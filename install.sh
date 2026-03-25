#!/usr/bin/env bash
set -euo pipefail

# Solana Claude Config Installer
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/riotavares/solana-claude-config/main/install.sh | bash
#   bash install.sh /path/to/project

REPO_URL="https://github.com/riotavares/solana-claude-config.git"
BRANCH="main"

TARGET_DIR="${1:-.}"
mkdir -p "$TARGET_DIR"
TARGET_DIR="$(cd "$TARGET_DIR" && pwd)"

TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

echo "Installing Solana Claude Config to: $TARGET_DIR"

# Support local source for testing: SOLANA_CLAUDE_LOCAL_SRC=/path/to/repo
if [ -n "${SOLANA_CLAUDE_LOCAL_SRC:-}" ] && [ -d "$SOLANA_CLAUDE_LOCAL_SRC/.claude" ]; then
  echo "Using local source: $SOLANA_CLAUDE_LOCAL_SRC"
  mkdir -p "$TEMP_DIR/repo"
  cp -r "$SOLANA_CLAUDE_LOCAL_SRC/.claude" "$TEMP_DIR/repo/.claude"
  cp "$SOLANA_CLAUDE_LOCAL_SRC/CLAUDE-solana.md" "$TEMP_DIR/repo/CLAUDE-solana.md"
  [ -f "$SOLANA_CLAUDE_LOCAL_SRC/.gitmodules" ] && cp "$SOLANA_CLAUDE_LOCAL_SRC/.gitmodules" "$TEMP_DIR/repo/.gitmodules"
else
  # Clone repo with submodules
  echo "Cloning repository..."
  git clone --recurse-submodules --depth 1 --branch "$BRANCH" "$REPO_URL" "$TEMP_DIR/repo" 2>&1 | tail -1 || true
fi

# Copy .claude/ directory
echo "Copying .claude/ configuration..."
if [ -d "$TARGET_DIR/.claude" ]; then
  echo "Warning: .claude/ already exists, merging..."
fi
cp -r "$TEMP_DIR/repo/.claude" "$TARGET_DIR/"

# Copy CLAUDE-solana.md as CLAUDE.md
echo "Copying CLAUDE.md..."
if [ -f "$TARGET_DIR/CLAUDE.md" ]; then
  echo "Warning: CLAUDE.md already exists, backing up to CLAUDE.md.bak"
  cp "$TARGET_DIR/CLAUDE.md" "$TARGET_DIR/CLAUDE.md.bak"
fi
cp "$TEMP_DIR/repo/CLAUDE-solana.md" "$TARGET_DIR/CLAUDE.md"

# Copy .gitmodules if it exists
if [ -f "$TEMP_DIR/repo/.gitmodules" ]; then
  cp "$TEMP_DIR/repo/.gitmodules" "$TARGET_DIR/.gitmodules"
fi

# Initialize submodules in target
echo "Initializing submodules..."
(cd "$TARGET_DIR" && git submodule update --init --recursive 2>/dev/null) || echo "Note: Submodule init skipped (not a git repo or submodules already set up)"

# Add .claude/skills/ext/ to .gitignore if not present
GITIGNORE="$TARGET_DIR/.gitignore"
EXT_PATTERN=".claude/skills/ext/"
if [ -f "$GITIGNORE" ]; then
  if ! grep -qF "$EXT_PATTERN" "$GITIGNORE"; then
    echo "" >> "$GITIGNORE"
    echo "# External Claude skill submodules" >> "$GITIGNORE"
    echo "$EXT_PATTERN" >> "$GITIGNORE"
    echo "Added $EXT_PATTERN to .gitignore"
  fi
else
  echo "# External Claude skill submodules" > "$GITIGNORE"
  echo "$EXT_PATTERN" >> "$GITIGNORE"
  echo "Created .gitignore with $EXT_PATTERN"
fi

echo ""
echo "Installation complete!"
echo ""
echo "Next steps:"
echo "  1. cd $TARGET_DIR"
echo "  2. Review .claude/mcp.json and add your API keys"
echo "  3. Run 'claude' to start Claude Code with Solana config"
echo "  4. Try /build-program or /audit-solana commands"
