Agent Runbook (repo-level)
==========================

This is a repository-level copy of the workspace agent runbook to make it easy for reviewers to inspect onboarding guidance inside this repo.

Quick start
-----------

- Check GH CLI auth: `gh auth status`
- Run acceptance test (dry-run): `bash ./scripts/agent_acceptance_test.sh .`
- Review generated `pact-changes-summary.md` at workspace root and logs in `logs/`.

Safety & policy
---------------

- Dry-run by default. Set `AGENT_MODE=apply` locally only after maintainers review the onboarding artifacts.
- Agent will not modify generated assets (e.g. `.next`, `out`, `node_modules`).
- Legal/brand-sensitive files listed in `legal/brand-review.md` require manual sign-off.

Acceptance test (repo-level)
----------------------------

This repo includes `scripts/agent_acceptance_test.sh` that wraps the workspace-level acceptance test. The test is a smoke-check: it runs `scripts/generate_summary.sh` and `scripts/validate_all.sh <repo>` (dry-run) and writes logs to `logs/`.

Contact
-------

If you have concerns, comment on PR #55 and refer to `pact-changes-summary.md` for a consolidated changelog.
