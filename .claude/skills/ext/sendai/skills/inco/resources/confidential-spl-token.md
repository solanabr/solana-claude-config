# Inco SVM — Confidential SPL Token Reference

## Overview

The Confidential SPL Token Program is a privacy-preserving token implementation on Solana. Unlike standard SPL tokens where balances and transfer amounts are publicly visible, this program uses Inco Lightning encryption to keep values hidden while still allowing validated operations.

## Key Features

- **Encrypted Balances** — stored as `Euint128` handles, invisible to observers
- **Private Transfers** — amounts remain confidential during validation
- **Standard SPL Interface** — familiar patterns for Solana developers
- **Access Control** — per-handle decryption permissions via `remaining_accounts`

## Program Functions

### `initialize_mint`

Creates a new confidential token mint.

```rust
pub fn initialize_mint(
    ctx: Context<InitializeMint>,
    decimals: u8,                     // Token precision (e.g., 9)
    mint_authority: Pubkey,           // Authority to mint tokens
    freeze_authority: Option<Pubkey>, // Authority to freeze accounts
) -> Result<()>
```

### `create_account`

Creates a token account for holding confidential balances.

### `mint_to`

Mints encrypted tokens to a token account.

```rust
pub fn mint_to<'info>(
    ctx: Context<'_, '_, '_, 'info, IncoMintTo<'info>>,
    ciphertext: Vec<u8>,  // Client-encrypted amount
    input_type: u8,       // 0 for ciphertext
) -> Result<()>
```

**remaining_accounts:**

| Index | Account | Mutable | Description |
|-------|---------|---------|-------------|
| 0 | allowance_account | Yes | PDA for owner's new balance handle |
| 1 | owner_address | No | Token account owner |

### `transfer`

Transfers encrypted tokens between accounts.

```rust
pub fn transfer<'info>(
    ctx: Context<'_, '_, '_, 'info, IncoTransfer<'info>>,
    ciphertext: Vec<u8>,  // Client-encrypted transfer amount
    input_type: u8,
) -> Result<()>
```

**remaining_accounts:**

| Index | Account | Mutable | Description |
|-------|---------|---------|-------------|
| 0 | source_allowance_account | Yes | PDA for source's new balance |
| 1 | source_owner_address | No | Source token account owner |
| 2 | dest_allowance_account | Yes | PDA for dest's new balance |
| 3 | dest_owner_address | No | Dest token account owner |

### `approve`

Approves a delegate to spend encrypted tokens.

```rust
pub fn approve<'info>(
    ctx: Context<'_, '_, '_, 'info, IncoApprove<'info>>,
    ciphertext: Vec<u8>,  // Client-encrypted allowance amount
    input_type: u8,
) -> Result<()>
```

**remaining_accounts:**

| Index | Account | Mutable | Description |
|-------|---------|---------|-------------|
| 0 | allowance_account | Yes | PDA for delegate |
| 1 | delegate_address | No | Delegate pubkey |

## Client Usage

### Setup

```typescript
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import { encryptValue } from "@inco/solana-sdk/encryption";
import { decrypt } from "@inco/solana-sdk/attested-decrypt";

const INCO_LIGHTNING_PROGRAM_ID = new PublicKey("5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj");
const connection = new Connection("https://api.devnet.solana.com", "confirmed");
```

### Mint Tokens

```typescript
const encryptedAmount = await encryptValue(1_000_000_000n); // 1 token (9 decimals)

await program.methods
  .mintTo(Buffer.from(encryptedAmount, "hex"), 0)
  .accounts({
    mint: mintPubkey,
    tokenAccount: tokenAccountPda,
    authority: wallet.publicKey,
    incoLightningProgram: INCO_LIGHTNING_PROGRAM_ID,
  })
  .remainingAccounts([
    { pubkey: allowancePda, isSigner: false, isWritable: true },
    { pubkey: wallet.publicKey, isSigner: false, isWritable: false },
  ])
  .rpc();
```

### Transfer Tokens

```typescript
const encryptedTransfer = await encryptValue(500_000_000n); // 0.5 tokens

await program.methods
  .transfer(Buffer.from(encryptedTransfer, "hex"), 0)
  .accounts({
    source: sourceTokenAccount,
    destination: destTokenAccount,
    authority: wallet.publicKey,
    incoLightningProgram: INCO_LIGHTNING_PROGRAM_ID,
  })
  .remainingAccounts([
    { pubkey: sourceAllowancePda, isSigner: false, isWritable: true },
    { pubkey: sourceOwner, isSigner: false, isWritable: false },
    { pubkey: destAllowancePda, isSigner: false, isWritable: true },
    { pubkey: destOwner, isSigner: false, isWritable: false },
  ])
  .rpc();
```

### Reveal Balance

```typescript
async function revealTokenBalance(
  connection: Connection,
  program: any,
  mint: PublicKey,
  owner: PublicKey,
  signMessage: (msg: Uint8Array) => Promise<Uint8Array>,
): Promise<string> {
  const [ata] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), INCO_LIGHTNING_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const accountInfo = await connection.getAccountInfo(ata);
  if (!accountInfo) throw new Error("Token account not found");

  const tokenAccount = program.coder.accounts.decode("IncoTokenAccount", accountInfo.data);
  const balanceHandle = tokenAccount.amount.toString();

  const result = await decrypt([balanceHandle], { address: owner, signMessage });
  return result.plaintexts[0];
}
```

## Account Discriminators

For fetching accounts via `getProgramAccounts`:

| Account Type | Discriminator |
|-------------|---------------|
| Mint | `[254, 129, 245, 169, 202, 143, 198, 4]` |
| Token Account | `[18, 233, 131, 18, 230, 173, 249, 89]` |

```typescript
import bs58 from "bs58";

// Find all token accounts for a specific mint and owner
const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
  filters: [
    { memcmp: { offset: 0, bytes: bs58.encode(Buffer.from([18, 233, 131, 18, 230, 173, 249, 89])) } },
    { memcmp: { offset: 8, bytes: mint.toBase58() } },
    { memcmp: { offset: 40, bytes: owner.toBase58() } },
  ],
});
```

## Handle Extraction

Token account balance handles are at byte offset 72-88:

```typescript
const data = accountInfo.data;
const amountBytes = data.slice(72, 88);
let handle = BigInt(0);
for (let i = 15; i >= 0; i--) {
  handle = handle * BigInt(256) + BigInt(amountBytes[i]);
}
```
