---
description: "Run Rust tests for Solana programs and backend services"
---

You are running Rust tests. This command handles unit tests, integration tests, and Solana-specific testing frameworks.

## Step 1: Identify Project Type

```bash
# Check what kind of Rust project this is
if [ -f "Anchor.toml" ]; then
    echo "📦 Anchor project detected"
    PROJECT_TYPE="anchor"
elif grep -q "solana-program" Cargo.toml 2>/dev/null; then
    echo "⚙️  Solana native program detected"
    PROJECT_TYPE="solana"
elif grep -q "axum\|tokio" Cargo.toml 2>/dev/null; then
    echo "🌐 Rust backend service detected"
    PROJECT_TYPE="backend"
else
    echo "🦀 Standard Rust project detected"
    PROJECT_TYPE="standard"
fi
```

## Step 2: Run Unit Tests

### For All Projects

```bash
# Run unit tests with output
cargo test --lib

# Run specific test
cargo test test_name

# Run tests with logging
RUST_LOG=debug cargo test -- --nocapture

# Run tests in release mode (faster for compute-heavy tests)
cargo test --release
```

### For Solana Programs (Mollusk)

```bash
# Run Mollusk unit tests (fast, isolated)
cargo test --lib --features test-sbf

# Example test output shows:
# - CU consumption per test
# - Account state changes
# - Program logs
```

## Step 3: Run Integration Tests

### For Anchor Programs

```bash
# Run Anchor tests (uses Bankrun or local validator)
anchor test

# Run without building (if already built)
anchor test --skip-build

# Run specific test file
anchor test tests/integration.ts

# Run with detailed logs
RUST_LOG=debug anchor test
```

### For LiteSVM Tests

```bash
# Run LiteSVM integration tests
cargo test --test '*' --features litesvm

# LiteSVM provides:
# - Fast integration testing
# - Multi-program interactions
# - Account state verification
```

## Step 4: Run Fuzz Tests (if configured)

```bash
# Check if Trident is set up
if [ -d "trident-tests" ]; then
    echo "🔍 Running fuzz tests with Trident..."
    cd trident-tests

    # Run fuzz tests (Trident v0.7+)
    trident fuzz run

    # Run for specific time (e.g., 5 minutes)
    trident fuzz run --timeout 300

    cd ..
else
    echo "ℹ️  No fuzz tests configured (use trident init to set up)"
fi
```

## Step 5: Run Doc Tests

```bash
# Test code examples in documentation comments
cargo test --doc

# These are the examples in /// comments:
# /// ```rust
# /// assert_eq!(add(2, 2), 4);
# /// ```
```

## Step 6: Check Test Coverage

```bash
# Install tarpaulin if not present
if ! command -v cargo-tarpaulin &> /dev/null; then
    echo "Installing cargo-tarpaulin..."
    cargo install cargo-tarpaulin
fi

# Generate coverage report
cargo tarpaulin --out Html --output-dir coverage

echo "📊 Coverage report: coverage/index.html"
```

## Project-Specific Test Patterns

### Anchor Program Tests

```bash
# Comprehensive Anchor test run
echo "🔨 Building program..."
anchor build

echo "🧪 Running unit tests..."
cargo test --lib

echo "🔗 Running integration tests..."
anchor test --skip-deploy

echo "✅ All Anchor tests complete"
```

### Native Solana Program Tests

```bash
# Build for SBF
cargo build-sbf

# Run Mollusk unit tests
echo "🧪 Unit tests (Mollusk)..."
cargo test --lib

# Run LiteSVM integration tests
echo "🔗 Integration tests (LiteSVM)..."
cargo test --test '*'

# Run on local validator (if needed)
if [ "$FULL_INTEGRATION" = "true" ]; then
    echo "🌐 Starting local validator..."
    solana-test-validator &
    VALIDATOR_PID=$!

    sleep 5
    cargo test-sbf

    kill $VALIDATOR_PID
fi
```

### Backend Service Tests

```bash
# Run all backend tests
cargo test

# Run with test database
if [ -f ".env.test" ]; then
    export $(cat .env.test | xargs)
fi

# Run integration tests against test database
cargo test --test '*' -- --test-threads=1

# Run async tests
cargo test --features tokio-test
```

## Common Test Flags

```bash
# Show println! output
cargo test -- --nocapture

# Run tests in parallel (default)
cargo test

# Run tests serially (for integration tests with shared state)
cargo test -- --test-threads=1

# Run only fast tests (custom feature)
cargo test --features fast-tests

# Run ignored tests
cargo test -- --ignored

# Run all tests including ignored
cargo test -- --include-ignored

# Show test execution time
cargo test -- --show-output
```

## Debugging Failed Tests

```bash
# Run specific failing test with logs
RUST_LOG=trace cargo test failing_test_name -- --nocapture --exact

# For Solana programs, check transaction logs
# Failed tests will show:
# - Program logs
# - Error codes
# - Account states
# - CU consumption

# Run with backtrace
RUST_BACKTRACE=1 cargo test failing_test

# Full backtrace
RUST_BACKTRACE=full cargo test failing_test
```

## Performance Testing

```bash
# Run benchmarks (if configured)
cargo bench

# Profile test execution
cargo test --release -- --nocapture

# For Solana programs, check CU usage in test output
```

## CI/CD Test Pattern

```bash
# Comprehensive test suite for CI
set -e  # Exit on first failure

echo "📝 Checking format..."
cargo fmt -- --check

echo "🔎 Running clippy..."
cargo clippy --all-targets -- -D warnings

echo "🧪 Running unit tests..."
cargo test --lib

echo "🔗 Running integration tests..."
if [ -f "Anchor.toml" ]; then
    anchor test --skip-deploy
else
    cargo test --test '*'
fi

echo "📚 Testing documentation..."
cargo test --doc

echo "✅ All tests passed!"
```

## Test Organization Best Practices

### Unit Tests (in src/ files)
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculation() {
        assert_eq!(calculate(2, 2), 4);
    }

    #[test]
    fn test_error_case() {
        let result = risky_operation();
        assert!(result.is_err());
    }
}
```

### Integration Tests (tests/ directory)
```
tests/
├── common/
│   └── mod.rs          # Shared test utilities
├── integration.rs      # Integration tests
└── e2e.rs             # End-to-end tests
```

### Mollusk Tests (Solana programs)
```rust
#[cfg(test)]
mod tests {
    use mollusk_svm::Mollusk;

    #[test]
    fn test_initialize() {
        let program_id = Pubkey::new_unique();
        let mollusk = Mollusk::new(&program_id, "target/deploy/program.so");

        let instruction = /* ... */;
        let result = mollusk.process_instruction(&instruction, &accounts);

        assert!(result.program_result.is_ok());

        // Check CU usage
        println!("CU used: {}", result.compute_units_consumed);
    }
}
```

## When Tests Fail

1. **Read the error message carefully**
   - Error code/message
   - Failed assertion
   - Stack trace

2. **For Solana programs:**
   - Check program logs in test output
   - Verify account validation logic
   - Confirm PDA derivations
   - Check for arithmetic errors

3. **For backend services:**
   - Check database state
   - Verify mock expectations
   - Confirm async/await usage
   - Check environment variables

4. **Common fixes:**
   - Update test data
   - Fix race conditions (use `--test-threads=1`)
   - Clear test database
   - Rebuild program (`anchor build`)

## Test Checklist

Before committing:
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] No warnings from clippy
- [ ] Code is formatted
- [ ] New features have tests
- [ ] Edge cases covered
- [ ] Error cases tested

---

**Remember**: Tests are your safety net. Write them, run them, trust them.
