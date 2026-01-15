---
paths:
  - "programs/**/src/**/*.rs"
when_filename_contains:
  - "pinocchio"
---

# Pinocchio Zero-Copy Framework Rules (Comprehensive Reference)

Pinocchio achieves **80-95% CU reduction** vs Anchor through zero-copy access, no dependencies, minimal binary size.

## Entrypoint Patterns

### Standard Entrypoint
```rust
use pinocchio::{
    account_info::AccountInfo,
    entrypoint,
    program_error::ProgramError,
    pubkey::Pubkey,
    ProgramResult,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: &[u8],
) -> ProgramResult {
    match data.split_first() {
        Some((0, data)) => Deposit::try_from((data, accounts))?.process(),
        Some((1, _)) => Withdraw::try_from(accounts)?.process(),
        _ => Err(ProgramError::InvalidInstructionData)
    }
}
```

### Lazy Entrypoint (Maximum Performance)
```rust
use pinocchio::lazy_program_entrypoint;

lazy_program_entrypoint!(process_instruction);
```

## Single-Byte Discriminators

```rust
// Use u8 discriminators (NOT 8-byte like Anchor)
const DISCRIMINATOR_VAULT: u8 = 0;
const DISCRIMINATOR_USER: u8 = 1;
const DISCRIMINATOR_POOL: u8 = 2;

// Account layout: [discriminator: 1 byte][data: remaining bytes]

#[repr(C)]
pub struct Vault {
    // No discriminator field in struct!
    pub authority: Pubkey,
    pub bump: u8,
    pub balance: u64,
}
```

Single-byte supports 255 instructions; use two bytes for up to 65,535 variants.

## Account Struct Patterns

### Use #[repr(C)] for Consistent Layout
```rust
#[repr(C)]
#[derive(Copy, Clone)]
pub struct Vault {
    pub authority: Pubkey,    // 32 bytes
    pub bump: u8,             // 1 byte
    pub balance: u64,         // 8 bytes
    pub last_update: i64,     // 8 bytes
    // Total: 49 bytes + 1 byte discriminator = 50 bytes
}

impl Vault {
    pub const SIZE: usize = core::mem::size_of::<Self>();

    pub const fn account_size() -> usize {
        1 + Self::SIZE  // discriminator + struct
    }

    pub fn init(authority: Pubkey, bump: u8) -> Self {
        Self {
            authority,
            bump,
            balance: 0,
            last_update: 0,
        }
    }
}
```

### Struct Field Ordering (Minimize Padding)

Order fields from largest to smallest alignment:

```rust
// Good: 16 bytes total
#[repr(C)]
struct GoodOrder {
    big: u64,     // 8 bytes, 8-byte aligned
    medium: u16,  // 2 bytes, 2-byte aligned
    small: u8,    // 1 byte, 1-byte aligned
    // 5 bytes padding
}

// Bad: 24 bytes due to padding
#[repr(C)]
struct BadOrder {
    small: u8,    // 1 byte
    // 7 bytes padding
    big: u64,     // 8 bytes
    medium: u16,  // 2 bytes
    // 6 bytes padding
}
```

### Byte Arrays for Multi-Byte Fields (Safest)

```rust
#[repr(C)]
pub struct Config {
    pub authority: Pubkey,
    pub mint: Pubkey,
    seed: [u8; 8],   // Store as bytes, not u64
    fee: [u8; 2],    // Store as bytes, not u16
    pub state: u8,
    pub bump: u8,
}

impl Config {
    pub const LEN: usize = core::mem::size_of::<Self>();

    pub fn seed(&self) -> u64 {
        u64::from_le_bytes(self.seed)
    }

    pub fn fee(&self) -> u16 {
        u16::from_le_bytes(self.fee)
    }

    pub fn set_seed(&mut self, seed: u64) {
        self.seed = seed.to_le_bytes();
    }

    pub fn set_fee(&mut self, fee: u16) {
        self.fee = fee.to_le_bytes();
    }
}
```

## Zero-Copy Account Access

### Reading Account Data (Zero-Copy)
```rust
fn read_vault_checked(account: &AccountInfo) -> Result<&Vault, ProgramError> {
    let data = account.borrow_data();

    // Check minimum length
    if data.len() < 1 + std::mem::size_of::<Vault>() {
        return Err(ProgramError::InvalidAccountData);
    }

    // Check discriminator
    if data[0] != DISCRIMINATOR_VAULT {
        return Err(ProgramError::InvalidAccountData);
    }

    // Zero-copy cast
    // SAFETY: We've verified length and discriminator above
    Ok(unsafe {
        &*((data.as_ptr().add(1)) as *const Vault)
    })
}
```

### Writing Account Data (Zero-Copy)
```rust
fn write_vault(account: &AccountInfo) -> Result<&mut Vault, ProgramError> {
    let mut data = account.borrow_mut_data();

    // Check minimum length
    if data.len() < 1 + std::mem::size_of::<Vault>() {
        return Err(ProgramError::InvalidAccountData);
    }

    // Set discriminator (single byte)
    data[0] = DISCRIMINATOR_VAULT;

    // Zero-copy mutable reference
    // SAFETY: We've verified length above
    Ok(unsafe {
        &mut *((data.as_mut_ptr().add(1)) as *mut Vault)
    })
}
```

### Field-by-Field Serialization (Safest)
```rust
impl Config {
    pub fn write_to_buffer(&self, data: &mut [u8]) -> Result<(), ProgramError> {
        if data.len() != Self::LEN {
            return Err(ProgramError::InvalidAccountData);
        }

        let mut offset = 0;

        data[offset..offset + 32].copy_from_slice(self.authority.as_ref());
        offset += 32;

        data[offset..offset + 32].copy_from_slice(self.mint.as_ref());
        offset += 32;

        data[offset..offset + 8].copy_from_slice(&self.seed);
        offset += 8;

        data[offset..offset + 2].copy_from_slice(&self.fee);
        offset += 2;

        data[offset] = self.state;
        data[offset + 1] = self.bump;

        Ok(())
    }
}
```

## Manual Account Validation (TryFrom Pattern)

### Validated Account Wrapper
```rust
use std::convert::TryFrom;

pub struct ValidatedVault<'a> {
    pub info: &'a AccountInfo,
    pub data: &'a Vault,
}

impl<'a> TryFrom<&'a AccountInfo> for ValidatedVault<'a> {
    type Error = ProgramError;

    fn try_from(info: &'a AccountInfo) -> Result<Self, Self::Error> {
        // 1. Owner check
        if info.owner() != &crate::ID {
            return Err(ProgramError::IncorrectProgramId);
        }

        // 2. Data length check
        let expected_len = 1 + std::mem::size_of::<Vault>();
        if info.borrow_data().len() != expected_len {
            return Err(ProgramError::InvalidAccountData);
        }

        // 3. Discriminator check
        let data = info.borrow_data();
        if data[0] != DISCRIMINATOR_VAULT {
            return Err(ProgramError::InvalidAccountData);
        }

        // 4. Zero-copy data access
        // SAFETY: Length and discriminator verified above
        let vault_data = unsafe {
            &*((data.as_ptr().add(1)) as *const Vault)
        };

        Ok(ValidatedVault {
            info,
            data: vault_data,
        })
    }
}
```

### Account Struct Validation
```rust
pub struct DepositAccounts<'a> {
    pub owner: &'a AccountInfo,
    pub vault: &'a AccountInfo,
    pub system_program: &'a AccountInfo,
}

impl<'a> TryFrom<&'a [AccountInfo]> for DepositAccounts<'a> {
    type Error = ProgramError;

    fn try_from(accounts: &'a [AccountInfo]) -> Result<Self, Self::Error> {
        let [owner, vault, system_program, _remaining @ ..] = accounts else {
            return Err(ProgramError::NotEnoughAccountKeys);
        };

        // Signer check
        if !owner.is_signer() {
            return Err(ProgramError::MissingRequiredSignature);
        }

        // Owner check
        if !vault.is_owned_by(&pinocchio_system::ID) {
            return Err(ProgramError::InvalidAccountOwner);
        }

        // Program ID check (prevents arbitrary CPI)
        if system_program.key() != &pinocchio_system::ID {
            return Err(ProgramError::IncorrectProgramId);
        }

        Ok(Self { owner, vault, system_program })
    }
}
```

### Instruction Data Validation
```rust
pub struct DepositData {
    pub amount: u64,
}

impl<'a> TryFrom<&'a [u8]> for DepositData {
    type Error = ProgramError;

    fn try_from(data: &'a [u8]) -> Result<Self, Self::Error> {
        if data.len() != core::mem::size_of::<u64>() {
            return Err(ProgramError::InvalidInstructionData);
        }

        let amount = u64::from_le_bytes(data.try_into().unwrap());

        if amount == 0 {
            return Err(ProgramError::InvalidInstructionData);
        }

        Ok(Self { amount })
    }
}
```

### Complete Instruction Pattern
```rust
pub struct Deposit<'a> {
    pub accounts: DepositAccounts<'a>,
    pub data: DepositData,
}

impl<'a> TryFrom<(&'a [u8], &'a [AccountInfo])> for Deposit<'a> {
    type Error = ProgramError;

    fn try_from((data, accounts): (&'a [u8], &'a [AccountInfo])) -> Result<Self, Self::Error> {
        let accounts = DepositAccounts::try_from(accounts)?;
        let data = DepositData::try_from(data)?;
        Ok(Self { accounts, data })
    }
}

impl<'a> Deposit<'a> {
    pub const DISCRIMINATOR: &'a u8 = &0;

    pub fn process(&self) -> ProgramResult {
        // Business logic only - validation already complete
        Ok(())
    }
}
```

## PDA Validation (Manual)

```rust
use pinocchio::pubkey::Pubkey;

fn validate_pda(
    account: &AccountInfo,
    seeds: &[&[u8]],
    stored_bump: u8,
    program_id: &Pubkey,
) -> ProgramResult {
    // Construct full seeds including bump
    let bump_slice = &[stored_bump];
    let mut full_seeds: Vec<&[u8]> = seeds.to_vec();
    full_seeds.push(bump_slice);

    // Create PDA from known seeds + stored bump (no search needed!)
    let derived_address = Pubkey::create_program_address(&full_seeds, program_id)
        .map_err(|_| ProgramError::InvalidSeeds)?;

    // Validate
    if account.key() != &derived_address {
        return Err(ProgramError::InvalidSeeds);
    }

    Ok(())
}

// Usage
fn example_usage(
    vault_account: &AccountInfo,
    authority: &AccountInfo,
    vault_bump: u8,
    program_id: &Pubkey,
) -> ProgramResult {
    let seeds: &[&[u8]] = &[b"vault", authority.key().as_ref()];
    validate_pda(vault_account, seeds, vault_bump, program_id)?;
    Ok(())
}
```

## Cross-Program Invocations (CPIs)

### Basic CPI
```rust
use pinocchio_system::instructions::Transfer;

Transfer {
    from: self.accounts.owner,
    to: self.accounts.vault,
    lamports: self.data.amount,
}.invoke()?;
```

### PDA-Signed CPI
```rust
use pinocchio::{seeds::Seed, signer::Signer};

let seeds = [
    Seed::from(b"vault"),
    Seed::from(self.accounts.owner.key().as_ref()),
    Seed::from(&[bump]),
];
let signers = [Signer::from(&seeds)];

Transfer {
    from: self.accounts.vault,
    to: self.accounts.owner,
    lamports: self.accounts.vault.lamports(),
}.invoke_signed(&signers)?;
```

### Manual CPI Construction
```rust
use pinocchio::{
    instruction::{AccountMeta, Instruction},
    program::invoke_signed,
};

fn transfer_tokens(
    token_program: &AccountInfo,
    from: &AccountInfo,
    to: &AccountInfo,
    authority: &AccountInfo,
    amount: u64,
    signer_seeds: &[&[&[u8]]],
) -> ProgramResult {
    // SPL Token transfer: [3 (discriminator), amount (8 bytes)]
    let mut instruction_data = [0u8; 9];
    instruction_data[0] = 3; // Transfer discriminator
    instruction_data[1..9].copy_from_slice(&amount.to_le_bytes());

    let transfer_ix = Instruction {
        program_id: *token_program.key(),
        accounts: vec![
            AccountMeta::new(*from.key(), false),
            AccountMeta::new(*to.key(), false),
            AccountMeta::new_readonly(*authority.key(), true),
        ],
        data: instruction_data.to_vec(),
    };

    let account_infos = &[from.clone(), to.clone(), authority.clone()];
    invoke_signed(&transfer_ix, account_infos, signer_seeds)
}
```

## Token Account Validation

### SPL Token
```rust
pub struct Mint;

impl Mint {
    pub fn check(account: &AccountInfo) -> Result<(), ProgramError> {
        if !account.is_owned_by(&pinocchio_token::ID) {
            return Err(ProgramError::InvalidAccountOwner);
        }
        if account.data_len() != pinocchio_token::state::Mint::LEN {
            return Err(ProgramError::InvalidAccountData);
        }
        Ok(())
    }

    pub fn init(
        account: &AccountInfo,
        payer: &AccountInfo,
        decimals: u8,
        mint_authority: &[u8; 32],
        freeze_authority: Option<&[u8; 32]>,
    ) -> ProgramResult {
        let lamports = Rent::get()?.minimum_balance(pinocchio_token::state::Mint::LEN);

        CreateAccount {
            from: payer,
            to: account,
            lamports,
            space: pinocchio_token::state::Mint::LEN as u64,
            owner: &pinocchio_token::ID,
        }.invoke()?;

        InitializeMint2 {
            mint: account,
            decimals,
            mint_authority,
            freeze_authority,
        }.invoke()
    }
}
```

### Token2022 Support
```rust
pub const TOKEN_2022_PROGRAM_ID: [u8; 32] = [...];
const TOKEN_2022_ACCOUNT_DISCRIMINATOR_OFFSET: usize = 165;
pub const TOKEN_2022_MINT_DISCRIMINATOR: u8 = 0x01;
pub const TOKEN_2022_TOKEN_ACCOUNT_DISCRIMINATOR: u8 = 0x02;

pub struct Mint2022;

impl Mint2022 {
    pub fn check(account: &AccountInfo) -> Result<(), ProgramError> {
        if !account.is_owned_by(&TOKEN_2022_PROGRAM_ID) {
            return Err(ProgramError::InvalidAccountOwner);
        }

        let data = account.try_borrow_data()?;

        if data.len() != pinocchio_token::state::Mint::LEN {
            if data.len() <= TOKEN_2022_ACCOUNT_DISCRIMINATOR_OFFSET {
                return Err(ProgramError::InvalidAccountData);
            }
            if data[TOKEN_2022_ACCOUNT_DISCRIMINATOR_OFFSET] != TOKEN_2022_MINT_DISCRIMINATOR {
                return Err(ProgramError::InvalidAccountData);
            }
        }
        Ok(())
    }
}
```

### Token Interface (Both Programs)
```rust
pub struct MintInterface;

impl MintInterface {
    pub fn check(account: &AccountInfo) -> Result<(), ProgramError> {
        if account.is_owned_by(&pinocchio_token::ID) {
            if account.data_len() != pinocchio_token::state::Mint::LEN {
                return Err(ProgramError::InvalidAccountData);
            }
        } else if account.is_owned_by(&TOKEN_2022_PROGRAM_ID) {
            Mint2022::check(account)?;
        } else {
            return Err(ProgramError::InvalidAccountOwner);
        }
        Ok(())
    }
}
```

## Error Handling

### Using ProgramError Custom Codes
```rust
use pinocchio::program_error::ProgramError;

const ERROR_INSUFFICIENT_FUNDS: u32 = 0;
const ERROR_UNAUTHORIZED: u32 = 1;
const ERROR_INVALID_AMOUNT: u32 = 2;

fn validate_transfer(balance: u64, amount: u64) -> ProgramResult {
    if amount == 0 {
        return Err(ProgramError::Custom(ERROR_INVALID_AMOUNT));
    }
    if balance < amount {
        return Err(ProgramError::Custom(ERROR_INSUFFICIENT_FUNDS));
    }
    Ok(())
}
```

### Using thiserror (no_std Compatible)
```rust
use thiserror::Error;
use num_derive::FromPrimitive;
use pinocchio::program_error::ProgramError;

#[derive(Clone, Debug, Eq, Error, FromPrimitive, PartialEq)]
pub enum VaultError {
    #[error("Lamport balance below rent-exempt threshold")]
    NotRentExempt,
    #[error("Invalid account owner")]
    InvalidOwner,
    #[error("Account not initialized")]
    NotInitialized,
}

impl From<VaultError> for ProgramError {
    fn from(e: VaultError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
```

## Account Creation

```rust
use pinocchio::{
    program::invoke_signed,
    sysvars::rent::Rent,
};

fn create_account(
    payer: &AccountInfo,
    new_account: &AccountInfo,
    system_program: &AccountInfo,
    space: usize,
    program_id: &Pubkey,
    signer_seeds: &[&[&[u8]]],
) -> ProgramResult {
    let rent = Rent::get()?;
    let lamports = rent.minimum_balance(space);

    // System program create_account instruction
    // Discriminator: 0, followed by lamports (8), space (8), owner (32)
    let mut ix_data = [0u8; 49];
    ix_data[0..8].copy_from_slice(&lamports.to_le_bytes());
    ix_data[8..16].copy_from_slice(&(space as u64).to_le_bytes());
    ix_data[16..48].copy_from_slice(program_id.as_ref());

    let ix = Instruction {
        program_id: *system_program.key(),
        accounts: vec![
            AccountMeta::new(*payer.key(), true),
            AccountMeta::new(*new_account.key(), true),
        ],
        data: ix_data.to_vec(),
    };

    invoke_signed(&ix, &[payer.clone(), new_account.clone()], signer_seeds)
}
```

## Closing Accounts Securely

```rust
pub fn close(account: &AccountInfo, destination: &AccountInfo) -> ProgramResult {
    // Mark as closed (prevents reinitialization/revival attacks)
    {
        let mut data = account.try_borrow_mut_data()?;
        data[0] = 0xff;
    }

    // Transfer lamports
    *destination.try_borrow_mut_lamports()? += *account.try_borrow_lamports()?;

    // Shrink and close
    account.realloc(1, true)?;
    account.close()
}
```

## Performance Optimization

### Minimize Allocations
```rust
// BAD - allocates Vec
let seeds = vec![b"vault".as_slice(), authority.as_ref()];

// GOOD - stack-allocated array
let seeds: &[&[u8]] = &[b"vault", authority.as_ref()];
```

### Use const for Fixed Sizes
```rust
const VAULT_SIZE: usize = 1 + 32 + 1 + 8 + 8; // discriminator + fields
let rent_lamports = rent.minimum_balance(VAULT_SIZE);
```

### Feature-Gate Debug Code
```rust
#[cfg(not(feature = "perf"))]
pinocchio::msg!("Processing deposit: {}", amount);
```

### Bitwise Flags for Storage
```rust
const FLAG_ACTIVE: u8 = 1 << 0;
const FLAG_FROZEN: u8 = 1 << 1;
const FLAG_ADMIN: u8 = 1 << 2;

// Set flag
flags |= FLAG_ACTIVE;

// Check flag
if flags & FLAG_ACTIVE != 0 { /* active */ }

// Clear flag
flags &= !FLAG_ACTIVE;
```

### Zero-Allocation Architecture
```rust
// Good: references with borrowed lifetimes
pub struct Instruction<'a> {
    pub accounts: &'a [AccountInfo],
    pub data: &'a [u8],
}

// Enforce no heap usage
no_allocator!();
```

## Batch Instructions

Process multiple operations in single CPI (saves ~1000 CU per batched operation):

```rust
const IX_HEADER_SIZE: usize = 2; // account_count + data_length

pub fn process_batch(mut accounts: &[AccountInfo], mut data: &[u8]) -> ProgramResult {
    loop {
        if data.len() < IX_HEADER_SIZE {
            return Err(ProgramError::InvalidInstructionData);
        }

        let account_count = data[0] as usize;
        let data_len = data[1] as usize;
        let data_offset = IX_HEADER_SIZE + data_len;

        if accounts.len() < account_count || data.len() < data_offset {
            return Err(ProgramError::InvalidInstructionData);
        }

        let (ix_accounts, ix_data) = (&accounts[..account_count], &data[IX_HEADER_SIZE..data_offset]);

        process_inner_instruction(ix_accounts, ix_data)?;

        if data_offset == data.len() {
            break;
        }

        accounts = &accounts[account_count..];
        data = &data[data_offset..];
    }

    Ok(())
}
```

## Dangerous Patterns to Avoid

```rust
// ❌ transmute with unaligned data
let value: u64 = unsafe { core::mem::transmute(bytes_slice) };

// ❌ Pointer casting to packed structs
#[repr(C, packed)]
pub struct Packed { pub a: u8, pub b: u64 }
let config = unsafe { &*(data.as_ptr() as *const Packed) };

// ❌ Direct field access on packed structs creates unaligned references
let b_ref = &packed.b;

// ❌ Assuming alignment without verification
let config = unsafe { &*(data.as_ptr() as *const Config) };

// ✅ Use byte arrays and accessor methods instead (see Config example above)
```

## Testing with Mollusk

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use mollusk_svm::Mollusk;
    use solana_sdk::{
        account::Account,
        instruction::{AccountMeta, Instruction},
        pubkey::Pubkey,
    };

    #[test]
    fn test_initialize() {
        let program_id = Pubkey::new_unique();
        let mollusk = Mollusk::new(&program_id, "target/deploy/program");

        let authority = Pubkey::new_unique();
        let (vault_pda, bump) = Pubkey::find_program_address(
            &[b"vault", authority.as_ref()],
            &program_id,
        );

        // Instruction data: [0 (init discriminator), bump]
        let ix_data = vec![0, bump];

        let vault_account = Account {
            lamports: 1_000_000,
            data: vec![0; Vault::account_size()],
            owner: program_id,
            executable: false,
            rent_epoch: 0,
        };

        let instruction = Instruction {
            program_id,
            accounts: vec![
                AccountMeta::new(vault_pda, false),
                AccountMeta::new_readonly(authority, true),
            ],
            data: ix_data,
        };

        let accounts = vec![
            (vault_pda, vault_account),
            (authority, Account::default()),
        ];

        let result = mollusk.process_instruction(&instruction, &accounts);

        assert!(result.program_result.is_ok());

        // Verify CU usage
        println!("CU consumed: {}", result.compute_units_consumed);
    }
}
```

## Security Checklist

- [ ] Validate all account owners in `TryFrom` implementations
- [ ] Check signer status for authority accounts
- [ ] Verify PDA derivation matches expected seeds
- [ ] Validate program IDs before CPIs (prevent arbitrary CPI)
- [ ] Use checked math (`checked_add`, `checked_sub`, etc.)
- [ ] Mark closed accounts to prevent revival attacks
- [ ] Validate instruction data length before parsing
- [ ] Check for duplicate mutable accounts
- [ ] Document all unsafe code with safety invariants
- [ ] Store canonical bumps (don't recalculate PDAs)
