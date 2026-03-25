#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

source "$SCRIPT_DIR/helpers.sh"

SETTINGS_FILE="$REPO_ROOT/.claude/settings.json"

echo "[test_settings] Checking settings.json..."

assert_file_exists "$SETTINGS_FILE" "settings.json exists"
assert_json_valid "$SETTINGS_FILE" "settings.json is valid JSON"

SETTINGS_CONTENT="$(cat "$SETTINGS_FILE")"
assert_contains "$SETTINGS_CONTENT" '"permissions"' "settings.json has permissions key"
assert_contains "$SETTINGS_CONTENT" '"hooks"' "settings.json has hooks key"

print_summary
