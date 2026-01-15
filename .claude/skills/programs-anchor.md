# Programs with Anchor (default choice)

## When to use Anchor
Use Anchor by default when:
- You want fast iteration with reduced boilerplate
- You want an IDL and TypeScript client story out of the box
- You want mature testing and workspace tooling
- You need built-in security through automatic account validation

## Core Advantages
- **Reduced Boilerplate**: Abstracts repetitive account management, instruction serialization, and error handling
- **Built-in Security**: Automatic account-ownership verification and data validation
- **IDL Generation**: Automatic interface definition for client generation

## Core Macros

### `declare_id!()`
Declares the onchain address where the program resides—a unique public key derived from the project's keypair.

### `#[program]`
Marks the module containing every instruction entrypoint and business-logic function.

### `#[derive(Accounts)]`
Lists accounts an instruction requires and automatically enforces their constraints:
- Declares all necessary accounts for specific instructions
- Enforces constraint checks automatically to block bugs and exploits
- Generates helper methods for safe account access and mutation

### `#[error_code]`
Enables custom, human-readable error types with `#[msg(...)]` attributes for clearer debugging.

## Account Types

| Type | Purpose |
|------|---------|
| `Signer<'info>` | Verifies the account signed the transaction |
| `SystemAccount<'info>` | Confirms System Program ownership |
| `Program<'info, T>` | Validates executable program accounts |
| `Account<'info, T>` | Typed program account with automatic validation |
| `UncheckedAccount<'info>` | Raw account requiring manual validation |

## Account Constraints

### Initialization
```rust
#[account(
    init,
    payer = payer,
    space = 8 + CustomAccount::INIT_SPACE
)]
pub account: Account<'info, CustomAccount>,
```

### PDA Validation
```rust
#[account(
    seeds = [b"vault", owner.key().as_ref()],
    bump
)]
pub vault: SystemAccount<'info>,
```

### Enhanced: Canonical Bump Pattern (CU Optimization)

**Always store the canonical bump to save ~1500 CU per PDA access:**

```rust
#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub authority: Pubkey,  // 32
    pub bump: u8,           // 1 - ALWAYS STORE THIS!
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

// Use stored bump for CPIs (saves ~1500 CU vs find_program_address)
pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let authority = ctx.accounts.vault.authority;
    let seeds = &[
        b"vault",
        authority.as_ref(),
        &[ctx.accounts.vault.bump],  // Use stored bump!
    ];
    let signer_seeds = &[&seeds[..]];

    // CPI with stored bump
    token::transfer(
        CpiContext::new_with_signer(/* ... */, signer_seeds),
        amount,
    )?;
    Ok(())
}
```

### Ownership and Relationships
```rust
#[account(
    has_one = authority @ CustomError::InvalidAuthority,
    constraint = account.is_active @ CustomError::AccountInactive
)]
pub account: Account<'info, CustomAccount>,
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
    close = destination
)]
pub account: Account<'info, CustomAccount>,
```

## Account Discriminators

Default discriminators use `sha256("account:<StructName>")[0..8]`. Custom discriminators (Anchor 0.31+):

```rust
#[account(discriminator = 1)]
pub struct Escrow { ... }
```

**Constraints:**
- Discriminators must be unique across your program
- Using `[1]` prevents using `[1, 2, ...]` which also start with `1`
- `[0]` conflicts with uninitialized accounts

## Instruction Patterns

### Basic Structure
```rust
#[program]
pub mod my_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
        ctx.accounts.account.data = data;
        Ok(())
    }
}
```

### Context Implementation Pattern
Move logic to context struct implementations for organization and testability:

```rust
impl<'info> Transfer<'info> {
    pub fn transfer_tokens(&mut self, amount: u64) -> Result<()> {
        // Implementation
        Ok(())
    }
}
```

## Cross-Program Invocations (CPIs)

### Basic CPI
```rust
let cpi_accounts = Transfer {
    from: ctx.accounts.from.to_account_info(),
    to: ctx.accounts.to.to_account_info(),
};
let cpi_program = ctx.accounts.system_program.to_account_info();
let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

transfer(cpi_ctx, amount)?;
```

### PDA-Signed CPIs
```rust
let seeds = &[b"vault".as_ref(), &[ctx.bumps.vault]];
let signer = &[&seeds[..]];
let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
```

### Enhanced: Account Reloading After CPIs

**Anchor doesn't automatically update deserialized accounts after a CPI. Without `.reload()`, you have stale data!**

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

## Error Handling

```rust
#[error_code]
pub enum MyError {
    #[msg("Custom error message")]
    CustomError,
    #[msg("Value too large: {0}")]
    ValueError(u64),
}

// Usage
require!(value > 0, MyError::CustomError);
require!(value < 100, MyError::ValueError(value));
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
Use `InterfaceAccount` for dual compatibility:

```rust
use anchor_spl::token_interface::{Mint, TokenAccount};

pub mint: InterfaceAccount<'info, Mint>,
pub token_account: InterfaceAccount<'info, TokenAccount>,
pub token_program: Interface<'info, TokenInterface>,
```

### Enhanced: Event Emission

```rust
#[event]
pub struct Transfer {
    #[index]
    pub from: Pubkey,
    #[index]
    pub to: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

// Emit on state changes
emit!(Transfer {
    from: ctx.accounts.from.key(),
    to: ctx.accounts.to.key(),
    amount,
    timestamp: Clock::get()?.unix_timestamp,
});
```

## LazyAccount (Anchor 0.31+)

Heap-allocated, read-only account access for efficient memory usage:

```rust
// Cargo.toml
anchor-lang = { version = "0.31.1", features = ["lazy-account"] }

// Usage
pub account: LazyAccount<'info, CustomAccountType>,

pub fn handler(ctx: Context<MyInstruction>) -> Result<()> {
    let value = ctx.accounts.account.get_value()?;
    Ok(())
}
```

**Note:** LazyAccount is read-only. After CPIs, use `unload()` to refresh cached values.

## Zero-Copy Accounts

For accounts exceeding stack/heap limits:

```rust
#[account(zero_copy)]
pub struct LargeAccount {
    pub data: [u8; 10000],
}
```

Accounts under 10,240 bytes use `init`; larger accounts require external creation then `zero` constraint initialization.

## Remaining Accounts

Pass dynamic accounts beyond fixed instruction structure:

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

## Version Management

- Use AVM (Anchor Version Manager) for reproducible builds
- Keep Solana CLI + Anchor versions aligned in CI and developer setup
- Pin versions in `Anchor.toml`

## Security Best Practices

### Account Validation
- Use typed accounts (`Account<'info, T>`) over `UncheckedAccount` when possible
- Always validate signer requirements explicitly
- Use `has_one` for ownership relationships
- Validate PDA seeds and bumps

### CPI Safety
- Use `Program<'info, T>` to validate CPI targets (prevents arbitrary CPI attacks)
- Never pass extra privileges to CPI callees
- Prefer explicit program IDs for known CPIs

### Common Gotchas
- **Avoid `init_if_needed`**: Permits reinitialization attacks
- **Legacy IDL formats**: Ensure tooling agrees on format (pre-0.30 vs new spec)
- **PDA seeds**: Ensure all seed material is stable and canonical

## Testing

- Use `anchor test` for end-to-end tests
- Prefer Mollusk or LiteSVM for fast unit tests
- Use Surfpool for integration tests with mainnet state

## IDL and Clients

- Treat the program's IDL as a product artifact
- Prefer generating Kit-native clients via Codama
- If using Anchor TS client in Kit-first app, put it behind web3-compat boundary

## Enhanced: Security Checklist (Per Instruction)

Use this checklist for every instruction:

- [ ] All accounts validated (owner, signer, PDA)
- [ ] Arithmetic uses checked operations
- [ ] No `unwrap()` or `expect()` in program code
- [ ] Error codes defined and descriptive
- [ ] PDA bumps stored and reused
- [ ] CPI targets validated (program IDs hardcoded or checked)
- [ ] Accounts reloaded after CPI if they were modified
- [ ] Events emitted for state changes
- [ ] Proper access control enforced
- [ ] Reentrancy protection considered
