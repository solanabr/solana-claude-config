---
globs:
  - "**/*.rs"
exclude:
  - "**/target/**"
---

# Rust Code Standards for Solana

These rules apply to all Rust code in the project, including tests.

## Error Handling

### NEVER use unwrap() or expect() in production code

```rust
// BAD
let value = some_option.unwrap();
let result = risky_operation().expect("failed");

// GOOD
let value = some_option.ok_or(ErrorCode::MissingValue)?;
let result = risky_operation()?;
```

**Note**: `unwrap()` is acceptable in tests and build scripts where panicking is appropriate.

### Use Result types properly

```rust
// BAD
pub fn process() {
    // Can panic
}

// GOOD
pub fn process() -> Result<(), ProgramError> {
    // Errors propagated
    Ok(())
}
```

## Arithmetic Safety

### ALWAYS use checked arithmetic

```rust
// BAD - can overflow/panic
let total = a + b;
let difference = a - b;
let product = a * b;

// GOOD - checked operations
let total = a.checked_add(b).ok_or(ErrorCode::Overflow)?;
let difference = a.checked_sub(b).ok_or(ErrorCode::Underflow)?;
let product = a.checked_mul(b).ok_or(ErrorCode::Overflow)?;
```

### Handle division by zero

```rust
// BAD
let ratio = amount / divisor;

// GOOD
if divisor == 0 {
    return Err(ErrorCode::DivisionByZero.into());
}
let ratio = amount.checked_div(divisor).ok_or(ErrorCode::DivisionError)?;
```

## Type Conversions

### Use try_into() for safe conversions

```rust
// BAD
let value: u32 = large_u64 as u32;  // Truncates!

// GOOD
let value: u32 = large_u64
    .try_into()
    .map_err(|_| ErrorCode::ConversionError)?;
```

## Code Style

### Follow Rust naming conventions

```rust
// Types: PascalCase
struct UserAccount {}
enum ErrorCode {}

// Functions, variables: snake_case
fn process_transaction() {}
let user_balance = 0;

// Constants: SCREAMING_SNAKE_CASE
const MAX_USERS: u64 = 1000;

// Lifetimes: short, lowercase
fn process<'a>(data: &'a [u8]) {}
```

### Use descriptive names

```rust
// BAD
let x = get_data();
fn proc(a: u64) -> u64 {}

// GOOD
let user_balance = get_balance();
fn calculate_interest(principal: u64) -> u64 {}
```

## Documentation

### Document public APIs

```rust
/// Calculates the interest for a given principal and rate.
///
/// # Arguments
/// * `principal` - The initial amount
/// * `rate` - Interest rate in basis points (100 = 1%)
///
/// # Returns
/// The calculated interest amount
///
/// # Errors
/// Returns `ErrorCode::Overflow` if calculation overflows
pub fn calculate_interest(principal: u64, rate: u16) -> Result<u64, ProgramError> {
    // Implementation
}
```

## Testing

### Write tests for all public functions

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_interest() {
        // unwrap() is OK in tests
        let result = calculate_interest(1000, 500).unwrap();
        assert_eq!(result, 50);
    }

    #[test]
    fn test_overflow() {
        let result = calculate_interest(u64::MAX, 100);
        assert!(result.is_err());
    }
}
```

## Performance

### Avoid unnecessary allocations

```rust
// BAD - allocates every time
fn format_message(id: u64) -> String {
    format!("ID: {}", id)
}

// GOOD - reuse buffer
fn format_message(id: u64, buf: &mut String) -> std::fmt::Result {
    use std::fmt::Write;
    write!(buf, "ID: {}", id)
}
```

### Use borrows correctly

```rust
// BAD - unnecessary clone
fn process(data: Vec<u8>) {
    let copy = data.clone();
}

// GOOD - use reference
fn process(data: &[u8]) {
    // Work with borrowed data
}
```

## Solana-Specific Rust

### Use Solana types consistently

```rust
use solana_program::{
    pubkey::Pubkey,
    program_error::ProgramError,
    msg,
};

// Use Pubkey for addresses
let authority: Pubkey = /* ... */;

// Use ProgramError for errors
fn validate() -> Result<(), ProgramError> {
    Ok(())
}
```

### Minimize logging in production

```rust
// Use feature flags for debug logging
#[cfg(feature = "debug")]
msg!("Debug: Processing transaction");

// Always log errors
msg!("Error: {}", error_code);
```

## Formatting

### Always run rustfmt

```bash
cargo fmt
```

## Linting

### Always run clippy

```bash
cargo clippy --all-targets -- -D warnings
```

---

**Remember**: These rules ensure code safety, maintainability, and Solana compatibility. Security is paramount.
