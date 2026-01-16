# Unity SDK for Solana Development

Progressive skill for Unity game development with Solana blockchain integration using Solana.Unity-SDK.

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

## Resources

- [Solana.Unity-SDK GitHub](https://github.com/magicblock-labs/Solana.Unity-SDK)
- [Solana.Unity-SDK Docs](https://solana.unity-sdk.gg/)
- [Unity Solana Wallet Template](https://github.com/magicblock-labs/Solana.Unity-SDK/tree/main/Samples~)
- [Metaplex Docs](https://developers.metaplex.com/)
