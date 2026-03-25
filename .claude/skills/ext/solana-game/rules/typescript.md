---
globs:
  - "app/**/*.{ts,tsx}"
  - "src/**/*.{ts,tsx}"
  - "tests/**/*.ts"
exclude:
  - "**/node_modules/**"
  - "**/dist/**"
  - "**/*.d.ts"
---

# TypeScript Standards for Solana Gaming

These rules apply to frontend and integration test TypeScript code.

## Type Safety

### NO any types

```typescript
// BAD
function process(data: any) {
  return data.value;
}

// GOOD
interface Data {
  value: number;
}

function process(data: Data): number {
  return data.value;
}
```

### Explicit return types for functions

```typescript
// BAD
function calculateBalance(amount) {
  return amount * 1.1;
}

// GOOD
function calculateBalance(amount: number): number {
  return amount * 1.1;
}
```

### Tree-shakable imports

```typescript
// BAD - imports entire library
import * as web3 from '@solana/web3.js';

// GOOD - tree-shakable, smaller bundle
import { Connection, PublicKey } from '@solana/web3.js';
```

## Solana Transaction Patterns

### Use proper BigInt for u64/u128

```typescript
// BAD - JavaScript number (unsafe for large values)
const amount = 1000000000000;

// GOOD - BigInt for Solana u64
const amount = 1_000_000_000_000n;

// For Anchor/BN.js compatibility
import BN from 'bn.js';
const amountBN = new BN('1000000000000');
```

### Always simulate before sending

```typescript
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

  // 2. Sign and send
  transaction.sign(payer);
  const signature = await connection.sendRawTransaction(transaction.serialize());

  // 3. Confirm
  await connection.confirmTransaction(signature, 'confirmed');

  return signature;
}
```

## Async/Await Patterns

### Always use async/await (not .then())

```typescript
// BAD
function getData() {
  return fetch('/api/data')
    .then(res => res.json())
    .then(data => process(data));
}

// GOOD
async function getData(): Promise<ProcessedData> {
  const res = await fetch('/api/data');
  const data = await res.json();
  return process(data);
}
```

### Batch requests to avoid overwhelming RPC

```typescript
// BAD - all at once (can overwhelm RPC)
const accounts = await Promise.all(
  pubkeys.map(pk => connection.getAccountInfo(pk))
);

// GOOD - use getMultipleAccountsInfo with batching
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
```

### User-friendly error messages

```typescript
function getUserFriendlyError(error: unknown): string {
  if (error instanceof WalletNotConnectedError) {
    return 'Please connect your wallet to continue';
  }

  if (error instanceof InsufficientFundsError) {
    return error.message;
  }

  if (error instanceof Error) {
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

## Code Style

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

**Remember**: Type safety prevents bugs. Simulate before sending. Handle errors gracefully.
