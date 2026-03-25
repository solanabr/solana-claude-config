# Inco SVM — Access Control & Allowance PDAs

## Overview

Inco uses an **Allowance PDA** system to control who can decrypt encrypted handles. Every handle has independent permissions — you must explicitly grant access after each operation that produces a new handle.

## How It Works

1. An encrypted operation (e.g., `e_add`) produces a **new handle**
2. The handle owner calls `allow()` to grant decryption permission to specific addresses
3. The Allowance PDA is derived from `[handle.to_le_bytes(), allowed_address]`
4. When a user requests decryption, the covalidator checks the Allowance PDA on-chain
5. If the PDA exists and grants access, the covalidator decrypts in its TEE

## On-Chain: Granting Access

```rust
use inco_lightning::cpi::accounts::Allow;
use inco_lightning::cpi::allow;

pub fn grant_access(ctx: Context<GrantAccess>, handle: u128) -> Result<()> {
    let cpi_ctx = CpiContext::new(
        ctx.accounts.inco_lightning_program.to_account_info(),
        Allow {
            allowance_account: ctx.accounts.allowance_account.to_account_info(),
            signer: ctx.accounts.authority.to_account_info(),
            allowed_address: ctx.accounts.user.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
        },
    );
    allow(cpi_ctx, handle, true, ctx.accounts.user.key())?;
    Ok(())
}
```

## The `remaining_accounts` Pattern

The Confidential SPL Token and other programs use `remaining_accounts` to pass allowance PDAs in the same transaction as the operation. This avoids a separate transaction to grant access.

### Example: Transfer with Access Grants

```rust
pub fn transfer<'info>(
    ctx: Context<'_, '_, '_, 'info, Transfer<'info>>,
    ciphertext: Vec<u8>,
    input_type: u8,
) -> Result<()> {
    // ... perform transfer logic ...

    // Grant source owner access to their new balance handle
    let source_allowance = &ctx.remaining_accounts[0];
    let source_owner = &ctx.remaining_accounts[1];
    // ... CPI allow() call ...

    // Grant dest owner access to their new balance handle
    let dest_allowance = &ctx.remaining_accounts[2];
    let dest_owner = &ctx.remaining_accounts[3];
    // ... CPI allow() call ...

    Ok(())
}
```

**remaining_accounts layout for transfer:**

| Index | Account | Mutable | Description |
|-------|---------|---------|-------------|
| 0 | source_allowance_account | Yes | PDA for source owner's new balance |
| 1 | source_owner_address | No | Source owner pubkey |
| 2 | dest_allowance_account | Yes | PDA for dest owner's new balance |
| 3 | dest_owner_address | No | Dest owner pubkey |

## Simulation-Then-Submit Pattern

Since operations produce new handles and allowance PDAs depend on the handle value, you need to:

1. **Build the transaction** without `remaining_accounts`
2. **Simulate** to get the resulting handle from account data
3. **Derive the allowance PDA** from the handle
4. **Rebuild and submit** the transaction with `remaining_accounts`

### Client-Side Implementation

```typescript
import { PublicKey, Transaction, Connection, Keypair } from "@solana/web3.js";

const INCO_LIGHTNING_PROGRAM_ID = new PublicKey("5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj");

// Step 1: Derive allowance PDA from handle
function getAllowancePda(handle: bigint, allowedAddress: PublicKey): [PublicKey, number] {
  const handleBuffer = Buffer.alloc(16);
  let h = handle;
  for (let i = 0; i < 16; i++) {
    handleBuffer[i] = Number(h & BigInt(0xff));
    h = h >> BigInt(8);
  }
  return PublicKey.findProgramAddressSync(
    [handleBuffer, allowedAddress.toBuffer()],
    INCO_LIGHTNING_PROGRAM_ID
  );
}

// Step 2: Simulate to discover the result handle
async function simulateAndGetHandle(
  connection: Connection,
  tx: Transaction,
  accountPubkey: PublicKey,
  walletKeypair: Keypair,
  handleOffset: number = 72,  // byte offset in account data
): Promise<bigint | null> {
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = walletKeypair.publicKey;
  tx.sign(walletKeypair);

  const simulation = await connection.simulateTransaction(tx, undefined, [accountPubkey]);
  if (simulation.value.err) {
    console.error("Simulation failed:", simulation.value.err);
    return null;
  }

  if (simulation.value.accounts?.[0]?.data) {
    const data = Buffer.from(simulation.value.accounts[0].data[0], "base64");
    const amountBytes = data.slice(handleOffset, handleOffset + 16);
    let handle = BigInt(0);
    for (let i = 15; i >= 0; i--) {
      handle = handle * BigInt(256) + BigInt(amountBytes[i]);
    }
    return handle;
  }
  return null;
}

// Step 3: Full flow — simulate, derive PDA, submit
async function mintWithAllowance(
  program: any,
  connection: Connection,
  mint: PublicKey,
  tokenAccount: PublicKey,
  owner: PublicKey,
  walletKeypair: Keypair,
  encryptedAmount: string,
) {
  // Build base instruction (no remaining_accounts yet)
  const ix = await program.methods
    .mintTo(Buffer.from(encryptedAmount, "hex"), 0)
    .accounts({
      mint,
      tokenAccount,
      authority: walletKeypair.publicKey,
      incoLightningProgram: INCO_LIGHTNING_PROGRAM_ID,
    })
    .instruction();

  // Simulate to get new balance handle
  const simTx = new Transaction().add(ix);
  const handle = await simulateAndGetHandle(connection, simTx, tokenAccount, walletKeypair);

  if (!handle) throw new Error("Failed to get handle from simulation");

  // Derive allowance PDA
  const [allowancePda] = getAllowancePda(handle, owner);

  // Submit with remaining_accounts
  await program.methods
    .mintTo(Buffer.from(encryptedAmount, "hex"), 0)
    .accounts({
      mint,
      tokenAccount,
      authority: walletKeypair.publicKey,
      incoLightningProgram: INCO_LIGHTNING_PROGRAM_ID,
    })
    .remainingAccounts([
      { pubkey: allowancePda, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: false, isWritable: false },
    ])
    .rpc();
}
```

## Checking Permissions

```rust
use inco_lightning::cpi::accounts::IsAllowed;
use inco_lightning::cpi::is_allowed;

let has_access: bool = is_allowed(cpi_ctx, handle.0)?;
```

## Security Best Practices

1. **Grant minimal permissions** — only the account owner should decrypt their balance
2. **Always grant access after operations** — new handles have no permissions by default
3. **Revoke when no longer needed** — call `allow(ctx, handle, false, address)` to revoke
4. **Verify handles in attestations** — always check the handle matches what you expect to prevent handle-swap attacks
