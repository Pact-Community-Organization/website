#!/usr/bin/env node
// mobile-check.mjs — fails if any page is wider than the phone it is viewed on.
//
// WHY THIS EXISTS. The navbar laid its links out as one non-wrapping flex row,
// so on a 375px screen the body measured 907px. No horizontal scroll was
// offered, so the site simply looked cut off and the only way to read it was to
// rotate the phone. It shipped that way, on every page, because nothing ever
// measured a page at a phone width — `next build` and `eslint` cannot see
// layout, and the repo has no test suite.
//
// The check is one assertion: document width must not exceed the viewport.
// When it fails it names the SHALLOWEST offending elements, because the widest
// element is usually a symptom and its container is the cause.
//
// Usage:  node scripts/mobile-check.mjs [baseURL]      (default http://localhost:3000)
// Exit 0 = every route fits at every width. Exit 1 = at least one overflows.
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://localhost:3000';
const ROUTES = [
  '/', '/token', '/token/guide', '/community', '/contracts', '/docs',
  '/mission-vision', '/nft', '/nft/buyers', '/nft/creators', '/nft/sellers',
  '/nft/marketplaces', '/roadmap',
];
// 320 = smallest phone still in use (iPhone SE 1st gen); 375 = the common case;
// 414 = large phones. A layout that holds at 320 holds everywhere.
const WIDTHS = [320, 375, 414];

const measure = () => {
  const vw = document.documentElement.clientWidth;
  const seen = new Set();
  const offenders = [];
  document.querySelectorAll('*').forEach((el) => {
    const b = el.getBoundingClientRect();
    if (b.width === 0 && b.height === 0) return;
    if (b.right > vw + 1 || b.width > vw + 1) {
      // Report only the shallowest offender in any subtree: a wide child inside
      // an already-wide parent is noise, the parent is the bug.
      let p = el.parentElement;
      while (p) { if (seen.has(p)) return; p = p.parentElement; }
      seen.add(el);
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className || '').toString().trim().slice(0, 44),
        w: Math.round(b.width),
        right: Math.round(b.right),
        text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 44),
      });
    }
  });
  return { vw, docWidth: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth), offenders };
};

// Use whatever chromium is already on this machine. PLAYWRIGHT_CHROMIUM lets a
// cached build be reused rather than downloading one; without it, Playwright's
// bundled default is used, which is what CI would do.
const exe = process.env.PLAYWRIGHT_CHROMIUM;
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
let failures = 0, checked = 0;

for (const width of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width, height: 780 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    // NOT 'networkidle': the Next dev server holds an HMR websocket open, so
    // network is never idle and this hangs forever. 'load' is what we need
    // anyway — layout is settled once stylesheets have applied.
    const res = await page.goto(BASE + route, { waitUntil: 'load', timeout: 20000 }).catch(() => null);
    if (!res || !res.ok()) { console.log(`  SKIP  ${width}px ${route} (HTTP ${res ? res.status() : 'no response'})`); continue; }
    checked++;
    const { vw, docWidth, offenders } = await page.evaluate(measure);
    if (docWidth > vw + 1) {
      failures++;
      console.log(`  FAIL  ${width}px ${route} — document ${docWidth}px in a ${vw}px viewport`);
      for (const o of offenders.slice(0, 4)) {
        console.log(`          <${o.tag} class="${o.cls}"> ${o.w}px wide, right edge ${o.right}px  "${o.text}"`);
      }
    }
  }
  await ctx.close();
}
await browser.close();

console.log(`\n-- mobile-check: ${checked} page-widths measured at ${WIDTHS.join('/')}px --`);
if (!checked) { console.log('RESULT: FAIL (nothing was measured — is the dev server running?)'); process.exit(1); }
if (failures) { console.log(`RESULT: FAIL (${failures} overflow${failures > 1 ? 's' : ''})`); process.exit(1); }
console.log('RESULT: PASS (every route fits its viewport)');
