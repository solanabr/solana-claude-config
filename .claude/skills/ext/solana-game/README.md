# Solana Game Skill for Claude Code

A Claude Code skill addon for Solana blockchain game development with Unity, React Native, and web frontends.

> **Extends**: [solana-dev-skill](https://github.com/solana-foundation/solana-dev-skill)

## Overview

This skill is an **addon** to the core Solana development skill. It adds gaming-specific capabilities while delegating program development and core patterns to solana-dev-skill.

```
┌─────────────────────────────────────────────────────────────────┐
│                     solana-game-skill (addon)                   │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Gaming Skills                                            │  │
│  │  ├── Unity / Solana.Unity-SDK                             │  │
│  │  ├── React Native / Mobile Wallet Adapter                 │  │
│  │  ├── PlaySolana / PSG1 Console                            │  │
│  │  ├── Game Architecture (state, economies)                 │  │
│  │  ├── In-Game Payments + Arcium Rollups                    │  │
│  │  └── Gaming Testing (Unity Test, Jest, Detox)             │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼ references                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  solana-dev-skill (core)                                  │  │
│  │  ├── Frontend (framework-kit, kit-web3-interop)           │  │
│  │  ├── Programs (Anchor, Pinocchio)                         │  │
│  │  ├── Testing (LiteSVM, Mollusk, Surfpool)                 │  │
│  │  └── Security (program + client checklists)               │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## What's Included

### Gaming-Specific Skills (This Addon)

| Skill | Description |
|-------|-------------|
| [unity-sdk.md](skill/unity-sdk.md) | Solana.Unity-SDK integration, wallet connection, NFT loading |
| [csharp-patterns.md](skill/csharp-patterns.md) | C# coding standards for Unity |
| [mobile.md](skill/mobile.md) | Mobile Wallet Adapter, Expo, offline-first |
| [react-native-patterns.md](skill/react-native-patterns.md) | React Native patterns |
| [game-architecture.md](skill/game-architecture.md) | On-chain vs off-chain state design |
| [playsolana.md](skill/playsolana.md) | PSG1 console, PlayDex, PlayID |
| [payments.md](skill/payments.md) | In-game economy, purchases, **Arcium rollups** |
| [testing.md](skill/testing.md) | Unity Test Framework, Jest, React Native |
| [resources.md](skill/resources.md) | Gaming-focused SDK links |

### Core Skills (from solana-dev-skill)

| Skill | Description |
|-------|-------------|
| frontend-framework-kit.md | React hooks, wallet connection |
| kit-web3-interop.md | Kit ↔ web3.js boundary patterns |
| security.md | Security checklist (programs + clients) |
| programs-anchor.md | Anchor framework patterns |
| programs-pinocchio.md | High-performance Pinocchio |
| idl-codegen.md | IDL generation, client codegen |
| testing.md | LiteSVM, Mollusk, Surfpool |

## Installation

### Recommended: Custom Install

If you're reading this, use the **custom installer** for full control:

```bash
git clone https://github.com/solanabr/solana-game-skill
cd solana-game-skill
./install-custom.sh
```

The custom installer lets you:
- Choose install location (personal `~/.claude/skills/` or project `./.claude/skills/`)
- Skip core skill if you already have `solana-dev-skill`
- Choose where to place `CLAUDE.md`

### Standard Install (Automation)

For scripts, CI/CD, or quick setup with defaults:

```bash
./install.sh        # Interactive with defaults
./install.sh -y     # Non-interactive, all defaults
```

**Standard defaults:**
- Location: `~/.claude/skills/`
- Installs both `solana-dev` and `solana-game` skills
- Copies `CLAUDE.md` to `~/.claude/`

### Install Comparison

| Feature | `install.sh` | `install-custom.sh` |
|---------|--------------|---------------------|
| Interactive prompts | Minimal (Y/n) | Full menu |
| Location choice | Default only | Personal/Project/Custom |
| Core skill handling | Always installs | Detects existing |
| CLAUDE.md placement | `~/.claude/` | Choose location |
| Best for | Automation, scripts | Manual setup |

### If You Already Have solana-dev-skill

Use `./install-custom.sh` - it detects existing installations and only installs the gaming addon.

## Default Stack (January 2026)

### Unity Games
| Layer | Choice |
|-------|--------|
| Engine | Unity 6000+ LTS |
| SDK | Solana.Unity-SDK 3.1.0+ |
| Runtime | .NET 9 / C# 13 |
| Platforms | Desktop, WebGL, PSG1 |
| Wallet | Phantom, Solflare, InGame, Web3Auth |

### Mobile Games (React Native)
| Layer | Choice |
|-------|--------|
| Framework | React Native 0.76+ |
| Build | Expo SDK 52+ |
| Wallet | Mobile Wallet Adapter 2.x |
| State | Zustand 5.x |
| Storage | MMKV 3.x |

### Web Frontends
| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| SDK | @solana/kit + @solana/react-hooks |
| State | Zustand + React Query |

## Agents

| Agent | Model | Purpose |
|-------|-------|---------|
| **game-architect** | opus | Game design, architecture, token economics |
| **unity-engineer** | sonnet | Unity/C# implementation |
| **mobile-engineer** | sonnet | React Native, MWA, offline-first |
| **solana-guide** | sonnet | Education, tutorials |
| **tech-docs-writer** | sonnet | Documentation |

## Commands

| Command | Purpose |
|---------|---------|
| **/build-unity** | Build Unity projects (WebGL, Desktop, PSG1) |
| **/test-dotnet** | Run .NET/C# tests |
| **/build-react-native** | Build React Native projects |
| **/test-react-native** | Run React Native tests |
| **/quick-commit** | Quick commit with conventional messages |

## Usage Examples

### Unity Game Development
```
"Help me set up wallet connection in my Unity game"
"Create an NFT gallery component that loads player-owned NFTs"
"Design an on-chain achievement system"
```

### Mobile Game Development
```
"Create a React Native game with Mobile Wallet Adapter"
"Implement offline-first sync for game progress"
"Set up deep linking for wallet connections"
```

### Game Architecture
```
"Design on-chain state for my multiplayer game"
"Set up Arcium rollups for confidential game actions"
"Plan a token economy for my play-to-earn game"
```

### Program Development (via core skill)
```
"Create an Anchor program for game items"
"Set up LiteSVM tests for my program"
```

## Repository Structure

```
solana-game-skill/
├── CLAUDE.md                    # Claude configuration
├── README.md                    # This file
├── install.sh                   # Standard installer (defaults)
├── install-custom.sh            # Custom installer (full options)
│
├── skill/                       # Gaming addon skills
│   ├── SKILL.md                # Entry point (references core)
│   ├── unity-sdk.md            # Unity patterns
│   ├── mobile.md               # React Native patterns
│   ├── game-architecture.md    # State design
│   ├── playsolana.md           # PSG1 console
│   ├── payments.md             # Economy + Arcium
│   ├── testing.md              # Unity/RN testing
│   └── resources.md
│
├── agents/                      # Specialized agents
├── commands/                    # Workflow commands
└── rules/                       # Code rules
```

## Development Workflow

### Two-Strike Rule

If a build or test fails twice on the same issue:
1. Claude will **STOP** immediately
2. Present error output and code change
3. Ask for user guidance

### .meta File Rules (Unity)

Claude will **never** manually create Unity `.meta` files - Unity generates them automatically.

## Related

- [solana-dev-skill](https://github.com/solana-foundation/solana-dev-skill) - Core Solana development skill (required dependency)

## Contributing

Contributions are welcome! Please ensure any updates reflect current Solana gaming ecosystem best practices.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature-29-01-2026`
3. Make your changes
4. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Maintained by [Superteam Brazil](https://github.com/solanabr)
