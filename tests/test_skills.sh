#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

source "$SCRIPT_DIR/helpers.sh"

SKILLS_DIR="$REPO_ROOT/.claude/skills"
SKILL_FILE="$SKILLS_DIR/SKILL.md"

echo "[test_skills] Checking SKILL.md links..."

assert_file_exists "$SKILL_FILE" "SKILL.md exists"

# Parse markdown links (excluding http links)
BROKEN=0
CHECKED=0
while IFS= read -r link; do
  link="$(echo "$link" | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')"
  [ -z "$link" ] && continue

  target="$SKILLS_DIR/$link"
  CHECKED=$((CHECKED + 1))

  TOTAL=$((TOTAL + 1))
  if [ -e "$target" ] || [ -d "$target" ]; then
    echo "  PASS: $link exists"
    PASS=$((PASS + 1))
  else
    echo "  FAIL: Broken link -> $link"
    FAIL=$((FAIL + 1))
    BROKEN=$((BROKEN + 1))
  fi
done < <(grep -oE '\]\([^)]+\)' "$SKILL_FILE" | sed 's/\](//' | sed 's/)//' | grep -v '^http')

echo ""
echo "Checked $CHECKED links, $BROKEN broken."

print_summary
