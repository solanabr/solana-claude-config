---
name: web3-patterns
description: Modern Solana frontend patterns with Web3.js 2.0, wallet adapters, and React integration. Use when building Solana dApp frontends, wallet integrations, or client-side transaction handling.
---

# Web3 Frontend Patterns for Solana (2026)

Modern patterns using Web3.js 2.0, wallet adapters, React 19, and Next.js 15 for building production Solana dApps.

## Technology Stack

- **@solana/kit**: Modern Web3.js 2.0 (tree-shakable, zero deps)
- **@solana/wallet-adapter-react**: Wallet integration
- **@coral-xyz/anchor**: Anchor client SDK
- **React 19 + Next.js 15**: UI framework
- **TanStack Query**: Async state management
- **Zustand**: Global state

## Web3.js 2.0 Modern Patterns

### Tree-Shakable Imports
```typescript
// ❌ BAD - Old way (large bundle)
import * as web3 from '@solana/web3.js';

// ✅ GOOD - Tree-shakable (smaller bundle, zero deps)
import {
  createSolanaRpc,
  address,
  createTransactionMessage,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstructions,
  signTransactionMessageWithSigners,
  getSignatureFromTransaction,
  sendAndConfirmTransactionFactory,
} from '@solana/kit';
```

### Type-Safe RPC Client
```typescript
import { createSolanaRpc, address, type Address } from '@solana/kit';

// Create RPC client
const rpc = createSolanaRpc('https://api.mainnet-beta.solana.com');

// Type-safe address handling
const pubkey: Address = address('11111111111111111111111111111111');

// Fetch account
const accountInfo = await rpc.getAccountInfo(pubkey, {
  encoding: 'base64',
}).send();
```

### BigInt for u64/u128
```typescript
// ✅ GOOD - BigInt support in Web3.js 2.0
const amount: bigint = 1_000_000_000n; // 1 SOL in lamports

// Safe arithmetic
const total = amount + 500_000_000n;
const doubled = amount * 2n;

// Convert to/from number safely
function lamportsToSol(lamports: bigint): number {
  return Number(lamports) / 1_000_000_000;
}
```

## Wallet Adapter Patterns

### Wallet Provider Setup
```typescript
'use client';

import { useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  BackpackWalletAdapter,
} from '@solana/wallet-adapter-wallets';

// Import styles
import '@solana/wallet-adapter-react-ui/styles.css';

export function WalletContextProvider({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(() => process.env.NEXT_PUBLIC_RPC_URL!, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

### Wallet Connection Button
```typescript
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function Header() {
  return (
    <header className="flex justify-between items-center p-4">
      <h1>My Solana dApp</h1>
      <WalletMultiButton />
    </header>
  );
}
```

### Using Wallet in Components
```typescript
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

export function TransferComponent() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  if (!publicKey) {
    return <div>Please connect wallet</div>;
  }

  async function handleTransfer() {
    // Build transaction...
    const signature = await sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, 'confirmed');
  }

  return (
    <button onClick={handleTransfer}>
      Transfer SOL
    </button>
  );
}
```

## Anchor Program Integration

### Program Provider Hook
```typescript
import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { IDL, YourProgram } from '@/idl/your_program';

export function useProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const program = useMemo(() => {
    if (!wallet) return null;

    const provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed' }
    );

    return new Program<YourProgram>(
      IDL,
      provider
    );
  }, [connection, wallet]);

  return program;
}
```

### Calling Program Instructions
```typescript
import { useProgram } from '@/hooks/useProgram';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

export function VaultManager() {
  const program = useProgram();
  const { publicKey } = useWallet();

  async function initializeVault() {
    if (!program || !publicKey) return;

    try {
      // Derive PDA
      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), publicKey.toBuffer()],
        program.programId
      );

      // Call instruction
      const tx = await program.methods
        .initialize()
        .accounts({
          vault: vaultPda,
          authority: publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      console.log('Transaction signature:', tx);
    } catch (error) {
      console.error('Error initializing vault:', error);
    }
  }

  return (
    <button onClick={initializeVault}>
      Initialize Vault
    </button>
  );
}
```

## Transaction Building Patterns

### Modern Transaction Construction (Web3.js 2.0)
```typescript
import {
  createSolanaRpc,
  createTransactionMessage,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstructions,
  signTransactionMessageWithSigners,
  sendAndConfirmTransactionFactory,
  type TransactionSigner,
} from '@solana/kit';

async function buildAndSendTransaction(
  rpc: ReturnType<typeof createSolanaRpc>,
  feePayer: TransactionSigner,
  instructions: TransactionInstruction[]
) {
  // 1. Get recent blockhash
  const { value: latestBlockhash } = await rpc
    .getLatestBlockhash()
    .send();

  // 2. Create transaction message
  let transactionMessage = createTransactionMessage({ version: 0 });

  // 3. Set fee payer
  transactionMessage = setTransactionMessageFeePayer(
    feePayer.address,
    transactionMessage
  );

  // 4. Set lifetime
  transactionMessage = setTransactionMessageLifetimeUsingBlockhash(
    latestBlockhash,
    transactionMessage
  );

  // 5. Add instructions
  transactionMessage = appendTransactionMessageInstructions(
    instructions,
    transactionMessage
  );

  // 6. Sign
  const signedTransaction = await signTransactionMessageWithSigners(
    transactionMessage
  );

  // 7. Send and confirm
  const sendAndConfirm = sendAndConfirmTransactionFactory({ rpc });
  const signature = await sendAndConfirm(signedTransaction, {
    commitment: 'confirmed',
  });

  return signature;
}
```

### Legacy Transaction Pattern (Still Common)
```typescript
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

async function sendSOL(
  connection: Connection,
  wallet: WalletContextState,
  recipient: PublicKey,
  amount: number
) {
  if (!wallet.publicKey) throw new Error('Wallet not connected');

  // 1. Create transaction
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: recipient,
      lamports: amount * 1_000_000_000, // Convert SOL to lamports
    })
  );

  // 2. Get recent blockhash
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash('confirmed');
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;

  // 3. Simulate first!
  const simulation = await connection.simulateTransaction(transaction);
  if (simulation.value.err) {
    throw new Error(`Simulation failed: ${JSON.stringify(simulation.value.err)}`);
  }

  // 4. Send transaction
  const signature = await wallet.sendTransaction(transaction, connection);

  // 5. Confirm
  await connection.confirmTransaction({
    signature,
    blockhash,
    lastValidBlockHeight,
  }, 'confirmed');

  return signature;
}
```

### Priority Fees and Compute Budget
```typescript
import {
  ComputeBudgetProgram,
  Transaction,
} from '@solana/web3.js';

async function buildOptimizedTransaction(
  connection: Connection,
  wallet: WalletContextState,
  instructions: TransactionInstruction[]
) {
  const transaction = new Transaction();

  // 1. Simulate to estimate CU usage
  const testTx = new Transaction().add(...instructions);
  testTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  testTx.feePayer = wallet.publicKey!;

  const simulation = await connection.simulateTransaction(testTx);
  const computeUnits = simulation.value.unitsConsumed || 200_000;

  // 2. Set compute unit limit (1.2x buffer)
  transaction.add(
    ComputeBudgetProgram.setComputeUnitLimit({
      units: Math.ceil(computeUnits * 1.2),
    })
  );

  // 3. Set priority fee (optional, for congestion)
  transaction.add(
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 1000, // Adjust based on network conditions
    })
  );

  // 4. Add actual instructions
  transaction.add(...instructions);

  return transaction;
}
```

## Data Fetching Patterns

### React Query Integration
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProgram } from '@/hooks/useProgram';
import { useWallet } from '@solana/wallet-adapter-react';

export function VaultDisplay() {
  const program = useProgram();
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();

  // Fetch vault data
  const { data: vault, isLoading, error } = useQuery({
    queryKey: ['vault', publicKey?.toString()],
    queryFn: async () => {
      if (!program || !publicKey) return null;

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), publicKey.toBuffer()],
        program.programId
      );

      try {
        return await program.account.vault.fetch(vaultPda);
      } catch (e) {
        if (e.message.includes('Account does not exist')) {
          return null;
        }
        throw e;
      }
    },
    enabled: !!program && !!publicKey,
    refetchInterval: 30_000, // Refetch every 30 seconds
    staleTime: 10_000, // Consider data fresh for 10 seconds
  });

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (amount: number) => {
      if (!program || !publicKey) throw new Error('Not connected');

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), publicKey.toBuffer()],
        program.programId
      );

      return await program.methods
        .deposit(new BN(amount))
        .accounts({
          vault: vaultPda,
          authority: publicKey,
        })
        .rpc();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['vault', publicKey?.toString()] });
    },
  });

  if (isLoading) return <div>Loading vault...</div>;
  if (error) return <div>Error loading vault: {error.message}</div>;
  if (!vault) return <div>No vault found</div>;

  return (
    <div>
      <p>Balance: {vault.balance.toString()}</p>
      <button
        onClick={() => depositMutation.mutate(1_000_000_000)}
        disabled={depositMutation.isPending}
      >
        {depositMutation.isPending ? 'Depositing...' : 'Deposit 1 SOL'}
      </button>
    </div>
  );
}
```

### Zustand State Management
```typescript
import { create } from 'zustand';
import { PublicKey } from '@solana/web3.js';

interface VaultStore {
  vaults: Map<string, Vault>;
  addVault: (pubkey: PublicKey, vault: Vault) => void;
  removeVault: (pubkey: PublicKey) => void;
  getVault: (pubkey: PublicKey) => Vault | undefined;
}

export const useVaultStore = create<VaultStore>((set, get) => ({
  vaults: new Map(),

  addVault: (pubkey, vault) =>
    set((state) => {
      const newVaults = new Map(state.vaults);
      newVaults.set(pubkey.toString(), vault);
      return { vaults: newVaults };
    }),

  removeVault: (pubkey) =>
    set((state) => {
      const newVaults = new Map(state.vaults);
      newVaults.delete(pubkey.toString());
      return { vaults: newVaults };
    }),

  getVault: (pubkey) => get().vaults.get(pubkey.toString()),
}));
```

## Error Handling Patterns

### User-Friendly Error Messages
```typescript
export class WalletError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WalletError';
  }
}

export function parseTransactionError(error: unknown): string {
  if (error instanceof WalletError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Parse common Solana errors
    const message = error.message.toLowerCase();

    if (message.includes('0x1') || message.includes('insufficient funds')) {
      return 'Insufficient SOL for transaction fee. Please add more SOL to your wallet.';
    }

    if (message.includes('0x0') || message.includes('custom program error: 0x0')) {
      return 'Transaction failed. Please try again.';
    }

    if (message.includes('blockhash not found')) {
      return 'Transaction expired. Please try again.';
    }

    if (message.includes('user rejected')) {
      return 'Transaction cancelled.';
    }

    if (message.includes('account does not exist')) {
      return 'Account not found. Please initialize first.';
    }

    // Custom program errors (if using Anchor)
    const anchorErrorMatch = message.match(/custom program error: 0x([0-9a-f]+)/i);
    if (anchorErrorMatch) {
      const errorCode = parseInt(anchorErrorMatch[1], 16);
      return getAnchorErrorMessage(errorCode);
    }
  }

  return 'An unexpected error occurred. Please try again.';
}
```

### Toast Notifications with Error Handling
```typescript
import { toast } from 'sonner'; // or react-hot-toast

export async function executeTransaction<T>(
  fn: () => Promise<T>,
  options?: {
    successMessage?: string;
    errorMessage?: string;
  }
): Promise<T | null> {
  const toastId = toast.loading('Processing transaction...');

  try {
    const result = await fn();

    toast.success(options?.successMessage || 'Transaction successful!', {
      id: toastId,
    });

    return result;
  } catch (error) {
    const message = parseTransactionError(error);

    toast.error(options?.errorMessage || message, {
      id: toastId,
    });

    console.error('Transaction error:', error);
    return null;
  }
}

// Usage
const signature = await executeTransaction(
  () => program.methods.deposit(new BN(amount)).rpc(),
  {
    successMessage: 'Deposit successful!',
    errorMessage: 'Failed to deposit funds',
  }
);
```

## Performance Patterns

### Memoization
```typescript
import { useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';

export function AccountDisplay({ address }: { address: string }) {
  // Memoize expensive PublicKey creation
  const pubkey = useMemo(() => {
    try {
      return new PublicKey(address);
    } catch {
      return null;
    }
  }, [address]);

  if (!pubkey) return <div>Invalid address</div>;

  return <div>{pubkey.toString()}</div>;
}
```

### Lazy Loading
```typescript
import { lazy, Suspense } from 'react';

const WalletManager = lazy(() => import('./components/WalletManager'));
const TransactionHistory = lazy(() => import('./components/TransactionHistory'));

export function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WalletManager />
      <TransactionHistory />
    </Suspense>
  );
}
```

### Debouncing Search/Input
```typescript
import { useMemo } from 'react';
import { debounce } from 'lodash';

export function AccountSearch() {
  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        const results = await searchAccounts(query);
        setResults(results);
      }, 300),
    []
  );

  return (
    <input
      type="text"
      onChange={(e) => debouncedSearch(e.target.value)}
      placeholder="Search accounts..."
    />
  );
}
```

## Best Practices

1. **Always simulate transactions before sending**
2. **Set compute unit limits based on simulation**
3. **Use BigInt for u64/u128 values**
4. **Implement proper error handling with user-friendly messages**
5. **Cache RPC responses with React Query**
6. **Memoize expensive computations**
7. **Show transaction status (pending, success, error)**
8. **Provide explorer links for transactions**
9. **Handle wallet disconnection gracefully**
10. **Use tree-shakable imports for smaller bundles**

---

**Sources:**
- [Web3.js 2.0 Guide](https://www.helius.dev/blog/how-to-start-building-with-the-solana-web3-js-2-0-sdk)
- [Web3.js 2.0 Best Practices](https://blog.quicknode.com/solana-web3-js-2-0-a-new-chapter-in-solana-development/)
- [Solana TypeScript SDK](https://solana.com/docs/clients/official/javascript)
