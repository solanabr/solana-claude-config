# Pinocchio Framework Skill

## Architecture Principles

### Zero-Copy Philosophy
- No deserialization/serialization overhead
- Direct pointer access to account data
- Manual validation with explicit safety checks

### Memory Constraints
- **4KB stack** per function call
- **32KB heap** total
- Use references, not copies
- Consider `no_allocator!()` for zero-heap

### Validation Strategy
- **TryFrom pattern** - Separate validation from logic
- **Fail early** - All checks before any mutations
- **Explicit checks** - No implicit Anchor validation

## Project Structure

```
my-pinocchio-program/
├── Cargo.toml
├── src/
│   ├── lib.rs               # Entrypoint, instruction dispatch
│   ├── instructions/
│   │   ├── mod.rs
│   │   ├── deposit.rs       # Deposit instruction + validation
│   │   └── withdraw.rs      # Withdraw instruction + validation
│   ├── state/
│   │   ├── mod.rs
│   │   └── vault.rs         # Account struct definitions
│   ├── error.rs             # Custom error codes
│   └── helpers/
│       ├── mod.rs
│       ├── token.rs         # Token validation helpers
│       └── pda.rs           # PDA validation helpers
├── tests/
│   └── integration.rs       # Mollusk/LiteSVM tests
└── idl/                     # Shank-generated IDL (if needed)
```

## Cargo.toml Configuration

```toml
[package]
name = "my-pinocchio-program"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]

[dependencies]
pinocchio = "0.10"
pinocchio-system = "0.4"
pinocchio-token = "0.4"
thiserror = "2.0"
num-derive = "0.4"

[dev-dependencies]
mollusk-svm = "0.10"
solana-sdk = "2.0"

[features]
default = []
perf = []  # Disable logging for production

[profile.release]
overflow-checks = true
lto = "fat"
codegen-units = 1
opt-level = 3
```

## Testing Strategy

### Testing Pyramid

1. **Unit Tests (Mollusk)** - Individual instructions, fastest, CU measurement
2. **Integration Tests (LiteSVM)** - Full transaction flows
3. **Fuzz Tests (Trident)** - Edge cases with random inputs

### Mollusk Setup
```bash
# Add to Cargo.toml dev-dependencies
mollusk-svm = "0.10"
solana-sdk = "2.0"

# Run tests
cargo test-sbf
```

### CU Benchmarking

Target: < 10,000 CU per instruction (vs ~50,000 CU typical Anchor).
Use `result.compute_units_consumed` in Mollusk tests to verify.

### Integration Testing with LiteSVM

Use LiteSVM for full transaction flow testing. See `.claude/rules/pinocchio.md` for complete test examples.

## IDL and Client Generation

### Shank for IDL Generation

Pinocchio doesn't auto-generate IDL. Use Shank:

```bash
# Install Shank
cargo install shank-cli

# Add to lib.rs
#[cfg(feature = "idl")]
use shank::ShankInstruction;

#[cfg(feature = "idl")]
#[derive(ShankInstruction)]
pub enum MyInstruction {
    #[account(0, writable, signer, name = "authority", desc = "The authority")]
    #[account(1, writable, name = "vault", desc = "The vault PDA")]
    Initialize { bump: u8 },

    #[account(0, writable, signer, name = "authority")]
    #[account(1, writable, name = "vault")]
    Deposit { amount: u64 },
}

# Generate IDL
shank idl --out-dir idl programs/my-program/src/lib.rs
```

### Codama for Client Generation
```bash
# Generate Kit-native clients from Shank IDL
npx @codama/cli generate --idl idl/my_program.json --out src/generated
```

### Manual Client (TypeScript)
```typescript
// Without IDL, build instructions manually
import { createTransactionMessage, appendTransactionMessageInstruction } from '@solana/kit';

function createDepositInstruction(
  authority: Address,
  vault: Address,
  amount: bigint
): IInstruction {
  const data = new Uint8Array(9);
  data[0] = 0; // Deposit discriminator
  new DataView(data.buffer).setBigUint64(1, amount, true);

  return {
    programAddress: PROGRAM_ID,
    accounts: [
      { address: authority, role: AccountRole.WRITABLE_SIGNER },
      { address: vault, role: AccountRole.WRITABLE },
    ],
    data,
  };
}
```

## Migration from Anchor

### Step 1: Identify Hotspots
```bash
# Profile CU usage in Anchor program
solana program show <PROGRAM_ID> --url devnet

# Add logging to identify expensive operations
msg!("CU before operation");
sol_log_compute_units!();
```

### Step 2: Extract Hot Paths
- Keep Anchor for complex instructions
- Migrate only CU-intensive instructions to Pinocchio
- Maintain shared state structures

### Step 3: Hybrid Approach
```
┌─────────────────────────────────────────────┐
│              Anchor Program                 │
│  ┌────────────────────────────────────────┐ │
│  │  Complex admin operations (Anchor)    │ │
│  └────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────┐ │
│  │  Hot path: swap() (Pinocchio)         │ │
│  └────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────┐ │
│  │  Hot path: settle() (Pinocchio)       │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Step 4: Verify CU Savings
```rust
// Before (Anchor): ~50,000 CU
// After (Pinocchio): ~8,000 CU
// Savings: 84%
```

## Security Audit Process

### Pre-Audit Requirements

Pinocchio requires MORE rigorous auditing than Anchor:

1. **All unsafe blocks documented** with safety invariants
2. **Manual review of all validation** (no Anchor safety net)
3. **CU benchmarks** to verify optimization claims
4. **Fuzz testing coverage** for all instructions

For per-instruction security checklist, common vulnerabilities, and dangerous patterns, see `.claude/rules/pinocchio.md`.

## Build and Deploy

### Build Commands
```bash
# Debug build
cargo build-sbf

# Release build (optimized)
cargo build-sbf --release

# With perf feature (no logging)
cargo build-sbf --release --features perf
```

### Deployment
```bash
# Deploy to devnet
solana program deploy target/deploy/my_program.so --url devnet

# Deploy to mainnet (requires explicit confirmation)
solana program deploy target/deploy/my_program.so --url mainnet-beta

# Verify deployment
solana program show <PROGRAM_ID>
```

### Verifiable Builds
```bash
# For mainnet, ensure reproducible builds
docker run --rm -v $(pwd):/workdir \
  solanalabs/solana:v2.0.0 \
  cargo build-sbf --release
```

## Best Practices Summary

1. **Start with Anchor** - Optimize with Pinocchio only when needed
2. **Measure before/after** - Always benchmark CU savings
3. **Document unsafe code** - Every unsafe block needs safety comments
4. **Use TryFrom pattern** - Maintains ergonomics with validation
5. **Test thoroughly** - More manual code = more potential bugs
6. **Fuzz test critical paths** - Trident catches edge cases
7. **Audit more carefully** - No Anchor safety net

For code patterns (discriminators, PDA validation, CU optimization), see `.claude/rules/pinocchio.md`.

## Resources

- [Pinocchio GitHub](https://github.com/anza-xyz/pinocchio)
- [Pinocchio Guide (Helius)](https://www.helius.dev/blog/pinocchio)
- [Pinocchio Tutorial (QuickNode)](https://www.quicknode.com/guides/solana-development/pinocchio/how-to-build-and-deploy-a-solana-program-using-pinocchio)
- [Shank IDL Generator](https://github.com/metaplex-foundation/shank)
- [Mollusk Testing](https://github.com/buffalojoec/mollusk)

## When to Reference Rules

For specific code patterns (TryFrom validation, zero-copy access, CPI construction), reference `.claude/rules/pinocchio.md` which contains comprehensive code examples.
