# Solana Development - Claude Code Configuration

Complete Claude Code configuration specialized for Solana blockchain development. Covers on-chain programs, frontend dApps, data indexing, testing, security, and ecosystem integration with modern 2026 best practices.

A

## Quick Start

### Installation

```bash
# Copy to your Solana project
cp -r out/solana/.claude /path/to/your-solana-project/
cp out/solana/CLAUDE.md /path/to/your-solana-project/
```

### Using Agents

```
"Use the solana-architect agent to design the vault program architecture"
"Use the anchor-specialist to implement the deposit instruction"
"Use the rust-backend-engineer to create an API for this program"
```

### Using Commands

```
/build-program          # Build Anchor/native program
/test-program           # Run comprehensive tests
/test-rust              # Rust-specific testing (unit, integration, fuzz)
/test-and-fix           # Automated test → fix → retest loop
/audit-solana           # Comprehensive security audit
/setup-ci-cd            # Setup CI/CD pipeline with automated security
/quick-commit           # Format, lint, and commit with conventional message
/deploy-devnet          # Deploy to devnet
/deploy-mainnet         # Deploy to mainnet (with confirmation)
```

## Technology Focus

### On-Chain Development
- **Anchor 0.32+**: Fastest development, auto-generated IDL
- **Pinocchio 0.10+**: 80-95% CU savings vs Anchor
- **Steel 4.0+**: Balance of control and ergonomics
- **Native Rust**: Maximum control, minimal abstractions

### Frontend Stack
- **@solana/kit**: Modern web3.js 2.0 client (tree-shakable, zero deps)
- **Wallet Adapter**: React wallet connection
- **Next.js 15 + React 19**: App framework
- **TanStack Query**: State management for blockchain data
- **Tailwind 4.0**: Styling with modern aesthetics

### Backend Services
- **Axum 0.8+**: Modern web framework (no `#[async_trait]` needed!)
- **Tokio 1.40+**: Async runtime
- **sqlx**: Compile-time checked database queries
- **solana-client**: Async Solana RPC integration

### Testing & QA
- **Mollusk 0.7+**: Fast unit testing, CU benchmarking
- **LiteSVM 0.6+**: Integration testing, multi-program
- **Trident 0.7+**: Fuzz testing for edge cases
- **Bankrun**: BPF testing with banking stage

### Data & Infrastructure
- **Helius**: DAS API, enhanced transactions, webhooks
- **Geyser Plugins**: Real-time indexing
- **Custom RPCs**: Self-hosted nodes
- **Monitoring**: Solana Beach, custom metrics

## Configuration Structure

```
out/solana/
├── CLAUDE.md                 # Solana-specific instructions
├── README.md                 # This file
├── SETUP.md                  # Quick setup guide
├── MODERN_PRACTICES.md       # 2026 best practices guide
├── ENHANCEMENTS_2026.md      # Complete enhancement summary
└── .claude/
    ├── agents/              # 6 specialized agents
    ├── commands/            # 9 workflow commands
    ├── rules/               # 4 auto-loading rule files
    ├── skills/              # 3 pattern libraries
    └── settings.json        # Enhanced settings with hooks
```

## Agent Index

### Core Development Agents (6 total)

| Agent | Purpose | Model | Use When |
|-------|---------|-------|----------|
| **solana-architect** | **NEW** Program architecture & design | Opus | System design, PDA schemes, token economics, CPI patterns |
| **anchor-specialist** | Anchor framework expert | Opus | Rapid Anchor development with modern patterns |
| **pinocchio-engineer** | CU optimization specialist | Opus | Maximum performance (80-95% CU reduction) |
| **solana-frontend-architect** | dApp frontend development | Opus | Web3.js 2.0, wallet adapters, React integration |
| **rust-backend-engineer** | Async backend services | Opus | Axum 0.8, Tokio, Solana client integration |
| **tech-docs-writer** | Technical documentation | Sonnet | README, API docs, integration guides |

### Agent Specializations

#### solana-architect
Comprehensive architectural knowledge including:
- **PDA Design**: Seed patterns, canonical bumps, collision prevention
- **Token Programs**: SPL Token, Token-2022 extensions, custom token logic
- **CPI Integration**: Safe cross-program invocations, composability patterns
- **Account Structures**: Efficient designs, rent optimization, upgrade paths
- **Security Modeling**: Threat analysis, access control, economic security

Use for: "Design the vault account structure", "How should I architect this pool?", "What's the best PDA scheme for this?"

#### anchor-specialist
Use for: "Implement the deposit instruction", "Add account validation", "Generate IDL"

#### pinocchio-engineer
Use for: "Optimize CU usage", "Reduce binary size", "Zero-copy implementation"

#### solana-frontend-architect
Use for: "Build wallet integration", "Create transaction UI", "Setup React Query"

#### rust-backend-engineer
Use for: "Build an indexer", "Create REST API", "WebSocket real-time updates"

#### tech-docs-writer
Use for: "Document this program", "Write integration guide", "Create API reference"

## Commands Reference

### Build & Deploy (3 commands)

| Command | Description |
|---------|-------------|
| `/build-program` | Build Anchor or native program (with verifiable build support) |
| `/deploy-devnet` | Deploy to devnet with safety checks |
| `/deploy-mainnet` | Deploy to mainnet (requires explicit "DEPLOY TO MAINNET" confirmation) |

### Testing (3 commands)

| Command | Description |
|---------|-------------|
| `/test-program` | Run all Solana program tests (Mollusk + LiteSVM + Trident) |
| `/test-rust` | Rust-specific testing (unit, integration, fuzz, doc tests) |
| `/test-and-fix` | Automated test → diagnose → fix → retest loop |

### Security & Development Workflow (3 commands)

| Command | Description |
|---------|-------------|
| `/audit-solana` | Comprehensive security audit with fuzz testing, static analysis |
| `/setup-ci-cd` | Setup automated security pipeline (GitHub Actions, pre-commit hooks) |
| `/quick-commit` | Format, lint, generate commit message, and commit in one command |

## Rules (Auto-Loading)

Rules automatically load based on file patterns to enforce best practices:

| Rule File | Paths | Purpose |
|-----------|-------|---------|
| **anchor.md** | `programs/**/src/**/*.rs` | Anchor-specific patterns, account validation, PDA management |
| **rust.md** | `**/*.rs` (excluding tests, target) | General Rust best practices, error handling, arithmetic safety |
| **typescript.md** | `app/**/*.{ts,tsx}`, `src/**/*.{ts,tsx}` | Web3.js 2.0 patterns, type safety, async/await, React hooks |
| **pinocchio.md** | Programs using Pinocchio | Zero-copy patterns, manual validation, CU optimization |

### What Rules Do

- **Auto-load** based on file paths (no manual triggering needed)
- **Enforce** coding standards and best practices
- **Prevent** common mistakes (unwrap(), unchecked arithmetic)
- **Guide** toward modern patterns (Web3.js 2.0, Axum 0.8, Pinocchio)

## Skills (Pattern Libraries)

Reusable pattern collections for common tasks:

| Skill | Description | Use When |
|-------|-------------|----------|
| **anchor-patterns/** | Secure Anchor program patterns | Building Anchor programs, need account validation examples |
| **rust-async-patterns/** | Axum 0.8 + Tokio patterns | Building async Rust backends, APIs, indexers |
| **web3-patterns/** | Web3.js 2.0 frontend patterns | Building Solana dApp frontends, wallet integration |

### Skill Contents

Each skill includes:
- ✅ Production-ready code examples
- ✅ Modern best practices (2026)
- ✅ Security patterns
- ✅ Performance optimization
- ✅ Common pitfalls to avoid

## Enhanced Features (2026)

### Modern Web3.js 2.0 Support
- Tree-shakable imports (smaller bundles)
- Zero external dependencies
- Type-safe address handling
- BigInt support for u64/u128
- Enhanced type refinement

### Pinocchio Zero-Copy Patterns
- 80-95% CU reduction vs Anchor
- Single-byte discriminators
- Manual validation with TryFrom
- Zero-copy account access
- No dependency bloat

### Axum 0.8 + Tokio Backend
- No more `#[async_trait]` needed
- Tower middleware (compression, tracing)
- Compile-time checked SQL queries
- Cooperative async patterns
- Solana client integration

### CI/CD Security Automation
- GitHub Actions workflow
- Pre-commit hooks (format, lint, test)
- Post-test analysis
- Pre-deploy safety checks
- Automated security scanning

### Enhanced Hooks
- **PostToolUse**: Auto-format on file edits (Rust, TS, JSON, MD)
- **PostToolUse**: Test result summary
- **PreCommit**: Format, lint, and test checks
- **PreDeploy**: Mainnet deployment confirmation

## Documentation Files

| File | Description |
|------|-------------|
| **CLAUDE.md** | Solana-specific development guidelines and best practices |
| **README.md** | This file - complete configuration documentation |
| **SETUP.md** | Quick setup guide with step-by-step instructions |
| **MODERN_PRACTICES.md** | 2026 best practices: verifiable builds, account reloading, CI/CD |
| **ENHANCEMENTS_2026.md** | Complete summary of all enhancements with sources |

## Getting Started

### For New Projects

```bash
# Create Anchor project
anchor init my-solana-project
cd my-solana-project

# Copy Solana config
cp -r /path/to/out/solana/.claude .
cp /path/to/out/solana/CLAUDE.md .

# Setup CI/CD
/setup-ci-cd

# Start developing
/build-program
```

### For Existing Projects

```bash
cd your-solana-project

# Copy config (merge with existing if needed)
cp -r /path/to/out/solana/.claude .
cp /path/to/out/solana/CLAUDE.md .

# Review and merge settings.json with your existing settings
# Then setup automation
/setup-ci-cd
```

## Development Workflow

### Initial Setup (Once)
1. **Setup CI/CD** → `/setup-ci-cd` (automated security pipeline)

### Continuous Development
1. **Design Architecture** → Use `solana-architect` agent
2. **Build** → `/build-program` (use `--verifiable` for mainnet)
3. **Test** → `/test-rust` (unit + integration + fuzz)
4. **Audit** → `/audit-solana` (comprehensive security check)
5. **Deploy Devnet** → `/deploy-devnet`
6. **Test on Devnet** (thoroughly, multiple days!)
7. **Deploy Mainnet** → `/deploy-mainnet` (with explicit confirmation)

### Quick Commits
```
# Make changes
# Auto-format, lint, and commit
/quick-commit
```

## Key Features

### Security-First (Modern Best Practices 2026)
- **CI/CD Integration**: Automated security checks on every commit
- **Verifiable Builds**: Reproducible builds for mainnet deployments
- **Account Reloading**: Explicit guidance on CPI account reloading
- **Mandatory Audits**: Security audits before mainnet
- **Account Validation**: Comprehensive validation checklists
- **Arithmetic Safety**: Checked operations enforcement
- **Mainnet Protection**: No deployment without explicit confirmation

### Performance-Optimized
- CU benchmarking with Mollusk
- Pinocchio specialist for extreme optimization (80-95% reduction)
- Stored PDA bumps (~1500 CU savings per access)
- Zero-copy patterns for large accounts

### Modern Stack (2026)
- Anchor 0.32+ (InitSpace derive, modern macros)
- Pinocchio 0.10+ (zero-copy, single-byte discriminators)
- Web3.js 2.0 (@solana/kit - tree-shakable, zero deps)
- Axum 0.8+ (no `#[async_trait]` needed!)
- Mollusk + LiteSVM + Trident testing
- Helius integration for data

## Best Practices Highlights

### Verifiable Builds (MANDATORY for Mainnet)
```bash
anchor build --verifiable
```
Ensures reproducible builds - auditors can verify deployed bytecode matches source.

### Account Reloading After CPIs (CRITICAL)
```rust
token::transfer(cpi_ctx, amount)?;
ctx.accounts.token_account.reload()?;  // MUST reload!
```
Anchor doesn't auto-update after CPIs - without reload, you have stale data.

### Stored PDA Bumps (Performance)
```rust
#[account]
pub struct Vault {
    pub bump: u8,  // Store canonical bump!
}
```
Saves ~1500 CU per PDA access by not recalculating.

## Common Use Cases

### For Anchor Developers
1. Use `solana-architect` for system design
2. Use `anchor-specialist` for implementation
3. Use `/test-rust` for comprehensive testing
4. Use `/audit-solana` before mainnet
5. Use `/setup-ci-cd` for automation

### For Pinocchio Optimizers
1. Use `solana-architect` for design
2. Use `pinocchio-engineer` for implementation
3. Follow `pinocchio.md` rules (auto-loading)
4. Benchmark CU savings with `/test-rust`

### For Frontend Developers
1. Use `solana-frontend-architect` agent
2. Follow `typescript.md` rules (Web3.js 2.0)
3. Use `web3-patterns` skill for integration
4. Implement tree-shakable imports

### For Backend Engineers
1. Use `rust-backend-engineer` agent
2. Follow `rust-async-patterns` skill
3. Integrate Solana RPC with spawn_blocking
4. Build indexers and APIs

## Support

For issues or questions about this configuration:
- Check **CLAUDE.md** for development guidelines
- Check **MODERN_PRACTICES.md** for 2026 best practices
- Check **ENHANCEMENTS_2026.md** for complete enhancement details
- Use specialized agents for specific tasks

## Research Sources

All patterns verified against official documentation and 2026 research:
- [Solana Web3.js 2.0 Guide](https://www.helius.dev/blog/how-to-start-building-with-the-solana-web3-js-2-0-sdk)
- [Pinocchio Framework](https://www.helius.dev/blog/pinocchio)
- [Axum 0.8.0 Release](https://tokio.rs/blog/2025-01-01-announcing-axum-0-8-0)
- [Solana Official Documentation](https://solana.com/docs)

---

**Version**: 2026.01
**Status**: Production-ready
**Last Updated**: January 2026
**Focus**: Solana blockchain development with modern best practices
