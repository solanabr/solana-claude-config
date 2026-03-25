# Inco SVM — JavaScript SDK Reference

Complete reference for the `@inco/solana-sdk` client library.

## Installation

```bash
npm install @inco/solana-sdk
# or
pnpm add @inco/solana-sdk
yarn add @inco/solana-sdk
```

## Modules

| Module | Import Path | Purpose |
|--------|-------------|---------|
| Encryption | `@inco/solana-sdk/encryption` | Encrypt values before sending to programs |
| Attested Decrypt | `@inco/solana-sdk/attested-decrypt` | Decrypt handles with wallet signature |
| Utils | `@inco/solana-sdk/utils` | Helper functions for buffer conversions |

---

## Encryption

### `encryptValue`

Encrypts a value using the covalidator's public key for use in program instructions.

```typescript
import { encryptValue } from "@inco/solana-sdk/encryption";

const encryptedHex: string = await encryptValue(value);
```

**Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `value` | `bigint \| number \| boolean` | Value to encrypt |

**Returns:** `Promise<string>` — hex-encoded ciphertext

**Supported types:**
- `bigint` — e.g., `1000n`, `500_000_000n`
- `number` — integers only, e.g., `42`, `50075`
- `boolean` — `true` or `false`

**Not supported:** floats, strings, objects, null, undefined

**Usage in instructions:**
```typescript
const encrypted = await encryptValue(1000n);
await program.methods
  .deposit(Buffer.from(encrypted, "hex"))
  .rpc();
```

**Common Errors:**

| Error | Cause | Fix |
|-------|-------|-----|
| Cannot encrypt null/undefined | Passed null/undefined | Ensure value is defined |
| Floating-point not supported | Passed `10.5` | Use integers or BigInt |
| Unsupported value type | Passed string/object | Convert to BigInt or boolean |

---

## Attested Decrypt

### `decrypt`

Requests decryption of encrypted handles with wallet authentication. The covalidator verifies the wallet signature and checks on-chain allowance PDAs before decrypting in a TEE.

```typescript
import { decrypt } from "@inco/solana-sdk/attested-decrypt";

const result = await decrypt(handles, options);
```

**Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `handles` | `string[]` | Array of handle values as decimal strings (max 10) |
| `options.address` | `PublicKey` | Wallet public key requesting decryption |
| `options.signMessage` | `(msg: Uint8Array) => Promise<Uint8Array>` | Wallet's signMessage function |

**Returns:** `Promise<DecryptResult>`

```typescript
interface DecryptResult {
  plaintexts: string[];                    // Decrypted values as strings
  ed25519Instructions: TransactionInstruction[];  // For on-chain verification
  handles: string[];                       // Original handles
}
```

### Attested Reveal (display in UI)

Use `result.plaintexts` directly:

```typescript
const result = await decrypt([balanceHandle.toString()], {
  address: wallet.publicKey,
  signMessage: wallet.signMessage,
});
console.log("Balance:", result.plaintexts[0]);
```

### Attested Decrypt (verify on-chain)

Build a transaction with Ed25519 instructions + your program's verify instruction:

```typescript
const result = await decrypt([handle.toString()], {
  address: wallet.publicKey,
  signMessage: wallet.signMessage,
});

const tx = new Transaction();
result.ed25519Instructions.forEach((ix) => tx.add(ix));
tx.add(
  await program.methods
    .verifyDecryption(
      [Buffer.from(handleBytes)],
      [Buffer.from(plaintextBytes)]
    )
    .accounts({ authority: wallet.publicKey, instructions: SYSVAR_INSTRUCTIONS_ID, incoLightningProgram: INCO_LIGHTNING_ID })
    .instruction()
);
await sendTransaction(tx);
```

### Error Handling

```typescript
import { decrypt, AttestedDecryptError } from "@inco/solana-sdk/attested-decrypt";

try {
  const result = await decrypt(handles, { address, signMessage });
} catch (error) {
  if (error instanceof AttestedDecryptError) {
    console.error("Decrypt failed:", error.message);
  }
}
```

---

## Utils

```typescript
import { hexToBuffer, handleToBuffer, plaintextToBuffer } from "@inco/solana-sdk/utils";
```

| Function | Description |
|----------|-------------|
| `hexToBuffer(hex: string)` | Convert hex string to Buffer |
| `handleToBuffer(handle: bigint)` | Convert u128 handle to 16-byte LE Buffer |
| `plaintextToBuffer(value: bigint)` | Convert plaintext value to Buffer |

---

## Constants

```typescript
const INCO_LIGHTNING_PROGRAM_ID = new PublicKey("5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj");
```

## Allowance PDA Derivation (Client-side)

```typescript
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
```

## Transaction Simulation for Handle Discovery

Operations produce new handles. To derive allowance PDAs, simulate first:

```typescript
async function simulateAndGetHandle(
  connection: Connection,
  tx: Transaction,
  accountPubkey: PublicKey,
  walletKeypair: Keypair
): Promise<bigint | null> {
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = walletKeypair.publicKey;
  tx.sign(walletKeypair);

  const simulation = await connection.simulateTransaction(tx, undefined, [accountPubkey]);
  if (simulation.value.err) return null;

  if (simulation.value.accounts?.[0]?.data) {
    const data = Buffer.from(simulation.value.accounts[0].data[0], "base64");
    // Adjust offset based on your account struct layout
    const amountBytes = data.slice(72, 88);
    let handle = BigInt(0);
    for (let i = 15; i >= 0; i--) {
      handle = handle * BigInt(256) + BigInt(amountBytes[i]);
    }
    return handle;
  }
  return null;
}
```
