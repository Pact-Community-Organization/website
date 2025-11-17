# Domain Configuration Plan

This document describes how to configure the Kadena Pact Community Foundation website domains for GitHub Pages hosting.

Targets:
- Primary domain: `kadena-community.org`
- Secondary domain (forwarding): `kadenacommunity.org`

> Note: Do not include any sensitive credentials. All configuration steps here are safe for public repos.

## Goals
- Serve the website at `https://kadena-community.org` (canonical).
- Enforce HTTPS and HSTS via GitHub Pages (Enforce HTTPS setting).
- Forward all traffic from `kadenacommunity.org` (apex and www) to the primary domain with permanent redirects (301).
- Ensure `www.kadena-community.org` also resolves to the site.

## GitHub Pages Hosting
We will publish via GitHub Pages from this repository. The exact source (e.g., `gh-pages` branch or `main`/`docs`) will be chosen with the implementation stack. The domain steps are the same for either source.

1) In the repository settings, under Pages:
- Set the publishing source (e.g., `gh-pages` branch or `main`/`docs`).
- Set the Custom domain to `kadena-community.org`.
- Enable “Enforce HTTPS”.

2) Ensure a `CNAME` file exists at the publishing root containing:
```
kadena-community.org
```
GitHub adds this automatically when you set the custom domain in Settings, but keep it tracked in the branch that serves the site.

## DNS Records (Primary: kadena-community.org)
For apex and `www` to resolve correctly on GitHub Pages:

- Apex A records (required)
  - `@  A  185.199.108.153`
  - `@  A  185.199.109.153`
  - `@  A  185.199.110.153`
  - `@  A  185.199.111.153`

- Apex AAAA records (recommended for IPv6)
  - `@  AAAA  2606:50c0:8000::153`
  - `@  AAAA  2606:50c0:8001::153`
  - `@  AAAA  2606:50c0:8002::153`
  - `@  AAAA  2606:50c0:8003::153`

- `www` CNAME
  - `www  CNAME  kadena-pact-community-foundation.github.io.`

Explanation:
- Apex must use A/AAAA records for GitHub Pages.
- `www` should use a CNAME pointing to the org’s Pages host `kadena-pact-community-foundation.github.io`.

## DNS Records (Secondary: kadenacommunity.org)
The secondary domain should forward to the primary domain to avoid duplicate content and to standardize URLs.

Prefer DNS provider–level forwarding (permanent 301) for both apex and `www`:
- `kadenacommunity.org` → `https://kadena-community.org/`
- `www.kadenacommunity.org` → `https://kadena-community.org/`

Implementation options:
- Registrar/Provider forwarding (recommended): configure 301 redirects at the registrar (e.g., GoDaddy “Domain Forwarding”).
- If provider cannot forward, you can point `www` via CNAME to the primary, but apex still needs A/AAAA. However, without a server, HTTP 301 is not handled at DNS. Prefer provider forwarding for clean 301 behavior.

Do not set the secondary as a GitHub Pages custom domain. GitHub Pages supports one custom domain per site; use forwarding for alternates.

## HTTPS
- After DNS propagates and the custom domain is set, ensure “Enforce HTTPS” is enabled in Repo Settings → Pages.
- GitHub will issue TLS certificates automatically (may take minutes to hours after DNS changes). Re-check until the green lock appears.

## GoDaddy DNS Notes
- Use the Zone File editor for A/AAAA/CNAME records.
- Use “Domain Forwarding” for 301 redirects from `kadenacommunity.org` to `https://kadena-community.org/` (both apex and `www`).
- Propagation can take up to 24 hours globally; typically much faster.

## Verification Checklist
DNS:
```bash
# Apex A/AAAA records
dig kadena-community.org A +short
dig kadena-community.org AAAA +short

# CNAME for www
dig www.kadena-community.org CNAME +short
```

GitHub Pages + TLS:
```bash
# Expect a 200 and valid TLS after propagation
curl -I https://kadena-community.org/
```

Redirects:
```bash
# Expect 301 to the primary domain
curl -I http://kadenacommunity.org/
curl -I https://kadenacommunity.org/
curl -I http://www.kadenacommunity.org/
curl -I https://www.kadenacommunity.org/
```

## Operational Notes
- Keep the CNAME file in the publishing branch in sync with the chosen primary domain.
- If the publishing source changes (e.g., `main`/`docs` → `gh-pages`), re-validate that the CNAME file exists in the new source branch.
- If moving the site to a different org/repo, update the `www` CNAME target accordingly.

