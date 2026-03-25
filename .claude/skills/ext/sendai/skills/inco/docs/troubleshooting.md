# Inco SVM — Troubleshooting Guide

## Encryption Errors

### Cannot encrypt null or undefined

**Symptoms:** `encryptValue()` throws "Cannot encrypt null/undefined"

**Solutions:**
1. Ensure the value is defined before encrypting
2. Check that your variable is properly initialized

```typescript
// Wrong
const encrypted = await encryptValue(undefined);

// Correct
const amount = 1000n;
const encrypted = await encryptValue(amount);
```

### Floating-point not supported

**Symptoms:** `encryptValue()` throws "Floating-point not supported"

**Solutions:**
1. Use integers or BigInt instead of floats
2. For token amounts, multiply by decimals first

```typescript
// Wrong
const encrypted = await encryptValue(10.5);

// Correct — use BigInt with token decimals
const amount = BigInt(10.5 * 1e9); // 10.5 tokens with 9 decimals
const encrypted = await encryptValue(amount);
```

### Unsupported value type

**Symptoms:** `encryptValue()` throws "Unsupported value type"

**Solutions:**
1. Only `bigint`, `number` (integers), and `boolean` are supported
2. Convert strings to BigInt

```typescript
// Wrong
const encrypted = await encryptValue("1000");

// Correct
const encrypted = await encryptValue(BigInt("1000"));
```

---

## Decryption Errors

### AttestedDecryptError: Access denied

**Symptoms:** `decrypt()` throws an `AttestedDecryptError`

**Causes:**
- The requesting address doesn't have an allowance PDA for the handle
- The allowance was revoked
- The handle value is incorrect

**Solutions:**
1. Verify `allow()` was called after the operation that produced the handle
2. Check the allowance PDA exists on-chain
3. Confirm you're passing the correct handle value as a decimal string

```typescript
// Verify allowance PDA exists
const [allowancePda] = getAllowancePda(handle, ownerPubkey);
const info = await connection.getAccountInfo(allowancePda);
if (!info) {
  console.error("No allowance PDA found — allow() was not called for this handle");
}
```

### Handle is 0 or incorrect

**Symptoms:** Decrypted value is always 0 or nonsensical

**Causes:**
- Wrong byte offset when extracting handle from account data
- Account data hasn't been updated yet

**Solutions:**
1. Verify the byte offset matches your account struct layout
2. Wait for transaction confirmation before reading

```typescript
// Anchor adds an 8-byte discriminator, so offsets shift:
// discriminator (8) + field1 (32) + field2 (32) = offset 72 for the third field
const handle = extractHandle(data, 72); // Adjust based on YOUR struct
```

### Wallet signature rejected

**Symptoms:** Decrypt call fails with signature error

**Solutions:**
1. Ensure `signMessage` is the wallet adapter's `signMessage` function
2. User must approve the signature popup in their wallet
3. Check that the wallet is connected

---

## CPI Errors

### Program failed to complete: exceeded CPI call depth

**Symptoms:** Transaction fails with CPI depth error

**Causes:** Too many nested CPI calls in a single instruction

**Solutions:**
1. Split operations across multiple instructions in a transaction
2. Reduce the number of encrypted operations per instruction

### Account not found for Inco Lightning program

**Symptoms:** "Account not found" or "Invalid program address"

**Solutions:**
1. Verify `INCO_LIGHTNING_ID` is correct: `5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj`
2. Ensure you're on Solana **devnet** (not mainnet or localnet)
3. Check your Anchor.toml includes the Inco Lightning program

```toml
[programs.devnet]
inco_lightning = "5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj"
```

### Operation signer mismatch

**Symptoms:** CPI call fails with signer validation error

**Solutions:**
1. The `signer` in the `Operation` struct must be a signer of the transaction
2. Check your accounts struct:

```rust
#[derive(Accounts)]
pub struct MyInstruction<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,  // Must be a Signer
    /// CHECK: Inco Lightning program
    #[account(address = INCO_LIGHTNING_ID)]
    pub inco_lightning_program: AccountInfo<'info>,
}
```

---

## Allowance PDA Issues

### Simulation returns null handle

**Symptoms:** `simulateAndGetHandle()` returns null

**Causes:**
- Simulation failed (check `simulation.value.err`)
- Wrong account index in `simulateTransaction` accounts array
- Account data format changed

**Solutions:**
1. Log and inspect the simulation error
2. Verify you're passing the correct account pubkeys to simulate
3. Check the account data encoding

```typescript
const simulation = await connection.simulateTransaction(tx, undefined, [accountPubkey]);
if (simulation.value.err) {
  console.error("Sim error:", JSON.stringify(simulation.value.err, null, 2));
  // Check simulation.value.logs for details
  simulation.value.logs?.forEach(log => console.log(log));
}
```

### Transaction fails after successful simulation

**Symptoms:** Simulation succeeds but the actual transaction fails

**Causes:**
- Blockhash expired between simulation and submission
- State changed between simulation and submission

**Solutions:**
1. Minimize time between simulation and submission
2. Re-fetch blockhash for the actual transaction
3. Consider retry logic with fresh simulation

---

## Deployment Issues

### Program deploy fails on devnet

**Solutions:**
1. Check you have enough SOL: `solana balance`
2. Airdrop if needed: `solana airdrop 2`
3. Verify program size fits within limits: `anchor build && ls -la target/deploy/`
4. Update program ID after first build:
   ```bash
   solana address -k target/deploy/my_program-keypair.json
   # Update declare_id!() in lib.rs and Anchor.toml
   anchor build && anchor deploy --provider.cluster devnet
   ```

### Anchor build fails with inco-lightning dependency

**Solutions:**
1. Ensure `features = ["cpi"]` is set in Cargo.toml
2. Check Rust toolchain compatibility
3. Run `anchor clean && anchor build`

---

## Next.js Integration Issues

### Wallet adapter signMessage not available

**Symptoms:** `wallet.signMessage` is undefined

**Solutions:**
1. Use `useWallet()` hook from `@solana/wallet-adapter-react`
2. Ensure wallet is connected before calling decrypt
3. Check wallet supports `signMessage` (most do)

```typescript
import { useWallet } from "@solana/wallet-adapter-react";

const { publicKey, signMessage } = useWallet();

if (!publicKey || !signMessage) {
  console.error("Wallet not connected or doesn't support signMessage");
  return;
}

const result = await decrypt([handle], { address: publicKey, signMessage });
```

### Buffer not defined in browser

**Symptoms:** `ReferenceError: Buffer is not defined`

**Solutions:**
1. Install the buffer polyfill: `npm install buffer`
2. Add to your app entry point:

```typescript
import { Buffer } from "buffer";
window.Buffer = Buffer;
```
