---
description: "Quick commit with automatic formatting and conventional commit message"
---

You are creating a quick commit. This command formats code, generates a conventional commit message, and commits changes.

## Overview

This command automates the commit workflow:
1. **Check if new task** → create feature branch
2. Stage changes (or confirm staged changes)
3. Format code
4. Generate conventional commit message
5. Create commit

## Step 0: Check for New Task / Feature Branch

```bash
echo "Checking branch status..."

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "Not a git repository"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# Check if we're on main/master (starting a new task)
if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
    echo ""
    echo "You're on $CURRENT_BRANCH. Starting a new task?"

    # Get today's date in DD-MM-YYYY format
    TODAY=$(date +%d-%m-%Y)

    # Suggest branch name based on changes
    echo "Suggested branch: feat/feature-name-$TODAY"
    echo ""
    echo "Options:"
    echo "  1. Create suggested branch"
    echo "  2. Enter custom branch name"
    echo "  3. Stay on $CURRENT_BRANCH"
fi
```

## Step 1: Check Working Directory Status

```bash
echo "Checking git status..."

# Check for changes
if git diff --quiet && git diff --cached --quiet; then
    echo "No changes to commit"
    exit 0
fi

# Show current status
git status --short
```

## Step 2: Stage Changes

```bash
echo ""
echo "Staging changes..."

# Check if there are staged changes
if git diff --cached --quiet; then
    # No staged changes, stage modified and new files
    echo "No staged changes. Staging all modified and new files..."
    git add -A
    echo "Changes staged"
else
    echo "Using existing staged changes"
fi

# Show what will be committed
echo ""
echo "Files to be committed:"
git diff --cached --name-status
echo ""
```

## Step 3: Format Code

```bash
echo "Formatting code..."

# Format C# files (if dotnet format is available)
if command -v dotnet >/dev/null 2>&1 && [ -f "*.sln" ] || [ -f "*.csproj" ]; then
    dotnet format 2>/dev/null || true
    echo "  C# files formatted"
fi

# Format TypeScript/JavaScript files
if find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | head -1 | grep -q .; then
    if command -v npx >/dev/null 2>&1; then
        npx prettier --write "**/*.{ts,tsx,js,jsx,json}" 2>/dev/null || true
        echo "  TypeScript/JavaScript files formatted"
    fi
fi

# Re-stage formatted files
git add -u

echo "Formatting complete"
```

## Step 4: Generate Conventional Commit Message

```bash
echo ""
echo "Generating commit message..."

# Analyze changes to determine commit type
analyze_changes() {
    local diff_output=$(git diff --cached --name-status)

    # Count file types
    local cs_files=$(echo "$diff_output" | grep -c "\.cs$" || true)
    local ts_files=$(echo "$diff_output" | grep -c "\.\(ts\|tsx\|js\|jsx\)$" || true)
    local test_files=$(echo "$diff_output" | grep -c "test\|Test" || true)
    local doc_files=$(echo "$diff_output" | grep -c "\.\(md\|txt\)$" || true)

    # Check for specific patterns
    local has_new_files=$(echo "$diff_output" | grep -c "^A" || true)
    local has_deleted_files=$(echo "$diff_output" | grep -c "^D" || true)

    # Determine commit type
    if [ "$test_files" -gt 0 ] && [ "$test_files" = "$(echo "$diff_output" | wc -l)" ]; then
        echo "test"
    elif [ "$doc_files" -gt 0 ] && [ "$doc_files" = "$(echo "$diff_output" | wc -l)" ]; then
        echo "docs"
    elif [ "$has_new_files" -gt 0 ]; then
        echo "feat"
    elif [ "$has_deleted_files" -gt 0 ]; then
        echo "refactor"
    else
        echo "fix"
    fi
}

COMMIT_TYPE=$(analyze_changes)

# Generate commit message based on type and files
generate_message() {
    local type=$1
    local files=$(git diff --cached --name-only | head -5)

    # Determine scope from file paths
    local scope=""
    if echo "$files" | grep -q "Scripts/"; then
        scope="scripts"
    elif echo "$files" | grep -q "Blockchain/\|Wallet"; then
        scope="blockchain"
    elif echo "$files" | grep -q "UI/"; then
        scope="ui"
    elif echo "$files" | grep -q "Tests/"; then
        scope="tests"
    elif echo "$files" | grep -q "\.md$"; then
        scope="docs"
    fi

    # Get first changed file for more context
    local first_file=$(echo "$files" | head -1)
    local file_basename=$(basename "$first_file" | sed 's/\.[^.]*$//')

    # Generate message
    if [ -n "$scope" ]; then
        echo "$type($scope): update $file_basename"
    else
        echo "$type: update $file_basename"
    fi
}

COMMIT_MSG=$(generate_message "$COMMIT_TYPE")

echo "  Generated: $COMMIT_MSG"
echo ""
```

## Step 5: Show Changes Summary

```bash
echo "Changes summary:"
git diff --cached --stat

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Commit message: $COMMIT_MSG"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
```

## Step 6: Create Commit

```bash
# Create commit with conventional message
git commit -m "$COMMIT_MSG"

if [ $? -eq 0 ]; then
    echo ""
    echo "Commit created successfully!"

    # Show the commit
    echo ""
    git log -1 --stat

    echo ""
    echo "Next steps:"
    echo "  - Review commit: git show"
    echo "  - Amend if needed: git commit --amend"
    echo "  - Push changes: git push"
else
    echo ""
    echo "Commit failed"
    exit 1
fi
```

## Conventional Commit Types

| Type | When to Use |
|------|-------------|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `refactor` | Code restructuring without behavior change |
| `test` | Adding or updating tests |
| `docs` | Documentation changes |
| `style` | Code style/formatting (no logic change) |
| `chore` | Build process, dependencies, tooling |

### Scope Examples

- `feat(blockchain)`: New wallet connection feature
- `fix(ui)`: Bug fix in UI component
- `refactor(tests)`: Restructure test files
- `docs(readme)`: Update README

---

**Remember**: Quick commits help maintain momentum. For complex changes, use detailed commit messages.
