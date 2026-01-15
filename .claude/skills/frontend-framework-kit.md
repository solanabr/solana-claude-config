# Frontend with framework-kit (Next.js / React)

## Goals
- One Solana client instance for the app (RPC + WS + wallet connectors)
- Wallet Standard-first discovery/connect
- Minimal "use client" footprint in Next.js (hooks only in leaf components)
- Transaction sending that is observable, cancelable, and UX-friendly

## Recommended dependencies
- @solana/client
- @solana/react-hooks
- @solana/kit
- @solana-program/system, @solana-program/token, etc. (only what you need)

## Bootstrap recommendation
Prefer `create-solana-dapp` and pick a kit/framework-kit compatible template for new projects.

## Provider setup (Next.js App Router)
Create a single client and provide it via SolanaProvider.

Example `app/providers.tsx`:

```tsx
'use client';

import React from 'react';
import { SolanaProvider } from '@solana/react-hooks';
import { autoDiscover, createClient } from '@solana/client';

const endpoint =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? 'https://api.devnet.solana.com';

// Some environments prefer an explicit WS endpoint; default to wss derived from https.
const websocketEndpoint =
  process.env.NEXT_PUBLIC_SOLANA_WS_URL ??
  endpoint.replace('https://', 'wss://').replace('http://', 'ws://');

export const solanaClient = createClient({
  endpoint,
  websocketEndpoint,
  walletConnectors: autoDiscover(),
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <SolanaProvider client={solanaClient}>{children}</SolanaProvider>;
}
```

Then wrap `app/layout.tsx` with `<Providers>`.

## Hook usage patterns (high-level)

Prefer framework-kit hooks before writing your own store/subscription logic:

* `useWalletConnection()` for connect/disconnect and wallet discovery
* `useBalance(...)` for lamports balance
* `useSolTransfer(...)` for SOL transfers
* `useSplToken(...)` / token helpers for token balances/transfers
* `useTransactionPool(...)` for managing send + status + retry flows

When you need custom instructions, build them using `@solana-program/*` and send them via the framework-kit transaction helpers.

## Data fetching and subscriptions

* Prefer watchers/subscriptions rather than manual polling.
* Clean up subscriptions with abort handles returned by watchers.
* For Next.js: keep server components server-side; only leaf components that call hooks should be client components.

## Transaction UX checklist

* Disable inputs while a transaction is pending
* Provide a signature immediately after send
* Track confirmation states (processed/confirmed/finalized) based on UX need
* Show actionable errors:

  * user rejected signing
  * insufficient SOL for fees / rent
  * blockhash expired / dropped
  * account already in use / already initialized
  * program error (custom error code)

## When to use ConnectorKit (optional)

If you need a headless connector with composable UI elements and explicit state control, use ConnectorKit.
Typical reasons:

* You want a headless wallet connection core (useful across frameworks)
* You want more control over wallet/account state than a single provider gives
* You need production diagnostics/health checks for wallet sessions

## React Query Integration

Use TanStack Query for caching and async state beyond what framework-kit hooks provide:

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useAccountData(address: Address | null) {
  const client = useSolanaClient();
  
  return useQuery({
    queryKey: ['account', address],
    queryFn: async () => {
      if (!address) return null;
      const rpc = client.rpc;
      const { value } = await rpc.getAccountInfo(address).send();
      return value;
    },
    enabled: !!address,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}

// Mutation pattern for transactions
export function useDeposit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ amount }: { amount: bigint }) => {
      // Build and send transaction via framework-kit
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account'] });
    },
  });
}
```

## Zustand for Global State

Use Zustand for app state that spans components (not RPC data):

```tsx
import { create } from 'zustand';
import type { Address } from '@solana/kit';

interface AppStore {
  selectedVault: Address | null;
  setSelectedVault: (vault: Address | null) => void;
  recentTransactions: string[];
  addTransaction: (sig: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  selectedVault: null,
  setSelectedVault: (vault) => set({ selectedVault: vault }),
  recentTransactions: [],
  addTransaction: (sig) =>
    set((state) => ({
      recentTransactions: [sig, ...state.recentTransactions].slice(0, 10),
    })),
}));
```

## Error Handling Patterns

Parse transaction errors into user-friendly messages:

```tsx
export function parseTransactionError(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'An unexpected error occurred.';
  }

  const message = error.message.toLowerCase();

  // Common Solana errors
  if (message.includes('insufficient') || message.includes('0x1')) {
    return 'Insufficient SOL for transaction fee.';
  }
  if (message.includes('blockhash not found') || message.includes('expired')) {
    return 'Transaction expired. Please try again.';
  }
  if (message.includes('user rejected') || message.includes('cancelled')) {
    return 'Transaction cancelled.';
  }
  if (message.includes('already in use') || message.includes('already initialized')) {
    return 'Account already exists.';
  }

  // Custom program error codes
  const errorMatch = message.match(/custom program error: 0x([0-9a-f]+)/i);
  if (errorMatch) {
    const code = parseInt(errorMatch[1], 16);
    return `Program error: ${code}. Check program documentation.`;
  }

  return 'Transaction failed. Please try again.';
}

// Toast wrapper for transactions
export async function executeWithToast<T>(
  fn: () => Promise<T>,
  messages?: { loading?: string; success?: string; error?: string }
): Promise<T | null> {
  const toastId = toast.loading(messages?.loading ?? 'Processing...');
  try {
    const result = await fn();
    toast.success(messages?.success ?? 'Success!', { id: toastId });
    return result;
  } catch (error) {
    toast.error(messages?.error ?? parseTransactionError(error), { id: toastId });
    return null;
  }
}
```

## Priority Fees and Compute Budget

For congested networks or complex transactions:

```tsx
import { getSetComputeUnitLimitInstruction, getSetComputeUnitPriceInstruction } from '@solana-program/compute-budget';

async function buildOptimizedTransaction(
  rpc: SolanaRpc,
  instructions: IInstruction[],
  estimatedCU?: number
) {
  const computeUnits = estimatedCU ?? 200_000;
  
  // Prepend compute budget instructions
  const optimizedInstructions = [
    getSetComputeUnitLimitInstruction({ units: Math.ceil(computeUnits * 1.2) }),
    getSetComputeUnitPriceInstruction({ microLamports: 1000n }), // Adjust based on network
    ...instructions,
  ];

  return optimizedInstructions;
}
```

## Performance Patterns

### Memoization
```tsx
import { useMemo } from 'react';
import { address, type Address } from '@solana/kit';

export function useValidAddress(input: string): Address | null {
  return useMemo(() => {
    try {
      return address(input);
    } catch {
      return null;
    }
  }, [input]);
}
```

### Debounced Search
```tsx
import { useMemo, useState } from 'react';
import { debounce } from 'lodash-es';

export function useAccountSearch() {
  const [results, setResults] = useState<Account[]>([]);
  
  const search = useMemo(
    () => debounce(async (query: string) => {
      const accounts = await searchAccounts(query);
      setResults(accounts);
    }, 300),
    []
  );

  return { results, search };
}
```

### Lazy Loading
```tsx
import { lazy, Suspense } from 'react';

const TransactionHistory = lazy(() => import('./TransactionHistory'));

export function Dashboard() {
  return (
    <Suspense fallback={<Skeleton />}>
      <TransactionHistory />
    </Suspense>
  );
}
```
