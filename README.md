# Solana Claude Configuration

Production-ready Claude Code configuration for full-stack Solana development. Combines best practices from multiple sources into an agent-optimized, token-efficient config you can copy over and adapt to your specific project.

Current multi-agent workflow favors monorepos, so we use a single CLAUDE.md/config for the whole project while leveraging agents and context-specific skills to solve each step of builder flow.

The idea here is to provide a generic CLAUDE.md that relies on subagents to plan and execute actions, dynamically loading markdown files for context, saving tokens in the end of the day.

Remember to rename ./CLAUDE-solana.md back to ./CLAUDE.md, as the current top-level CLAUDE.md file is focused on maintaining the repo itself.

## What This Is

A complete `.claude/` configuration that turns Claude into a Solana development expert with:

- **Specialized agents** for different tasks (architecture, Anchor, Pinocchio, frontend, backend, QA, docs, Unity games)
- **Workflow commands** for building, testing, deploying, and committing (Rust, TypeScript, Unity/C#)
- **Progressive skill loading** that only loads context when needed (saves tokens)
- **Auto-loading rules** that enforce best practices based on file patterns

## Quick Start

```bash
# Copy to your Solana project
cp -r .claude /path/to/your-project/
cp CLAUDE-solana.md /path/to/your-project/CLAUDE.md

# Or clone and use as template
git clone https://github.com/solanabr/solana-claude-config
```

## Key Features

### Agent-Ready Architecture

Each agent loads its own specialized context on invocation:

```
"Use solana-architect to design the vault program"
"Use anchor-engineer to implement the deposit instruction"  
"Use solana-qa-engineer to write comprehensive tests"
```

Claude will spawn each specialized agent by itself based on context.

### Token-Efficient Design

- Skills load progressively (not all at once)
- Agents reference skills instead of duplicating content
- Rules auto-load only for matching file patterns
- Decision frameworks live in agents, not global context

### Modern Stack (2026)

| Layer | Stack |
|-------|-------|
| Programs | Anchor 0.31+, Pinocchio, Rust 1.82+ |
| Testing | Mollusk, LiteSVM, Surfpool, Trident |
| Frontend | @solana/kit, Next.js 15, React 19 |
| Backend | Axum 0.8+, Tokio 1.40+, sqlx |
| Unity Games | Solana.Unity-SDK, .NET 9, C# 13 |
| PlaySolana | PSG1 console, PlayDex, SvalGuard |

## Repository Structure

```
.
├── CLAUDE.md                    # Main hub - Claude reads this first
├── README.md                    # This file
├── LICENSE                      # MIT
└── .claude/
    ├── agents/                      # 11 specialized agents
    │   ├── solana-architect.md          # System design, PDAs, architecture
    │   ├── anchor-engineer.md           # Anchor framework development
    │   ├── pinocchio-engineer.md        # CU optimization, zero-copy
    │   ├── solana-frontend-engineer.md  # React/Next.js, wallet UX
    │   ├── rust-backend-engineer.md     # Axum APIs, indexers
    │   ├── solana-qa-engineer.md        # Testing, CU profiling, code quality
    │   ├── tech-docs-writer.md          # Documentation
    │   ├── game-architect.md            # Solana game design, Unity architecture
    │   ├── unity-engineer.md            # Unity/C# implementation, Solana.Unity-SDK
    │   ├── solana-guide.md              # Learning, tutorials, concept explanations
    │   └── solana-researcher.md         # Ecosystem research, protocol investigation
    │
    ├── commands/                # 14 workflow commands
    │   ├── quick-commit.md          # Branch creation, format, lint, commit
    │   ├── build-program.md         # Build Solana programs
    │   ├── build-app.md             # Build web clients
    │   ├── build-unity.md           # Build Unity projects (WebGL, Desktop, PSG1)
    │   ├── test-rust.md             # Rust tests (Mollusk/LiteSVM/Trident)
    │   ├── test-typescript.md       # TypeScript tests
    │   ├── test-dotnet.md           # .NET/C# tests (Unity, NUnit)
    │   ├── test-and-fix.md          # Automated test→fix loop
    │   ├── deploy.md                # Deploy (devnet first, then mainnet)
    │   ├── audit-solana.md          # Security audit workflow
    │   ├── setup-ci-cd.md           # GitHub Actions setup
    │   ├── write-docs.md            # Generate documentation
    │   ├── explain-code.md          # Explain complex code with diagrams
    │   └── plan-feature.md          # Plan feature implementation
    │
    ├── skills/                   # Progressive-loading knowledge
    │   ├── SKILL.md                  # Entry point, routing guide
    │   ├── programs-anchor.md        # Anchor patterns
    │   ├── programs-pinocchio.md     # Pinocchio patterns
    │   ├── frontend-framework-kit.md # @solana/kit patterns
    │   ├── kit-web3-interop.md       # Legacy web3.js interop
    │   ├── backend-async.md          # Axum/Tokio patterns
    │   ├── testing.md                # Test framework selection
    │   ├── security.md               # Security checklist
    │   ├── idl-codegen.md            # IDL generation and client codegen
    │   ├── payments.md               # Solana Pay, Commerce Kit, Kora payments
    │   ├── deployment.md             # Deployment workflows
    │   ├── ecosystem.md              # DeFi/NFT integrations
    │   ├── resources.md              # Official links
    │   ├── unity.md                  # Solana.Unity-SDK, C# patterns
    │   └── playsolana.md             # PlaySolana ecosystem, PSG1, PlayDex
    │
    ├── rules/                   # Auto-loading constraints
    │   ├── anchor.md                # Anchor code rules
    │   ├── pinocchio.md             # Pinocchio code rules
    │   ├── rust.md                  # General Rust rules
    │   ├── kit-react.md             # Frontend rules
    │   └── dotnet.md                # C#/.NET/Unity rules
    │
    └── settings.json            # Permissions, hooks
```

## Agents

| Agent | Purpose | Model |
|-------|---------|-------|
| **solana-architect** | System design, PDA schemes, token economics, multi-program architecture | Opus |
| **anchor-engineer** | Anchor development, IDL generation, account constraints | Opus |
| **pinocchio-engineer** | CU optimization (80-95% savings), zero-copy, minimal binary | Opus |
| **solana-frontend-engineer** | React/Next.js, wallet UX, transaction flows, accessibility | Opus |
| **rust-backend-engineer** | Axum APIs, indexers, WebSocket services | Opus |
| **solana-qa-engineer** | Testing (Mollusk/LiteSVM/Trident), CU profiling, code quality | Opus |
| **tech-docs-writer** | READMEs, API docs, integration guides | Sonnet |
| **game-architect** | Solana game design, Unity architecture, on-chain game state, PlaySolana | Opus |
| **unity-engineer** | Unity/C# implementation, Solana.Unity-SDK, wallet integration, NFT display | Sonnet |
| **solana-guide** | Learning, tutorials, concept explanations, progressive learning paths | Sonnet |
| **solana-researcher** | Ecosystem research, protocol investigation, SDK analysis | Sonnet |

## Commands

| Command | Purpose |
|---------|---------|
| `/quick-commit` | Create branch, format, lint, conventional commit |
| `/build-program` | Build Anchor or native Solana program |
| `/build-app` | Build Next.js/Vite web client |
| `/build-unity` | Build Unity project (WebGL, Desktop, PSG1) |
| `/test-rust` | Run Mollusk, LiteSVM, Surfpool, Trident tests |
| `/test-ts` | Run TypeScript tests (Anchor, Vitest, Playwright) |
| `/test-dotnet` | Run .NET/C# tests (Unity Test Framework, NUnit) |
| `/deploy` | Deploy to devnet (always first) or mainnet |
| `/audit-solana` | Comprehensive security audit |
| `/setup-ci-cd` | Configure GitHub Actions pipeline |
| `/write-docs` | Generate documentation for programs, APIs, components |
| `/explain-code` | Explain complex code with visual diagrams |
| `/plan-feature` | Plan feature implementation with specifications |

## GitHub Action for Team Collaboration

This config works with the [Claude GitHub Action](https://github.com/anthropics/claude-code-action) for PR-based iteration:

1. Add `ANTHROPIC_API_KEY` to your repository secrets
2. Team members can `@claude` in PR comments
3. Claude responds with code suggestions using this configuration

## Branch Workflow

All new work starts on a feature branch:

```bash
# Format: <type>/<scope>-<description>-<DD-MM-YYYY>
git checkout -b feat/program-vault-15-01-2026
git checkout -b fix/frontend-auth-15-01-2026
```

Use `/quick-commit` to automate branch creation and commits.

## Code Quality

Before merging, check for AI-generated patterns that don't match the codebase:

```bash
git diff main...HEAD
```

Remove: excessive comments, abnormal try/catch blocks, verbose errors, redundant validation.

Keep: legitimate security checks, non-obvious explanations, matching error patterns.

## Credits

This project builds on excellent work from the community:

- **[GuiBibeau/solana-dev-skill](https://github.com/GuiBibeau/solana-dev-skill)** - Gui from the Solana Foundation open-sourced a comprehensive skill set for Solana development. This project restructures those skills for better agent coordination and progressive loading.

- **[0xquinto/bcherny-claude](https://github.com/0xquinto/bcherny-claude)** - Compiled Boris Cherny's (creator of Claude Code at Anthropic) best practices including verification loops, parallel Claude sessions, and CLAUDE.md patterns.

- **[builderz-labs/solana-claude-md](https://github.com/builderz-labs/solana-claude-md)** - Provided starter inspiration for Solana-specific Claude configuration.

## License

MIT - See [LICENSE](LICENSE)

## TODO

This is a work in progress, use at your own risk.

- Integrate any MCP tools used in project
- Wait for [bug](https://github.com/anthropics/claude-code/issues/16299) to be solved and review rules/skills token usage
- Test pinnochio usage