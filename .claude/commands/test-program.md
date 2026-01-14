---
description: "Run Solana program tests with Anchor, Mollusk, LiteSVM, and Trident"
---

You are running Solana program tests. This command covers the modern Solana testing stack.

## Overview

Solana programs should be tested at multiple levels:
- **Unit tests**: Fast, isolated instruction tests (Mollusk)
- **Integration tests**: Multi-instruction flows (LiteSVM, Anchor/Bankrun)
- **Fuzz tests**: Property-based testing (Trident)

## Step 1: Identify Testing Framework

```bash
echo "🔍 Detecting test configuration..."

# Check for Anchor
if [ -f "Anchor.toml" ]; then
    echo "📦 Anchor project - using Anchor tests + Bankrun"
fi

# Check for Mollusk
if grep -q "mollusk" Cargo.toml 2>/dev/null; then
    echo "🐚 Mollusk configured for unit tests"
fi

# Check for LiteSVM
if grep -q "litesvm" Cargo.toml 2>/dev/null; then
    echo "⚡ LiteSVM configured for integration tests"
fi

# Check for Trident
if [ -d "trident-tests" ]; then
    echo "🔱 Trident configured for fuzz testing"
fi
```

## Step 2: Run Mollusk Unit Tests

Mollusk provides fast, isolated unit tests for individual instructions:

```bash
echo "🐚 Running Mollusk unit tests..."

# Run Mollusk tests (typically in lib tests)
cargo test --lib

# Run with output to see CU consumption
cargo test --lib -- --nocapture
```

### Mollusk Test Example

```rust
#[cfg(test)]
mod tests {
    use mollusk_svm::Mollusk;
    use solana_sdk::{account::Account, pubkey::Pubkey};

    #[test]
    fn test_initialize() {
        let program_id = Pubkey::new_unique();
        let mollusk = Mollusk::new(&program_id, "target/deploy/my_program.so");

        // Setup accounts
        let user = Pubkey::new_unique();
        let accounts = vec![
            (user, Account::new(1_000_000_000, 0, &program_id)),
        ];

        // Create instruction
        let instruction = solana_sdk::instruction::Instruction {
            program_id,
            accounts: vec![],
            data: vec![0], // Initialize instruction
        };

        // Process and verify
        let result = mollusk.process_instruction(&instruction, &accounts);
        assert!(result.program_result.is_ok());

        // Check compute units used
        println!("CU consumed: {}", result.compute_units_consumed);
    }
}
```

## Step 3: Run LiteSVM Integration Tests

LiteSVM enables fast integration tests with multiple instructions:

```bash
echo "⚡ Running LiteSVM integration tests..."

# Run integration tests
cargo test --test '*'

# Run specific integration test file
cargo test --test integration
```

### LiteSVM Test Example

```rust
#[cfg(test)]
mod tests {
    use litesvm::LiteSVM;
    use solana_sdk::{signature::Keypair, signer::Signer, transaction::Transaction};

    #[test]
    fn test_full_flow() {
        let mut svm = LiteSVM::new();

        // Add program
        let program_id = Pubkey::new_unique();
        svm.add_program(program_id, include_bytes!("../target/deploy/my_program.so"));

        // Create and fund user
        let user = Keypair::new();
        svm.airdrop(&user.pubkey(), 10_000_000_000).unwrap();

        // Build transaction with multiple instructions
        let tx = Transaction::new_signed_with_payer(
            &[
                /* instructions */
            ],
            Some(&user.pubkey()),
            &[&user],
            svm.latest_blockhash(),
        );

        // Execute and verify
        let result = svm.send_transaction(tx);
        assert!(result.is_ok());
    }
}
```

## Step 4: Run Anchor/Bankrun Tests

For Anchor projects, use TypeScript tests with Bankrun:

```bash
echo "⚓ Running Anchor tests..."

# Build first
anchor build

# Run all Anchor tests (uses Bankrun by default in modern Anchor)
anchor test

# Run without rebuilding
anchor test --skip-build

# Run specific test file
anchor test tests/my_test.ts

# Run with logs
RUST_LOG=debug anchor test
```

### Anchor Test Example

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MyProgram } from "../target/types/my_program";

describe("my_program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.MyProgram as Program<MyProgram>;

  it("initializes correctly", async () => {
    const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault")],
      program.programId
    );

    await program.methods
      .initialize()
      .accounts({
        vault: vaultPda,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const vault = await program.account.vault.fetch(vaultPda);
    expect(vault.authority.toString()).eq(provider.wallet.publicKey.toString());
  });
});
```

## Step 5: Run Trident Fuzz Tests

Trident finds edge cases through property-based fuzzing:

```bash
echo "🔱 Running Trident fuzz tests..."

# Initialize Trident (first time only)
if [ ! -d "trident-tests" ]; then
    trident init
fi

cd trident-tests

# Run fuzz tests (Trident v0.7+)
trident fuzz run

# Run for specific duration (seconds)
trident fuzz run --timeout 300

# Run with specific number of iterations
trident fuzz run --iterations 10000

cd ..

# Check for crashes
if [ -d "trident-tests/hfuzz_workspace" ]; then
    echo "📋 Checking for crash reports..."
    find trident-tests/hfuzz_workspace -name "crashes" -type d -exec ls -la {} \; 2>/dev/null
fi
```

### Trident Test Configuration

```rust
// trident-tests/fuzz_tests/fuzz_0/test_fuzz.rs
use my_program::entry as entry_my_program;
use trident_client::prelude::*;

#[derive(Arbitrary, Debug)]
pub struct InitializeData {
    pub amount: u64,
}

impl FuzzInstruction for InitializeData {
    fn get_program_id(&self) -> Pubkey {
        my_program::ID
    }

    fn get_data(&self) -> Result<Vec<u8>, FuzzingError> {
        let data = my_program::instruction::Initialize {
            amount: self.amount,
        };
        Ok(data.data())
    }
}
```

## Step 6: Run All Tests

```bash
echo "🧪 Running complete test suite..."

# Unit tests (Mollusk)
echo "📍 Unit tests..."
cargo test --lib

# Integration tests (LiteSVM)
echo "📍 Integration tests..."
cargo test --test '*'

# Anchor tests (if applicable)
if [ -f "Anchor.toml" ]; then
    echo "📍 Anchor tests..."
    anchor test --skip-build
fi

# Fuzz tests (if configured)
if [ -d "trident-tests" ]; then
    echo "📍 Fuzz tests (quick run)..."
    cd trident-tests
    trident fuzz run --timeout 60
    cd ..
fi

echo "✅ All tests complete!"
```

## Test Framework Comparison

| Framework | Speed | Use Case | Scope |
|-----------|-------|----------|-------|
| **Mollusk** | ⚡ Fastest | Single instruction validation | Unit |
| **LiteSVM** | ⚡ Fast | Multi-instruction flows | Integration |
| **Bankrun** | 🚀 Fast | Anchor TypeScript tests | Integration |
| **Trident** | 🐢 Slower | Edge case discovery | Fuzz |
| **test-validator** | 🐢 Slowest | Full network simulation | E2E |

## Common Test Patterns

### Testing Error Conditions

```rust
#[test]
fn test_insufficient_funds() {
    let mollusk = Mollusk::new(&program_id, "target/deploy/program.so");

    let result = mollusk.process_instruction(&withdraw_too_much, &accounts);

    // Verify specific error
    assert!(result.program_result.is_err());
    // Check error code if using custom errors
}
```

### Testing PDA Derivation

```rust
#[test]
fn test_pda_derivation() {
    let (pda, bump) = Pubkey::find_program_address(
        &[b"vault", user.as_ref()],
        &program_id
    );

    // Verify PDA is used correctly in instruction
    let result = mollusk.process_instruction(&init_vault, &accounts);
    assert!(result.program_result.is_ok());
}
```

### Testing CU Consumption

```rust
#[test]
fn test_cu_budget() {
    let result = mollusk.process_instruction(&complex_instruction, &accounts);

    // Ensure we stay within budget
    assert!(result.compute_units_consumed < 200_000);
    println!("CU used: {}", result.compute_units_consumed);
}
```

## Debugging Failed Tests

```bash
# Run specific failing test with full output
cargo test test_name -- --nocapture --exact

# Run with backtrace
RUST_BACKTRACE=1 cargo test test_name

# For Anchor tests with logs
RUST_LOG=debug anchor test -- --grep "test name"

# Check Trident crash inputs
cat trident-tests/hfuzz_workspace/*/crashes/*
```

## Test Checklist

Before deployment:

- [ ] All Mollusk unit tests pass
- [ ] All LiteSVM integration tests pass
- [ ] All Anchor tests pass (if applicable)
- [ ] Fuzz testing run for 10+ minutes with no crashes
- [ ] Error conditions tested
- [ ] Edge cases covered (max values, zero values)
- [ ] PDA derivations verified
- [ ] CU consumption within limits

---

**Remember**: Test at all levels. Mollusk for speed, LiteSVM for integration, Trident for edge cases.
