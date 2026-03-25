# Mobile Development for Solana Games

## Overview

This skill covers React Native/Expo development for Solana-integrated mobile games, including Mobile Wallet Adapter integration, offline-first architecture, and cross-platform patterns.

## Tech Stack (January 2026)

| Layer | Choice | Version |
|-------|--------|---------|
| **Framework** | React Native | 0.76+ |
| **Build** | Expo | SDK 52+ |
| **Router** | Expo Router | 4.x |
| **Wallet** | Mobile Wallet Adapter | 2.x |
| **State** | Zustand | 5.x |
| **Query** | TanStack Query | 5.x |
| **Storage** | MMKV | 3.x |
| **Solana SDK** | @solana/web3.js | 1.95+ |

## Project Setup

### Create New Project

```bash
# Create Expo project
npx create-expo-app my-solana-game --template expo-template-blank-typescript

# Navigate and install dependencies
cd my-solana-game

# Core Solana dependencies
npx expo install \
  @solana/web3.js \
  @solana-mobile/mobile-wallet-adapter-protocol \
  @solana-mobile/mobile-wallet-adapter-protocol-web3js \
  react-native-get-random-values \
  expo-crypto \
  @coral-xyz/anchor

# State and storage
npx expo install \
  zustand \
  @tanstack/react-query \
  react-native-mmkv

# UI and navigation
npx expo install \
  expo-router \
  expo-linking \
  react-native-gesture-handler \
  react-native-reanimated \
  expo-image
```

### Polyfills Setup

```typescript
// app/_layout.tsx - Must be first imports
import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import { Stack } from 'expo-router';
// ... rest of layout
```

## Mobile Wallet Adapter

### Authorization Flow

```typescript
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';

async function connectWallet() {
  return await transact(async (wallet) => {
    // Request authorization
    const authResult = await wallet.authorize({
      cluster: 'devnet', // or 'mainnet-beta'
      identity: {
        name: 'My Solana Game',
        uri: 'https://mygame.com',
        icon: 'favicon.ico', // relative to uri
      },
    });

    return {
      publicKey: authResult.accounts[0].address,
      authToken: authResult.auth_token,
    };
  });
}
```

### Reauthorization (Session Resume)

```typescript
async function reauthorize(authToken: string) {
  return await transact(async (wallet) => {
    try {
      const result = await wallet.reauthorize({ auth_token: authToken });
      return result;
    } catch (error) {
      // Token expired, need fresh authorization
      return await wallet.authorize({
        cluster: 'devnet',
        identity: { name: 'My Solana Game' },
      });
    }
  });
}
```

### Transaction Signing

```typescript
import { Transaction, Connection } from '@solana/web3.js';

async function signAndSendTransaction(
  transaction: Transaction,
  connection: Connection
): Promise<string> {
  return await transact(async (wallet) => {
    // Sign the transaction
    const { signedTransactions } = await wallet.signTransactions({
      transactions: [transaction],
    });

    // Send to network
    const signature = await connection.sendRawTransaction(
      signedTransactions[0].serialize()
    );

    // Confirm
    await connection.confirmTransaction(signature, 'confirmed');

    return signature;
  });
}
```

### Message Signing

```typescript
async function signMessage(message: string): Promise<Uint8Array> {
  const encodedMessage = new TextEncoder().encode(message);

  return await transact(async (wallet) => {
    const { signedPayloads } = await wallet.signMessages({
      addresses: [wallet.accounts[0].address],
      payloads: [encodedMessage],
    });

    return signedPayloads[0];
  });
}
```

## Offline-First Architecture

### Storage Layer (MMKV)

```typescript
import { MMKV } from 'react-native-mmkv';

// Create storage instances
export const storage = new MMKV({ id: 'app-storage' });
export const secureStorage = new MMKV({
  id: 'secure-storage',
  encryptionKey: 'your-key', // Generate securely
});

// Zustand storage adapter
export const zustandMMKVStorage = {
  getItem: (key: string): string | null => {
    return storage.getString(key) ?? null;
  },
  setItem: (key: string, value: string): void => {
    storage.set(key, value);
  },
  removeItem: (key: string): void => {
    storage.delete(key);
  },
};
```

### Offline Transaction Queue

```typescript
interface PendingTx {
  id: string;
  type: string;
  payload: unknown;
  createdAt: number;
  retries: number;
}

// Store pending transactions locally
function queueTransaction(tx: Omit<PendingTx, 'id' | 'createdAt' | 'retries'>) {
  const pending = JSON.parse(storage.getString('pending-tx') ?? '[]');
  pending.push({
    ...tx,
    id: generateId(),
    createdAt: Date.now(),
    retries: 0,
  });
  storage.set('pending-tx', JSON.stringify(pending));
}

// Process queue when online
async function processQueue(connection: Connection) {
  const pending = JSON.parse(storage.getString('pending-tx') ?? '[]') as PendingTx[];

  for (const tx of pending) {
    try {
      await processPendingTransaction(tx, connection);
      removePendingTransaction(tx.id);
    } catch (error) {
      incrementRetries(tx.id);
      if (tx.retries >= 3) {
        removePendingTransaction(tx.id);
      }
    }
  }
}
```

### Network State Monitoring

```typescript
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export function useNetworkState() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  return { isConnected };
}
```

## State Management

### Zustand with Persistence

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '@/utils/storage';

interface GameStore {
  score: number;
  highScore: number;
  level: number;
  addScore: (points: number) => void;
  nextLevel: () => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      score: 0,
      highScore: 0,
      level: 1,

      addScore: (points) =>
        set((state) => ({
          score: state.score + points,
          highScore: Math.max(state.highScore, state.score + points),
        })),

      nextLevel: () => set((state) => ({ level: state.level + 1 })),

      reset: () => set({ score: 0, level: 1 }),
    }),
    {
      name: 'game-store',
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);
```

### React Query for RPC Data

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const connection = new Connection(process.env.EXPO_PUBLIC_RPC_URL!);

export function useBalance(publicKey: string | null) {
  return useQuery({
    queryKey: ['balance', publicKey],
    queryFn: async () => {
      if (!publicKey) return 0;
      const balance = await connection.getBalance(new PublicKey(publicKey));
      return balance / LAMPORTS_PER_SOL;
    },
    enabled: !!publicKey,
    refetchInterval: 30_000, // Refresh every 30s
    staleTime: 10_000,
  });
}

export function useTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      to,
      amount,
    }: {
      to: string;
      amount: number;
    }) => {
      // Build and send transaction
      // Return signature
    },
    onSuccess: (signature, { to }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });
}
```

## Deep Linking

### Configure in app.json

```json
{
  "expo": {
    "scheme": "mygame",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            { "scheme": "https", "host": "mygame.com" },
            { "scheme": "mygame" },
            { "scheme": "solana" }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    "ios": {
      "associatedDomains": ["applinks:mygame.com"]
    }
  }
}
```

### Handle Deep Links

```typescript
import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export function useDeepLinking() {
  const router = useRouter();

  useEffect(() => {
    const handleURL = ({ url }: { url: string }) => {
      const parsed = Linking.parse(url);

      switch (parsed.path) {
        case 'game':
          router.push(`/game/${parsed.queryParams?.id}`);
          break;
        case 'leaderboard':
          router.push('/leaderboard');
          break;
      }
    };

    // Handle URL that opened the app
    Linking.getInitialURL().then((url) => {
      if (url) handleURL({ url });
    });

    // Listen for new URLs
    const subscription = Linking.addEventListener('url', handleURL);
    return () => subscription.remove();
  }, [router]);
}
```

## Performance Optimization

### List Rendering

```typescript
import { FlashList } from '@shopify/flash-list';
import { memo, useCallback } from 'react';

interface Item {
  id: string;
  // ... other fields
}

const ListItem = memo(({ item }: { item: Item }) => {
  // Render item
});

export function OptimizedList({ data }: { data: Item[] }) {
  const renderItem = useCallback(
    ({ item }: { item: Item }) => <ListItem item={item} />,
    []
  );

  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      estimatedItemSize={80}
      keyExtractor={(item) => item.id}
    />
  );
}
```

### Image Loading

```typescript
import { Image } from 'expo-image';

export function NFTImage({ uri }: { uri: string }) {
  return (
    <Image
      source={{ uri }}
      style={{ width: 100, height: 100 }}
      contentFit="cover"
      transition={200}
      cachePolicy="memory-disk"
      placeholder={blurhash}
    />
  );
}
```

### Preloading

```typescript
import { Image } from 'expo-image';

// Preload critical images
async function preloadImages(uris: string[]) {
  await Image.prefetch(uris);
}
```

## Testing

### Unit Tests

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useGameStore } from '@/stores/game';

describe('useGameStore', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it('adds score correctly', () => {
    const { result } = renderHook(() => useGameStore());

    act(() => {
      result.current.addScore(100);
    });

    expect(result.current.score).toBe(100);
  });

  it('updates high score', () => {
    const { result } = renderHook(() => useGameStore());

    act(() => {
      result.current.addScore(500);
    });

    expect(result.current.highScore).toBe(500);
  });
});
```

### Component Tests

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { WalletButton } from '@/components/WalletButton';

jest.mock('@/hooks/useWallet', () => ({
  useWallet: () => ({
    connected: false,
    connect: jest.fn(),
  }),
}));

describe('WalletButton', () => {
  it('renders connect text when disconnected', () => {
    const { getByText } = render(<WalletButton />);
    expect(getByText('Connect Wallet')).toBeTruthy();
  });
});
```

## Error Handling

```typescript
export function handleMobileWalletError(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Unknown error occurred';
  }

  const msg = error.message.toLowerCase();

  if (msg.includes('user rejected') || msg.includes('cancelled')) {
    return 'Wallet connection cancelled';
  }

  if (msg.includes('no wallet')) {
    return 'No compatible wallet found. Please install a Solana wallet.';
  }

  if (msg.includes('network') || msg.includes('timeout')) {
    return 'Network error. Please check your connection.';
  }

  if (msg.includes('insufficient')) {
    return 'Insufficient balance for this transaction.';
  }

  return 'Transaction failed. Please try again.';
}
```

## Build and Deploy

### Development

```bash
# Start development server
npx expo start

# Run on specific platform
npx expo run:ios
npx expo run:android
```

### Production Build

```bash
# EAS Build setup
npx eas build:configure

# Build for app stores
npx eas build --platform ios
npx eas build --platform android

# Submit to stores
npx eas submit --platform ios
npx eas submit --platform android
```

## Platform Considerations

### iOS
- Test wallet connection on real device
- Configure App Transport Security for RPC
- Set up Universal Links properly
- Review App Store guidelines for crypto apps

### Android
- Handle Seed Vault for hardware wallet support
- Test on various Android versions
- Configure intent filters correctly
- Review Play Store crypto policies

## Quick Reference

| Task | Pattern |
|------|---------|
| Wallet Connection | `transact()` with `authorize()` |
| Signing | `wallet.signTransactions()` |
| Persistence | Zustand + MMKV |
| RPC Data | React Query |
| Offline Queue | MMKV + NetInfo |
| Deep Links | Expo Router + Linking |
| Lists | FlashList or optimized FlatList |
| Images | expo-image with caching |
