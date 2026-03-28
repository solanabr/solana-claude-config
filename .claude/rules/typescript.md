---
paths:
  - "app/**/*.{ts,tsx}"
  - "src/**/*.{ts,tsx}"
  - "tests/**/*.ts"
exclude:
  - "**/node_modules/**"
  - "**/dist/**"
  - "**/*.d.ts"
---

# TypeScript Standards for Solana dApps

These rules apply to frontend and integration test TypeScript code.

## Web3.js Versions

Solana has two major web3.js versions:
- **@solana/web3.js 1.x** - Legacy, used with Anchor and most existing code
- **@solana/kit (web3.js 2.0)** - Modern, tree-shakable, better types

**Recommendation**: Use web3.js 2.0 (`@solana/kit`) for new projects. Use 1.x when working with Anchor or existing codebases.

### Web3.js 2.0 (@solana/kit)
```typescript
// ✅ Modern web3.js 2.0
import {
  createSolanaRpc,
  address,
  getSignatureFromTransaction,
  pipe,
} from '@solana/kit';

const rpc = createSolanaRpc('https://api.mainnet-beta.solana.com');

// Type-safe address handling
const pubkey = address('11111111111111111111111111111111');
```

### Web3.js 1.x (Legacy/Anchor)
```typescript
// Legacy web3.js 1.x (for Anchor projects)
import { Connection, PublicKey, Transaction } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const pubkey = new PublicKey('11111111111111111111111111111111');
```

### Tree-shakable imports (both versions)
```typescript
// ❌ BAD - imports entire library
import * as web3 from '@solana/web3.js';

// ✅ GOOD - tree-shakable, smaller bundle
import { Connection, PublicKey } from '@solana/web3.js';
```

## Type Safety

### NO any types
```typescript
// ❌ BAD
function process(data: any) {
  return data.value;
}

// ✅ GOOD
interface Data {
  value: number;
}

function process(data: Data): number {
  return data.value;
}
```

### Explicit return types for functions
```typescript
// ❌ BAD
function calculateBalance(amount) {
  return amount * 1.1;
}

// ✅ GOOD
function calculateBalance(amount: number): number {
  return amount * 1.1;
}
```

### Use const assertions for readonly data
```typescript
// ✅ GOOD
const PROGRAM_IDS = {
  TOKEN_PROGRAM: '11111111111111111111111111111111',
  ASSOCIATED_TOKEN_PROGRAM: '22222222222222222222222222222222',
} as const;

type ProgramId = typeof PROGRAM_IDS[keyof typeof PROGRAM_IDS];
```

## Solana Transaction Patterns (Web3.js 1.x / Anchor)

### Always simulate before sending
```typescript
import {
  Connection,
  Transaction,
  ComputeBudgetProgram,
  Keypair,
} from '@solana/web3.js';

async function sendAndConfirmTransaction(
  connection: Connection,
  transaction: Transaction,
  payer: Keypair
): Promise<string> {
  // 1. Simulate first
  const simulation = await connection.simulateTransaction(transaction);

  if (simulation.value.err) {
    throw new Error(`Simulation failed: ${JSON.stringify(simulation.value.err)}`);
  }

  // 2. Set compute budget based on simulation
  const computeUnits = simulation.value.unitsConsumed;
  if (computeUnits) {
    const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: Math.ceil(computeUnits * 1.2), // 20% buffer
    });
    transaction.add(computeBudgetIx);
  }

  // 3. Sign and send transaction
  transaction.sign(payer);
  const signature = await connection.sendRawTransaction(transaction.serialize());

  // 4. Confirm
  await connection.confirmTransaction(signature, 'confirmed');

  return signature;
}
```

### Use proper BigInt for u64/u128
```typescript
// ❌ BAD - JavaScript number (unsafe for large values)
const amount = 1000000000000;

// ✅ GOOD - BigInt for Solana u64
const amount = 1_000_000_000_000n;

// For Anchor/BN.js compatibility
import BN from 'bn.js';
const amountBN = new BN('1000000000000');
```

### Type-safe account fetching (Anchor)
```typescript
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { IDL, YourProgram } from './your_program';

interface Vault {
  authority: PublicKey;
  balance: bigint;
}

async function getVault(
  program: Program<YourProgram>,
  authority: PublicKey
): Promise<Vault | null> {
  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), authority.toBuffer()],
    program.programId
  );

  try {
    const vault = await program.account.vault.fetch(vaultPda);
    return vault as Vault;
  } catch (e) {
    if (e instanceof Error && e.message.includes('Account does not exist')) {
      return null;
    }
    throw e;
  }
}
```

## Async/Await Patterns

### Always use async/await (not .then())
```typescript
// ❌ BAD
function getData() {
  return fetch('/api/data')
    .then(res => res.json())
    .then(data => process(data));
}

// ✅ GOOD
async function getData(): Promise<ProcessedData> {
  const res = await fetch('/api/data');
  const data = await res.json();
  return process(data);
}
```

### Proper error handling
```typescript
import { Connection, PublicKey, AccountInfo } from '@solana/web3.js';

async function fetchAccount(
  connection: Connection,
  pubkey: PublicKey
): Promise<AccountInfo<Buffer>> {
  try {
    const account = await connection.getAccountInfo(pubkey);

    if (!account) {
      throw new Error('Account not found');
    }

    return account;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to fetch account:', error.message);
    }
    throw error;
  }
}
```

### Batch requests to avoid overwhelming RPC
```typescript
import { Connection, PublicKey, AccountInfo } from '@solana/web3.js';

// ❌ BAD - all at once (can overwhelm RPC)
const accounts = await Promise.all(
  pubkeys.map(pk => connection.getAccountInfo(pk))
);

// ✅ GOOD - use getMultipleAccountsInfo with batching
async function getAccountsBatched(
  connection: Connection,
  pubkeys: PublicKey[],
  batchSize = 100
): Promise<(AccountInfo<Buffer> | null)[]> {
  const results: (AccountInfo<Buffer> | null)[] = [];

  for (let i = 0; i < pubkeys.length; i += batchSize) {
    const batch = pubkeys.slice(i, i + batchSize);
    const batchResults = await connection.getMultipleAccountsInfo(batch);
    results.push(...batchResults);
  }

  return results;
}
```

## React Patterns (for dApps)

### Use hooks properly
```typescript
import { useWallet } from '@solana/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';
import { useProgram } from './hooks/useProgram';

function VaultDisplay() {
  const { publicKey } = useWallet();
  const program = useProgram();

  // ✅ GOOD - React Query for data fetching
  const { data: vault, isLoading } = useQuery({
    queryKey: ['vault', publicKey?.toString()],
    queryFn: async () => {
      if (!publicKey || !program) return null;
      return getVault(program, publicKey);
    },
    enabled: !!publicKey && !!program,
    refetchInterval: 30_000, // Refetch every 30s
  });

  if (isLoading) return <div>Loading...</div>;
  if (!vault) return <div>No vault found</div>;

  return <div>Balance: {vault.balance.toString()}</div>;
}
```

### Memoize expensive computations
```typescript
import { useMemo } from 'react';

interface Transaction {
  amount: bigint;
}

function TransactionList({ transactions }: { transactions: Transaction[] }) {
  // ✅ GOOD - memoized calculation
  const totalVolume = useMemo(() => {
    return transactions.reduce((sum, tx) => sum + tx.amount, 0n);
  }, [transactions]);

  return <div>Total Volume: {totalVolume.toString()}</div>;
}
```

## Error Handling

### Custom error types
```typescript
export class WalletNotConnectedError extends Error {
  constructor() {
    super('Wallet not connected');
    this.name = 'WalletNotConnectedError';
  }
}

export class InsufficientFundsError extends Error {
  constructor(required: bigint, available: bigint) {
    super(`Insufficient funds: need ${required}, have ${available}`);
    this.name = 'InsufficientFundsError';
  }
}

// Usage
async function withdraw(
  wallet: { publicKey: PublicKey | null },
  amount: bigint,
  getBalance: (pk: PublicKey) => Promise<bigint>
): Promise<string> {
  if (!wallet.publicKey) {
    throw new WalletNotConnectedError();
  }

  const balance = await getBalance(wallet.publicKey);
  if (balance < amount) {
    throw new InsufficientFundsError(amount, balance);
  }

  // Process withdrawal...
  return 'signature';
}
```

### User-friendly error messages
```typescript
function getUserFriendlyError(error: unknown): string {
  if (error instanceof WalletNotConnectedError) {
    return 'Please connect your wallet to continue';
  }

  if (error instanceof InsufficientFundsError) {
    return error.message; // Already user-friendly
  }

  if (error instanceof Error) {
    // Map common Solana errors
    if (error.message.includes('0x1')) {
      return 'Insufficient funds for transaction fee';
    }
    if (error.message.includes('0x0')) {
      return 'Transaction failed - please try again';
    }
  }

  return 'An unexpected error occurred';
}
```

## Wallet Integration

### Wallet adapter pattern
```typescript
import { useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';

function App() {
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <YourApp />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

## Code Style

### Use functional components
```typescript
// ✅ GOOD - Functional component
interface Props {
  amount: bigint;
  onTransfer: (amount: bigint) => Promise<void>;
}

export function TransferForm({ amount, onTransfer }: Props) {
  return <div>{/* ... */}</div>;
}
```

### Proper naming
```typescript
// Components: PascalCase
function UserVaultDisplay() {}

// Hooks: camelCase with 'use' prefix
function useVaultData() {}

// Constants: SCREAMING_SNAKE_CASE
const MAX_TRANSACTION_SIZE = 1232;

// Functions/variables: camelCase
const calculateFee = () => {};
let userBalance = 0n;
```

## Performance

### Lazy load components
```typescript
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const VaultManager = lazy(() => import('./components/VaultManager'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VaultManager />
    </Suspense>
  );
}
```

### Debounce user inputs
```typescript
import { useMemo, useState } from 'react';
import { debounce } from 'lodash';

function SearchComponent() {
  const [results, setResults] = useState<Account[]>([]);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        const searchResults = await searchAccounts(query);
        setResults(searchResults);
      }, 300),
    []
  );

  return <input onChange={(e) => debouncedSearch(e.target.value)} />;
}
```

## Testing

### Test with proper types
```typescript
import { describe, it, expect } from 'vitest';

describe('calculateFee', () => {
  it('calculates fee correctly', () => {
    const amount = 1000n;
    const fee = calculateFee(amount);

    expect(fee).toBe(10n); // 1% fee
  });

  it('handles zero amount', () => {
    const fee = calculateFee(0n);
    expect(fee).toBe(0n);
  });
});
```

## Documentation

### JSDoc for exported functions
```typescript
import { Program } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

/**
 * Fetches vault data for a given authority.
 *
 * @param program - The Anchor program instance
 * @param authority - The vault authority's public key
 * @returns The vault data, or null if not found
 * @throws {Error} If RPC call fails
 */
export async function getVault(
  program: Program<YourProgram>,
  authority: PublicKey
): Promise<Vault | null> {
  // Implementation
}
```

## Imports Organization

```typescript
// 1. External libraries (React first, then alphabetical)
import { useState, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';

// 2. Internal modules
import { useWallet } from '@/hooks/useWallet';
import { VaultDisplay } from '@/components/VaultDisplay';

// 3. Types (use 'import type' for type-only imports)
import type { Vault } from '@/types';

// 4. Styles
import styles from './Component.module.css';
```

---

## Project Scaffolding

- Use `create-solana-dapp` for new frontend projects

**Remember**: Type safety prevents bugs. Simulate before sending. Handle errors gracefully. Choose web3.js version based on your project needs.

**Sources:**
- [Solana Web3.js 2.0](https://www.helius.dev/blog/how-to-start-building-with-the-solana-web3-js-2-0-sdk)
- [Web3.js 2.0 Best Practices](https://blog.quicknode.com/solana-web3-js-2-0-a-new-chapter-in-solana-development/)
- [Anchor TypeScript Client](https://www.anchor-lang.com/docs/javascript-anchor-types)