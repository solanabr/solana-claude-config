---
paths:
  - "programs/**/src/**/*.rs"
---

# Anchor Program Rules (Comprehensive Reference)

## Core Macros

### `declare_id!()`
Declares the onchain program address—unique public key from project keypair.

### `#[program]`
Marks module containing instruction entrypoints and business logic.

### `#[derive(Accounts)]`
Lists accounts an instruction requires with automatic constraint enforcement.

### `#[error_code]`
Enables custom error types with `#[msg(...)]` attributes.

## Account Types

| Type | Purpose |
|------|---------|
| `Signer<'info>` | Verifies account signed the transaction |
| `SystemAccount<'info>` | Confirms System Program ownership |
| `Program<'info, T>` | Validates executable program accounts |
| `Account<'info, T>` | Typed program account with automatic validation |
| `UncheckedAccount<'info>` | Raw account requiring manual validation |
| `InterfaceAccount<'info, T>` | SPL/Token2022 compatible typed account |
| `Interface<'info, T>` | SPL/Token2022 compatible program account |

## Account Constraints

### Initialization
```rust
#[account(
    init,
    payer = payer,
    space = 8 + CustomAccount::INIT_SPACE,
    seeds = [b"vault", authority.key().as_ref()],
    bump
)]
pub vault: Account<'info, Vault>,
```

### PDA Validation (with stored bump)
```rust
#[account(
    seeds = [b"vault", owner.key().as_ref()],
    bump = vault.bump  // Use stored bump, NOT recalculated
)]
pub vault: Account<'info, Vault>,
```

### Ownership and Relationships
```rust
#[account(
    mut,
    has_one = authority @ CustomError::InvalidAuthority,
    constraint = account.is_active @ CustomError::AccountInactive
)]
pub account: Account<'info, CustomAccount>,
```

### Instruction Arguments in Constraints
```rust
#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct Transfer<'info> {
    #[account(
        mut,
        has_one = authority,
        constraint = source.amount >= amount @ ErrorCode::InsufficientFunds
    )]
    pub source: Account<'info, TokenAccount>,
}
```

### Reallocation
```rust
#[account(
    mut,
    realloc = new_space,
    realloc::payer = payer,
    realloc::zero = true  // Clear old data when shrinking
)]
pub account: Account<'info, CustomAccount>,
```

### Closing Accounts
```rust
#[account(
    mut,
    close = destination,
    has_one = authority
)]
pub vault: Account<'info, Vault>,
```

## Account Discriminators (Anchor 0.31+)

Default: `sha256("account:<StructName>")[0..8]`. Custom:
```rust
#[account(discriminator = 1)]
pub struct Escrow { ... }
```
**Rules:** Must be unique; `[0]` conflicts with uninitialized accounts; `[1]` prevents `[1, 2, ...]`.

## PDA Management (CRITICAL)

**ALWAYS store canonical bump—saves ~1500 CU per access:**

```rust
#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub authority: Pubkey,  // 32
    pub bump: u8,           // 1 - ALWAYS STORE THIS
    pub balance: u64,       // 8
}

// Initialize with canonical bump
pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    vault.authority = ctx.accounts.authority.key();
    vault.bump = ctx.bumps.vault;  // Store canonical bump
    vault.balance = 0;
    Ok(())
}

// Use stored bump for CPIs
pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let authority = ctx.accounts.vault.authority;
    let seeds = &[
        b"vault",
        authority.as_ref(),
        &[ctx.accounts.vault.bump],  // Use stored bump!
    ];
    let signer_seeds = &[&seeds[..]];

    token::transfer(
        CpiContext::new_with_signer(/* ... */, signer_seeds),
        amount,
    )?;
    Ok(())
}
```

### Seed Collision Prevention
```rust
pub const USER_VAULT_SEED: &[u8] = b"user_vault";
pub const ADMIN_CONFIG_SEED: &[u8] = b"admin_config";
pub const POOL_STATE_SEED: &[u8] = b"pool_state";
```

## Arithmetic Safety

**ALWAYS use checked arithmetic. NEVER use unchecked operations.**

```rust
// Correct
let total = amount_a
    .checked_add(amount_b)
    .ok_or(ErrorCode::Overflow)?;

vault.balance = vault
    .balance
    .checked_sub(amount)
    .ok_or(ErrorCode::InsufficientFunds)?;

// Safe division
pub fn calculate_share(total: u64, amount: u64) -> Result<u64> {
    if total == 0 {
        return err!(ErrorCode::DivisionByZero);
    }
    amount
        .checked_mul(PRECISION)
        .and_then(|v| v.checked_div(total))
        .ok_or(ErrorCode::ArithmeticError.into())
}

// WRONG - can panic!
let total = amount_a + amount_b;
```

## Error Handling

**NEVER use `unwrap()` or `expect()` in program code (OK in tests).**

```rust
#[error_code]
pub enum ErrorCode {
    #[msg("Arithmetic overflow occurred")]
    Overflow,
    #[msg("Division by zero")]
    DivisionByZero,
    #[msg("Insufficient funds for operation")]
    InsufficientFunds,
    #[msg("Unauthorized: caller is not the authority")]
    Unauthorized,
    #[msg("Invalid account state")]
    InvalidAccountState,
    #[msg("Stale oracle price data")]
    StaleOracleData,
    #[msg("Slippage tolerance exceeded")]
    SlippageExceeded,
}

// Usage with require!
require!(value > 0, ErrorCode::InvalidAccountState);
require!(value < 100, ErrorCode::ValueError);

// Safe data access
let data = ctx.accounts.account.data
    .get(0..32)
    .ok_or(ErrorCode::InvalidAccountState)?;
```

## Cross-Program Invocations (CPIs)

### Basic CPI
```rust
let cpi_accounts = Transfer {
    from: ctx.accounts.from.to_account_info(),
    to: ctx.accounts.to.to_account_info(),
    authority: ctx.accounts.authority.to_account_info(),
};
let cpi_program = ctx.accounts.token_program.to_account_info();
let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

token::transfer(cpi_ctx, amount)?;
```

### PDA-Signed CPI
```rust
let seeds = &[
    b"vault",
    authority.as_ref(),
    &[ctx.accounts.vault.bump],
];
let signer_seeds = &[&seeds[..]];

let cpi_ctx = CpiContext::new_with_signer(
    ctx.accounts.token_program.to_account_info(),
    Transfer {
        from: ctx.accounts.vault_token_account.to_account_info(),
        to: ctx.accounts.recipient_token_account.to_account_info(),
        authority: ctx.accounts.vault.to_account_info(),
    },
    signer_seeds,
);

token::transfer(cpi_ctx, amount)?;
```

### Account Reloading After CPI (CRITICAL)

**Anchor doesn't automatically update deserialized accounts after CPI. Without `.reload()`, you have stale data!**

```rust
pub fn complex_operation(ctx: Context<ComplexOp>, amount: u64) -> Result<()> {
    // Before CPI: balance = 100
    msg!("Balance before: {}", ctx.accounts.token_account.amount);

    // Execute CPI that modifies the account
    token::transfer(cpi_ctx, amount)?;

    // WITHOUT RELOAD: balance still shows 100 (STALE DATA!)
    // WITH RELOAD: balance shows correct updated value

    ctx.accounts.token_account.reload()?;  // CRITICAL!
    msg!("Balance after: {}", ctx.accounts.token_account.amount);

    // Now safe to use updated balance
    require!(
        ctx.accounts.token_account.amount >= MIN_BALANCE,
        ErrorCode::BalanceTooLow
    );

    Ok(())
}
```

**When to reload:**
- After ANY CPI that modifies an account you hold a reference to
- Before making decisions based on account state post-CPI
- When chaining multiple CPIs that affect the same accounts

### CPI Target Validation
```rust
// Use Program<'info, T> to validate CPI targets
pub token_program: Program<'info, Token>,

// Or manual validation for dynamic programs
if cpi_program.key() != expected_program_id {
    return Err(ErrorCode::InvalidProgram.into());
}
```

## Token Accounts

### SPL Token
```rust
#[account(
    mint::decimals = 9,
    mint::authority = authority,
)]
pub mint: Account<'info, Mint>,

#[account(
    mut,
    associated_token::mint = mint,
    associated_token::authority = owner,
)]
pub token_account: Account<'info, TokenAccount>,
```

### Token2022 Compatibility
```rust
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

pub mint: InterfaceAccount<'info, Mint>,
pub token_account: InterfaceAccount<'info, TokenAccount>,
pub token_program: Interface<'info, TokenInterface>,
```

## Event Emission

```rust
#[event]
pub struct Deposit {
    #[index]
    pub user: Pubkey,
    pub amount: u64,
    pub new_balance: u64,
    pub timestamp: i64,
}

// Emit on state changes
pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    vault.balance = vault.balance.checked_add(amount)
        .ok_or(ErrorCode::Overflow)?;

    emit!(Deposit {
        user: ctx.accounts.authority.key(),
        amount,
        new_balance: vault.balance,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}
```

## Advanced Patterns

### Zero-Copy Accounts (Large Data)
```rust
#[account(zero_copy)]
pub struct LargeAccount {
    pub data: [u8; 10000],
}
```
Accounts under 10,240 bytes use `init`; larger require external creation then `zero` constraint.

### LazyAccount (Anchor 0.31+)
```rust
// Cargo.toml: anchor-lang = { features = ["lazy-account"] }
pub account: LazyAccount<'info, CustomAccountType>,

// Read-only, heap-allocated. Use unload() after CPIs to refresh.
let value = ctx.accounts.account.get_value()?;
```

### Remaining Accounts
```rust
pub fn batch_operation(ctx: Context<BatchOp>, amounts: Vec<u64>) -> Result<()> {
    let remaining = &ctx.remaining_accounts;
    require!(remaining.len() % 2 == 0, BatchError::InvalidSchema);

    for (i, chunk) in remaining.chunks(2).enumerate() {
        process_pair(&chunk[0], &chunk[1], amounts[i])?;
    }
    Ok(())
}
```

### Context Implementation Pattern
```rust
impl<'info> Transfer<'info> {
    pub fn transfer_tokens(&mut self, amount: u64) -> Result<()> {
        // Move logic here for organization and testability
        Ok(())
    }
}
```

## CU Optimization

```rust
// Store bumps, don't recalculate (saves ~1500 CU per access)
pub struct Vault {
    pub bump: u8,
}

// Feature-gate logs
#[cfg(feature = "debug")]
msg!("Debug: value = {}", value);

// Use zero-copy for large accounts
#[account(zero_copy)]
pub struct LargeAccount { ... }

// Profile with sol_log_compute_units!()
```

## Anti-Patterns to Avoid

| Don't | Do Instead |
|-------|------------|
| `unwrap()` in program code | Proper error handling with `?` |
| Unchecked arithmetic | `checked_add`, `checked_sub`, etc. |
| Recalculate PDA bumps | Store canonical bump |
| Skip account validation | Use constraints and manual checks |
| Forget to reload after CPI | Call `.reload()?` on modified accounts |
| Accept user-provided program IDs | Hardcode or validate against known IDs |
| Use `msg!()` excessively | Feature-gate debug logs |
| Use `init_if_needed` | Permits reinitialization attacks |

## Security Checklist (Per Instruction)

- [ ] All accounts validated (owner, signer, PDA)
- [ ] Arithmetic uses checked operations
- [ ] No `unwrap()` or `expect()` in program code
- [ ] Error codes defined and descriptive
- [ ] PDA bumps stored and reused
- [ ] CPI targets validated (Program<'info, T> or hardcoded)
- [ ] Accounts reloaded after CPI if modified
- [ ] Events emitted for state changes
- [ ] Proper access control enforced
- [ ] Reentrancy protection considered
- [ ] Integer overflow/underflow prevented
