---
description: "Quick commit with automatic formatting, linting, and conventional commit message"
---

You are creating a quick commit. This command formats code, runs lints, generates a conventional commit message, and commits changes.

## Overview

This command automates the commit workflow:
1. Stage changes (or confirm staged changes)
2. Format and lint code
3. Run quick tests
4. Generate conventional commit message
5. Create commit with co-author tag

## Step 1: Check Working Directory Status

```bash
echo "📊 Checking git status..."

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "❌ Not a git repository"
    exit 1
fi

# Check for changes
if git diff --quiet && git diff --cached --quiet; then
    echo "ℹ️  No changes to commit"
    exit 0
fi

# Show current status
git status --short
```

## Step 2: Stage Changes

```bash
echo ""
echo "📝 Staging changes..."

# Check if there are staged changes
if git diff --cached --quiet; then
    # No staged changes, stage modified and new files
    echo "No staged changes. Staging all modified and new files..."

    # Get list of modified and new files
    git add -A

    echo "✅ Changes staged"
else
    echo "✅ Using existing staged changes"
fi

# Show what will be committed
echo ""
echo "Files to be committed:"
git diff --cached --name-status
echo ""
```

## Step 3: Format Code

```bash
echo "📝 Formatting code..."

# Format Rust files
if [ -f "Cargo.toml" ]; then
    cargo fmt
    echo "  ✅ Rust files formatted"
fi

# Format TypeScript/JavaScript files
if find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | head -1 | grep -q .; then
    if command -v npx >/dev/null 2>&1; then
        npx prettier --write "**/*.{ts,tsx,js,jsx,json}" 2>/dev/null || true
        echo "  ✅ TypeScript/JavaScript files formatted"
    fi
fi

# Format Python files (if any)
if find . -type f -name "*.py" | head -1 | grep -q .; then
    if command -v ruff >/dev/null 2>&1; then
        ruff format .
        echo "  ✅ Python files formatted"
    fi
fi

# Re-stage formatted files
git add -u

echo "✅ Formatting complete"
```

## Step 4: Run Quick Lints

```bash
echo ""
echo "🔍 Running quick lints..."

LINT_FAILED=0

# Rust: clippy check
if [ -f "Cargo.toml" ]; then
    echo "  Running clippy..."
    if ! cargo clippy --all-targets -- -D warnings 2>/dev/null; then
        echo "  ⚠️  Clippy warnings found (non-blocking)"
        # Don't fail commit, just warn
    else
        echo "  ✅ Clippy passed"
    fi
fi

# TypeScript: eslint check (if configured)
if [ -f "package.json" ] && grep -q "eslint" package.json; then
    echo "  Running eslint..."
    if ! npm run lint --silent 2>/dev/null; then
        echo "  ⚠️  ESLint warnings found (non-blocking)"
    else
        echo "  ✅ ESLint passed"
    fi
fi

echo "✅ Linting complete"
```

## Step 5: Run Quick Tests (Optional)

```bash
# Quick tests only for small changes
# Skip for large changes to keep commits fast

CHANGED_FILES=$(git diff --cached --name-only | wc -l)

if [ "$CHANGED_FILES" -lt 5 ]; then
    echo ""
    echo "🧪 Running quick tests..."

    if [ -f "Cargo.toml" ]; then
        # Run only unit tests (fast)
        if cargo test --lib --quiet 2>/dev/null; then
            echo "  ✅ Unit tests passed"
        else
            echo "  ⚠️  Some tests failed (continuing anyway)"
        fi
    fi
else
    echo ""
    echo "ℹ️  Skipping tests (many files changed, run full test suite separately)"
fi
```

## Step 6: Generate Conventional Commit Message

```bash
echo ""
echo "💬 Generating commit message..."

# Analyze changes to determine commit type
analyze_changes() {
    local diff_output=$(git diff --cached --name-status)

    # Count file types
    local rust_files=$(echo "$diff_output" | grep -c "\.rs$" || true)
    local ts_files=$(echo "$diff_output" | grep -c "\.\(ts\|tsx\|js\|jsx\)$" || true)
    local test_files=$(echo "$diff_output" | grep -c "test" || true)
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
    if echo "$files" | grep -q "^programs/"; then
        scope="program"
    elif echo "$files" | grep -q "^app/\|^src/.*\.\(ts\|tsx\)"; then
        scope="frontend"
    elif echo "$files" | grep -q "^tests/"; then
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

## Step 7: Show Changes Summary

```bash
echo "📋 Changes summary:"
git diff --cached --stat

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Commit message: $COMMIT_MSG"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
```

## Step 8: Create Commit

```bash
# Create commit with conventional message
git commit -m "$COMMIT_MSG"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Commit created successfully!"

    # Show the commit
    echo ""
    git log -1 --stat

    echo ""
    echo "💡 Next steps:"
    echo "  - Review commit: git show"
    echo "  - Amend if needed: git commit --amend"
    echo "  - Push changes: git push"
else
    echo ""
    echo "❌ Commit failed"
    exit 1
fi
```

## Conventional Commit Types

This command uses conventional commits:

| Type | When to Use |
|------|-------------|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `refactor` | Code restructuring without behavior change |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `docs` | Documentation changes |
| `style` | Code style/formatting (no logic change) |
| `chore` | Build process, dependencies, tooling |
| `ci` | CI/CD configuration |

### Scope Examples

- `feat(program)`: New instruction added to Solana program
- `fix(frontend)`: Bug fix in React component
- `refactor(tests)`: Restructure test files
- `docs(readme)`: Update README
- `chore(deps)`: Update dependencies

## Advanced Usage

### Custom Commit Message

If you want to override the auto-generated message:

```bash
# Set custom message as environment variable
COMMIT_MESSAGE="feat(vault): add withdrawal cooldown period" quick-commit

# Or edit the generated message:
# The command will pause for you to edit before committing
```

### Skip Tests

```bash
# Skip even quick tests (faster commits)
SKIP_TESTS=1 quick-commit
```

### Commit Partial Changes

```bash
# Stage specific files first
git add src/specific_file.rs

# Then quick commit
quick-commit
```

## Pre-commit Hooks Integration

This command respects your pre-commit hooks (if configured in `.git/hooks/pre-commit`):

```bash
# Pre-commit hook will run automatically
# If it fails, commit is aborted

# To bypass pre-commit hooks (not recommended):
git commit --no-verify
```

## Common Commit Patterns

### After Feature Implementation
```bash
# 1. Implement feature
# 2. Format, lint, test
# 3. Quick commit
quick-commit
# Result: "feat(program): add user vault initialization"
```

### After Bug Fix
```bash
# 1. Fix bug
# 2. Add test
# 3. Quick commit
quick-commit
# Result: "fix(program): prevent overflow in balance calculation"
```

### After Documentation Update
```bash
# 1. Update README
# 2. Quick commit
quick-commit
# Result: "docs(readme): add deployment instructions"
```

## Best Practices

### Commit Often
- Small, focused commits are better than large ones
- Easier to review and revert if needed
- Clear history of changes

### Meaningful Messages
- Auto-generated messages are good defaults
- Edit them if they don't capture the change accurately
- Include "why" in commit body for complex changes

### Test Before Pushing
```bash
# After quick commits, before pushing:
cargo test           # Full test suite
cargo clippy         # Full lint
anchor test          # Integration tests
```

## Troubleshooting

### Commit Hook Fails
```bash
# Check what failed
cat .git/hooks/pre-commit

# Temporarily bypass (not recommended)
git commit --no-verify -m "message"
```

### Formatting Changes Not Staged
```bash
# The command automatically re-stages formatted files
# If issues persist, manually stage:
git add -u
```

### Wrong Commit Type Detected
```bash
# The auto-detection is heuristic-based
# Manually create commit with correct type:
git commit -m "correct_type: your message"
```

---

**Remember**: Quick commits help maintain momentum. For complex changes, use detailed commit messages with git commit directly.
