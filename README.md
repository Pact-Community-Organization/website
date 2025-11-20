# Pact Community Website

Public-facing website for the Pact Community Organization at https://pact-community.org.

## Mission & Vision
- Mission: Make it easy and safe for businesses to start building with Pact.
- Vision: A trusted Pact ecosystem where businesses can confidently start using audited, reliable open source Pact contracts.

This repository implements the website that communicates and advances that mission and vision.

## Useful Links
- Wiki: https://github.com/Pact-Community-Organization/website/wiki
- GitHub Pages (preview): https://pact-community-organization.github.io/website/
- Foundation repository (governance, docs, automation): https://github.com/Pact-Community-Organization/foundation

## Getting Started
> The initial tech stack is being defined. Until then, contributors can help by planning content and structure.

1. Fork and clone the repo:
   ```bash
   git clone https://github.com/Pact-Community-Organization/website.git
   cd website
   ```
2. Create a branch linked to an issue (replace N):
   ```bash
   git checkout -b feat/<short-topic>-#N
   ```
3. Add or update planning docs under `docs/` and assets under `design/`.
4. Commit with an issue reference (refs or closes):
   ```bash
   git commit -m "docs: add homepage requirements (refs #5)"
   git push -u origin feat/<short-topic>-#N
   ```
5. Open a PR describing the change and linking the issue.

When the implementation stack is finalized, this README will include local dev commands and build/deploy steps.

## Contribution Guidelines
- Always reference an Issue in commits and PRs (e.g., `refs #N` or `closes #N`).
- Keep content consistent with the Foundation’s mission and voice; prefer reusing wording from the Wiki.
- Organize content:
  - `docs/` for content plans and requirements
  - `design/` for branding and visual guidelines
  - `src/` for site source once the stack is chosen
- Follow the Wiki for standards and conventions.

## Example Repository Structure
```text
.github/             # Workflows and repo config
/docs/               # Content plans (architecture, pages, requirements)
/design/             # Branding, visual assets, design tokens
/public/             # Static assets (favicons, robots, etc.)
/src/                # Website source (framework TBD)
README.md
```

## Scope of This Repository
This repository is solely for the public website. Foundation governance, broader documentation, and automation live in the Foundation repo:
- https://github.com/Pact-Community-Organization/foundation
