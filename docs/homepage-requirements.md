# Homepage Requirements  
Pact Community Organization — Issue #5

This document defines the required content, visual layout, and measurable KPIs for the homepage of **pact-community.org**. It follows the Foundation’s mission to make it easy and safe for builders and businesses to develop with Pact. The homepage must feel familiar to users of kadena.io, while still representing the distinct identity of the Pact Community Organization.

This document is written for developers, contributors, designers, and AI agents to ensure clarity, consistency, and long-term maintainability.


## 1. Purpose of the Homepage
The homepage serves as the primary landing experience for all visitors. It should:

- Introduce the Foundation clearly and professionally  
- Direct users to key pathways (Pact learning, smart contracts, community participation)  
- Communicate our mission and vision concisely  
- Build trust through visual consistency with the Pact ecosystem  
- Act as the navigation gateway to the entire site  

This page must be lightweight, accessible, clean, and community-friendly.

---

## 2. Content Requirements

### 2.1 Hero Section
- Short headline introducing the Foundation  
- Sub-headline summarizing mission  
- Three primary call-to-action buttons:  
  1. **Explore Smart Contracts**  
  2. **Learn Pact**  
  3. **Join the Community**  
- Background gradient similar to Pact brand (Foundation theme adaptation)
- Background gradient similar to the Foundation theme (soft gradient background)

### 2.2 Mission & Vision Summary
- 1–2 short paragraphs introducing:  
  - Mission: *Make it easy and safe for businesses to start building with Pact*  
  - Vision: *A trusted Pact ecosystem with safe, audited open source Pact contracts*  
- “Read full Mission & Vision →” link

### 2.3 Smart Contract Catalog Preview
- A 3-card preview of featured or audited contracts  
- Each card includes: name, 1–2 sentence description, link to catalog  
- Future: dynamic cards sourced from repository metadata  
  - TODO: Replace placeholder card data with dynamic source

### 2.4 Documentation Hub Preview
- Small section with icons/buttons linking to:  
  - Pact documentation  
- Pact developer portal  
  - Foundation documentation hub  
- Brief copy: “Everything you need to build with Pact, in one place.”  
  - TODO: Replace placeholder documentation links with finalized URLs

### 2.5 Community & Contribution
- Invitation to join GitHub, Discord, or community forum  
- Small blurb summarizing contribution philosophy  
- CTA button: **Get Involved**  
  - TODO: Replace placeholder community platform URLs

### 2.6 Footer Summary
Mirrors footer specifications defined in architecture document:  
- Quick navigation  
- GitHub organization  
- License  
- Social links  
- Copyright  
  - TODO: Confirm final license text and social handles

---

## 3. Homepage Visual Wireframe (High-Level)
```
| HERO: Headline / Subtext / 3 CTAs / soft gradient background |
| Mission & Vision summary + link                                             |
| Smart Contract Catalog Preview (3 cards)                                    |
| Documentation Hub quick-links                                               |
| Community / Contribution CTA                                                |
| Footer                                                                      |
```
Wireframe intentionally minimal; detailed UI design will come in a later design sprint.

---

## 4. Branding Alignment
The homepage must follow the Foundation's Brand Guidelines (`/design/brand-guidelines.md`). Key elements:

- **Color Scheme:** Gradient (pink → purple → indigo), accessible neutrals  
- **Typography:** Satoshi (preferred) or Inter for all text (Space Grotesk removed for consistency)  
- **Tone:** Welcoming, educational, trustworthy  
- **Spacing:** Clean, modern, high-readability layout  
- **Icons:** Preferred sets: Lucide or Heroicons  
  - TODO: Confirm final font hosting strategy (self-host vs. CDN)  
  - TODO: Add gradient utility classes or CSS variables


## 5. KPIs for the Homepage
The homepage must support measurable success indicators:

### Engagement KPIs
- CTR for “Explore Smart Contracts”  
- CTR for “Learn Pact”  
- CTR for “Join the Community”  

### Behavior KPIs
- Bounce rate  
- Average time on page  
- Conversion to GitHub repo visits  

### Technical KPIs
- Page loads in < 1.5 seconds on standard broadband  
- Lighthouse score targets:  
  - Performance ≥ 90  
  - Accessibility ≥ 95  
  - Best Practices ≥ 95  
  - SEO ≥ 95  
  - TODO: Add baseline measurement script after initial deployment


## 6. Future Technical Implementation Plan
This section guides the upcoming implementation issue (separate from this requirements issue).

### Framework (Planned)
- **Next.js (Static Export)** chosen for: SEO, incremental growth, React familiarity, flexible docs integration, easy GitHub Pages / alternative hosting.

### Proposed Directory Structure
```
/web (future root if separated)
  /pages
    index.tsx            # Homepage
  /components/home/
    Hero.tsx
    MissionVision.tsx
    ContractPreview.tsx
    DocsHub.tsx
    CommunityCTA.tsx
    Footer.tsx
  /styles/
    variables.css        # CSS custom properties (colors, gradients, spacing)
    globals.css
    home.module.css
```

### Styling Approach
- CSS Modules + global variables for theme primitives (colors, gradients, spacing, typography).
- Accessibility: semantic landmarks (header, main, nav, footer, section, aria-labels).
- TODO: Add prefers-reduced-motion handling for subtle animations.

### Component Outline
- Hero: Gradient background, headline, subtext, CTA buttons.
- MissionVision: Two paragraphs + link.
- ContractPreview: 3 placeholder cards (name, description, link).
- DocsHub: Links group w/ icons.
- CommunityCTA: Contribution pitch + button.
- Footer: Minimal navigation + attribution.

### Placeholder Data Strategy
- Hardcoded arrays for cards / links initially.
- TODO: Replace with fetch from static JSON or API when available.

### Accessibility / SEO Checklist (for implementation issue)
- Landmark regions used.
- Alt text for any icons if decorative vs informative.
- Meta title / description derived from Mission & Vision.
- Focus-visible styles for buttons and links.


## 7. Acceptance Criteria Checklist
- [ ] `/docs/homepage-requirements.md` created  
- [ ] Contains all homepage content requirements  
- [ ] Includes high-level visual wireframe  
- [ ] Branding aligns with Issue #4 guidelines (fonts corrected to Satoshi/Inter)  
- [ ] KPIs documented  
- [ ] Implementation plan section prepared for future issue  
- [ ] Document written clearly for humans + AI agents  
- [ ] Ready for use by designers and developers in future issues  


Approved by Product Owner  
Pact Community Organization
