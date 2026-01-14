---
paths:
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

## Memory Safety

### Avoid unsafe code unless absolutely necessary
```rust
// Only use unsafe when:
// 1. Performance is critical
// 2. Safety invariants are documented
// 3. Code is thoroughly tested
unsafe {
    // Document why this is safe
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

### Document safety invariants for unsafe code
```rust
/// # Safety
/// The caller must ensure that:
/// - `ptr` is valid and points to initialized memory
/// - `len` matches the actual length of the data
unsafe fn from_raw(ptr: *const u8, len: usize) -> &'static [u8] {
    std::slice::from_raw_parts(ptr, len)
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

### Use appropriate data structures
```rust
// Use Vec for sequential access
let items: Vec<u64> = vec![];

// Use HashMap for key-value lookups
use std::collections::HashMap;
let balances: HashMap<Pubkey, u64> = HashMap::new();

// Use BTreeMap for sorted iteration
use std::collections::BTreeMap;
let ordered: BTreeMap<u64, Data> = BTreeMap::new();
```

### Avoid unnecessary allocations
```rust
// BAD - allocates every time
fn format_message(id: u64) -> String {
    format!("ID: {}", id)
}

// GOOD - reuse buffer (note: write! returns Result, handle it)
fn format_message(id: u64, buf: &mut String) -> std::fmt::Result {
    use std::fmt::Write;
    write!(buf, "ID: {}", id)
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

### Input validation
```rust
use solana_program::program_error::ProgramError;

pub fn process(amount: u64, minimum: u64, max_amount: u64) -> Result<(), ProgramError> {
    // Validate before processing
    if amount < minimum {
        return Err(ProgramError::InvalidArgument);
    }
    if amount > max_amount {
        return Err(ProgramError::InvalidArgument);
    }

    // Process...
    Ok(())
}
```

## Dependencies

### Minimize external dependencies
- Solana programs have size limits
- Fewer dependencies = smaller binary
- Audit all dependencies for security

### Use workspace dependencies
```toml
# In workspace Cargo.toml
[workspace.dependencies]
solana-program = "2.0"
borsh = "1.5"

# In program Cargo.toml
[dependencies]
solana-program = { workspace = true }
```

## Security

### Use const for fixed values
```rust
// GOOD - compile-time constant
const SECONDS_PER_DAY: i64 = 86_400;

// BAD - runtime allocation
let seconds_per_day = 86400;
```

## Code Organization

### One concept per file
```
src/
├── lib.rs           # Entry point
├── state.rs         # Account structures
├── instructions/    # Instruction handlers
│   ├── mod.rs
│   ├── initialize.rs
│   └── transfer.rs
├── errors.rs        # Error definitions
└── utils.rs         # Helper functions
```

### Use modules appropriately
```rust
// lib.rs
pub mod state;
pub mod instructions;
mod errors;  // Private
mod utils;   // Private

// Re-export public items
pub use state::*;
pub use instructions::*;
```

## Common Patterns

### Builder pattern for complex construction
```rust
pub struct TransactionBuilder {
    amount: Option<u64>,
    recipient: Option<Pubkey>,
}

impl TransactionBuilder {
    pub fn new() -> Self {
        Self { amount: None, recipient: None }
    }

    pub fn amount(mut self, amount: u64) -> Self {
        self.amount = Some(amount);
        self
    }

    pub fn recipient(mut self, recipient: Pubkey) -> Self {
        self.recipient = Some(recipient);
        self
    }

    pub fn build(self) -> Result<Transaction, ProgramError> {
        Ok(Transaction {
            amount: self.amount.ok_or(ProgramError::InvalidArgument)?,
            recipient: self.recipient.ok_or(ProgramError::InvalidArgument)?,
        })
    }
}
```

### Iterator over loops when possible
```rust
// BAD
let mut sum = 0;
for i in 0..items.len() {
    sum += items[i];
}

// GOOD
let sum: u64 = items.iter().sum();
```

## Formatting

### Always run rustfmt
```bash
cargo fmt
```

### Configuration
```toml
# rustfmt.toml
max_width = 100
tab_spaces = 4
edition = "2021"
```

## Linting

### Always run clippy
```bash
cargo clippy --all-targets -- -D warnings
```

### Address all warnings
- Don't disable lints without good reason
- Document why lints are disabled if necessary
```rust
#[allow(clippy::too_many_arguments)]  // Required for CPI compatibility
pub fn complex_function(/* many args */) {}
```

---

**Remember**: These rules ensure code safety, maintainability, and Solana compatibility. Security is paramount - when in doubt, choose the safer option.
