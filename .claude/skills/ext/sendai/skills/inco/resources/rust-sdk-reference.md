# Inco SVM — Rust SDK Reference

Complete API reference for the `inco-lightning` Rust crate used in Anchor programs.

## Imports

```rust
use anchor_lang::prelude::*;
use inco_lightning::cpi::accounts::{Operation, Allow, IsAllowed, VerifySignature};
use inco_lightning::cpi::{
    // Input
    new_euint128, new_ebool, as_euint128, as_ebool,
    // Arithmetic
    e_add, e_sub, e_mul, e_rem,
    // Comparison
    e_ge, e_gt, e_le, e_lt, e_eq,
    // Bitwise
    e_and, e_or, e_not, e_shl, e_shr,
    // Control flow
    e_select,
    // Random
    e_rand,
    // Access control
    allow, is_allowed,
    // Decryption verification
    is_validsignature,
};
use inco_lightning::types::{Euint128, Ebool};
use inco_lightning::ID as INCO_LIGHTNING_ID;
```

## Program ID

```
5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj
```

## Encrypted Types

| Type | Definition | Size |
|------|-----------|------|
| `Euint128` | `pub struct Euint128(pub u128)` | 16 bytes |
| `Ebool` | `pub struct Ebool(pub u128)` | 16 bytes |

Handles are deterministic: same operation + same inputs = same handle.

## CPI Context

All operations require a CPI context with the `Operation` account struct:

```rust
let cpi_ctx = CpiContext::new(
    ctx.accounts.inco_lightning_program.to_account_info(),
    Operation {
        signer: ctx.accounts.authority.to_account_info(),
    },
);
```

## Input Functions

### `new_euint128`

Create encrypted handle from client-side ciphertext.

```rust
pub fn new_euint128(ctx: CpiContext<Operation>, ciphertext: Vec<u8>, input_type: u8) -> Result<Euint128>
```

- `ciphertext` — hex-decoded output from `encryptValue()` on the client
- `input_type` — `0` for ciphertext input

### `new_ebool`

```rust
pub fn new_ebool(ctx: CpiContext<Operation>, ciphertext: Vec<u8>, input_type: u8) -> Result<Ebool>
```

### `as_euint128`

Trivial encryption — converts a plaintext `u128` to an encrypted handle. Use only for public constants (e.g., zero).

```rust
pub fn as_euint128(ctx: CpiContext<Operation>, value: u128) -> Result<Euint128>
```

```rust
let zero = as_euint128(cpi_ctx, 0)?;
```

### `as_ebool`

```rust
pub fn as_ebool(ctx: CpiContext<Operation>, value: bool) -> Result<Ebool>
```

## Arithmetic Operations

All return `Euint128`. The `scalar_byte` param: `0` = both operands encrypted, `1` = left operand is plaintext.

| Function | Signature |
|----------|-----------|
| `e_add` | `(CpiContext<Operation>, Euint128, Euint128, u8) -> Result<Euint128>` |
| `e_sub` | `(CpiContext<Operation>, Euint128, Euint128, u8) -> Result<Euint128>` |
| `e_mul` | `(CpiContext<Operation>, Euint128, Euint128, u8) -> Result<Euint128>` |
| `e_rem` | `(CpiContext<Operation>, Euint128, Euint128, u8) -> Result<Euint128>` |

```rust
let sum = e_add(cpi_ctx, balance, deposit_amount, 0)?;
let diff = e_sub(cpi_ctx, balance, withdrawal, 0)?;
```

## Comparison Operations

All return `Ebool`.

| Function | Description |
|----------|-------------|
| `e_ge` | Greater than or equal |
| `e_gt` | Greater than |
| `e_le` | Less than or equal |
| `e_lt` | Less than |
| `e_eq` | Equal |

```rust
let has_enough: Ebool = e_ge(cpi_ctx, balance, amount, 0)?;
let is_match: Ebool = e_eq(cpi_ctx, guess, answer, 0)?;
```

## Bitwise Operations

| Function | Description | Returns |
|----------|-------------|---------|
| `e_and` | Bitwise AND | `Euint128` |
| `e_or` | Bitwise OR | `Euint128` |
| `e_not` | Bitwise NOT | `Euint128` |
| `e_shl` | Shift left | `Euint128` |
| `e_shr` | Shift right | `Euint128` |

## Control Flow — `e_select`

The **multiplexer pattern**. You cannot use `if/else` on encrypted conditions — use `e_select` instead.

```rust
pub fn e_select(
    ctx: CpiContext<Operation>,
    condition: Ebool,
    if_true: Euint128,
    if_false: Euint128,
    scalar_byte: u8,
) -> Result<Euint128>
```

```rust
let has_balance = e_ge(cpi_ctx.clone(), balance, transfer_amount, 0)?;
let actual_transfer = e_select(cpi_ctx.clone(), has_balance, transfer_amount, zero, 0)?;
let new_sender_balance = e_sub(cpi_ctx.clone(), balance, actual_transfer, 0)?;
```

## Random Number Generation

```rust
pub fn e_rand(ctx: CpiContext<Operation>, scalar_byte: u8) -> Result<Euint128>
```

Returns an encrypted random value. Cannot be predicted until decrypted.

```rust
let random = e_rand(cpi_ctx, 0)?;
```

## Access Control — `allow` / `is_allowed`

### `allow`

Grant or revoke decryption permission for a handle to a specific address.

```rust
pub fn allow(
    ctx: CpiContext<Allow>,
    handle: u128,
    grant: bool,      // true = grant, false = revoke
    allowed: Pubkey,
) -> Result<()>
```

**Account struct:**
```rust
pub struct Allow<'info> {
    pub allowance_account: AccountInfo<'info>,  // PDA: [handle.to_le_bytes(), allowed_address]
    pub signer: AccountInfo<'info>,
    pub allowed_address: AccountInfo<'info>,
    pub system_program: AccountInfo<'info>,
}
```

### `is_allowed`

Check if an address has decryption permission.

```rust
pub fn is_allowed(ctx: CpiContext<IsAllowed>, handle: u128) -> Result<bool>
```

## Decryption Verification — `is_validsignature`

Verify an Ed25519 attestation from the covalidator on-chain.

```rust
pub fn is_validsignature(
    ctx: CpiContext<VerifySignature>,
    expected_sig_count: u8,
    handles: Option<Vec<Vec<u8>>>,
    plaintext_values: Option<Vec<Vec<u8>>>,
) -> Result<()>
```

**Account struct:**
```rust
pub struct VerifySignature<'info> {
    pub instructions: AccountInfo<'info>,  // SYSVAR_INSTRUCTIONS_ID
    pub signer: AccountInfo<'info>,
}
```

```rust
use solana_program::sysvar::instructions as sysvar_instructions;

#[derive(Accounts)]
pub struct VerifyDecryption<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Sysvar instructions account
    #[account(address = sysvar_instructions::ID)]
    pub instructions: AccountInfo<'info>,
    /// CHECK: Inco Lightning program
    #[account(address = INCO_LIGHTNING_ID)]
    pub inco_lightning_program: AccountInfo<'info>,
}
```

## Account Integration Pattern

Add Inco Lightning to your instruction accounts:

```rust
#[derive(Accounts)]
pub struct MyInstruction<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub my_account: Account<'info, MyState>,
    /// CHECK: Inco Lightning program for encrypted operations
    #[account(address = INCO_LIGHTNING_ID)]
    pub inco_lightning_program: AccountInfo<'info>,
}
```

For access control operations, also include:

```rust
#[derive(Accounts)]
pub struct GrantAccess<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Allowance PDA
    #[account(mut)]
    pub allowance_account: AccountInfo<'info>,
    /// CHECK: Address being granted access
    pub allowed_address: AccountInfo<'info>,
    /// CHECK: Inco Lightning program
    #[account(address = INCO_LIGHTNING_ID)]
    pub inco_lightning_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}
```
