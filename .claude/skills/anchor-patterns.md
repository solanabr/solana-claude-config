---
name: anchor-patterns
description: Common Anchor/Solana program patterns and best practices. Use when writing Solana programs, reviewing Anchor code, or need secure patterns for account validation, PDAs, CPIs, and error handling.
---

# Anchor Program Patterns

Secure, production-ready patterns for Solana program development with Anchor framework.

## Account Validation Patterns

### Basic Account Structure

```rust
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Vault::INIT_SPACE,
        seeds = [b"vault", authority.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub authority: Pubkey,
    pub bump: u8,
    pub balance: u64,
}
```

### Validation Constraints

```rust
#[derive(Accounts)]
pub struct Transfer<'info> {
    // Validate ownership and authority
    #[account(
        mut,
        has_one = authority @ ErrorCode::Unauthorized,
        constraint = vault.balance >= amount @ ErrorCode::InsufficientFunds
    )]
    pub vault: Account<'info, Vault>,

    // Must be signer
    pub authority: Signer<'info>,

    // Validate PDA with stored bump
    #[account(
        mut,
        seeds = [b"destination", recipient.key().as_ref()],
        bump = destination.bump,
    )]
    pub destination: Account<'info, Vault>,

    pub recipient: SystemAccount<'info>,
}
```

## PDA Management

### Canonical Bump Pattern

```rust
// ALWAYS store the canonical bump
#[account]
pub struct Vault {
    pub bump: u8,  // Store this!
    // ... other fields
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
pub fn transfer(ctx: Context<Transfer>, amount: u64) -> Result<()> {
    let authority_key = ctx.accounts.vault.authority;
    let seeds = &[
        b"vault",
        authority_key.as_ref(),
        &[ctx.accounts.vault.bump],  // Use stored bump
    ];
    let signer_seeds = &[&seeds[..]];

    // Use in CPI
    token::transfer(
        ctx.accounts.transfer_ctx().with_signer(signer_seeds),
        amount
    )?;
    Ok(())
}
```

### Seed Collision Prevention

```rust
// Use unique prefixes for different account types
pub const USER_VAULT_SEED: &[u8] = b"user_vault";
pub const ADMIN_CONFIG_SEED: &[u8] = b"admin_config";
pub const POOL_STATE_SEED: &[u8] = b"pool_state";

#[account(
    seeds = [USER_VAULT_SEED, user.key().as_ref()],
    bump = vault.bump
)]
pub vault: Account<'info, UserVault>,
```

## Arithmetic Safety

### Checked Operations

```rust
pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    let vault = &mut ctx.accounts.vault;

    // ALWAYS use checked arithmetic
    vault.balance = vault
        .balance
        .checked_add(amount)
        .ok_or(ErrorCode::Overflow)?;

    vault.total_deposits = vault
        .total_deposits
        .checked_add(1)
        .ok_or(ErrorCode::Overflow)?;

    Ok(())
}
```

### Safe Division

```rust
pub fn calculate_share(total: u64, amount: u64) -> Result<u64> {
    if total == 0 {
        return err!(ErrorCode::DivisionByZero);
    }

    amount
        .checked_mul(PRECISION)
        .and_then(|v| v.checked_div(total))
        .ok_or(ErrorCode::ArithmeticError.into())
}
```

## Error Handling

### Comprehensive Error Codes

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
```

### Result Types

```rust
// Never use unwrap() or expect()
pub fn safe_operation(ctx: Context<Operation>) -> Result<()> {
    let data = ctx.accounts.account.data
        .get(0..32)
        .ok_or(ErrorCode::InvalidAccountState)?;

    let value = u64::from_le_bytes(
        data.try_into()
            .map_err(|_| ErrorCode::InvalidAccountState)?
    );

    Ok(())
}
```

## CPI (Cross-Program Invocation) Patterns

### Token Transfer CPI

```rust
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

pub fn transfer_tokens(ctx: Context<TransferTokens>, amount: u64) -> Result<()> {
    let cpi_accounts = Transfer {
        from: ctx.accounts.from.to_account_info(),
        to: ctx.accounts.to.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

    token::transfer(cpi_ctx, amount)?;

    // CRITICAL: Reload accounts after CPI
    // Anchor doesn't automatically update deserialized accounts after a CPI
    // Without reload, you'll have stale data leading to bugs
    ctx.accounts.from.reload()?;

    Ok(())
}
```

### When to Reload Accounts

**Always reload accounts that may have been modified by a CPI:**

```rust
// Example: Account modified by CPI
pub fn complex_operation(ctx: Context<ComplexOp>, amount: u64) -> Result<()> {
    // Before CPI: balance = 100
    msg!("Balance before: {}", ctx.accounts.token_account.amount);

    // Execute CPI that modifies the account
    token::transfer(ctx.accounts.into_transfer_context(), amount)?;

    // Without reload: balance still shows 100 (STALE DATA!)
    // With reload: balance shows correct updated value

    ctx.accounts.token_account.reload()?;
    msg!("Balance after: {}", ctx.accounts.token_account.amount);

    // Now we can safely use the updated balance
    require!(
        ctx.accounts.token_account.amount >= MIN_BALANCE,
        ErrorCode::BalanceTooLow
    );

    Ok(())
}
```

### CPI with PDA Signer

```rust
pub fn cpi_with_pda(ctx: Context<CpiWithPda>, amount: u64) -> Result<()> {
    let authority = ctx.accounts.vault.authority;
    let bump = ctx.accounts.vault.bump;

    let seeds = &[
        b"vault",
        authority.as_ref(),
        &[bump],
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

    Ok(())
}
```

## Account Closing Pattern

### Safe Account Closure

```rust
#[derive(Accounts)]
pub struct CloseAccount<'info> {
    #[account(
        mut,
        close = authority,  // Anchor handles zeroing and rent return
        has_one = authority
    )]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub authority: Signer<'info>,
}

pub fn close_vault(ctx: Context<CloseAccount>) -> Result<()> {
    // Perform any final cleanup
    emit!(VaultClosed {
        authority: ctx.accounts.authority.key(),
        timestamp: Clock::get()?.unix_timestamp,
    });

    // Anchor automatically:
    // 1. Zeros account data
    // 2. Sets closed discriminator
    // 3. Returns rent to authority

    Ok(())
}
```

## Event Emission

### Define Events

```rust
#[event]
pub struct Deposit {
    #[index]
    pub user: Pubkey,
    pub amount: u64,
    pub new_balance: u64,
    pub timestamp: i64,
}

#[event]
pub struct Withdrawal {
    #[index]
    pub user: Pubkey,
    pub amount: u64,
    pub new_balance: u64,
    pub timestamp: i64,
}
```

### Emit Events

```rust
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

## Testing Patterns

### Unit Tests with Mollusk

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use mollusk_svm::Mollusk;

    #[test]
    fn test_initialize() {
        let program_id = Pubkey::new_unique();
        let mollusk = Mollusk::new(&program_id, "target/deploy/program");

        // Setup accounts
        let authority = Pubkey::new_unique();
        let (vault, _bump) = Pubkey::find_program_address(
            &[b"vault", authority.as_ref()],
            &program_id
        );

        // Create instruction
        let instruction = initialize(/* ... */);

        // Execute
        let result = mollusk.process_instruction(&instruction, &accounts);

        assert!(result.program_result.is_ok());
    }
}
```

## Security Checklist

Use this for every instruction:

- [ ] All accounts validated (owner, signer, PDA)
- [ ] Arithmetic uses checked operations
- [ ] No unwrap() or expect()
- [ ] Error codes defined
- [ ] PDA bumps stored and reused
- [ ] CPI targets validated (program IDs hardcoded or checked)
- [ ] Accounts reloaded after CPI if they were modified
- [ ] Events emitted for state changes
- [ ] Proper access control
- [ ] Reentrancy protection considered
- [ ] Integer overflow/underflow prevented

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
| Skip verifiable builds for mainnet | Always use `--verifiable` for production |
| Deploy without security audit | Run automated tools + manual review |

## Performance Tips

### CU Optimization

```rust
// Store bumps, don't recalculate
pub struct Vault {
    pub bump: u8,  // Saves ~1500 CU per PDA access
}

// Feature-gate logs
#[cfg(feature = "debug")]
msg!("Debug: value = {}", value);

// Use zero-copy for large accounts
#[account(zero_copy)]
pub struct LargeAccount {
    pub data: [u8; 10000],
}
```

## When to Use These Patterns

- **Account Validation**: Every instruction, every account
- **PDA Management**: Any PDA usage
- **Arithmetic**: All math operations
- **Error Handling**: Every Result-returning function
- **CPI**: Any cross-program calls
- **Account Closing**: When closing accounts
- **Events**: All state changes
- **Testing**: Every instruction and error path

These patterns ensure your Solana programs are secure, maintainable, and production-ready.
