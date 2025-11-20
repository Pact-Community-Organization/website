# Website Architecture Plan

Pact Community Organization — Information Architecture

This document defines the structural layout of the Pact Community Organization public website hosted at pact-community.org. It aligns with Issue #3 and is optimized for clarity, scalability, and community-driven growth. It serves as the foundational map for developers, contributors, designers, and AI agents.

Related: Issue #3 – Website Architecture Plan

---

## 1. Purpose of This Architecture
The goal is to create a clear, intuitive, and professional website structure that communicates:
- Mission, vision, and purpose of the Foundation
- Educational content for Pact builders
- Community resources and contribution pathways
- Smart contract catalog for audited Pact contracts
- Documentation access (internal + external)

This architecture avoids unnecessary complexity while ensuring future expansion is easy.

---

## 2. Core Navigation Structure (Top-Level Menu)
Primary sections in the global navigation:

1. Home
2. Mission & Vision
3. Smart Contract Catalog
4. Documentation Hub
5. Community & Contribution
6. Contact / Get Involved

Secondary navigation: Code of Conduct; Wiki entry points to extended materials.

---

## 3. Page Descriptions & Requirements

### 3.1 Home
- High-level introduction to the Foundation
- Summary of mission and vision
- Key pathways:
	- “Explore Smart Contracts”
	- “Learn Pact”
	- “Join the Community”
- Optional future: latest announcements or updates

### 3.2 Mission & Vision
- Clearly articulate:
	- Mission: Make it easy and safe for businesses to start building with Pact
	- Vision: A trusted Pact ecosystem with safe, audited open source Pact contracts
- Core values and community purpose

### 3.3 Smart Contract Catalog
- Table/list of audited or reviewed Pact smart contracts
- Categories: business use cases; tools; libraries/templates
- Metadata: name, description, repository link, audit state, version
- Future: search and filtering

### 3.4 Documentation Hub
- Central landing page pointing to:
	- Pact documentation
	- Developer docs for Pact-compatible platforms
	- Foundation documentation
	- Tutorials (internal and external)
- Serves as the knowledge center for builders

### 3.5 Community & Contribution
- How to get involved (GitHub, Discord, Forum, etc.)
- Contribution guidelines
- Community governance overview
- Future: CFP programs or grants

### 3.6 Contact / Get Involved
- Contact form or clear contact email/portal
- Optional: direct community support links

---

## 4. Footer Structure
The footer should include:
- Quick navigation links
- GitHub organization link
- Licensing statement (MIT or appropriate)
- Social/community links
- Copyright

---

## 5. Future Expansion Points
- Blog / announcements
- Events calendar
- Learning portal
- Tools and utilities index
- Partnership acknowledgements

These are intentionally postponed until the foundation website is stable.

---

## 6. Technical Notes for Implementation
- Hosting: GitHub Pages served from the `main` branch under `docs/`
- Content sources: Pages under `docs/` and selected Wiki pages
- Link strategy: Prefer stable, absolute paths under the site root; cross-link to Wiki when appropriate
- Sync model: Wiki-to-docs sync is PR-based and manual-only to respect branch protections (no direct pushes to protected branches; no PAT required)
- Build model: Static content only; suitable for migration to Astro/Next static export later if needed
- Documentation navigation: Sidebar/breadcrumbs may be introduced later for documentation depth

---

## 7. URLs & Routing
All major sections map to predictable URL paths:
- `/`
- `/mission-vision/`
- `/contracts/`
- `/docs/`
- `/community/`
- `/contact/`

---

## 8. Acceptance Criteria Checklist
- [ ] `docs/architecture.md` created
- [ ] Document contains full structural layout
- [ ] Structure is clear for developers and AI agents
- [ ] Can be directly used to generate template pages
- [ ] Navigation and section hierarchy defined
- [ ] Future-proof expansion areas included

---

Approved by Product Owner, Pact Community Organization
