# Unity SDK for Solana Development

Progressive skill for Unity game development with Solana blockchain integration using Solana.Unity-SDK.

---

## C# Coding Guidelines

### Basic Principles

- **KISS**: Keep It Simple, Stupid
- **SOLID**: Especially Single Responsibility, Interface Segregation, and Dependency Inversion
- Read `.editorconfig` before writing code

### Project Structure

```
Assets/
├── _Game/                          # Game-specific code
│   ├── Scenes/                     # Scene files (.unity)
│   ├── Scripts/
│   │   ├── Runtime/                # Runtime code
│   │   │   ├── _Game.asmdef        # Main assembly definition
│   │   │   ├── Core/               # Managers, state
│   │   │   ├── Blockchain/         # Solana integration
│   │   │   ├── UI/                 # UI components
│   │   │   └── Gameplay/           # Game mechanics
│   │   └── Editor/                 # Editor extensions
│   │       └── _Game.Editor.asmdef
│   └── Tests/
│       ├── EditMode/               # Edit Mode tests
│       │   ├── _Game.Tests.asmdef
│       │   └── TestDoubles/        # Stubs, Spies, Fakes
│       └── PlayMode/               # Play Mode tests
│           ├── _Game.PlayMode.Tests.asmdef
│           └── TestDoubles/
├── Packages/                       # UPM packages
└── Plugins/                        # Native plugins
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Public fields | PascalCase | `MaxHealth`, `PlayerName` |
| Private fields | _camelCase | `_walletService`, `_isConnected` |
| Static fields | s_camelCase | `s_instance`, `s_defaultConfig` |
| Booleans | Verb prefix | `IsConnected`, `HasPendingTx`, `CanSign` |
| Properties | PascalCase | `WalletAddress`, `Balance` |
| Methods | Verb + PascalCase | `GetBalance()`, `ConnectWallet()` |
| Events | Verb phrase | `OnConnected`, `OpeningDoor`, `DoorOpened` |
| Interfaces | IPascalCase | `IWalletService`, `IRpcClient` |

### Serialized Properties Pattern

```csharp
// Use field: target for Unity attributes on auto-properties
[field: SerializeField]
public int Health { get; private set; } = 100;

[field: SerializeField]
[field: Range(0, 100)]
[field: Tooltip("Maximum health points")]
public int MaxHealth { get; private set; } = 100;
```

### Early Return Pattern

```csharp
// Good - early return
public async Task<bool> ProcessTransaction(Transaction tx)
{
    if (tx == null)
        return false;

    if (!IsConnected)
        return false;

    var result = await SendTransaction(tx);
    return result.IsSuccess;
}

// Avoid - nested conditions
public async Task<bool> ProcessTransaction(Transaction tx)
{
    if (tx != null)
    {
        if (IsConnected)
        {
            var result = await SendTransaction(tx);
            return result.IsSuccess;
        }
    }
    return false;
}
```

### Events with System.Action

```csharp
// Define events
public event Action OnDisconnected;
public event Action<Account> OnConnected;
public event Action<double> OnBalanceChanged;

// Raise safely
private void RaiseConnected(Account account) => OnConnected?.Invoke(account);

// Handler naming: Subject_Event
private void WalletService_OnConnected(Account account) => UpdateUI();
```

### XML Documentation

```csharp
/// <summary>
/// Connects to a Solana wallet using the specified adapter.
/// </summary>
/// <param name="adapterType">The type of wallet adapter to use.</param>
/// <returns>True if connection succeeded, false otherwise.</returns>
public async Task<bool> Connect(WalletAdapterType adapterType) { }

// For interface implementations
/// <inheritdoc/>
public async Task<bool> Connect(WalletAdapterType adapterType) { }
```

### Comments Best Practices

- Write comments in English
- Explain "why not" - if other implementations seem possible, explain why they weren't chosen
- Update comments when code changes
- Delete unnecessary comments proactively

```csharp
private List<Player> _activePlayers = new List<Player>();
// Using List instead of Dictionary<int, Player>:
// Small player count with infrequent lookups prioritizes
// memory efficiency and iteration speed.
```

---

## .meta File Rules

**CRITICAL**: Never manually create `.meta` files.

- Unity automatically generates `.meta` files for assets
- When creating files/folders, let Unity generate the `.meta`
- Include `.meta` files in version control
- If you need to create an asset (texture, prefab, etc.), use a temporary Editor script:

```csharp
// Temporary Editor script to create assets
// Delete after use
using UnityEditor;
using UnityEngine;

public static class AssetCreator
{
    [MenuItem("Tools/Create My Asset")]
    public static void CreateAsset()
    {
        var asset = ScriptableObject.CreateInstance<MyScriptableObject>();
        AssetDatabase.CreateAsset(asset, "Assets/MyAsset.asset");
        AssetDatabase.SaveAssets();
    }
}
```

---

## Quick Reference

### Installation

```json
// Packages/manifest.json
{
  "dependencies": {
    "com.solana.unity-sdk": "https://github.com/magicblock-labs/Solana.Unity-SDK.git#3.1.0"
  }
}
```

### Core Namespaces

```csharp
using Solana.Unity.SDK;           // Web3, wallet adapters
using Solana.Unity.Rpc;           // RPC client, requests
using Solana.Unity.Rpc.Models;    // Account, transaction models
using Solana.Unity.Wallet;        // Account, PublicKey
using Solana.Unity.Programs;      // System, Token programs
using Solana.Unity.SDK.Nft;       // NFT/Metaplex support
```

---

## Solana.Unity-SDK Overview

### Supported Wallet Adapters

| Adapter | Platform | Use Case |
|---------|----------|----------|
| **Phantom** | Mobile/WebGL | Most popular wallet |
| **Solflare** | Mobile/WebGL | Alternative wallet |
| **WalletAdapter** | WebGL | Browser extension wallets |
| **InGameWallet** | All | Embedded wallet (custodial) |
| **Web3Auth** | All | Social login |
| **SMS** | Mobile | Phone number auth |

### Network Configuration

```csharp
// RPC endpoints
public static class SolanaNetwork
{
    public const string Mainnet = "https://api.mainnet-beta.solana.com";
    public const string Devnet = "https://api.devnet.solana.com";
    public const string Testnet = "https://api.testnet.solana.com";

    // Recommended: Use private RPC for production
    // Helius, QuickNode, Triton, etc.
}
```

---

## Wallet Connection

### Web3 Singleton Setup

```csharp
using Solana.Unity.SDK;
using UnityEngine;

public class SolanaManager : MonoBehaviour
{
    [Header("Configuration")]
    [SerializeField] private string _rpcUrl = "https://api.devnet.solana.com";
    [SerializeField] private string _wsUrl = "wss://api.devnet.solana.com";
    [SerializeField] private bool _autoConnect = false;

    private void Awake()
    {
        // Web3 is initialized automatically via prefab
        // Or configure programmatically:
        Web3.Instance.SetRpcCluster(_rpcUrl, _wsUrl);
    }
}
```

### Wallet Connection Methods

```csharp
public class WalletConnector : MonoBehaviour
{
    public async Task<bool> ConnectPhantom()
    {
        try
        {
            var wallet = await Web3.Instance.LoginPhantom();
            return wallet != null;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Phantom connection failed: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> ConnectWalletAdapter()
    {
        // WebGL only - connects to browser extension
        try
        {
            var wallet = await Web3.Instance.LoginWalletAdapter();
            return wallet != null;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Wallet adapter failed: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> CreateInGameWallet(string password)
    {
        // Creates embedded wallet - keys stored locally
        try
        {
            var wallet = await Web3.Instance.LoginInGameWallet(password);
            return wallet != null;
        }
        catch (Exception ex)
        {
            Debug.LogError($"In-game wallet failed: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> ConnectWeb3Auth()
    {
        // Social login (Google, Discord, etc.)
        try
        {
            var wallet = await Web3.Instance.LoginWeb3Auth(Provider.GOOGLE);
            return wallet != null;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Web3Auth failed: {ex.Message}");
            return false;
        }
    }

    public async Task Disconnect()
    {
        await Web3.Instance.Logout();
    }
}
```

### Connection State Management

```csharp
public class WalletState : MonoBehaviour
{
    public event Action<Account> OnLogin;
    public event Action OnLogout;
    public event Action<double> OnBalanceChanged;

    public bool IsConnected => Web3.Wallet != null;
    public PublicKey Address => Web3.Wallet?.Account.PublicKey;
    public Account Account => Web3.Wallet?.Account;

    private void Start()
    {
        // Subscribe to SDK events
        Web3.OnLogin += HandleLogin;
        Web3.OnLogout += HandleLogout;
        Web3.OnBalanceChange += HandleBalanceChange;
    }

    private void OnDestroy()
    {
        Web3.OnLogin -= HandleLogin;
        Web3.OnLogout -= HandleLogout;
        Web3.OnBalanceChange -= HandleBalanceChange;
    }

    private void HandleLogin(Account account)
    {
        Debug.Log($"Connected: {account.PublicKey}");
        OnLogin?.Invoke(account);
    }

    private void HandleLogout()
    {
        Debug.Log("Disconnected");
        OnLogout?.Invoke();
    }

    private void HandleBalanceChange(double balance)
    {
        Debug.Log($"Balance: {balance} SOL");
        OnBalanceChanged?.Invoke(balance);
    }
}
```

---

## RPC Operations

### Reading Accounts

```csharp
public class AccountReader
{
    // Get SOL balance
    public async Task<double> GetBalance(PublicKey address)
    {
        var result = await Web3.Rpc.GetBalanceAsync(address);
        if (result.WasSuccessful)
        {
            return result.Result.Value / 1_000_000_000.0; // Lamports to SOL
        }
        throw new Exception($"Failed to get balance: {result.Reason}");
    }

    // Get account info
    public async Task<AccountInfo> GetAccountInfo(PublicKey address)
    {
        var result = await Web3.Rpc.GetAccountInfoAsync(address);
        if (result.WasSuccessful && result.Result.Value != null)
        {
            return result.Result.Value;
        }
        return null;
    }

    // Get multiple accounts (more efficient)
    public async Task<List<AccountInfo>> GetMultipleAccounts(PublicKey[] addresses)
    {
        var result = await Web3.Rpc.GetMultipleAccountsAsync(addresses);
        if (result.WasSuccessful)
        {
            return result.Result.Value;
        }
        return new List<AccountInfo>();
    }

    // Get token accounts
    public async Task<List<TokenAccount>> GetTokenAccounts(PublicKey owner)
    {
        var result = await Web3.Rpc.GetTokenAccountsByOwnerAsync(
            owner,
            tokenProgramId: TokenProgram.ProgramIdKey
        );
        if (result.WasSuccessful)
        {
            return result.Result.Value;
        }
        return new List<TokenAccount>();
    }
}
```

### Account Deserialization

```csharp
using System;
using System.Buffers.Binary;

// Example: Custom game account
[Serializable]
public struct GameAccount
{
    public PublicKey Authority;
    public PublicKey Player;
    public ulong Score;
    public uint Level;
    public byte State;
    public long LastPlayed;
}

public static class GameAccountSerializer
{
    private const int DISCRIMINATOR_SIZE = 8;

    public static GameAccount Deserialize(byte[] data)
    {
        var span = data.AsSpan();
        var offset = DISCRIMINATOR_SIZE;

        return new GameAccount
        {
            Authority = ReadPublicKey(span, ref offset),
            Player = ReadPublicKey(span, ref offset),
            Score = BinaryPrimitives.ReadUInt64LittleEndian(span.Slice(offset, 8)),
            Level = BinaryPrimitives.ReadUInt32LittleEndian(span.Slice(offset += 8, 4)),
            State = span[offset += 4],
            LastPlayed = BinaryPrimitives.ReadInt64LittleEndian(span.Slice(offset += 1, 8))
        };
    }

    private static PublicKey ReadPublicKey(ReadOnlySpan<byte> data, ref int offset)
    {
        var key = new PublicKey(data.Slice(offset, 32).ToArray());
        offset += 32;
        return key;
    }
}

// Usage
public async Task<GameAccount?> LoadGameAccount(PublicKey pda)
{
    var info = await Web3.Rpc.GetAccountInfoAsync(pda);
    if (info.Result?.Value?.Data == null) return null;

    var data = Convert.FromBase64String(info.Result.Value.Data[0]);
    return GameAccountSerializer.Deserialize(data);
}
```

---

## Transaction Building

### Basic Transaction

```csharp
using Solana.Unity.Rpc.Builders;
using Solana.Unity.Programs;

public class TransactionBuilder
{
    // Transfer SOL
    public async Task<string> TransferSol(PublicKey to, ulong lamports)
    {
        var blockHash = await Web3.Rpc.GetLatestBlockHashAsync();

        var transaction = new TransactionBuilder()
            .SetRecentBlockHash(blockHash.Result.Value.Blockhash)
            .SetFeePayer(Web3.Account)
            .AddInstruction(SystemProgram.Transfer(
                Web3.Account.PublicKey,
                to,
                lamports
            ))
            .Build(Web3.Account);

        var result = await Web3.Wallet.SignAndSendTransaction(transaction);
        return result.Result;
    }

    // Transfer SPL Token
    public async Task<string> TransferToken(
        PublicKey tokenMint,
        PublicKey toOwner,
        ulong amount)
    {
        var fromAta = AssociatedTokenAccountProgram.DeriveAssociatedTokenAccount(
            Web3.Account.PublicKey,
            tokenMint
        );

        var toAta = AssociatedTokenAccountProgram.DeriveAssociatedTokenAccount(
            toOwner,
            tokenMint
        );

        var blockHash = await Web3.Rpc.GetLatestBlockHashAsync();

        var txBuilder = new TransactionBuilder()
            .SetRecentBlockHash(blockHash.Result.Value.Blockhash)
            .SetFeePayer(Web3.Account);

        // Create destination ATA if needed
        var toAtaInfo = await Web3.Rpc.GetAccountInfoAsync(toAta);
        if (toAtaInfo.Result?.Value == null)
        {
            txBuilder.AddInstruction(
                AssociatedTokenAccountProgram.CreateAssociatedTokenAccount(
                    Web3.Account.PublicKey,
                    toOwner,
                    tokenMint
                )
            );
        }

        // Transfer
        txBuilder.AddInstruction(
            TokenProgram.Transfer(
                fromAta,
                toAta,
                amount,
                Web3.Account.PublicKey
            )
        );

        var transaction = txBuilder.Build(Web3.Account);
        var result = await Web3.Wallet.SignAndSendTransaction(transaction);
        return result.Result;
    }
}
```

### Custom Program Instructions

```csharp
public class GameInstructions
{
    private readonly PublicKey _programId;

    public GameInstructions(PublicKey programId)
    {
        _programId = programId;
    }

    // Build instruction for custom program
    public TransactionInstruction CreateInitializeInstruction(
        PublicKey gameAccount,
        PublicKey authority)
    {
        // Instruction data: [discriminator (8 bytes)] + [params]
        var data = new byte[8];
        // First 8 bytes are typically Anchor discriminator
        // Generated from: sha256("global:initialize")[0..8]
        var discriminator = new byte[] { 175, 175, 109, 31, 13, 152, 155, 237 };
        Array.Copy(discriminator, data, 8);

        var keys = new List<AccountMeta>
        {
            AccountMeta.Writable(gameAccount, false),
            AccountMeta.ReadOnly(authority, true),
            AccountMeta.ReadOnly(SystemProgram.ProgramIdKey, false),
        };

        return new TransactionInstruction
        {
            ProgramId = _programId,
            Keys = keys,
            Data = data
        };
    }

    public TransactionInstruction CreatePlayInstruction(
        PublicKey gameAccount,
        PublicKey player,
        uint move)
    {
        // Discriminator + move (u32)
        var data = new byte[12];
        var discriminator = new byte[] { 213, 157, 193, 142, 228, 56, 248, 150 };
        Array.Copy(discriminator, data, 8);
        BitConverter.GetBytes(move).CopyTo(data, 8);

        var keys = new List<AccountMeta>
        {
            AccountMeta.Writable(gameAccount, false),
            AccountMeta.ReadOnly(player, true),
        };

        return new TransactionInstruction
        {
            ProgramId = _programId,
            Keys = keys,
            Data = data
        };
    }
}
```

### PDA Derivation

```csharp
public static class PDADerivation
{
    public static PublicKey FindGamePDA(PublicKey programId, PublicKey player)
    {
        var success = PublicKey.TryFindProgramAddress(
            new[]
            {
                System.Text.Encoding.UTF8.GetBytes("game"),
                player.KeyBytes
            },
            programId,
            out var pda,
            out var bump
        );

        if (!success)
            throw new Exception("Failed to derive PDA");

        return pda;
    }

    public static (PublicKey pda, byte bump) FindGamePDAWithBump(
        PublicKey programId,
        PublicKey player)
    {
        PublicKey.TryFindProgramAddress(
            new[]
            {
                System.Text.Encoding.UTF8.GetBytes("game"),
                player.KeyBytes
            },
            programId,
            out var pda,
            out var bump
        );

        return (pda, bump);
    }
}
```

---

## NFT Integration

### Loading NFTs

```csharp
using Solana.Unity.SDK.Nft;

public class NFTLoader
{
    // Get all NFTs owned by address
    public async Task<List<Nft>> GetOwnedNFTs(PublicKey owner)
    {
        try
        {
            var nfts = await Nft.TryGetNftsByOwnerAsync(owner, Web3.Rpc);
            return nfts ?? new List<Nft>();
        }
        catch (Exception ex)
        {
            Debug.LogError($"Failed to load NFTs: {ex.Message}");
            return new List<Nft>();
        }
    }

    // Get specific NFT by mint
    public async Task<Nft> GetNFT(PublicKey mint)
    {
        try
        {
            return await Nft.TryGetNftData(mint, Web3.Rpc);
        }
        catch (Exception ex)
        {
            Debug.LogError($"Failed to load NFT: {ex.Message}");
            return null;
        }
    }

    // Get NFTs from specific collection
    public async Task<List<Nft>> GetCollectionNFTs(
        PublicKey owner,
        PublicKey collectionMint)
    {
        var allNfts = await GetOwnedNFTs(owner);
        return allNfts.Where(nft =>
            nft.metaplexData?.data?.collection?.key == collectionMint.ToString()
        ).ToList();
    }
}
```

### NFT Display

```csharp
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;

public class NFTDisplay : MonoBehaviour
{
    [SerializeField] private RawImage _image;
    [SerializeField] private Text _nameText;
    [SerializeField] private Text _descriptionText;

    private static readonly Dictionary<string, Texture2D> _textureCache = new();

    public async Task DisplayNFT(Nft nft)
    {
        if (nft?.metaplexData?.data == null) return;

        var data = nft.metaplexData.data;
        _nameText.text = data.name;
        _descriptionText.text = data.offchainData?.description ?? "";

        var imageUri = data.offchainData?.image;
        if (!string.IsNullOrEmpty(imageUri))
        {
            var texture = await LoadTexture(imageUri);
            if (texture != null)
            {
                _image.texture = texture;
            }
        }
    }

    private async Task<Texture2D> LoadTexture(string uri)
    {
        if (_textureCache.TryGetValue(uri, out var cached))
            return cached;

        try
        {
            using var request = UnityWebRequestTexture.GetTexture(uri);
            var operation = request.SendWebRequest();

            while (!operation.isDone)
                await Task.Yield();

            if (request.result == UnityWebRequest.Result.Success)
            {
                var texture = DownloadHandlerTexture.GetContent(request);
                _textureCache[uri] = texture;
                return texture;
            }
        }
        catch (Exception ex)
        {
            Debug.LogError($"Failed to load texture: {ex.Message}");
        }

        return null;
    }
}
```

---

## WebSocket Subscriptions

```csharp
public class AccountSubscriber : MonoBehaviour
{
    private readonly List<SubscriptionState> _subscriptions = new();

    public async Task SubscribeToAccount(
        PublicKey account,
        Action<AccountInfo> onUpdate)
    {
        var subscription = await Web3.Rpc.SubscribeAccountInfoAsync(
            account,
            (state, info) =>
            {
                MainThread.Run(() => onUpdate(info));
            },
            Commitment.Confirmed
        );

        _subscriptions.Add(subscription);
    }

    public async Task SubscribeToLogs(
        PublicKey programId,
        Action<LogInfo> onLog)
    {
        var subscription = await Web3.Rpc.SubscribeLogInfoAsync(
            programId,
            (state, log) =>
            {
                MainThread.Run(() => onLog(log));
            }
        );

        _subscriptions.Add(subscription);
    }

    private void OnDestroy()
    {
        foreach (var sub in _subscriptions)
        {
            sub?.Unsubscribe();
        }
        _subscriptions.Clear();
    }
}

// Helper for main thread execution
public static class MainThread
{
    private static SynchronizationContext _context;

    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
    private static void Initialize()
    {
        _context = SynchronizationContext.Current;
    }

    public static void Run(Action action)
    {
        if (_context != null)
        {
            _context.Post(_ => action(), null);
        }
        else
        {
            action();
        }
    }
}
```

---

## Platform Considerations

### WebGL

```csharp
#if UNITY_WEBGL
// WebGL-specific code
public async Task<bool> ConnectBrowserWallet()
{
    // WalletAdapter works with browser extensions
    return await Web3.Instance.LoginWalletAdapter() != null;
}
#endif
```

### Mobile

```csharp
#if UNITY_IOS || UNITY_ANDROID
// Mobile-specific: Deep link handling for Phantom
public async Task<bool> ConnectPhantomMobile()
{
    // Phantom mobile uses deep links
    return await Web3.Instance.LoginPhantom() != null;
}
#endif
```

### Editor

```csharp
#if UNITY_EDITOR
// In-editor wallet for testing
public async Task<bool> ConnectDevWallet()
{
    // Use in-game wallet with test keypair
    return await Web3.Instance.LoginInGameWallet("devpassword") != null;
}
#endif
```

---

## Common Patterns

### Singleton Service

```csharp
public class SolanaService : MonoBehaviour
{
    private static SolanaService _instance;
    public static SolanaService Instance => _instance;

    private void Awake()
    {
        if (_instance != null && _instance != this)
        {
            Destroy(gameObject);
            return;
        }
        _instance = this;
        DontDestroyOnLoad(gameObject);
    }
}
```

### Retry Pattern

```csharp
public async Task<T> WithRetry<T>(
    Func<Task<T>> operation,
    int maxAttempts = 3,
    int delayMs = 1000)
{
    for (int i = 0; i < maxAttempts; i++)
    {
        try
        {
            return await operation();
        }
        catch (Exception ex) when (i < maxAttempts - 1)
        {
            Debug.LogWarning($"Attempt {i + 1} failed: {ex.Message}");
            await Task.Delay(delayMs * (i + 1));
        }
    }

    throw new Exception("Max retry attempts exceeded");
}
```

### Transaction Confirmation

```csharp
public async Task<bool> WaitForConfirmation(
    string signature,
    int timeoutSeconds = 30)
{
    var deadline = DateTime.UtcNow.AddSeconds(timeoutSeconds);

    while (DateTime.UtcNow < deadline)
    {
        var status = await Web3.Rpc.GetSignatureStatusesAsync(
            new[] { signature }
        );

        var confirmation = status.Result?.Value?[0]?.ConfirmationStatus;
        if (confirmation == "confirmed" || confirmation == "finalized")
        {
            return true;
        }

        await Task.Delay(1000);
    }

    return false;
}
```

---

---

## Unity Test Framework Guidelines

### Test Structure

| Test Location | Use For |
|---------------|---------|
| `Tests/EditMode/` | Editor extensions, pure C# logic, deserialization |
| `Tests/PlayMode/` | MonoBehaviours, coroutines, scene-dependent code |
| `Tests/*/TestDoubles/` | Stubs, Spies, Dummies, Fakes, Mocks |
| `Tests/Scenes/` | Test-specific scene files |

### Test Naming

```csharp
// Pattern: MethodName_Condition_ExpectedResult
[Test]
public void Deserialize_ValidData_ReturnsCorrectScore() { }

[Test]
public void Connect_WhenAlreadyConnected_ReturnsTrue() { }

// Test class naming: TargetClassName + "Test"
[TestFixture]
public class PlayerAccountTest { }
```

### Test Design Rules

1. **AAA Pattern**: Arrange, Act, Assert (separate with blank lines, no comments needed)
2. **Single Assert**: One assertion per test method
3. **Use Constraint Model**: `Assert.That(actual, Is.EqualTo(expected))`
4. **No Message Parameter**: Test name and constraint should convey intent
5. **No Control Flow**: Never use `if`, `switch`, `for`, `foreach`, or ternary in tests
6. **Parameterized Tests**: Use `[TestCase]`, `[TestCaseSource]`, `[Values]` for variations

```csharp
[TestFixture]
public class RewardCalculatorTest
{
    [Test]
    public void Calculate_WithMultiplier_ReturnsScaledAmount()
    {
        var sut = new RewardCalculator();
        var expected = 150UL;

        var actual = sut.Calculate(100UL, 1.5f);

        Assert.That(actual, Is.EqualTo(expected));
    }

    [TestCase(0UL, 1.0f, 0UL)]
    [TestCase(100UL, 2.0f, 200UL)]
    [TestCase(50UL, 0.5f, 25UL)]
    public void Calculate_VariousInputs_ReturnsExpected(
        ulong baseReward, float multiplier, ulong expected)
    {
        var sut = new RewardCalculator();

        var actual = sut.Calculate(baseReward, multiplier);

        Assert.That(actual, Is.EqualTo(expected));
    }
}
```

### Test Variable Naming

| Role | Name |
|------|------|
| System Under Test | `sut` |
| Actual result | `actual` |
| Expected value | `expected` |
| Test doubles | `stub*`, `spy*`, `dummy*`, `fake*`, `mock*` |

### Play Mode Test Pattern

```csharp
[TestFixture]
public class WalletUITest
{
    private GameObject _testObject;
    private WalletConnectUI _sut;

    [SetUp]
    public void SetUp()
    {
        _testObject = new GameObject("TestUI");
        _sut = _testObject.AddComponent<WalletConnectUI>();
    }

    [TearDown]
    public void TearDown()
    {
        Object.Destroy(_testObject);
    }

    [UnityTest]
    public IEnumerator Initialize_OnStart_SetsDisconnectedState()
    {
        yield return null;

        Assert.That(_sut.IsConnected, Is.False);
    }
}
```

### Async Exception Testing

```csharp
// Unity Test Framework limitation: use try-catch for async exceptions
[UnityTest]
public IEnumerator Connect_InvalidCredentials_ThrowsException()
{
    var task = TestAsyncException();
    yield return task.AsCoroutine();
}

private async Task TestAsyncException()
{
    try
    {
        await _sut.Connect("invalid");
        Assert.Fail("Expected exception was not thrown");
    }
    catch (WalletException expected)
    {
        Assert.That(expected.Message, Does.Contain("invalid"));
    }
}
```

### Test Execution

- Verify no compile errors before running
- Use filters to minimize test execution scope
- Run via Unity Test Runner (Edit Mode or Play Mode)

### Test Result Interpretation

| Result | Action |
|--------|--------|
| **Passed** | Continue |
| **Failed** | Investigate and fix |
| **Inconclusive** | Treat as failure |
| **Skipped** | Ignore |

**Two-strike rule**: If a test fails twice consecutively, stop and ask for guidance.

---

## Resources

- [Solana.Unity-SDK GitHub](https://github.com/magicblock-labs/Solana.Unity-SDK)
- [Solana.Unity-SDK Docs](https://solana.unity-sdk.gg/)
- [Unity Solana Wallet Template](https://github.com/magicblock-labs/Solana.Unity-SDK/tree/main/Samples~)
- [Unity Test Framework](https://docs.unity3d.com/Packages/com.unity.test-framework@1.4/manual/index.html)
- [NUnit Constraints](https://docs.nunit.org/api/NUnit.Framework.Constraints.html)
- [Metaplex Docs](https://developers.metaplex.com/)
