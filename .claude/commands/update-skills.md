---
description: "Update external skill submodules and verify integrity"
---

You are updating external skill submodules and verifying all skill paths resolve correctly.

## Related Skills

- [SKILL.md](../skills/SKILL.md) - Unified skill hub with all path references

## Step 1: Update All Submodules

```bash
echo "Updating external skill submodules..."
git submodule update --remote --merge

if [ $? -ne 0 ]; then
    echo "Submodule update failed. Attempting init first..."
    git submodule update --init --recursive
    git submodule update --remote --merge
fi

echo "Submodule update complete."
```

## Step 2: Show What Changed

```bash
echo "Changes in submodules:"
git diff --submodule=diff

echo ""
echo "Submodule status:"
git submodule status
```

## Step 3: Verify Skill Paths

Check that all paths referenced in SKILL.md still resolve to actual files.

```bash
SKILL_HUB=".claude/skills/SKILL.md"
SKILL_DIR=".claude/skills"
MISSING=0

echo "Verifying skill paths referenced in SKILL.md..."

# Extract all relative paths from markdown links
grep -oP '\]\(([^)]+\.md)\)' "$SKILL_HUB" | sed 's/\](//' | sed 's/)//' | while read -r ref; do
    FULL_PATH="$SKILL_DIR/$ref"
    if [ ! -f "$FULL_PATH" ]; then
        echo "MISSING: $ref -> $FULL_PATH"
        MISSING=$((MISSING + 1))
    fi
done

# Check directory references (skills that are directories)
grep -oP '\]\(([^)]+/)\)' "$SKILL_HUB" | sed 's/\](//' | sed 's/)//' | while read -r ref; do
    FULL_PATH="$SKILL_DIR/$ref"
    if [ ! -d "$FULL_PATH" ]; then
        echo "MISSING DIR: $ref -> $FULL_PATH"
        MISSING=$((MISSING + 1))
    fi
done

if [ "$MISSING" -eq 0 ]; then
    echo "All skill paths resolve correctly."
else
    echo ""
    echo "$MISSING broken path(s) found. Fix SKILL.md or check submodule state."
fi
```

## Step 4: Report Summary

```bash
echo ""
echo "=== Submodule Summary ==="
echo ""

# List each submodule with its current commit
git submodule foreach --quiet '
    LATEST=$(git log -1 --format="%h %s" 2>/dev/null)
    echo "$name: $LATEST"
'

echo ""
echo "Run 'git add .gitmodules .claude/skills/ext/' and commit to lock updates."
```

## After Update

- [ ] All skill paths verified
- [ ] No broken references in SKILL.md
- [ ] Submodule changes committed if desired
- [ ] Test skill loading in a target project
