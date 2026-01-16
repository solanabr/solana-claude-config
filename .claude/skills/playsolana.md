# PlaySolana Ecosystem Integration

Progressive skill for PlaySolana ecosystem integration, PSG1 console development, and the SuperHUB platform.

> **Note**: Only account for PlaySolana/PSG1 features when explicitly targeting this platform. Default to standard desktop/WebGL builds.

## Overview

PlaySolana is a vertically integrated gaming ecosystem built on Solana, featuring:

- **PSG1**: Handheld gaming console (retro-futuristic, 3.92" OLED)
- **PlayDex**: Quest and achievement platform
- **PlayID**: On-chain identity and progression
- **SvalGuard**: Hardware-backed wallet
- **PlayGate**: Developer publishing portal
- **$PLAY**: Ecosystem token

---

## When to Use PlaySolana SDK

**Include PlaySolana SDK when user specifies:**
- PSG1 console as target platform
- Mobile (Android) deployment for handheld
- PlayDex integration for quests/achievements
- PlayID for cross-game identity
- SvalGuard wallet integration

**Default (no PlaySolana SDK needed):**
- Desktop builds (Windows/macOS)
- WebGL browser games
- Standard Phantom/Solflare wallet connection

---

## PSG1 Console Specifications

### Hardware

| Component | Specification |
|-----------|---------------|
| **SoC** | RK3588S2 (octa-core CPU + Mali-G610 GPU + NPU) |
| **RAM** | 8GB |
| **Storage** | 128GB |
| **Display** | 3.92" OLED, 1240×1080 (vertical orientation) |
| **Connectivity** | Wi-Fi 6, Bluetooth 5.4 |
| **Battery** | 5000mAh |
| **Security** | TEE + Secure Element + StrongBox |
| **OS** | EchOS (Android-based) |

### Input Controls

```
┌─────────────────────────────┐
│         [L]     [R]         │  Shoulder buttons
├─────────────────────────────┤
│                             │
│    ┌───┐         ┌───┐     │
│    │ ↑ │         │ Y │     │  D-Pad (Left)
│ ┌──┼───┼──┐   ┌──┼───┼──┐  │  Face Buttons (Right)
│ │← │   │ →│   │ X│   │ A│  │
│ └──┼───┼──┘   └──┼───┼──┘  │
│    │ ↓ │         │ B │     │
│    └───┘         └───┘     │
│                             │
│   [Select]     [Start]      │  Menu buttons
│                             │
│      ┌─────────────┐        │
│      │   SCREEN    │        │  3.92" OLED
│      │  1240×1080  │        │  (vertical)
│      │  (portrait) │        │
│      └─────────────┘        │
│                             │
└─────────────────────────────┘
```

### Unity Input Mapping

```csharp
#if PLAYSOLANA_PSG1
using PlaySolana.InputSystem;

public class PSG1InputHandler : MonoBehaviour
{
    void Update()
    {
        // D-Pad
        var dpad = PSG1Input.DPad;
        if (dpad.up.wasPressedThisFrame) OnUp();
        if (dpad.down.wasPressedThisFrame) OnDown();
        if (dpad.left.wasPressedThisFrame) OnLeft();
        if (dpad.right.wasPressedThisFrame) OnRight();

        // Face buttons (Nintendo-style layout)
        if (PSG1Input.ButtonA.wasPressedThisFrame) OnConfirm();
        if (PSG1Input.ButtonB.wasPressedThisFrame) OnCancel();
        if (PSG1Input.ButtonX.wasPressedThisFrame) OnAction1();
        if (PSG1Input.ButtonY.wasPressedThisFrame) OnAction2();

        // Shoulders
        if (PSG1Input.ShoulderL.wasPressedThisFrame) OnLeftShoulder();
        if (PSG1Input.ShoulderR.wasPressedThisFrame) OnRightShoulder();

        // Menu
        if (PSG1Input.Start.wasPressedThisFrame) OnPause();
        if (PSG1Input.Select.wasPressedThisFrame) OnMenu();
    }
}
#endif
```

---

## PlaySolana Unity SDK

### Installation

```json
// Packages/manifest.json
{
  "dependencies": {
    "com.solana.unity-sdk": "https://github.com/magicblock-labs/Solana.Unity-SDK.git#3.1.0",
    "com.playsolana.sdk": "https://github.com/playsolana/unity-sdk.git#1.0.0"
  }
}
```

### SDK Structure

```csharp
using PlaySolana.SDK;           // Core SDK
using PlaySolana.InputSystem;   // PSG1 input
using PlaySolana.Wallet;        // SvalGuard integration
using PlaySolana.PlayDex;       // Quests and achievements
using PlaySolana.PlayID;        // On-chain identity
```

---

## SvalGuard Wallet Integration

SvalGuard is the hardware-backed wallet built into PSG1, using TEE and Secure Element for key protection.

```csharp
#if PLAYSOLANA_PSG1
using PlaySolana.Wallet;

public class SvalGuardWallet : MonoBehaviour
{
    private SvalGuard _wallet;

    public event Action<PublicKey> OnConnected;
    public event Action OnDisconnected;

    public bool IsConnected => _wallet?.IsConnected ?? false;
    public PublicKey Address => _wallet?.Address;

    public async Task<bool> Connect()
    {
        try
        {
            _wallet = await SvalGuard.Connect();
            if (_wallet != null)
            {
                OnConnected?.Invoke(_wallet.Address);
                return true;
            }
        }
        catch (Exception ex)
        {
            Debug.LogError($"SvalGuard connection failed: {ex.Message}");
        }
        return false;
    }

    public async Task<string> SignAndSendTransaction(Transaction tx)
    {
        if (!IsConnected)
            throw new InvalidOperationException("Wallet not connected");

        // SvalGuard uses biometric authentication
        // User confirms with fingerprint
        return await _wallet.SignAndSendTransaction(tx);
    }

    public async Task Disconnect()
    {
        if (_wallet != null)
        {
            await _wallet.Disconnect();
            _wallet = null;
            OnDisconnected?.Invoke();
        }
    }
}
#endif
```

### Biometric Authentication

```csharp
#if PLAYSOLANA_PSG1
public async Task<bool> AuthenticateForTransaction()
{
    // Triggers fingerprint prompt on PSG1
    var result = await SvalGuard.RequestBiometric(
        title: "Confirm Transaction",
        description: "Use fingerprint to sign"
    );

    return result == BiometricResult.Success;
}
#endif
```

---

## PlayDex Integration

PlayDex is the quest and achievement platform for earning XP and rewards.

### Quest Completion

```csharp
#if PLAYSOLANA_PSG1
using PlaySolana.PlayDex;

public class QuestManager : MonoBehaviour
{
    private PlayDexClient _client;

    async void Start()
    {
        _client = await PlayDexClient.Initialize();
    }

    // Report quest completion to PlayDex
    public async Task CompleteQuest(string questId, uint score)
    {
        try
        {
            var result = await _client.CompleteQuest(new QuestCompletion
            {
                QuestId = questId,
                Score = score,
                Timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
            });

            if (result.Success)
            {
                Debug.Log($"Quest completed! XP earned: {result.XpEarned}");
            }
        }
        catch (Exception ex)
        {
            Debug.LogError($"Quest completion failed: {ex.Message}");
        }
    }

    // Check available quests
    public async Task<List<Quest>> GetAvailableQuests()
    {
        return await _client.GetActiveQuests();
    }

    // Get player's quest progress
    public async Task<QuestProgress> GetProgress(string questId)
    {
        return await _client.GetQuestProgress(questId);
    }
}
#endif
```

### Achievement System

```csharp
#if PLAYSOLANA_PSG1
public class AchievementManager : MonoBehaviour
{
    private PlayDexClient _client;

    public async Task UnlockAchievement(string achievementId)
    {
        try
        {
            var result = await _client.UnlockAchievement(achievementId);

            if (result.Success)
            {
                // Show achievement popup
                ShowAchievementUnlocked(result.Achievement);

                // XP automatically added to PlayID
                Debug.Log($"Achievement unlocked! +{result.XpEarned} XP");
            }
        }
        catch (Exception ex)
        {
            Debug.LogError($"Achievement unlock failed: {ex.Message}");
        }
    }

    public async Task<List<Achievement>> GetAchievements()
    {
        return await _client.GetAchievements();
    }
}
#endif
```

### Leaderboard Integration

```csharp
#if PLAYSOLANA_PSG1
public class LeaderboardManager : MonoBehaviour
{
    private PlayDexClient _client;

    public async Task SubmitScore(string leaderboardId, ulong score)
    {
        await _client.SubmitLeaderboardScore(new LeaderboardEntry
        {
            LeaderboardId = leaderboardId,
            Score = score,
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
        });
    }

    public async Task<List<LeaderboardEntry>> GetTopScores(
        string leaderboardId,
        int count = 100)
    {
        return await _client.GetLeaderboard(leaderboardId, count);
    }

    public async Task<LeaderboardEntry> GetPlayerRank(string leaderboardId)
    {
        return await _client.GetPlayerLeaderboardEntry(leaderboardId);
    }
}
#endif
```

---

## PlayID Integration

PlayID is the on-chain identity system that persists across games.

```csharp
#if PLAYSOLANA_PSG1
using PlaySolana.PlayID;

public class PlayIDManager : MonoBehaviour
{
    private PlayIDClient _client;

    public PlayIDProfile CurrentProfile { get; private set; }

    async void Start()
    {
        _client = await PlayIDClient.Initialize();
        await LoadProfile();
    }

    public async Task LoadProfile()
    {
        CurrentProfile = await _client.GetProfile();

        if (CurrentProfile != null)
        {
            Debug.Log($"PlayID: {CurrentProfile.Username}");
            Debug.Log($"Level: {CurrentProfile.Level}");
            Debug.Log($"Total XP: {CurrentProfile.TotalXp}");
        }
    }

    public async Task<bool> UpdateUsername(string newUsername)
    {
        var result = await _client.UpdateUsername(newUsername);
        if (result.Success)
        {
            CurrentProfile = result.UpdatedProfile;
        }
        return result.Success;
    }

    // Get player's NFT avatar if set
    public async Task<Texture2D> GetAvatarTexture()
    {
        if (CurrentProfile?.AvatarNft == null) return null;

        return await LoadNFTTexture(CurrentProfile.AvatarNft);
    }
}

public class PlayIDProfile
{
    public PublicKey Address { get; set; }
    public string Username { get; set; }
    public uint Level { get; set; }
    public ulong TotalXp { get; set; }
    public ulong SeasonXp { get; set; }
    public PublicKey AvatarNft { get; set; }
    public List<string> UnlockedAchievements { get; set; }
}
#endif
```

---

## PSG1 Screen Considerations

### Vertical Layout (1240×1080)

```csharp
#if PLAYSOLANA_PSG1
public class PSG1ScreenManager : MonoBehaviour
{
    void Start()
    {
        // PSG1 is vertical/portrait orientation
        Screen.orientation = ScreenOrientation.Portrait;

        // Native resolution
        // Width: 1080, Height: 1240 (in portrait)
    }
}
#endif
```

### UI Design Guidelines

```
┌──────────────────┐
│    TOP BAR       │  Status, wallet, etc.
│    (safe zone)   │
├──────────────────┤
│                  │
│                  │
│    MAIN GAME     │  Primary content area
│      AREA        │  Consider D-Pad reach
│                  │
│                  │
├──────────────────┤
│   BOTTOM BAR     │  Actions, inventory
│   (safe zone)    │
└──────────────────┘
```

### Safe Areas

```csharp
#if PLAYSOLANA_PSG1
public class SafeAreaHandler : MonoBehaviour
{
    [SerializeField] private RectTransform _safeAreaPanel;

    void Start()
    {
        ApplySafeArea();
    }

    void ApplySafeArea()
    {
        var safeArea = Screen.safeArea;

        var anchorMin = safeArea.position;
        var anchorMax = safeArea.position + safeArea.size;
        anchorMin.x /= Screen.width;
        anchorMin.y /= Screen.height;
        anchorMax.x /= Screen.width;
        anchorMax.y /= Screen.height;

        _safeAreaPanel.anchorMin = anchorMin;
        _safeAreaPanel.anchorMax = anchorMax;
    }
}
#endif
```

---

## PSG1 Simulator

For development without physical hardware:

```csharp
#if UNITY_EDITOR
using PlaySolana.Simulator;

public class PSG1SimulatorSetup : MonoBehaviour
{
    void Awake()
    {
        // Enable simulator in editor
        PSG1Simulator.Enable();

        // Set screen size to match PSG1
        PSG1Simulator.SetResolution(1080, 1240);

        // Map keyboard to PSG1 controls
        PSG1Simulator.MapKeyboard(new KeyboardMapping
        {
            DPadUp = KeyCode.UpArrow,
            DPadDown = KeyCode.DownArrow,
            DPadLeft = KeyCode.LeftArrow,
            DPadRight = KeyCode.RightArrow,
            ButtonA = KeyCode.Z,
            ButtonB = KeyCode.X,
            ButtonX = KeyCode.A,
            ButtonY = KeyCode.S,
            ShoulderL = KeyCode.Q,
            ShoulderR = KeyCode.E,
            Start = KeyCode.Return,
            Select = KeyCode.Backspace
        });
    }
}
#endif
```

---

## PlayGate Publishing

PlayGate is the developer portal for publishing games to PSG1.

### Build Requirements

```csharp
// PlayerSettings for PSG1
public static class PSG1BuildSettings
{
    public static void ConfigureForPSG1()
    {
        // Target Android
        PlayerSettings.Android.targetArchitectures = AndroidArchitecture.ARM64;
        PlayerSettings.Android.minSdkVersion = AndroidSdkVersions.AndroidApiLevel30;

        // Screen orientation
        PlayerSettings.defaultInterfaceOrientation = UIOrientation.Portrait;

        // Graphics
        PlayerSettings.SetGraphicsAPIs(BuildTarget.Android,
            new[] { GraphicsDeviceType.Vulkan, GraphicsDeviceType.OpenGLES3 });

        // Package name
        // Format: com.playsolana.games.{your-game}
        PlayerSettings.SetApplicationIdentifier(
            BuildTargetGroup.Android,
            "com.playsolana.games.yourgame"
        );
    }
}
```

### Manifest Requirements

```xml
<!-- AndroidManifest.xml additions for PSG1 -->
<uses-feature android:name="android.hardware.touchscreen" android:required="false"/>
<uses-feature android:name="android.hardware.gamepad" android:required="true"/>

<!-- PlaySolana permissions -->
<uses-permission android:name="com.playsolana.SVALGUARD"/>
<uses-permission android:name="com.playsolana.PLAYDEX"/>
```

---

## $PLAY Token Integration

```csharp
#if PLAYSOLANA_PSG1
public class PlayTokenManager : MonoBehaviour
{
    // $PLAY token mint address
    public static readonly PublicKey PLAY_MINT =
        new PublicKey("PLAYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

    public async Task<ulong> GetPlayBalance()
    {
        var ata = AssociatedTokenAccountProgram.DeriveAssociatedTokenAccount(
            SvalGuard.Address,
            PLAY_MINT
        );

        var balance = await Web3.Rpc.GetTokenAccountBalanceAsync(ata);
        return balance.Result?.Value?.AmountUlong ?? 0;
    }

    public async Task<string> TransferPlay(PublicKey to, ulong amount)
    {
        // Build transfer transaction
        var tx = await BuildPlayTransferTransaction(to, amount);

        // Sign with SvalGuard (biometric)
        return await SvalGuard.SignAndSendTransaction(tx);
    }
}
#endif
```

---

## Conditional Compilation

Use preprocessor directives for PSG1-specific code:

```csharp
public class GameManager : MonoBehaviour
{
    void Start()
    {
        #if PLAYSOLANA_PSG1
        // PSG1-specific initialization
        InitializePSG1();
        #else
        // Standard desktop/WebGL initialization
        InitializeStandard();
        #endif
    }

    #if PLAYSOLANA_PSG1
    private void InitializePSG1()
    {
        // Connect SvalGuard wallet
        // Setup PSG1 input
        // Initialize PlayDex client
    }
    #endif

    private void InitializeStandard()
    {
        // Standard Phantom/Solflare wallet
        // Keyboard/mouse input
    }
}
```

### Define Symbol

Add `PLAYSOLANA_PSG1` to Player Settings → Scripting Define Symbols when targeting PSG1:

```
PLAYSOLANA_PSG1;UNITY_ASSERTIONS
```

---

## Resources

- [PlaySolana Developers](https://developers.playsolana.com/)
- [PlayGate Portal](https://playgate.playsolana.com/)
- [PlayDex](https://playsolana.com/playdex)
- [PlaySolana Unity SDK](https://github.com/playsolana/unity-sdk)
- [PSG1 Simulator](https://developers.playsolana.com/simulator)
- [PlaySolana Litepaper](https://playsolana.com/litepaper)
