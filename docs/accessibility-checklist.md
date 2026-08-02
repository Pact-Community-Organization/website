# Accessibility checklist

**Standard: WCAG 2.1 Level A and AA.** Enforced mechanically on every pull request by
`npm run a11y-check`, which runs axe-core over all 13 routes. A green run means those rules
found nothing — not that the site is fully accessible; see *What this does not cover*.

Last measured: 2026-08-02 — **0 violations across 13 routes**.

## What is enforced automatically

`scripts/a11y-check.mjs` fails the build on any WCAG 2.1 A/AA violation. It reports
best-practice findings separately and does **not** fail on them: they are advice, and mixing
them in makes a real failure easy to miss.

Run it locally against a built export:

```bash
npm run build
npx serve out -l 3000 &
npm run a11y-check
```

Point it at any origin (`npm run a11y-check -- https://pact-community.org`), and override the
route list with `MOBILE_CHECK_ROUTES` (shared with `mobile-check`).

## Violations found and fixed on the first run

These are recorded because they are the failure modes this site actually produced — a
checklist derived from the standard rather than from the site would have listed neither.

| Rule | Impact | What it was |
|---|---|---|
| `select-name` | **critical** | The claim-round `<select>` had no accessible name. Its visible label sat in a separate paragraph, so a screen reader announced only "combo box" — on the primary action of the whole site. Fixed with `aria-label`. |
| `color-contrast` | serious | A link hardcoded to `#0070f3` gave 4.22:1 on the dark background (AA needs 4.5:1), and the token banner's badge was white-on-pink at 2.81:1. |
| `link-in-text-block` | serious | 27 links identified by colour alone. Colour is not a sufficient signal (1.4.1). |

## Rules that apply when writing this site

1. **Every control needs an accessible name.** A visible label in a nearby element is not one.
   Use `<label for>`, `aria-label`, or `aria-labelledby`. This is the rule that broke the claim
   flow for screen-reader users.
2. **Text contrast: 4.5:1 normal, 3:1 large** (≥24px, or ≥18.66px bold). Check against the
   colour actually painted behind the element, not the page background.
3. **Never introduce a raw hex.** Every colour comes from the tokens in `globals.css`. The one
   contrast failure on this site was the one hardcoded hex in the stylesheet — the accessible
   fix and the correct fix were the same change.
4. **A link inside prose is underlined.** Colour alone does not identify it. Navigation, cards
   and buttons are exempt: they are identifiable by position and shape.
5. **Headings descend in order**, one `<h1>` per page. Do not pick a level for its size — use
   the token scale.
6. **Every image needs `alt`**; decorative images take `alt=""`, never a missing attribute.
7. **Keyboard reachable, and visibly focused.** Anything clickable must be tabbable and show a
   focus ring. Never remove an outline without replacing it.
8. **Do not encode meaning in colour alone** — status, validity, required fields all need a
   second signal (text, icon, underline).
9. **Respect `prefers-reduced-motion`** for any animation.

## What this does not cover

Stated so a green run is never read as more than it is. axe detects roughly a third to a half
of WCAG issues; the rest need a human:

- **Screen-reader flow** — that the announced order and wording make sense, not merely that a
  name exists.
- **Keyboard journeys** — completing a claim, a vote, or a transfer without a mouse.
- **Contrast over gradients and images**, which axe cannot compute reliably. The token banner
  uses a gradient; its badge was checked by hand.
- **Content quality** — link text that reads as "click here", or an `alt` that describes
  nothing.
- **Zoom to 200%** and 320px reflow. Reflow *is* covered mechanically, by `mobile-check`.
- **Cognitive load** of the wallet and claim flows.

## Compliance notes specific to PCO

- The claim flow is the one journey that must never regress: it is the site's purpose, and it
  is used by people who have never held a token before. Its `<select>` and inputs carry
  explicit names for that reason.
- Account ids and transaction hashes are 43–66 unbreakable characters. They wrap
  (`overflow-wrap: anywhere`) so they neither overflow nor force a horizontal scroll.
- The valueless-token disclosure must be readable, not merely present: it is body text, never
  a low-contrast footnote.
