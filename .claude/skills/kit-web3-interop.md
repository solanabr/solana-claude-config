# Kit ↔ web3.js Interop (boundary patterns)

## The rule
- New code: Kit types and Kit-first APIs.
- Legacy dependencies: isolate web3.js-shaped types behind an adapter boundary.

## Preferred bridge: @solana/web3-compat
Use `@solana/web3-compat` when:
- A dependency expects `PublicKey`, `Keypair`, `Transaction`, `VersionedTransaction`, `Connection`, etc.
- You are migrating an existing web3.js codebase incrementally.

### Why this approach works
- web3-compat re-exports web3.js-like types and delegates to Kit where possible.
- It includes helper conversions to move between web3.js and Kit representations.

## Practical boundary layout
Keep these modules separate:

- `src/solana/kit/`:
  - all Kit-first code: addresses, instruction builders, tx assembly, typed codecs, generated clients

- `src/solana/web3/`:
  - adapters for legacy libs (Anchor TS client, older SDKs)
  - conversions between `PublicKey` and Kit `Address`
  - conversions between web3 `TransactionInstruction` and Kit instruction shapes (only at edges)

## Conversion helpers (examples)
Use web3-compat helpers such as:
- `toAddress(...)`
- `toPublicKey(...)`
- `toWeb3Instruction(...)`
- `toKitSigner(...)`

## When you still need @solana/web3.js
Some methods outside web3-compat's compatibility surface may fall back to a legacy web3.js implementation.
If that happens:
- keep `@solana/web3.js` as an explicit dependency
- isolate fallback usage to adapter modules only
- avoid letting `PublicKey` bleed into your core domain types

## Common mistakes to prevent
- Mixing `Address` and `PublicKey` throughout the app (causes type drift and confusion)
- Building transactions in one stack and signing in another without explicit conversion
- Passing web3.js `Connection` into Kit-native code (or vice versa) rather than using a single source of truth

## Decision checklist
If you're about to add web3.js:
1) Is there a Kit-native equivalent? Prefer Kit.
2) Is the only reason a dependency? Use web3-compat at the boundary.
3) Can you generate a Kit-native client (Codama) instead? Prefer codegen.

## Legacy Adapter Examples

### Anchor Program Adapter

Wrap Anchor's web3.js-based client in an adapter module:

```typescript
// src/solana/web3/anchor-adapter.ts
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { toAddress, toPublicKey } from '@solana/web3-compat';
import type { Address } from '@solana/kit';
import { IDL, YourProgram } from '@/idl/your_program';

// Adapter class isolates web3.js types
export class AnchorProgramAdapter {
  private program: Program<YourProgram>;

  constructor(connection: Connection, wallet: AnchorWallet) {
    const provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
    });
    this.program = new Program<YourProgram>(IDL, provider);
  }

  // Public API uses Kit types only
  async fetchVault(vaultAddress: Address): Promise<VaultData | null> {
    try {
      const pubkey = toPublicKey(vaultAddress);
      const account = await this.program.account.vault.fetch(pubkey);
      return {
        authority: toAddress(account.authority),
        balance: BigInt(account.balance.toString()),
      };
    } catch (e) {
      if (e.message?.includes('Account does not exist')) return null;
      throw e;
    }
  }

  // Returns Kit Address for PDA
  deriveVaultPda(authority: Address): Address {
    const authorityPubkey = toPublicKey(authority);
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), authorityPubkey.toBuffer()],
      this.program.programId
    );
    return toAddress(pda);
  }

  // Transaction methods return signature string
  async deposit(vault: Address, amount: bigint): Promise<string> {
    return await this.program.methods
      .deposit(new BN(amount.toString()))
      .accounts({ vault: toPublicKey(vault) })
      .rpc();
  }
}
```

### Usage in Kit-first Code

```typescript
// src/solana/kit/vault-service.ts
import type { Address } from '@solana/kit';
import { AnchorProgramAdapter } from '../web3/anchor-adapter';

// Kit-first service consumes adapter
export async function getVaultBalance(
  adapter: AnchorProgramAdapter,
  userAddress: Address
): Promise<bigint> {
  const vaultPda = adapter.deriveVaultPda(userAddress);
  const vault = await adapter.fetchVault(vaultPda);
  return vault?.balance ?? 0n;
}
```

### Legacy Transaction Wrapper

When you must use legacy `Transaction` objects:

```typescript
// src/solana/web3/legacy-tx-adapter.ts
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import { toPublicKey, toKitInstruction } from '@solana/web3-compat';
import type { Address, IInstruction } from '@solana/kit';

// Convert legacy transaction to Kit instructions
export function wrapLegacyTransaction(
  fromAddress: Address,
  toAddress: Address,
  lamports: bigint
): IInstruction {
  const legacyIx = SystemProgram.transfer({
    fromPubkey: toPublicKey(fromAddress),
    toPubkey: toPublicKey(toAddress),
    lamports: Number(lamports),
  });

  return toKitInstruction(legacyIx);
}

// For libraries that return Transaction objects
export function extractInstructions(
  legacyTx: Transaction
): IInstruction[] {
  return legacyTx.instructions.map(toKitInstruction);
}
```

## Migration Strategy

When migrating a web3.js codebase:

1. **Start with adapters** - Wrap existing web3.js code, don't rewrite immediately
2. **New features in Kit** - All new code uses Kit types natively
3. **Gradual replacement** - Replace adapters with Kit-native implementations over time
4. **Test at boundaries** - Ensure conversions preserve data integrity
