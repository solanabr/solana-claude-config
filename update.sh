#!/usr/bin/env bash
set -euo pipefail

# Solana Claude Config Updater
# Usage:
#   bash update.sh /path/to/project
#   bash update.sh --agents /path/to/project   # agents + skills only

REPO_URL="https://github.com/solanabr/solana-claude-config.git"
BRANCH="main"

# Parse flags
AGENTS_ONLY=false
TARGET_ARG=""
for arg in "$@"; do
  case "$arg" in
    --agents) AGENTS_ONLY=true ;;
    *) TARGET_ARG="$arg" ;;
  esac
done

if [ -z "$TARGET_ARG" ]; then
  echo "Usage: bash update.sh [--agents] /path/to/project"
  exit 1
fi

TARGET_DIR="$(cd "$TARGET_ARG" && pwd)"

# Verify target has .claude/
if [ ! -d "$TARGET_DIR/.claude" ]; then
  echo "Error: $TARGET_DIR/.claude/ not found. Run install.sh first."
  exit 1
fi

# Auto-detect agents-only install (no settings.json = agents-only)
if [ ! -f "$TARGET_DIR/.claude/settings.json" ] && [ "$AGENTS_ONLY" = false ]; then
  AGENTS_ONLY=true
  echo "Detected agents-only install (no settings.json). Using --agents mode."
fi

TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

if [ "$AGENTS_ONLY" = true ]; then
  echo "Updating Solana agents + skills in: $TARGET_DIR"
else
  echo "Updating Solana Claude Config in: $TARGET_DIR"
fi

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

# Track what changed
CHANGES=""

if [ "$AGENTS_ONLY" = true ]; then
  # Update only agents, skills, and rules
  for dir in agents skills rules; do
    if [ -d "$TEMP_DIR/repo/.claude/$dir" ]; then
      if ! diff -rq "$TEMP_DIR/repo/.claude/$dir" "$TARGET_DIR/.claude/$dir" >/dev/null 2>&1; then
        CHANGES="$CHANGES  - .claude/$dir/ updated\n"
      fi
      cp -r "$TEMP_DIR/repo/.claude/$dir" "$TARGET_DIR/.claude/"
    fi
  done
else
  # Full update
  if ! diff -rq "$TEMP_DIR/repo/.claude" "$TARGET_DIR/.claude" >/dev/null 2>&1; then
    CHANGES="$CHANGES  - .claude/ directory updated\n"
  fi

  cp -r "$TEMP_DIR/repo/.claude" "$TARGET_DIR/"

  # Compare and copy CLAUDE.md
  if [ -f "$TEMP_DIR/repo/CLAUDE-solana.md" ]; then
    if ! diff -q "$TEMP_DIR/repo/CLAUDE-solana.md" "$TARGET_DIR/CLAUDE.md" >/dev/null 2>&1; then
      CHANGES="$CHANGES  - CLAUDE.md updated\n"
    fi
    cp "$TEMP_DIR/repo/CLAUDE-solana.md" "$TARGET_DIR/CLAUDE.md"
  fi
fi

# Copy .gitmodules (needed for both modes — skill submodules)
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
