#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

source "$SCRIPT_DIR/helpers.sh"

echo "[test_validate] Running validate.sh from repo root..."

assert_cmd_success "cd '$REPO_ROOT' && bash validate.sh" "validate.sh exits 0"

print_summary
