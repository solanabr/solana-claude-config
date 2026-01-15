# Anchor Framework Skill

## Project Structure

```
my-program/
├── Anchor.toml           # Workspace config
├── programs/
│   └── my-program/
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs           # Entry point
│           ├── instructions/    # Instruction handlers
│           │   ├── mod.rs
│           │   ├── initialize.rs
│           │   └── transfer.rs
│           ├── state/           # Account structures
│           │   ├── mod.rs
│           │   └── vault.rs
│           └── error.rs         # Error codes
├── tests/
│   └── my-program.ts     # Integration tests
└── target/
    └── idl/              # Generated IDL
```

## Version Management

### AVM (Anchor Version Manager)
```bash
# Install AVM
cargo install --git https://github.com/coral-xyz/anchor avm

# Install specific version
avm install 0.32.0
avm use 0.32.0

# Check version
anchor --version
```

### Anchor.toml Configuration
```toml
[toolchain]
anchor_version = "0.32.0"
solana_version = "2.0.0"

[features]
seeds = true
skip-lint = false

[programs.localnet]
my_program = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"

[programs.devnet]
my_program = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "localnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
```

## Testing Strategy

### Testing Pyramid

1. **Unit Tests (Mollusk)** - Individual instructions, fastest
2. **Integration Tests (LiteSVM)** - Full transaction simulation
3. **Fuzz Tests (Trident)** - Edge cases, random inputs
4. **E2E Tests (anchor test)** - Full validator, TypeScript

### Mollusk (Unit Testing)
```rust
#[cfg(test)]
mod tests {
    use mollusk_svm::Mollusk;

    #[test]
    fn test_initialize() {
        let program_id = Pubkey::new_unique();
        let mollusk = Mollusk::new(&program_id, "target/deploy/program");

        let authority = Pubkey::new_unique();
        let (vault, _bump) = Pubkey::find_program_address(
            &[b"vault", authority.as_ref()],
            &program_id
        );

        let instruction = initialize(/* ... */);
        let result = mollusk.process_instruction(&instruction, &accounts);

        assert!(result.program_result.is_ok());
    }
}
```

### LiteSVM (Integration Testing)
```rust
use litesvm::LiteSVM;

#[test]
fn test_full_flow() {
    let mut svm = LiteSVM::new();
    svm.add_program(program_id, &program_bytes);

    // Execute transactions with full simulation
    let result = svm.send_transaction(tx);
    assert!(result.is_ok());
}
```

### Trident (Fuzz Testing)
```rust
// trident-tests/fuzz_tests/fuzz_0/fuzz_instructions.rs
use trident_client::fuzzing::*;

#[derive(Arbitrary, Clone)]
pub struct InitializeData {
    pub amount: u64,
}

impl FuzzTestExecutor<FuzzAccounts> for InitializeData {
    fn run_fuzz(/* ... */) -> FuzzResult {
        // Trident generates random inputs
    }
}
```

### TypeScript E2E Tests
```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MyProgram } from "../target/types/my_program";

describe("my-program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.MyProgram as Program<MyProgram>;

  it("initializes vault", async () => {
    const tx = await program.methods
      .initialize()
      .accounts({ /* ... */ })
      .rpc();

    console.log("Transaction signature:", tx);
  });
});
```

## IDL and Client Generation

### IDL Generation
```bash
# Build generates IDL automatically
anchor build

# IDL location
target/idl/my_program.json
target/types/my_program.ts
```

### IDL Structure
```json
{
  "version": "0.1.0",
  "name": "my_program",
  "instructions": [...],
  "accounts": [...],
  "types": [...],
  "events": [...],
  "errors": [...]
}
```

### Client Generation Options

| Tool | Output | Best For |
|------|--------|----------|
| Anchor TS | TypeScript | Anchor-native apps |
| Codama | Kit-native | @solana/kit apps |
| Kinobi | Multiple | Custom requirements |

### Codama Integration (Recommended for Kit)
```bash
# Generate Kit-native client from IDL
npx codama generate --idl target/idl/my_program.json --out src/generated
```

```typescript
// Usage with @solana/kit
import { getMyProgramProgram } from './generated';

const program = getMyProgramProgram(rpc);
const ix = program.initialize({ /* ... */ });
```

### Anchor TypeScript Client
```typescript
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { IDL, MyProgram } from "./idl/my_program";

const provider = AnchorProvider.env();
const program = new Program<MyProgram>(IDL, programId, provider);

// Call instructions
await program.methods.initialize().accounts({...}).rpc();

// Fetch accounts
const vault = await program.account.vault.fetch(vaultPda);

// Subscribe to events
program.addEventListener("Deposit", (event) => {
  console.log("Deposit:", event);
});
```

## Build and Deploy

### Build Commands
```bash
# Standard build
anchor build

# Verifiable build (required for mainnet)
anchor build --verifiable

# Build specific program
anchor build -p my_program
```

### Deployment Workflow

```bash
# 1. Deploy to localnet (automatic with anchor test)
anchor test

# 2. Deploy to devnet
anchor deploy --provider.cluster devnet

# 3. Verify deployment
solana program show <PROGRAM_ID> --url devnet

# 4. Deploy to mainnet (requires explicit confirmation)
anchor deploy --provider.cluster mainnet-beta
```

### Upgrade Authority Management
```bash
# Check upgrade authority
solana program show <PROGRAM_ID>

# Transfer to multisig (recommended for mainnet)
solana program set-upgrade-authority <PROGRAM_ID> \
  --new-upgrade-authority <SQUADS_VAULT>

# Make immutable (irreversible!)
solana program set-upgrade-authority <PROGRAM_ID> --final
```

## Architecture Patterns

### Single Program vs Multi-Program

**Single Program:**
- Simpler deployment
- All state in one place
- Better for small-medium apps

**Multi-Program:**
- Separation of concerns
- Independent upgrades
- Better for complex protocols
- Requires careful CPI design

### State Design Principles

1. **Account per entity** - One PDA per user/vault/pool
2. **Minimize account size** - Rent costs scale with size
3. **Use discriminators** - Anchor handles this automatically
4. **Plan for upgrades** - Leave room for new fields

See `.claude/rules/anchor.md` for PDA bump storage patterns and CU optimization.

### PDA Design

```
user_vault = [b"user_vault", user_pubkey]
pool_state = [b"pool", pool_id]
position = [b"position", pool_pubkey, user_pubkey]
```

**Rules:**
- Use unique prefixes per account type
- Include all identifying keys in seeds
- Store bump in account data

## Security Audit Process

### Pre-Audit Checklist
- [ ] All tests passing (unit + integration + fuzz)
- [ ] No compiler warnings
- [ ] `cargo clippy` clean
- [ ] Manual review of all instructions

### Automated Tools
```bash
# Clippy with all warnings
cargo clippy -- -W clippy::all

# Anchor verify
anchor verify <PROGRAM_ID>

# Soteria (if available)
soteria analyze
```

For per-instruction security checklist and common anti-patterns, see `.claude/rules/anchor.md`.

## Migration from Legacy

### web3.js 1.x to Kit
- Use Codama for client generation
- Wrap Anchor client behind compatibility layer
- Gradually migrate to Kit-native patterns

### Native to Anchor
- Start with account structures
- Add Anchor constraints incrementally
- Keep business logic, replace boilerplate

## Resources

- [Anchor Book](https://book.anchor-lang.com/)
- [Anchor GitHub](https://github.com/coral-xyz/anchor)
- [Anchor Examples](https://github.com/coral-xyz/anchor/tree/master/examples)
- [Solana Cookbook - Anchor](https://solanacookbook.com/references/anchor.html)

## When to Reference Rules

For specific code patterns (account constraints, CPI syntax, error handling), reference `.claude/rules/anchor.md` which contains comprehensive code examples.
