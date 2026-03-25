# React Native Patterns for Solana Games

## Coding Standards

### File Organization

```
src/
├── app/                  # Expo Router screens
├── components/           # Reusable UI components
│   ├── common/          # Buttons, inputs, etc.
│   ├── game/            # Game-specific components
│   └── wallet/          # Wallet UI components
├── hooks/               # Custom React hooks
├── services/            # Business logic, API clients
├── stores/              # Zustand stores
├── types/               # TypeScript types
├── utils/               # Helper functions
└── constants/           # App constants
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `WalletButton.tsx` |
| Hooks | camelCase, use prefix | `useWallet.ts` |
| Stores | camelCase | `gameStore.ts` |
| Utils | camelCase | `formatAddress.ts` |
| Types | PascalCase | `GameState.ts` |
| Constants | SCREAMING_SNAKE | `MAX_RETRIES` |

### Component Pattern

```typescript
import React, { memo } from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';

interface Props {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const GameCard = memo(function GameCard({ title, onPress, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1a1a2e',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
```

### Hook Pattern

```typescript
import { useState, useCallback, useEffect } from 'react';

interface UseCounterOptions {
  initialValue?: number;
  max?: number;
}

export function useCounter({ initialValue = 0, max = Infinity }: UseCounterOptions = {}) {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount((prev) => Math.min(prev + 1, max));
  }, [max]);

  const decrement = useCallback(() => {
    setCount((prev) => Math.max(prev - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  return { count, increment, decrement, reset };
}
```

## State Management

### Zustand Store Pattern

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { storage } from '@/utils/storage';

interface WalletState {
  publicKey: string | null;
  connected: boolean;
  balance: number;
}

interface WalletActions {
  setPublicKey: (key: string | null) => void;
  setBalance: (balance: number) => void;
  disconnect: () => void;
}

type WalletStore = WalletState & WalletActions;

export const useWalletStore = create<WalletStore>()(
  persist(
    immer((set) => ({
      // State
      publicKey: null,
      connected: false,
      balance: 0,

      // Actions
      setPublicKey: (key) =>
        set((state) => {
          state.publicKey = key;
          state.connected = key !== null;
        }),

      setBalance: (balance) =>
        set((state) => {
          state.balance = balance;
        }),

      disconnect: () =>
        set((state) => {
          state.publicKey = null;
          state.connected = false;
          state.balance = 0;
        }),
    })),
    {
      name: 'wallet-store',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        publicKey: state.publicKey,
      }),
    }
  )
);
```

### Selector Pattern

```typescript
// Selectors for derived state
export const selectIsRich = (state: WalletStore) => state.balance > 100;
export const selectShortAddress = (state: WalletStore) =>
  state.publicKey
    ? `${state.publicKey.slice(0, 4)}...${state.publicKey.slice(-4)}`
    : null;

// Usage
function Component() {
  const isRich = useWalletStore(selectIsRich);
  const shortAddress = useWalletStore(selectShortAddress);
}
```

## Async Patterns

### Error Boundaries

```typescript
import React, { Component, type PropsWithChildren } from 'react';
import { View, Text, Button } from 'react-native';

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Something went wrong</Text>
          <Button title="Retry" onPress={this.handleRetry} />
        </View>
      );
    }

    return this.props.children;
  }
}
```

### Suspense with Loading States

```typescript
import { Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';

function LoadingFallback() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#9945FF" />
    </View>
  );
}

export function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GameScreen />
    </Suspense>
  );
}
```

### useMutation Pattern

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

export function useSendTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ to, amount }: { to: string; amount: number }) => {
      // Build and send transaction
      return signature;
    },
    onMutate: async () => {
      // Optimistic update
    },
    onSuccess: (signature) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      Alert.alert('Success', `Transaction sent: ${signature.slice(0, 8)}...`);
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });
}
```

## Performance Patterns

### Memoization

```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoize components
const ExpensiveComponent = memo(function ExpensiveComponent({ data }: Props) {
  // Render
});

// Memoize values
function useFormattedData(rawData: RawData[]) {
  return useMemo(() => {
    return rawData.map((item) => ({
      ...item,
      formatted: formatItem(item),
    }));
  }, [rawData]);
}

// Memoize callbacks
function useHandlers(onSubmit: () => void) {
  const handlePress = useCallback(() => {
    // Do something
    onSubmit();
  }, [onSubmit]);

  return { handlePress };
}
```

### List Optimization

```typescript
import { FlashList } from '@shopify/flash-list';
import { memo, useCallback } from 'react';

interface Item {
  id: string;
  name: string;
}

const ListItem = memo(({ item }: { item: Item }) => (
  <View>
    <Text>{item.name}</Text>
  </View>
));

export function OptimizedList({ items }: { items: Item[] }) {
  const renderItem = useCallback(
    ({ item }: { item: Item }) => <ListItem item={item} />,
    []
  );

  const keyExtractor = useCallback((item: Item) => item.id, []);

  return (
    <FlashList
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={60}
    />
  );
}
```

### Debouncing and Throttling

```typescript
import { useMemo, useState, useCallback } from 'react';
import { debounce, throttle } from 'lodash-es';

// Debounced search
export function useSearch(onSearch: (query: string) => Promise<void>) {
  const [query, setQuery] = useState('');

  const debouncedSearch = useMemo(
    () => debounce(onSearch, 300),
    [onSearch]
  );

  const handleChange = useCallback(
    (text: string) => {
      setQuery(text);
      debouncedSearch(text);
    },
    [debouncedSearch]
  );

  return { query, handleChange };
}

// Throttled scroll handler
export function useThrottledScroll(onScroll: () => void) {
  return useMemo(
    () => throttle(onScroll, 100),
    [onScroll]
  );
}
```

## UI Patterns

### Loading States

```typescript
interface LoadingButtonProps {
  loading: boolean;
  onPress: () => void;
  title: string;
}

export function LoadingButton({ loading, onPress, title }: LoadingButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        loading && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  );
}
```

### Skeleton Loading

```typescript
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';

export function CardSkeleton() {
  return (
    <MotiView
      transition={{ type: 'timing' }}
      style={styles.container}
    >
      <Skeleton colorMode="dark" width={100} height={100} radius={12} />
      <Skeleton colorMode="dark" width="100%" height={20} />
      <Skeleton colorMode="dark" width="60%" height={16} />
    </MotiView>
  );
}
```

### Pull to Refresh

```typescript
import { RefreshControl, FlatList } from 'react-native';
import { useState, useCallback } from 'react';

export function RefreshableList({ data, onRefresh }: Props) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#9945FF"
        />
      }
    />
  );
}
```

## Animation Patterns

### Reanimated Gestures

```typescript
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export function DraggableCard() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        {/* Card content */}
      </Animated.View>
    </GestureDetector>
  );
}
```

### Layout Animations

```typescript
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
  SlideInRight,
} from 'react-native-reanimated';

export function AnimatedListItem({ item }: Props) {
  return (
    <Animated.View
      entering={SlideInRight.delay(index * 100)}
      exiting={FadeOut}
      layout={Layout.springify()}
    >
      {/* Item content */}
    </Animated.View>
  );
}
```

## Testing Patterns

### Component Testing

```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { WalletButton } from '@/components/WalletButton';

describe('WalletButton', () => {
  it('renders connect text when disconnected', () => {
    const { getByText } = render(<WalletButton />);
    expect(getByText('Connect')).toBeTruthy();
  });

  it('calls connect on press', async () => {
    const mockConnect = jest.fn();
    const { getByText } = render(<WalletButton onConnect={mockConnect} />);

    fireEvent.press(getByText('Connect'));

    await waitFor(() => {
      expect(mockConnect).toHaveBeenCalled();
    });
  });
});
```

### Hook Testing

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useCounter } from '@/hooks/useCounter';

describe('useCounter', () => {
  it('increments correctly', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('respects max value', () => {
    const { result } = renderHook(() => useCounter({ max: 5 }));

    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.increment();
      }
    });

    expect(result.current.count).toBe(5);
  });
});
```

### Store Testing

```typescript
import { useGameStore } from '@/stores/game';

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it('adds score', () => {
    useGameStore.getState().addScore(100);
    expect(useGameStore.getState().score).toBe(100);
  });

  it('tracks high score', () => {
    useGameStore.getState().addScore(500);
    useGameStore.getState().reset();
    expect(useGameStore.getState().highScore).toBe(500);
    expect(useGameStore.getState().score).toBe(0);
  });
});
```

## TypeScript Patterns

### Strict Typing

```typescript
// Use strict null checks
interface GameState {
  player: Player | null;
  score: number;
}

// Discriminated unions
type TransactionState =
  | { status: 'idle' }
  | { status: 'pending'; signature: string }
  | { status: 'confirmed'; signature: string; slot: number }
  | { status: 'failed'; error: string };

// Type guards
function isConfirmed(state: TransactionState): state is Extract<TransactionState, { status: 'confirmed' }> {
  return state.status === 'confirmed';
}
```

### Generic Hooks

```typescript
function useAsyncState<T>(
  asyncFn: () => Promise<T>
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [asyncFn]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
```

## Common Mistakes to Avoid

1. **Not memoizing list items** - Always wrap list items in `memo()`
2. **Inline functions in JSX** - Use `useCallback` for event handlers
3. **Missing cleanup** - Always return cleanup functions from `useEffect`
4. **Blocking the JS thread** - Use `InteractionManager` for heavy operations
5. **Not handling errors** - Always catch async errors
6. **Ignoring rerenders** - Use React DevTools Profiler to identify issues
7. **Large bundle size** - Use dynamic imports for heavy components
8. **Missing accessibility** - Add `accessibilityLabel` and `accessibilityRole`
