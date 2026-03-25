---
name: test-react-native
description: Run tests for React Native/Expo projects
---

# Test React Native

Run unit tests, integration tests, and E2E tests for React Native projects.

## Usage

```
/test-react-native [type] [options]
```

### Test Types
- `unit` - Unit tests with Jest (default)
- `integration` - Integration tests
- `e2e` - End-to-end tests with Detox

### Options
- `--watch` - Watch mode for development
- `--coverage` - Generate coverage report
- `--update` - Update snapshots
- `--ci` - CI mode (no interactivity)

## Workflow

### 1. Unit Tests (Jest)

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# Run specific test file
npm test -- WalletButton.test.tsx

# Update snapshots
npm test -- -u
```

### 2. Component Tests

```bash
# Run component tests only
npm test -- --testPathPattern="components"

# Verbose output
npm test -- --verbose
```

### 3. Integration Tests

```bash
# Run integration tests
npm run test:integration

# With specific RPC endpoint
EXPO_PUBLIC_RPC_URL=https://api.devnet.solana.com npm run test:integration
```

### 4. E2E Tests (Detox)

```bash
# Build for E2E testing
npx detox build --configuration ios.sim.debug

# Run E2E tests
npx detox test --configuration ios.sim.debug

# Run specific test
npx detox test --configuration ios.sim.debug e2e/wallet.test.ts
```

## Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

## Test Patterns

### Component Test Example

```typescript
// __tests__/WalletButton.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { WalletButton } from '@/components/WalletButton';

// Mock wallet hook
jest.mock('@/hooks/useWallet', () => ({
  useWallet: () => ({
    connected: false,
    connecting: false,
    connect: jest.fn(),
    disconnect: jest.fn(),
  }),
}));

describe('WalletButton', () => {
  it('shows connect text when disconnected', () => {
    const { getByText } = render(<WalletButton />);
    expect(getByText('Connect Wallet')).toBeTruthy();
  });

  it('calls connect on press', async () => {
    const mockConnect = jest.fn();
    jest.spyOn(require('@/hooks/useWallet'), 'useWallet').mockReturnValue({
      connected: false,
      connecting: false,
      connect: mockConnect,
    });

    const { getByText } = render(<WalletButton />);
    fireEvent.press(getByText('Connect Wallet'));

    await waitFor(() => {
      expect(mockConnect).toHaveBeenCalled();
    });
  });
});
```

### Hook Test Example

```typescript
// __tests__/useGameStore.test.ts
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

  it('increments level', () => {
    const { result } = renderHook(() => useGameStore());

    act(() => {
      result.current.nextLevel();
    });

    expect(result.current.level).toBe(2);
  });
});
```

### E2E Test Example

```typescript
// e2e/wallet.test.ts
describe('Wallet Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show connect button on launch', async () => {
    await expect(element(by.text('Connect Wallet'))).toBeVisible();
  });

  it('should show wallet modal on connect press', async () => {
    await element(by.text('Connect Wallet')).tap();
    await expect(element(by.id('wallet-modal'))).toBeVisible();
  });
});
```

## Mock Patterns

### Mock Mobile Wallet Adapter

```typescript
// __mocks__/@solana-mobile/mobile-wallet-adapter-protocol-web3js.ts
export const transact = jest.fn(async (callback) => {
  const mockWallet = {
    authorize: jest.fn().mockResolvedValue({
      accounts: [{ address: 'MockAddress123' }],
      auth_token: 'mock-token',
    }),
    signTransactions: jest.fn().mockResolvedValue({
      signedTransactions: [{ serialize: () => new Uint8Array() }],
    }),
  };
  return callback(mockWallet);
});
```

### Mock Storage

```typescript
// __mocks__/react-native-mmkv.ts
export class MMKV {
  private store: Map<string, string> = new Map();

  getString(key: string) {
    return this.store.get(key);
  }

  set(key: string, value: string) {
    this.store.set(key, value);
  }

  delete(key: string) {
    this.store.delete(key);
  }
}
```

## CI Configuration

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test -- --ci --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Two-Strike Rule

If a test fails twice on the same issue:
1. **STOP** immediately
2. Present error output and test code
3. Ask for user guidance

## Test Coverage Targets

| Type | Target |
|------|--------|
| Statements | 80% |
| Branches | 70% |
| Functions | 80% |
| Lines | 80% |

## Common Issues

### Test Timeouts

```javascript
// Increase timeout for slow tests
jest.setTimeout(30000);

// Or per-test
it('slow test', async () => {
  // ...
}, 30000);
```

### Async Act Warnings

```typescript
// Wrap state updates in act()
await act(async () => {
  await result.current.connect();
});
```

### Mock Not Working

```typescript
// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```
