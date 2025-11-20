Agent onboarding and acceptance tests
===================================

Purpose
-------

This folder contains a lightweight onboarding and acceptance test for the local agent. It is a convenience copy of the workspace-level agent docs so maintainers can review and accept them inside this repository.

How to run the acceptance test
------------------------------

From the repository root (workspace):

```bash
bash ./scripts/agent_acceptance_test.sh .
```

The script runs in dry-run mode and will print logs to `logs/` (created at workspace root).

Guidance
--------

- Run `gh auth status` and ensure the active account is a maintainer before enabling `AGENT_MODE=apply`.
- Review the generated `pact-changes-summary.md` and validation logs before merging any agent-created PRs.
