# Domain setup for GitHub Pages

This document describes recommended steps to configure the repository to serve the site at  using GitHub Pages.

## Custom domain
- In the repository Settings → Pages, set the **Custom domain** to .
- Enable **Enforce HTTPS**.

## CNAME
Ensure a  file exists at the publishing root containing:


GitHub will also create this automatically when you set the custom domain via the UI; keep it tracked in the branch that serves the site.

## DNS recommendations
For reliable resolution of the apex domain and  subdomain, configure your DNS as follows:

- Apex A records (required):
  - 
  - 
  - 
  - 

- Apex AAAA records (recommended for IPv6):
  - 
  - 
  - 
  - 

-  CNAME:
  - 

## Notes
- If the publishing source changes (e.g., / → ) or the site moves to a different repo/org, update the  and DNS settings accordingly.
- Do not include any sensitive credentials in repository files. All steps here are public-safe.
