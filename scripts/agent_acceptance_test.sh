#!/usr/bin/env bash
set -euo pipefail

# Simple acceptance test for the agent scoped to this repo via workspace scripts.
# Usage: ./scripts/agent_acceptance_test.sh <repo-path>

ROOT="$PWD"
REPO_PATH="${1:-kadena-community-website}"

if [ ! -d "$REPO_PATH" ]; then
  echo "Repo path '$REPO_PATH' not found in workspace." >&2
  exit 2
fi

echo "Running agent acceptance test for: $REPO_PATH"

echo "1) Generating pact-changes-summary.md (dry-run)"
bash ./scripts/generate_summary.sh || { echo "generate_summary failed"; exit 3; }

echo "2) Validating target repo: $REPO_PATH"
bash ./scripts/validate_all.sh "$REPO_PATH" || { echo "validate_all failed"; exit 4; }

echo "Acceptance test completed successfully. Logs are in ./logs/"

exit 0
