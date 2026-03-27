#!/usr/bin/env bash
set -euo pipefail

# Solana Claude Config Updater
# Usage: bash update.sh /path/to/project

REPO_URL="https://github.com/solanabr/solana-claude-config.git"
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
  [ -f "$SOLANA_CLAUDE_LOCAL_SRC/.mcp.json" ] && cp "$SOLANA_CLAUDE_LOCAL_SRC/.mcp.json" "$TEMP_DIR/repo/.mcp.json"
  [ -f "$SOLANA_CLAUDE_LOCAL_SRC/.env.example" ] && cp "$SOLANA_CLAUDE_LOCAL_SRC/.env.example" "$TEMP_DIR/repo/.env.example"
  [ -f "$SOLANA_CLAUDE_LOCAL_SRC/.gitmodules" ] && cp "$SOLANA_CLAUDE_LOCAL_SRC/.gitmodules" "$TEMP_DIR/repo/.gitmodules"
else
  # Clone latest
  echo "Fetching latest config..."
  git clone --recurse-submodules --depth 1 --branch "$BRANCH" "$REPO_URL" "$TEMP_DIR/repo" 2>&1 | tail -1 || true

  # Update submodules in temp
  (cd "$TEMP_DIR/repo" && git submodule update --init --recursive 2>/dev/null) || true
fi

# Track what changed
CHANGES=""

# Compare and copy .claude/
if ! diff -rq "$TEMP_DIR/repo/.claude" "$TARGET_DIR/.claude" >/dev/null 2>&1; then
  CHANGES="$CHANGES  - .claude/ directory updated\n"
fi

cp -r "$TEMP_DIR/repo/.claude" "$TARGET_DIR/"

# Copy .mcp.json (no secrets — safe to overwrite)
if [ -f "$TEMP_DIR/repo/.mcp.json" ]; then
  if ! diff -q "$TEMP_DIR/repo/.mcp.json" "$TARGET_DIR/.mcp.json" >/dev/null 2>&1; then
    CHANGES="$CHANGES  - .mcp.json updated\n"
  fi
  cp "$TEMP_DIR/repo/.mcp.json" "$TARGET_DIR/.mcp.json"
fi

# Copy .env.example (update template, never touch .env)
if [ -f "$TEMP_DIR/repo/.env.example" ]; then
  if ! diff -q "$TEMP_DIR/repo/.env.example" "$TARGET_DIR/.env.example" >/dev/null 2>&1; then
    CHANGES="$CHANGES  - .env.example updated\n"
  fi
  cp "$TEMP_DIR/repo/.env.example" "$TARGET_DIR/.env.example"
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
