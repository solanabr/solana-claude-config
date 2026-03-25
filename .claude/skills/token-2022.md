---
name: token-2022
description: Comprehensive guide to SPL Token-2022 (Token Extensions) — transfer hooks, confidential transfers, metadata, transfer fees, and all extension types with practical Anchor/native patterns.
---

# Token-2022 (Token Extensions)

SPL Token-2022 is the next-generation token program (`TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`). Superset of SPL Token with extensions that add functionality at the mint or account level.

**Program IDs:**
- Token-2022: `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
- SPL Token (legacy): `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`

## 1. Transfer Hooks

Execute custom logic on every token transfer via a CPI to your program.

### Anchor Transfer Hook Program

```rust
use anchor_lang::prelude::*;
use anchor_spl::token_2022;
use spl_transfer_hook_interface::instruction::TransferHookInstruction;

declare_id!("YourHookProgram111111111111111111111111111");

#[program]
pub mod transfer_hook {
    use super::*;

    // Called by Token-2022 on every transfer
    pub fn transfer_hook(ctx: Context<TransferHook>, amount: u64) -> Result<()> {
        // Custom logic: logging, royalties, allowlists, etc.
        let counter = &mut ctx.accounts.counter;
        counter.transfers += 1;
        Ok(())
    }

    // Required: tells Token-2022 what extra accounts to include
    pub fn initialize_extra_account_meta_list(
        ctx: Context<InitExtraAccountMetaList>,
    ) -> Result<()> {
        let extra_metas = &[
            ExtraAccountMeta::new_with_seeds(
                &[Seed::Literal { bytes: b"counter".to_vec() }],
                false, // is_signer
                true,  // is_writable
            )?,
        ];
        ExtraAccountMetaList::init::<ExecuteInstruction>(
            &mut ctx.accounts.extra_account_meta_list.try_borrow_mut_data()?,
            extra_metas,
        )?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct TransferHook<'info> {
    #[account(token::mint = mint, token::authority = owner)]
    pub source: InterfaceAccount<'info, token_2022::TokenAccount>,
    pub mint: InterfaceAccount<'info, token_2022::Mint>,
    #[account(token::mint = mint)]
    pub destination: InterfaceAccount<'info, token_2022::TokenAccount>,
    pub owner: UncheckedAccount<'info>,
    /// CHECK: validated by transfer hook interface
    pub extra_account_meta_list: UncheckedAccount<'info>,
    #[account(mut, seeds = [b"counter"], bump)]
    pub counter: Account<'info, TransferCounter>,
}
```

### Client-Side: Adding Extra Accounts

```typescript
import {
  createTransferCheckedWithTransferHookInstruction,
  getExtraAccountMetaAddress,
  getExtraAccountMetas,
} from "@solana/spl-token";

// Automatically resolves extra accounts from on-chain meta list
const ix = await createTransferCheckedWithTransferHookInstruction(
  connection,
  sourceAta,
  mint,
  destinationAta,
  owner.publicKey,
  amount,
  decimals,
  [],                  // multiSigners
  "confirmed",
  TOKEN_2022_PROGRAM_ID
);
```

**Pitfalls:**
- Hook program must implement the `spl-transfer-hook-interface` exactly — wrong discriminators = silent failures
- Extra account meta list must be initialized before any transfers
- Transfer hooks add CU cost to every transfer — keep logic minimal

## 2. Confidential Transfers

Zero-knowledge proof-based transfers that hide amounts on-chain.

### Setup Flow

```typescript
import {
  createMint,
  createAccount,
  enableConfidentialTransfers,
  configureConfidentialTransferAccount,
  depositConfidentialTokens,
  transferConfidentialTokens,
  withdrawConfidentialTokens,
} from "@solana/spl-token";

// 1. Create mint with confidential transfer extension
const mint = await createMint(
  connection, payer, mintAuthority, null, 9,
  undefined, undefined, TOKEN_2022_PROGRAM_ID,
  [{ extensionType: ExtensionType.ConfidentialTransferMint }]
);

// 2. Configure the mint for confidential transfers
await confidentialTransferInitializeMint(
  connection, payer, mint,
  auditorElGamalPubkey, // optional auditor
);

// 3. Configure each token account
await configureConfidentialTransferAccount(
  connection, payer, tokenAccount, owner, TOKEN_2022_PROGRAM_ID
);

// 4. Deposit (public → confidential balance)
await depositConfidentialTokens(
  connection, payer, tokenAccount, mint, amount, owner, TOKEN_2022_PROGRAM_ID
);

// 5. Transfer (confidential → confidential)
await transferConfidentialTokens(
  connection, payer,
  sourceAccount, mint, destinationAccount,
  amount, owner, TOKEN_2022_PROGRAM_ID
);

// 6. Withdraw (confidential → public)
await withdrawConfidentialTokens(
  connection, payer, tokenAccount, mint, amount, owner, TOKEN_2022_PROGRAM_ID
);
```

**Pitfalls:**
- ZK proof generation is CPU-intensive on client — can take seconds
- Both sender and receiver accounts must be configured for confidential transfers
- Auditor key is optional but recommended for compliance
- Pending balance must be applied before it can be transferred

## 3. Transfer Fee

Automatically collect fees on every transfer.

### Creating Mint with Transfer Fee

```typescript
import {
  createInitializeTransferFeeConfigInstruction,
  createInitializeMintInstruction,
  harvestWithheldTokensToMint,
  withdrawWithheldTokensFromMint,
  ExtensionType,
  getMintLen,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";

const mintLen = getMintLen([ExtensionType.TransferFeeConfig]);
const mintRent = await connection.getMinimumBalanceForRentExemption(mintLen);

const tx = new Transaction().add(
  SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: mint.publicKey,
    space: mintLen,
    lamports: mintRent,
    programId: TOKEN_2022_PROGRAM_ID,
  }),
  createInitializeTransferFeeConfigInstruction(
    mint.publicKey,
    feeAuthority.publicKey,     // can update fee
    withdrawAuthority.publicKey, // can collect fees
    500,    // 5% fee (basis points, max 10000)
    BigInt(5_000_000_000),       // max fee cap
    TOKEN_2022_PROGRAM_ID
  ),
  createInitializeMintInstruction(
    mint.publicKey, 9, mintAuthority.publicKey, null,
    TOKEN_2022_PROGRAM_ID
  )
);
```

### Collecting Fees

```typescript
// Step 1: Harvest withheld fees from token accounts → mint
await harvestWithheldTokensToMint(
  connection, payer, mint.publicKey, [account1, account2],
  TOKEN_2022_PROGRAM_ID
);

// Step 2: Withdraw collected fees from mint → destination
await withdrawWithheldTokensFromMint(
  connection, payer, mint.publicKey,
  feeCollectorAta,
  withdrawAuthority,
  TOKEN_2022_PROGRAM_ID
);
```

**Pitfalls:**
- Fee is withheld in the recipient's token account, not deducted from sender
- `transferChecked` is required — plain `transfer` will fail
- Max fee cap prevents excessive fees on large transfers

## 4. Interest-Bearing Tokens

Display an interest-accruing UI balance without on-chain token minting.

```typescript
import {
  createInitializeInterestBearingMintInstruction,
  amountToUiAmount,
} from "@solana/spl-token";

// Initialize mint with interest rate (basis points)
const ix = createInitializeInterestBearingMintInstruction(
  mint.publicKey,
  rateAuthority.publicKey,
  350, // 3.5% annual rate in basis points
  TOKEN_2022_PROGRAM_ID
);

// Calculate display amount with accrued interest
const uiAmount = amountToUiAmount(connection, mint.publicKey, rawAmount);
```

**Pitfalls:**
- Interest is cosmetic — no new tokens are minted. Supply doesn't change
- Only affects `amountToUiAmount`/`uiAmountToAmount` calculations
- Rate authority can update the rate; set to `null` to lock it

## 5. Metadata Pointer + Token Metadata

Store token metadata directly on the mint — no Metaplex needed.

```typescript
import {
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  TYPE_SIZE, LENGTH_SIZE,
} from "@solana/spl-token";
import {
  createInitializeInstruction,
  createUpdateFieldInstruction,
  pack,
} from "@solana/spl-token-metadata";

// Metadata points to the mint itself
const metadataPointerIx = createInitializeMetadataPointerInstruction(
  mint.publicKey,
  updateAuthority.publicKey,
  mint.publicKey, // metadata lives on the mint
  TOKEN_2022_PROGRAM_ID
);

const metadata = {
  mint: mint.publicKey,
  name: "My Token",
  symbol: "MTK",
  uri: "https://example.com/metadata.json",
  additionalMetadata: [["description", "A cool token"]],
};

const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
const mintLen = getMintLen([ExtensionType.MetadataPointer]) + metadataLen;

const tx = new Transaction().add(
  SystemProgram.createAccount({ /* ... */ space: mintLen, /* ... */ }),
  metadataPointerIx,
  createInitializeMintInstruction(mint.publicKey, 9, mintAuth, null, TOKEN_2022_PROGRAM_ID),
  createInitializeInstruction({
    programId: TOKEN_2022_PROGRAM_ID,
    mint: mint.publicKey,
    metadata: mint.publicKey,
    name: metadata.name,
    symbol: metadata.symbol,
    uri: metadata.uri,
    mintAuthority: mintAuth,
    updateAuthority: updateAuthority.publicKey,
  }),
  createUpdateFieldInstruction({
    programId: TOKEN_2022_PROGRAM_ID,
    metadata: mint.publicKey,
    updateAuthority: updateAuthority.publicKey,
    field: "description",
    value: "A cool token",
  })
);
```

**Pitfalls:**
- Metadata pointer must be initialized BEFORE `InitializeMint`
- Account space must include metadata length — calculate with `pack()`
- `additionalMetadata` is key-value pairs, not arbitrary JSON

## 6. Default Account State

All new token accounts start frozen — useful for regulated tokens.

```typescript
import {
  createInitializeDefaultAccountStateInstruction,
  AccountState,
} from "@solana/spl-token";

const ix = createInitializeDefaultAccountStateInstruction(
  mint.publicKey,
  AccountState.Frozen,
  TOKEN_2022_PROGRAM_ID
);
// Add before InitializeMint in transaction
```

**Pitfalls:**
- Requires freeze authority on the mint to thaw accounts
- Every new ATA will be frozen — ensure your onboarding flow thaws after KYC/approval

## 7. Immutable Owner

Prevents the token account owner from being reassigned. ATAs have this by default.

```typescript
import { createInitializeImmutableOwnerInstruction } from "@solana/spl-token";

// Add before InitializeAccount instruction
const ix = createInitializeImmutableOwnerInstruction(
  tokenAccount.publicKey,
  TOKEN_2022_PROGRAM_ID
);
```

**Pitfalls:**
- Already default for Associated Token Accounts under Token-2022
- Only needed for manually created accounts
- Cannot be added after account initialization

## 8. CPI Guard

Prevents token account from being manipulated via CPI (cross-program invocation).

```typescript
import { createEnableCpiGuardInstruction } from "@solana/spl-token";

const ix = createEnableCpiGuardInstruction(
  tokenAccount,
  owner.publicKey,
  [],
  TOKEN_2022_PROGRAM_ID
);
```

When enabled, CPI calls cannot:
- Transfer tokens from this account
- Burn tokens from this account
- Approve a delegate
- Close the account
- Set the close authority

**Pitfalls:**
- User must disable CPI guard before interacting with DeFi protocols that use CPI
- Only the account owner (via top-level instruction) can disable it

## 9. Permanent Delegate

A delegate that can never be revoked — can transfer or burn any amount.

```typescript
import { createInitializePermanentDelegateInstruction } from "@solana/spl-token";

const ix = createInitializePermanentDelegateInstruction(
  mint.publicKey,
  permanentDelegate.publicKey,
  TOKEN_2022_PROGRAM_ID
);
// Add before InitializeMint
```

**Use cases:** Compliance (freeze/seize), recovery mechanisms, auto-revocation of licenses.

**Pitfalls:**
- Extremely powerful — the delegate can drain any token account for this mint
- Users may reject tokens with permanent delegates — impacts trust
- Cannot be removed once set

## 10. Non-Transferable Tokens (Soulbound)

Tokens that cannot be transferred after minting — only burn is allowed.

```typescript
import { createInitializeNonTransferableMintInstruction } from "@solana/spl-token";

const ix = createInitializeNonTransferableMintInstruction(
  mint.publicKey,
  TOKEN_2022_PROGRAM_ID
);
// Add before InitializeMint
```

**Use cases:** Achievements, certifications, reputation scores, membership badges.

**Pitfalls:**
- Tokens can still be burned — use with freeze authority if you need to prevent that
- Cannot be combined with transfer hooks (transfers are blocked entirely)

## 11. Group / Member Pointer

Create on-chain token collections — a group mint points to group data, member mints point back to their group.

```typescript
import {
  createInitializeGroupPointerInstruction,
  createInitializeMemberPointerInstruction,
} from "@solana/spl-token";

// Group mint
const groupIx = createInitializeGroupPointerInstruction(
  groupMint.publicKey,
  groupAuthority.publicKey,
  groupMint.publicKey, // group data on the mint itself
  TOKEN_2022_PROGRAM_ID
);

// Member mint
const memberIx = createInitializeMemberPointerInstruction(
  memberMint.publicKey,
  memberAuthority.publicKey,
  memberMint.publicKey,
  TOKEN_2022_PROGRAM_ID
);
```

**Pitfalls:**
- Relatively new — tooling support may lag behind other extensions
- Group size must be updated when adding members

## 12. Required Memo on Transfer

Every transfer to this account must include a memo instruction in the same transaction.

```typescript
import { createEnableRequiredMemoTransfersInstruction } from "@solana/spl-token";

const ix = createEnableRequiredMemoTransfersInstruction(
  tokenAccount,
  owner.publicKey,
  [],
  TOKEN_2022_PROGRAM_ID
);
```

Sending a transfer:

```typescript
import { createMemoInstruction } from "@solana/spl-memo";

const tx = new Transaction().add(
  createMemoInstruction("Payment for invoice #1234", [sender.publicKey]),
  createTransferCheckedInstruction(
    sourceAta, mint, destinationAta, sender.publicKey,
    amount, decimals, [], TOKEN_2022_PROGRAM_ID
  )
);
```

**Pitfalls:**
- Memo instruction must come BEFORE the transfer in the transaction
- Breaks compatibility with programs that don't include memos

## Detecting Extensions

### Check Mint Extensions

```typescript
import {
  getMint,
  getExtensionTypes,
  getExtensionData,
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";

const mintInfo = await getMint(connection, mintPubkey, "confirmed", TOKEN_2022_PROGRAM_ID);
const extensions = getExtensionTypes(mintInfo.tlvData);

// Check specific extension
const hasTransferFee = extensions.includes(ExtensionType.TransferFeeConfig);
const hasTransferHook = extensions.includes(ExtensionType.TransferHook);
const hasMetadata = extensions.includes(ExtensionType.MetadataPointer);

// Get extension data
if (hasTransferFee) {
  const feeConfig = getTransferFeeConfig(mintInfo);
  console.log(`Fee: ${feeConfig.newerTransferFee.transferFeeBasisPoints} bps`);
}
```

### Check Account Extensions

```typescript
import { getAccount, getExtensionTypes } from "@solana/spl-token";

const accountInfo = await getAccount(
  connection, tokenAccount, "confirmed", TOKEN_2022_PROGRAM_ID
);
const extensions = getExtensionTypes(accountInfo.tlvData);
const hasCpiGuard = extensions.includes(ExtensionType.CpiGuard);
```

## Frontend Handling

### Transfer Hook Extra Accounts

```typescript
import { addExtraAccountMetasForExecute } from "@solana/spl-token";

// Build a basic transfer instruction, then add extra accounts
const ix = createTransferCheckedInstruction(
  source, mint, destination, owner, amount, decimals, [], TOKEN_2022_PROGRAM_ID
);

// Resolves and appends extra accounts from on-chain meta list
await addExtraAccountMetasForExecute(
  connection, ix, TOKEN_2022_PROGRAM_ID,
  source, mint, destination, owner, amount
);
```

### Displaying Token Metadata

```typescript
import { getTokenMetadata } from "@solana/spl-token-metadata";

const metadata = await getTokenMetadata(connection, mintPubkey);
if (metadata) {
  console.log(metadata.name, metadata.symbol, metadata.uri);
  // Additional metadata as Map<string, string>
  for (const [key, value] of metadata.additionalMetadata) {
    console.log(`${key}: ${value}`);
  }
}
```

## Testing with LiteSVM

```rust
use litesvm::LiteSVM;

#[test]
fn test_token_2022_transfer_fee() {
    let mut svm = LiteSVM::new();
    // Load Token-2022 program
    svm.add_program_from_file(
        spl_token_2022::ID,
        "path/to/spl_token_2022.so"
    );

    let payer = Keypair::new();
    svm.airdrop(&payer.pubkey(), 10_000_000_000).unwrap();

    // Create mint with transfer fee extension
    let mint = Keypair::new();
    let space = ExtensionType::try_calculate_account_len::<Mint>(
        &[ExtensionType::TransferFeeConfig]
    ).unwrap();

    let create_ix = system_instruction::create_account(
        &payer.pubkey(), &mint.pubkey(),
        svm.minimum_balance_for_rent_exemption(space),
        space as u64, &spl_token_2022::ID,
    );

    let fee_ix = spl_token_2022::extension::transfer_fee::instruction::initialize_transfer_fee_config(
        &spl_token_2022::ID, &mint.pubkey(),
        Some(&fee_authority.pubkey()),
        Some(&withdraw_authority.pubkey()),
        500, // 5%
        5_000_000_000, // max fee
    ).unwrap();

    let init_ix = spl_token_2022::instruction::initialize_mint(
        &spl_token_2022::ID, &mint.pubkey(),
        &mint_authority.pubkey(), None, 9,
    ).unwrap();

    let tx = Transaction::new_signed_with_payer(
        &[create_ix, fee_ix, init_ix],
        Some(&payer.pubkey()),
        &[&payer, &mint],
        svm.latest_blockhash(),
    );
    svm.send_transaction(tx).unwrap();
}
```

### Anchor Test Pattern

```typescript
import { startAnchor } from "solana-bankrun";
import { BankrunProvider } from "anchor-bankrun";

const context = await startAnchor(".", [], []);
const provider = new BankrunProvider(context);

// Token-2022 is available by default in bankrun
// Create mints and accounts using @solana/spl-token with TOKEN_2022_PROGRAM_ID
```

## Migration from SPL Token

| SPL Token | Token-2022 | Notes |
|-----------|-----------|-------|
| `TOKEN_PROGRAM_ID` | `TOKEN_2022_PROGRAM_ID` | Different program ID |
| `createTransferInstruction` | `createTransferCheckedInstruction` | Must use checked variant |
| `getMint(conn, mint)` | `getMint(conn, mint, commitment, TOKEN_2022_PROGRAM_ID)` | Pass program ID explicitly |
| `getAccount(conn, addr)` | `getAccount(conn, addr, commitment, TOKEN_2022_PROGRAM_ID)` | Pass program ID explicitly |
| `getAssociatedTokenAddress(mint, owner)` | `getAssociatedTokenAddress(mint, owner, false, TOKEN_2022_PROGRAM_ID)` | Different ATA derivation |
| Fixed account size (165 bytes) | Variable size (extensions) | Use `getMintLen([...extensions])` |

### Anchor CPI to Token-2022

```rust
use anchor_spl::token_2022::{self, Token2022, TransferChecked};

#[derive(Accounts)]
pub struct Pay<'info> {
    #[account(mut)]
    pub from: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub to: InterfaceAccount<'info, TokenAccount>,
    pub mint: InterfaceAccount<'info, Mint>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token2022>,
}

pub fn pay(ctx: Context<Pay>, amount: u64) -> Result<()> {
    token_2022::transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.from.to_account_info(),
                to: ctx.accounts.to.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        ),
        amount,
        ctx.accounts.mint.decimals,
    )
}
```

### Supporting Both Token Programs

```rust
use anchor_spl::token_interface::{self, TokenInterface, TokenAccount, Mint, TransferChecked};

#[derive(Accounts)]
pub struct Pay<'info> {
    #[account(mut)]
    pub from: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub to: InterfaceAccount<'info, TokenAccount>,
    pub mint: InterfaceAccount<'info, Mint>,
    pub authority: Signer<'info>,
    pub token_program: Interface<'info, TokenInterface>, // accepts both
}

pub fn pay(ctx: Context<Pay>, amount: u64) -> Result<()> {
    token_interface::transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.from.to_account_info(),
                to: ctx.accounts.to.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        ),
        amount,
        ctx.accounts.mint.decimals,
    )
}
```

Use `Interface<'info, TokenInterface>` to accept both SPL Token and Token-2022 in the same instruction. This is the recommended pattern for new programs.
