# Solana Game Architecture

Architecture patterns and design decisions for Solana-integrated games.

---

## On-Chain vs Off-Chain Decision Framework

```
+-------------------------------------------------------------+
|                    Game State Decision                       |
+-----------------------+-------------------------------------+
                        |
           +------------v------------+
           |  Is this state valuable |
           |  or tradeable?          |
           +------------+------------+
                        |
           +----Yes-----+-----No----+
           |                        |
           v                        v
     ON-CHAIN                  OFF-CHAIN
     - NFT ownership           - Frame-by-frame position
     - Token balances          - Transient UI state
     - Achievement records     - Local preferences
     - Tournament results      - Cached data
     - Rare item attributes    - Session state
```

### State Categories

| Category | Storage | Examples |
|----------|---------|----------|
| **Ownership** | On-chain (NFT/Token) | Characters, items, land |
| **Progression** | On-chain (PDA) | XP, level, achievements |
| **Leaderboard** | On-chain or hybrid | Scores, rankings |
| **Gameplay** | Off-chain | Position, velocity, temp buffs |
| **Settings** | Local | Graphics, audio, controls |

---

## Hybrid Architecture Pattern

```csharp
public class GameState : MonoBehaviour
{
    // Off-chain: Real-time gameplay
    public Vector3 PlayerPosition { get; set; }
    public float Health { get; set; }

    // Cached on-chain data (sync periodically)
    public ulong TokenBalance { get; private set; }
    public List<NFTItem> OwnedItems { get; private set; }
    public PlayerStats OnChainStats { get; private set; }

    // Sync checkpoints to chain
    public async Task SyncProgressToChain()
    {
        // Only sync significant milestones
        // Batch updates to minimize transactions
    }
}
```

---

## Unity Project Architecture

### Recommended Structure for Solana Games

```
Assets/
├── _Project/                    # Game-specific code
│   ├── Scenes/
│   │   ├── Boot.unity          # Initial loading
│   │   ├── MainMenu.unity      # Menu with wallet connect
│   │   └── Gameplay.unity      # Main game scene
│   ├── Scripts/
│   │   ├── Runtime/
│   │   │   ├── Core/           # Game managers
│   │   │   ├── Blockchain/     # Solana integration
│   │   │   ├── UI/             # UI components
│   │   │   ├── Gameplay/       # Game mechanics
│   │   │   └── Data/           # ScriptableObjects
│   │   └── Editor/             # Editor tools
│   └── Tests/
│       ├── EditMode/
│       └── PlayMode/
├── Packages/                    # UPM packages
│   ├── com.solana.unity-sdk/   # Solana SDK
│   └── com.playsolana.sdk/     # PlaySolana SDK (if targeting PSG1)
└── Plugins/                     # Native plugins
```

### Assembly Definition Pattern

```
_Project.asmdef                  # Main runtime
├── _Project.Blockchain.asmdef   # Solana integration
├── _Project.UI.asmdef           # UI layer
├── _Project.Tests.asmdef        # Test assembly
└── _Project.Editor.asmdef       # Editor tools
```

---

## Wallet Connection Architecture

```csharp
public interface IWalletService
{
    event Action<Account> OnLogin;
    event Action OnLogout;
    event Action<double> OnBalanceChange;

    bool IsConnected { get; }
    PublicKey WalletAddress { get; }

    Task<bool> Connect(WalletType type);
    Task<string> SignAndSendTransaction(Transaction tx);
    Task Disconnect();
}

public class WalletService : IWalletService
{
    private WalletBase _wallet;

    public async Task<bool> Connect(WalletType type)
    {
        _wallet = type switch
        {
            WalletType.Phantom => new PhantomWallet(...),
            WalletType.WalletAdapter => new SolanaWalletAdapter(...),
            WalletType.InGame => new InGameWallet(...),
            _ => throw new ArgumentException()
        };
        return await _wallet.Login();
    }
}
```

---

## NFT Game Asset Architecture

### Dynamic NFT Pattern

```csharp
// Unity: Load and display NFT with dynamic attributes
public class NFTCharacter : MonoBehaviour
{
    public async Task LoadFromChain(PublicKey mint)
    {
        // Load metadata from Metaplex
        var nft = await Nft.TryGetNftData(mint, Web3.Rpc);

        // Load dynamic attributes from game PDA
        var attributesPda = GetAttributesPDA(mint);
        var attributes = await FetchCharacterAttributes(attributesPda);

        // Apply to character
        ApplyVisuals(nft);
        ApplyStats(attributes);
    }
}
```

### On-Chain Character Attributes (Conceptual)

```
pub struct CharacterAttributes {
    pub mint: Pubkey,           // NFT mint
    pub level: u8,
    pub experience: u64,
    pub strength: u16,
    pub defense: u16,
    pub last_battle: i64,
    pub wins: u32,
    pub losses: u32,
}
```

---

## Player Progression Design

### Achievement System Pattern

On-chain achievement tracking (conceptual):

```
pub struct PlayerAchievements {
    pub player: Pubkey,
    pub achievements: u64,      // Bitfield for up to 64 achievements
    pub total_score: u64,
    pub last_update: i64,
}
```

Unity implementation:

```csharp
public class AchievementManager : MonoBehaviour
{
    private ulong _achievementBits;

    public bool HasAchievement(int id) => (_achievementBits & (1UL << id)) != 0;

    public async Task UnlockAchievement(int id)
    {
        if (HasAchievement(id)) return;

        // Verify criteria locally
        if (!VerifyAchievementCriteria(id)) return;

        // Send unlock transaction
        var tx = BuildUnlockTransaction(id);
        var sig = await _walletService.SignAndSendTransaction(tx);

        // Update local state on confirmation
        if (await WaitForConfirmation(sig))
            _achievementBits |= (1UL << id);
    }
}
```

### Leaderboard Architecture

```csharp
public class LeaderboardService
{
    private readonly PublicKey _leaderboardPda;

    public async Task<List<LeaderboardEntry>> GetTopScores(int count)
    {
        var accountInfo = await Web3.Rpc.GetAccountInfoAsync(_leaderboardPda);
        var data = Convert.FromBase64String(accountInfo.Result.Value.Data[0]);
        return DeserializeLeaderboard(data, count);
    }

    public async Task<string> SubmitScore(ulong score)
    {
        var tx = BuildSubmitScoreTransaction(score);
        return await _walletService.SignAndSendTransaction(tx);
    }
}
```

---

## Token Economics Design

### In-Game Currency Pattern

```
+-------------------------------------------------------------+
|                 Token Economy Design                         |
+-------------------------------------------------------------+
|                                                              |
|  EARNING (Sources)              SPENDING (Sinks)            |
|  -----------------              ----------------             |
|  - Quest completion             - Item purchases            |
|  - PvP victories                - Upgrades/crafting         |
|  - Achievement unlocks          - Entry fees                |
|  - Daily rewards                - Cosmetics                 |
|  - Tournament prizes            - Gas fees (sponsor?)       |
|                                                              |
|  Balance: Earnings <= Spendings + Staking                   |
|                                                              |
+-------------------------------------------------------------+
```

### Anti-Inflation Patterns

1. **Time-gated rewards**: Daily caps on earnings
2. **Diminishing returns**: Reduced rewards for repeated actions
3. **Sink mechanisms**: Consumables, upgrades, fees
4. **Staking incentives**: Lock tokens for bonuses
5. **Burn mechanics**: Remove tokens from circulation

---

## Architecture Decision Framework

### When to Build Custom vs Use Existing

| Component | Build Custom | Use Existing |
|-----------|--------------|--------------|
| **Wallet** | Never | Solana.Unity-SDK |
| **NFT Minting** | Sometimes | Metaplex SDK |
| **Token Program** | Rarely | SPL Token |
| **Game State** | Usually | - |
| **Leaderboard** | Often | SOAR (if compatible) |
| **Achievements** | Often | Custom PDA |

### Performance Considerations

| Platform | Constraints |
|----------|-------------|
| **Desktop** | High fidelity, complex shaders |
| **WebGL** | Memory limits, no threading |
| **PSG1** | 8GB RAM, optimize for OLED |
| **Mobile** | Battery, thermal, memory |

---

## Best Practices

### Game State
1. **Minimize on-chain writes** - Batch updates, checkpoint system
2. **Validate on-chain** - Never trust client-side state for valuable outcomes
3. **Handle failures gracefully** - Network issues, transaction failures
4. **Cache aggressively** - Reduce RPC calls

### Unity
1. **Use dependency injection** - Testable, modular code
2. **Separate concerns** - Blockchain layer isolated from gameplay
3. **Async everywhere** - Never block main thread
4. **Test coverage** - Unit tests for game logic, integration tests for chain

### Security
1. **Server authority** - Critical game logic validated on-chain
2. **Rate limiting** - Prevent spam/abuse
3. **Economic modeling** - Prevent inflation/deflation exploits
4. **Audit critical paths** - Especially reward/mint logic

---

## Document Generation (For Game Architects)

When planning a new game, create two documents:

### 1. `concept.md` - Game Concept Document

```markdown
# [Game Title] - Game Concept

## Overview
[High-level description of the game]

## Genre & Platform
- [Primary genre]
- [Target platforms]

## Core Gameplay Loop
[Detailed gameplay flow]

## Detailed Specifications
[Entity stats, formulas, UI layout, physics values]

## Technical Implementation
[Rendering approach, state management]
```

### 2. `plan.md` - Implementation Plan

```markdown
# [Game Title] - Implementation Plan

## Step 1: [Phase Name]
### What will be implemented:
- [Feature list]

### Files to create:
- `path/to/file.cs` - [Purpose]

### What to review:
- [Checkpoint list]

## Step 2: [Phase Name]
...
```

---

## Platform Targeting

### Default: Desktop/WebGL

Unless explicitly specified:
- **Primary**: Desktop (Windows/macOS) builds
- **Secondary**: WebGL for browser-based play
- Unity Input System (new input)
- Standard wallet adapters (Phantom, Solflare)

### PlaySolana/PSG1 Target

Only when user explicitly specifies:
- PSG1 console deployment
- Mobile (Android/iOS) builds
- PlaySolana ecosystem integration

When PSG1 is specified:
- Use PlaySolana-Unity.SDK for input
- Design for 3.92" vertical OLED (1240x1080)
- Integrate PSG1 Simulator for testing
- Consider SvalGuard wallet integration
- Plan PlayDex quest/achievement hooks
