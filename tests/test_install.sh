#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

source "$SCRIPT_DIR/helpers.sh"

TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

echo "[test_install] Installing to temp directory: $TEMP_DIR"

# Initialize a git repo so submodule commands work
(cd "$TEMP_DIR" && git init -q)

# Run install.sh targeting temp dir (use local source for testing)
SOLANA_CLAUDE_LOCAL_SRC="$REPO_ROOT" bash "$REPO_ROOT/install.sh" "$TEMP_DIR"

echo ""
echo "[test_install] Verifying installation..."

assert_dir_exists "$TEMP_DIR/.claude" ".claude/ directory exists"
assert_file_exists "$TEMP_DIR/CLAUDE.md" "CLAUDE.md exists"
assert_dir_exists "$TEMP_DIR/.claude/agents" ".claude/agents/ directory exists"
assert_dir_exists "$TEMP_DIR/.claude/commands" ".claude/commands/ directory exists"
assert_file_exists "$TEMP_DIR/.claude/skills/SKILL.md" "SKILL.md exists"
assert_json_valid "$TEMP_DIR/.claude/settings.json" "settings.json is valid JSON"
assert_file_exists "$TEMP_DIR/.mcp.json" ".mcp.json exists at project root"
assert_json_valid "$TEMP_DIR/.mcp.json" ".mcp.json is valid JSON"
assert_file_exists "$TEMP_DIR/.env.example" ".env.example exists"
assert_file_exists "$TEMP_DIR/.env" ".env was bootstrapped from .env.example"

# Count agents
AGENT_COUNT=$(find "$TEMP_DIR/.claude/agents" -name "*.md" | wc -l | tr -d ' ')
assert_eq "15" "$AGENT_COUNT" "Agent count is 15"

# Count commands
CMD_COUNT=$(find "$TEMP_DIR/.claude/commands" -name "*.md" | wc -l | tr -d ' ')
assert_eq "22" "$CMD_COUNT" "Command count is 22"

# Check .gitignore was updated
assert_file_exists "$TEMP_DIR/.gitignore" ".gitignore exists"
GITIGNORE_CONTENT="$(cat "$TEMP_DIR/.gitignore")"
assert_contains "$GITIGNORE_CONTENT" ".claude/skills/ext/" ".gitignore contains ext/ entry"

print_summary
