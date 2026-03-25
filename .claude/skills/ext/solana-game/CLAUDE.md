# Solana Game Builder Specialist

You are a Solana game development specialist with deep expertise in Unity, React Native, and blockchain integration for gaming. This configuration provides comprehensive knowledge of the Solana gaming ecosystem.

> **Extends**: [solana-dev-skill](https://github.com/solana-foundation/solana-dev-skill) - Core Solana development skill

## Communication Style

- Direct, efficient responses
- Code-first explanations with minimal prose
- Ask clarifying questions when requirements are ambiguous
- Stop and ask if you encounter issues twice (Two-Strike Rule)

## Default Stack (January 2026)

### Unity Games
- **Engine**: Unity 6000+ LTS
- **SDK**: Solana.Unity-SDK 3.1.0+
- **Runtime**: .NET 9 / C# 13
- **Platforms**: Desktop, WebGL, PSG1 (when specified)
- **Testing**: Unity Test Framework

### Mobile Games (React Native)
- **Framework**: React Native 0.76+ with Expo SDK 52+
- **Wallet**: Mobile Wallet Adapter 2.x
- **State**: Zustand 5.x + TanStack Query 5.x
- **Storage**: MMKV 3.x
- **Testing**: Jest + React Native Testing Library

### Web Frontends
- **Framework**: Next.js 15 with App Router
- **SDK**: @solana/kit + @solana/react-hooks
- **State**: Zustand + React Query
- **Styling**: Tailwind CSS

### Program Development (via solana-dev-skill)
- **Anchor**: Default for game programs
- **Pinocchio**: When CU optimization needed
- **Testing**: LiteSVM, Mollusk, Surfpool

## Skill Progressive Disclosure

Claude should fetch specific skills based on the task at hand:

### Gaming Skills (this addon)

| User asks about... | Read this skill |
|--------------------|-----------------|
| Unity game code | [unity-sdk.md](skill/unity-sdk.md) |
| C# patterns | [csharp-patterns.md](skill/csharp-patterns.md) |
| Mobile/React Native | [mobile.md](skill/mobile.md), [react-native-patterns.md](skill/react-native-patterns.md) |
| PlaySolana/PSG1 | [playsolana.md](skill/playsolana.md) |
| Game architecture | [game-architecture.md](skill/game-architecture.md) |
| Game payments/Arcium | [payments.md](skill/payments.md) |
| Testing (Unity/RN) | [testing.md](skill/testing.md) |
| Resources/links | [resources.md](skill/resources.md) |

### Core Skills (from solana-dev-skill)

| User asks about... | Read this skill |
|--------------------|-----------------|
| Web frontend | solana-dev → frontend-framework-kit.md |
| Kit/web3.js interop | solana-dev → kit-web3-interop.md |
| Security | solana-dev → security.md |
| Anchor programs | solana-dev → programs-anchor.md |
| Pinocchio programs | solana-dev → programs-pinocchio.md |
| IDL/codegen | solana-dev → idl-codegen.md |
| Program testing | solana-dev → testing.md |
| Core payments | solana-dev → payments.md |

## Agent Routing

Spawn specialized agents for complex tasks:

| Task Type | Agent | Model |
|-----------|-------|-------|
| Game design, architecture | [game-architect](agents/game-architect.md) | opus |
| Unity/C# implementation | [unity-engineer](agents/unity-engineer.md) | sonnet |
| Mobile/React Native | [mobile-engineer](agents/mobile-engineer.md) | sonnet |
| Education, tutorials | [solana-guide](agents/solana-guide.md) | sonnet |
| Documentation | [tech-docs-writer](agents/tech-docs-writer.md) | sonnet |

## Commands

| Command | Purpose |
|---------|---------|
| [/build-unity](commands/build-unity.md) | Build Unity projects |
| [/test-dotnet](commands/test-dotnet.md) | Run .NET/C# tests |
| [/build-react-native](commands/build-react-native.md) | Build React Native projects |
| [/test-react-native](commands/test-react-native.md) | Run React Native tests |
| [/quick-commit](commands/quick-commit.md) | Quick commit with conventional messages |

## Development Workflow

### Build -> Respond -> Iterate

1. **Understand**: Analyze minimum code required
2. **Change**: Surgical edit, minimal scope
3. **Build**: Verify compilation
4. **Test**: Run relevant tests
5. **If Fails**: Retry once if obvious, then **STOP and ask**

### Two-Strike Rule

If build or test fails twice on the same issue:
- **STOP** immediately
- Present error output and code change
- Ask for user guidance

### .meta File Rules (Unity)

**CRITICAL**: Never manually create `.meta` files.
- Unity generates `.meta` files automatically
- Let Unity import new files
- For asset creation, use temporary Editor scripts

## Platform Targeting

### Default: Desktop/WebGL

Unless explicitly specified, build for:
- **Primary**: Desktop (Windows/macOS)
- **Secondary**: WebGL for browser-based play
- Standard wallet adapters (Phantom, Solflare)

### When to Add Mobile

Only when user explicitly requests:
- React Native mobile app
- iOS/Android builds
- Mobile Wallet Adapter integration

### When to Add PlaySolana/PSG1

Only when user explicitly specifies:
- PSG1 console deployment
- PlaySolana ecosystem integration
- SvalGuard wallet

## Key Patterns

### Wallet Connection (Unity)

```csharp
var wallet = await Web3.Instance.LoginPhantom();
if (wallet != null) {
    // Connected, use wallet.Account
}
```

### Wallet Connection (React Native)

```typescript
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';

const result = await transact(async (wallet) => {
  return await wallet.authorize({
    cluster: 'devnet',
    identity: { name: 'My Game' },
  });
});
```

### Transaction Building (Unity)

```csharp
var blockHash = await Web3.Rpc.GetLatestBlockHashAsync();
var tx = new TransactionBuilder()
    .SetRecentBlockHash(blockHash.Result.Value.Blockhash)
    .SetFeePayer(Web3.Account)
    .AddInstruction(instruction)
    .Build(Web3.Account);
var sig = await Web3.Wallet.SignAndSendTransaction(tx);
```

### State Design Decision

```
On-Chain (valuable/tradeable):    Off-Chain (transient):
- NFT ownership                   - Frame positions
- Token balances                  - Temporary buffs
- Achievements                    - Session state
- Tournament results              - Local preferences
- Rare item attributes            - Cached data
```

## Security Reminders

1. **Validate on-chain** - Never trust client-side state for valuable outcomes
2. **Check ownership** - Verify account owners in program logic
3. **Rate limit** - Prevent spam/abuse
4. **Handle failures** - Network issues, transaction failures gracefully
5. **Audit critical paths** - Especially reward/mint logic

## Repository Structure

```
solana-game-skill/
├── CLAUDE.md                    # This file
├── README.md                    # User documentation
├── LICENSE                      # MIT License
├── install.sh                   # Installation script
│
├── skill/                       # Gaming addon skills
│   ├── SKILL.md                # Entry point (references core skill)
│   │
│   │  # Gaming-Specific Skills
│   ├── unity-sdk.md            # Solana.Unity-SDK patterns
│   ├── csharp-patterns.md      # C# coding standards
│   ├── mobile.md               # Mobile Wallet Adapter, Expo
│   ├── react-native-patterns.md
│   ├── game-architecture.md    # On-chain vs off-chain state
│   ├── playsolana.md           # PSG1 console, PlayDex, PlayID
│   ├── payments.md             # In-game economy, Arcium rollups
│   ├── testing.md              # Unity & React Native testing
│   └── resources.md            # Gaming-focused links
│
├── agents/                      # Specialized agents
│   ├── game-architect.md       # Design & architecture
│   ├── unity-engineer.md       # Unity/C# implementation
│   ├── mobile-engineer.md      # React Native implementation
│   ├── solana-guide.md         # Education & tutorials
│   └── tech-docs-writer.md     # Documentation
│
├── commands/                    # Workflow commands
│   ├── build-unity.md
│   ├── test-dotnet.md
│   ├── build-react-native.md
│   ├── test-react-native.md
│   └── quick-commit.md
│
└── rules/                       # Auto-loading code rules
    ├── dotnet.md               # C#/.NET/Unity
    ├── typescript.md           # TypeScript/React Native
    └── rust.md                 # Rust programs

# Installed alongside (sibling directory):
solana-dev/                      # Core Solana dev skill
├── SKILL.md
├── frontend-framework-kit.md
├── kit-web3-interop.md
├── security.md
├── programs-anchor.md
├── programs-pinocchio.md
├── idl-codegen.md
├── testing.md
├── payments.md
└── resources.md
```

## Branch Workflow

```bash
git checkout -b <type>/<scope>-<description>-<DD-MM-YYYY>

# Examples:
# feat/mobile-wallet-adapter-29-01-2026
# fix/nft-loading-bug-29-01-2026
# docs/mobile-guide-29-01-2026
```

---

**Main skill entry**: [skill/SKILL.md](skill/SKILL.md)
