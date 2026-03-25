#!/usr/bin/env bash
set -euo pipefail

# Solana Claude Config Updater
# Usage: bash update.sh /path/to/project

REPO_URL="https://github.com/riotavares/solana-claude-config.git"
BRANCH="main"

if [ $# -lt 1 ]; then
  echo "Usage: bash update.sh /path/to/project"
  exit 1
fi

TARGET_DIR="$(cd "$1" && pwd)"

# Verify target has .claude/
if [ ! -d "$TARGET_DIR/.claude" ]; then
  echo "Error: $TARGET_DIR/.claude/ not found. Run install.sh first."
  exit 1
fi

TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

echo "Updating Solana Claude Config in: $TARGET_DIR"

# Support local source for testing: SOLANA_CLAUDE_LOCAL_SRC=/path/to/repo
if [ -n "${SOLANA_CLAUDE_LOCAL_SRC:-}" ] && [ -d "$SOLANA_CLAUDE_LOCAL_SRC/.claude" ]; then
  echo "Using local source: $SOLANA_CLAUDE_LOCAL_SRC"
  mkdir -p "$TEMP_DIR/repo"
  cp -r "$SOLANA_CLAUDE_LOCAL_SRC/.claude" "$TEMP_DIR/repo/.claude"
  cp "$SOLANA_CLAUDE_LOCAL_SRC/CLAUDE-solana.md" "$TEMP_DIR/repo/CLAUDE-solana.md"
  [ -f "$SOLANA_CLAUDE_LOCAL_SRC/.gitmodules" ] && cp "$SOLANA_CLAUDE_LOCAL_SRC/.gitmodules" "$TEMP_DIR/repo/.gitmodules"
else
  # Clone latest
  echo "Fetching latest config..."
  git clone --recurse-submodules --depth 1 --branch "$BRANCH" "$REPO_URL" "$TEMP_DIR/repo" 2>&1 | tail -1 || true

  # Update submodules in temp
  (cd "$TEMP_DIR/repo" && git submodule update --init --recursive 2>/dev/null) || true
fi

# Preserve local mcp.json if it exists
MCP_BACKUP=""
if [ -f "$TARGET_DIR/.claude/mcp.json" ]; then
  MCP_BACKUP="$TEMP_DIR/mcp.json.bak"
  cp "$TARGET_DIR/.claude/mcp.json" "$MCP_BACKUP"
  echo "Preserved local mcp.json"
fi

# Track what changed
CHANGES=""

# Compare and copy .claude/
if ! diff -rq "$TEMP_DIR/repo/.claude" "$TARGET_DIR/.claude" >/dev/null 2>&1; then
  CHANGES="$CHANGES  - .claude/ directory updated\n"
fi

cp -r "$TEMP_DIR/repo/.claude" "$TARGET_DIR/"

# Restore local mcp.json
if [ -n "$MCP_BACKUP" ]; then
  cp "$MCP_BACKUP" "$TARGET_DIR/.claude/mcp.json"
fi

# Compare and copy CLAUDE.md
if [ -f "$TEMP_DIR/repo/CLAUDE-solana.md" ]; then
  if ! diff -q "$TEMP_DIR/repo/CLAUDE-solana.md" "$TARGET_DIR/CLAUDE.md" >/dev/null 2>&1; then
    CHANGES="$CHANGES  - CLAUDE.md updated\n"
  fi
  cp "$TEMP_DIR/repo/CLAUDE-solana.md" "$TARGET_DIR/CLAUDE.md"
fi

# Copy .gitmodules
if [ -f "$TEMP_DIR/repo/.gitmodules" ]; then
  if ! diff -q "$TEMP_DIR/repo/.gitmodules" "$TARGET_DIR/.gitmodules" >/dev/null 2>&1; then
    CHANGES="$CHANGES  - .gitmodules updated\n"
  fi
  cp "$TEMP_DIR/repo/.gitmodules" "$TARGET_DIR/.gitmodules"
fi

# Update submodules in target
echo "Updating submodules..."
(cd "$TARGET_DIR" && git submodule update --init --recursive 2>/dev/null) || echo "Note: Submodule update skipped"

echo ""
if [ -n "$CHANGES" ]; then
  echo "Changes applied:"
  printf "$CHANGES"
else
  echo "Already up to date."
fi
echo ""
echo "Update complete!"
