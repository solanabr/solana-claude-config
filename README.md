# Solana Claude Configuration

Production-ready Claude Code configuration for full-stack Solana development. Combines best practices from multiple sources into an agent-optimized, token-efficient config you can copy over and adapt to your specific project.

Current multi-agent workflow favors monorepos, so we use a single CLAUDE.md/config for the whole project while leveraging agents and context-specific skills to solve each step of builder flow.

The idea here is to provide a generic CLAUDE.md that relies on subagents to plan and execute actions, dynamically loading markdown files for context, saving tokens in the end of the day.

Remember to rename ./CLAUDE-solana.md back to ./CLAUDE.md, as the current top-level CLAUDE.md file is focused on maintaining the repo itself.

## What This Is

A complete `.claude/` configuration that turns Claude into a Solana development expert with:

- **15 specialized agents** for different tasks (architecture, Anchor, Pinocchio, DeFi, tokens, frontend, mobile, backend, DevOps, QA, docs, games, Unity, learning, research)
- **22 workflow commands** for building, testing, deploying, profiling, migrating, and committing
- **MCP server integrations** for real-time on-chain data (Helius), docs lookup (Context7), and browser automation (Puppeteer)
- **Agent teams** for multi-step workflows (architect → engineer → QA)
- **Progressive skill loading** that only loads context when needed (saves tokens)
- **Auto-loading rules** that enforce best practices based on file patterns

## Quick Start

```bash
# Option 1: One-liner installer
curl -fsSL https://raw.githubusercontent.com/solanabr/solana-claude-config/main/install.sh | bash

# Option 2: Manual setup
git clone --recurse-submodules https://github.com/solanabr/solana-claude-config.git
cp -r solana-claude-config/.claude /path/to/your-project/
cp solana-claude-config/CLAUDE-solana.md /path/to/your-project/CLAUDE.md
cd /path/to/your-project && git submodule update --init --recursive

# Start Claude Code
claude
```

### MCP Setup (Optional)

After installation, configure MCP servers for enhanced capabilities:

```bash
# In your project with Claude Code running:
/setup-mcp
```

This guides you through API key configuration for Helius, Context7, and other MCP servers.

## Key Features

### Agent-Ready Architecture

Each agent loads its own specialized context on invocation:

```
"Use solana-architect to design the vault program"
"Use anchor-engineer to implement the deposit instruction"
"Use defi-engineer to integrate Jupiter swaps"
"Use solana-qa-engineer to write comprehensive tests"
```

Claude will spawn each specialized agent by itself based on context.

### Agent Teams

With `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` enabled, orchestrate multi-agent workflows:

```
"Create an agent team: solana-architect for design, anchor-engineer for implementation, solana-qa-engineer for testing"
```

Recommended team patterns:

| Pattern | Flow | Use Case |
|---------|------|----------|
| **program-ship** | architect → anchor/pinocchio → qa | Build program from spec to tested |
| **full-stack** | architect → anchor → frontend → qa | End-to-end feature |
| **audit-and-fix** | qa → trailofbits context → anchor | Audit and remediate |
| **game-ship** | game-architect → unity → qa | Game feature |
| **defi-compose** | researcher → defi-engineer → qa | DeFi integration |
| **token-launch** | token-engineer → frontend → qa | Token creation + launch UI |

### MCP Server Integrations

Pre-configured MCP servers in `.mcp.json`:

| Server | Capabilities |
|--------|-------------|
| **Helius** | 60+ tools: RPC, DAS API, webhooks, priority fees, token metadata, NFT data |
| **Context7** | Up-to-date library documentation lookup |
| **Puppeteer** | Browser automation for dApp testing and visual verification |

### Token-Efficient Design

- Skills load progressively (not all at once)
- Agents reference skills instead of duplicating content
- Rules auto-load only for matching file patterns
- Decision frameworks live in agents, not global context

### External Skill Submodules

| Submodule | Source | Purpose |
|-----------|--------|---------|
| `ext/solana-dev` | [solana-foundation/solana-dev-skill](https://github.com/solana-foundation/solana-dev-skill) | Core Solana development (programs, frontend, testing, security) |
| `ext/sendai` | [sendaifun/skills](https://github.com/sendaifun/skills) | DeFi protocol integrations (Jupiter, Drift, Raydium, etc.) |
| `ext/solana-game` | [solanabr/solana-game-skill](https://github.com/solanabr/solana-game-skill) | Game development (Unity, PlaySolana, PSG1) |
| `ext/cloudflare` | [cloudflare/skills](https://github.com/cloudflare/skills) | Infrastructure (Workers, Agents SDK, MCP servers) |
| `ext/trailofbits` | [trailofbits/skills](https://github.com/trailofbits/skills) | Security auditing and vulnerability scanning |
| `ext/qedgen` | [QEDGen/solana-skills](https://github.com/QEDGen/solana-skills) | Formal verification with Lean 4 theorem proving |
| `ext/colosseum` | [ColosseumOrg/colosseum-copilot](https://github.com/ColosseumOrg/colosseum-copilot) | Startup research, idea validation, hackathon projects (proprietary license) |
| `ext/solana-mobile` | [solana-mobile/solana-mobile-dev-skill](https://github.com/solana-mobile/solana-mobile-dev-skill) | Solana Mobile Stack (MWA, Saga, dApp Store) |

### Modern Stack (2026)

| Layer | Stack |
|-------|-------|
| Programs | Anchor 0.31+, Pinocchio, Rust 1.82+ |
| Token Extensions | Token-2022 (transfer hooks, confidential transfers, metadata) |
| Testing | Mollusk, LiteSVM, Surfpool, Trident |
| Frontend | @solana/kit, Next.js 15, React 19 |
| Mobile | React Native, Expo, Mobile Wallet Adapter, Solana Mobile Stack |
| Backend | Axum 0.8+, Tokio 1.40+, sqlx |
| Unity Games | Solana.Unity-SDK, .NET 9, C# 13 |
| PlaySolana | PSG1 console, PlayDex, SvalGuard |
| DeFi | Jupiter, Drift, Kamino, Raydium, Orca, Meteora |
| Infrastructure | Cloudflare Workers, GitHub Actions, Docker |

## Repository Structure

```
.
├── CLAUDE.md                    # Main hub - Claude reads this first
├── README.md                    # This file
├── CHANGELOG.md                 # Version history
├── install.sh                   # One-liner installer
├── update.sh                    # Config updater
├── validate.sh                  # Config integrity checker
├── LICENSE                      # MIT
├── tests/                       # Config integrity test suite
├── .github/workflows/
│   ├── ci.yml                       # PR validation
│   └── claude-code.yml              # Claude Code action template
└── .claude/
    ├── agents/                  # 15 specialized agents
    ├── commands/                # 22 workflow commands
    ├── skills/                  # Progressive-loading knowledge
    │   ├── SKILL.md                 # Unified hub routing to all skills
    │   ├── ext/                     # External skill submodules
    │   │   ├── solana-dev/              # Solana Foundation dev skill (core)
    │   │   ├── sendai/                  # SendAI protocol skills (DeFi)
    │   │   ├── solana-game/             # Solana game skill (Unity, PSG1)
    │   │   ├── cloudflare/              # Cloudflare Workers, Agents SDK
    │   │   ├── trailofbits/             # Trail of Bits security skills
    │   │   ├── qedgen/                # QEDGen formal verification (Lean 4)
    │   │   ├── colosseum/              # Colosseum Copilot (startup research)
    │   │   └── solana-mobile/          # Solana Mobile Stack (MWA, Saga)
    │   ├── token-2022.md            # Token Extensions guide (local)
    │   ├── backend-async.md         # Axum/Tokio patterns (local)
    │   └── deployment.md            # Deployment workflows (local)
    ├── mcp.json                 # MCP server configurations
    ├── rules/                   # Auto-loading constraints
    └── settings.json            # Permissions, hooks, agent teams
```

## Agents

| Agent | Purpose | Model |
|-------|---------|-------|
| **solana-architect** | System design, PDA schemes, token economics, multi-program architecture | Opus |
| **anchor-engineer** | Anchor development, IDL generation, account constraints | Opus |
| **pinocchio-engineer** | CU optimization (80-95% savings), zero-copy, minimal binary | Opus |
| **defi-engineer** | DeFi integrations: Jupiter, Drift, Kamino, Raydium, Orca, Meteora | Opus |
| **token-engineer** | Token-2022 extensions, token economics, launch mechanics | Opus |
| **solana-frontend-engineer** | React/Next.js, wallet UX, transaction flows, accessibility | Opus |
| **mobile-engineer** | React Native/Expo, mobile wallet adapter, deep linking | Sonnet |
| **rust-backend-engineer** | Axum APIs, indexers, WebSocket services | Opus |
| **devops-engineer** | CI/CD, monitoring, RPC infrastructure, Cloudflare Workers | Sonnet |
| **solana-qa-engineer** | Testing (Mollusk/LiteSVM/Trident), CU profiling, code quality | Opus |
| **tech-docs-writer** | READMEs, API docs, integration guides | Sonnet |
| **game-architect** | Solana game design, Unity architecture, on-chain game state, PlaySolana | Opus |
| **unity-engineer** | Unity/C# implementation, Solana.Unity-SDK, wallet integration, NFT display | Sonnet |
| **solana-guide** | Learning, tutorials, concept explanations, progressive learning paths | Sonnet |
| **solana-researcher** | Ecosystem research, protocol investigation, SDK analysis | Sonnet |

## Commands

### Building
| Command | Purpose |
|---------|---------|
| `/build-program` | Build Anchor or native Solana program |
| `/build-app` | Build Next.js/Vite web client |
| `/build-unity` | Build Unity project (WebGL, Desktop, PSG1) |
| `/scaffold` | Generate project scaffolding (program + frontend + tests + CI) |

### Testing & Quality
| Command | Purpose |
|---------|---------|
| `/test-rust` | Run Mollusk, LiteSVM, Surfpool, Trident tests |
| `/test-ts` | Run TypeScript tests (Anchor, Vitest, Playwright) |
| `/test-dotnet` | Run .NET/C# tests (Unity Test Framework, NUnit) |
| `/test-and-fix` | Run tests and auto-fix common issues |
| `/audit-solana` | Comprehensive security audit |
| `/diff-review` | AI-powered diff review for Solana-specific issues |
| `/profile-cu` | CU profiling per instruction with optimization suggestions |
| `/benchmark` | CU benchmarks with before/after comparison |

### Deployment & Migration
| Command | Purpose |
|---------|---------|
| `/deploy` | Deploy to devnet (always first) or mainnet |
| `/migrate-web3` | Migrate from @solana/web3.js to @solana/kit |
| `/generate-idl-client` | Generate typed clients from IDL (Codama/Shank) |

### Workflow & Setup
| Command | Purpose |
|---------|---------|
| `/quick-commit` | Create branch, format, lint, conventional commit |
| `/setup-ci-cd` | Configure GitHub Actions pipeline |
| `/setup-mcp` | Configure MCP server API keys and connections |
| `/update-skills` | Update external skill submodules |
| `/write-docs` | Generate documentation for programs, APIs, components |
| `/explain-code` | Explain complex code with visual diagrams |
| `/plan-feature` | Plan feature implementation with specifications |

## DX Scripts

| Script | Purpose |
|--------|---------|
| `install.sh` | One-liner installer: copies config to your project |
| `update.sh` | Updates config in existing project to latest version |
| `validate.sh` | Validates all config integrity (agents, commands, skills, settings) |
| `tests/run_all.sh` | Runs full test suite for config validation |

## GitHub Action for Team Collaboration

This config includes a pre-built GitHub Action (`.github/workflows/claude-code.yml`) for PR-based iteration:

1. Add `ANTHROPIC_API_KEY` to your repository secrets
2. Copy `.github/workflows/claude-code.yml` to your project
3. Team members can `@claude` in PR comments
4. Claude responds with code suggestions using this configuration

## Branch Workflow

All new work starts on a feature branch:

```bash
# Format: <type>/<scope>-<description>-<DD-MM-YYYY>
git checkout -b feat/program-vault-15-01-2026
git checkout -b fix/frontend-auth-15-01-2026
```

Use `/quick-commit` to automate branch creation and commits.

## Code Quality

Before merging, run `/diff-review` or check diff against main:

```bash
git diff main...HEAD
```

Remove: excessive comments, abnormal try/catch blocks, verbose errors, redundant validation.

Keep: legitimate security checks, non-obvious explanations, matching error patterns.

## Updating

```bash
# Update config in your project
bash update.sh /path/to/your-project

# Or manually update submodules
git submodule update --remote --merge
```

## Credits

This project builds on excellent work from the community:

- **[solana-foundation/solana-dev-skill](https://github.com/solana-foundation/solana-dev-skill)** - The Solana Foundation's comprehensive skill set for Solana development, included as the primary submodule.

- **[sendaifun/skills](https://github.com/sendaifun/skills)** - SendAI's protocol-specific skills for DeFi integrations.

- **[solanabr/solana-game-skill](https://github.com/solanabr/solana-game-skill)** - Game development skills for Unity and PlaySolana.

- **[trailofbits/skills](https://github.com/trailofbits/skills)** - Trail of Bits security auditing skills.

- **[cloudflare/skills](https://github.com/cloudflare/skills)** - Cloudflare infrastructure skills.

- **[QEDGen/solana-skills](https://github.com/QEDGen/solana-skills)** - Formal verification for Solana programs using Lean 4 theorem proving.

- **[ColosseumOrg/colosseum-copilot](https://github.com/ColosseumOrg/colosseum-copilot)** - Solana startup research, idea validation, and hackathon project discovery from Colosseum. Proprietary license (Copyright Colosseum).

- **[solana-mobile/solana-mobile-dev-skill](https://github.com/solana-mobile/solana-mobile-dev-skill)** - Solana Mobile Stack skills (Mobile Wallet Adapter, Saga Genesis Token, SKR address resolution).

- **[0xquinto/bcherny-claude](https://github.com/0xquinto/bcherny-claude)** - Compiled Boris Cherny's (creator of Claude Code at Anthropic) best practices including verification loops, parallel Claude sessions, and CLAUDE.md patterns.

- **[builderz-labs/solana-claude-md](https://github.com/builderz-labs/solana-claude-md)** - Provided starter inspiration for Solana-specific Claude configuration.

## License

MIT - See [LICENSE](LICENSE)
