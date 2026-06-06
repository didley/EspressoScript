#!/usr/bin/env bash
set -euo pipefail
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
echo "Git hooks configured. Pre-commit will run fixture tests on each commit."
echo "Run 'bash scripts/verify.sh' for the full integration suite."
