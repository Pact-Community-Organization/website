# Pact Community Website

Public-facing website for the Pact Community Organization at https://pact-community.org.

## Mission & Vision
- Mission: Make it easy and safe for businesses to start building with Pact.
- Vision: A trusted Pact ecosystem where businesses can confidently start using audited, reliable open source Pact contracts.

This repository implements the website that communicates and advances that mission and vision.

## Useful Links
- Live site: https://pact-community.org
- Foundation repository (governance, docs, automation): https://github.com/Pact-Community-Organization/foundation
- Foundation wiki: https://github.com/Pact-Community-Organization/foundation/wiki

## Tech Stack
Next.js (App Router, static export) + TypeScript + CSS Modules. `next build` writes the static
site to `out/`, which deploys to GitHub Pages via `.github/workflows/deploy.yml` on every push
to `main`.

## Getting Started
1. Fork and clone the repo:
   ```bash
   git clone https://github.com/Pact-Community-Organization/website.git
   cd website
   npm install
   ```
2. Run the dev server:
   ```bash
   npm run dev
   ```
3. Before opening a PR, make sure the production build and lint pass:
   ```bash
   npm run build
   npm run lint
   ```
4. Create a branch linked to an issue (replace N):
   ```bash
   git checkout -b feat/<short-topic>-#N
   ```
5. Open a PR describing the change and linking the issue.

## Contribution Guidelines
- Always reference an Issue in commits and PRs (e.g., `refs #N` or `closes #N`).
- Keep content consistent with the Foundation’s mission and voice.
- Organize content:
  - `src/app/` — routes (one directory per page)
  - `src/components/` — page content and layout components
  - `src/styles/` — CSS Modules
  - `public/` — static assets, `CNAME`, and redirect stubs for legacy URLs
  - `docs/` — content plans and requirements
  - `design/` — branding and visual guidelines

## Scope of This Repository
This repository is solely for the public website. Foundation governance, broader documentation, and automation live in the Foundation repo:
- https://github.com/Pact-Community-Organization/foundation
