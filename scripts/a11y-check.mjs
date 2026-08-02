#!/usr/bin/env node
// a11y-check.mjs — run axe-core over every route and report WCAG violations.
//
// WHY THIS EXISTS. Issue #10 asked for an accessibility checklist. A checklist
// written from a standard rather than from the site is a document that asserts
// compliance nobody measured — the same defect as a gate that reports PASS
// having examined nothing. So this measures first; the checklist records what
// was actually found and what is actually enforced.
//
// Usage:  node scripts/a11y-check.mjs [baseURL]
//   MOBILE_CHECK_ROUTES overrides the route list (shared with mobile-check).
// Exit 0 = no violations at the configured level. Exit 1 = at least one.
import { chromium } from 'playwright';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core/axe.min.js');
const axeSource = require('node:fs').readFileSync(axePath, 'utf8');

const BASE = process.argv[2] || 'http://localhost:3000';
const ROUTES = process.env.MOBILE_CHECK_ROUTES
  ? process.env.MOBILE_CHECK_ROUTES.split(',').map((s) => s.trim()).filter(Boolean)
  : ['/', '/token', '/token/guide', '/community', '/contracts', '/docs',
     '/mission-vision', '/nft', '/nft/buyers', '/nft/creators', '/nft/sellers',
     '/nft/marketplaces', '/roadmap'];

// WCAG 2.1 A + AA. Best-practice rules are reported separately: they are advice,
// not the standard, and mixing them in makes a real failure easy to miss.
const STANDARD = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const exe = process.env.PLAYWRIGHT_CHROMIUM;
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

const failures = new Map();   // ruleId -> {impact, help, nodes:[{route,target}]}
let advisory = 0, checked = 0;

for (const route of ROUTES) {
  const res = await page.goto(BASE + route, { waitUntil: 'load', timeout: 20000 }).catch(() => null);
  if (!res || !res.ok()) { console.log(`  SKIP  ${route} (HTTP ${res ? res.status() : 'no response'})`); continue; }
  await page.addScriptTag({ content: axeSource });
  const r = await page.evaluate(async () => await window.axe.run(document, { resultTypes: ['violations'] }));
  checked++;
  for (const v of r.violations) {
    const isStandard = v.tags.some((t) => ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'].includes(t));
    if (!isStandard) { advisory++; continue; }
    if (!failures.has(v.id)) failures.set(v.id, { impact: v.impact, help: v.help, nodes: [] });
    for (const n of v.nodes) failures.get(v.id).nodes.push({ route, target: n.target.join(' ') });
  }
}
await browser.close();

console.log(`\n-- a11y-check: ${checked} route(s) against WCAG 2.1 A/AA (${STANDARD.join('/')}) --`);
if (!checked) { console.log('RESULT: FAIL (nothing was measured — is the server running?)'); process.exit(1); }
for (const [id, v] of [...failures].sort((a, b) => b[1].nodes.length - a[1].nodes.length)) {
  console.log(`  ${String(v.impact).toUpperCase().padEnd(8)} ${id} — ${v.help} (${v.nodes.length} node(s))`);
  for (const n of v.nodes.slice(0, 3)) console.log(`             ${n.route}  ${n.target.slice(0, 76)}`);
  if (v.nodes.length > 3) console.log(`             …and ${v.nodes.length - 3} more`);
}
if (advisory) console.log(`  (${advisory} best-practice finding(s) not counted — advice, not the standard)`);
if (failures.size) { console.log(`\nRESULT: FAIL (${failures.size} WCAG rule(s) violated)`); process.exit(1); }
console.log('RESULT: PASS (no WCAG 2.1 A/AA violations)');
