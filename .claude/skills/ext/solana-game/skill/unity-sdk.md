# Solana.Unity-SDK Integration

Comprehensive guide for Unity game development with Solana blockchain integration using Solana.Unity-SDK.

---

## Installation

```json
// Packages/manifest.json
{
  "dependencies": {
    "com.solana.unity-sdk": "https://github.com/magicblock-labs/Solana.Unity-SDK.git#3.1.0"
  }
}
```

## Core Namespaces

```csharp
using Solana.Unity.SDK;           // Web3, wallet adapters
using Solana.Unity.Rpc;           // RPC client, requests
using Solana.Unity.Rpc.Models;    // Account, transaction models
using Solana.Unity.Wallet;        // Account, PublicKey
using Solana.Unity.Programs;      // System, Token programs
using Solana.Unity.SDK.Nft;       // NFT/Metaplex support
```

---

## Wallet Adapters

| Adapter | Platform | Use Case |
|---------|----------|----------|
| **Phantom** | Mobile/WebGL | Most popular wallet |
| **Solflare** | Mobile/WebGL | Alternative wallet |
| **WalletAdapter** | WebGL | Browser extension wallets |
| **InGameWallet** | All | Embedded wallet (custodial) |
| **Web3Auth** | All | Social login |

---

## Wallet Connection

### Wallet Service Pattern

```csharp
using Solana.Unity.SDK;
using Solana.Unity.Wallet;
using System;
using System.Threading.Tasks;
using UnityEngine;

public class WalletService : MonoBehaviour
{
    public event Action<Account> OnLogin;
    public event Action OnLogout;
    public event Action<double> OnBalanceChanged;

    public bool IsConnected => Web3.Wallet != null;
    public PublicKey Address => Web3.Wallet?.Account.PublicKey;

    void Start()
    {
        Web3.OnLogin += a => OnLogin?.Invoke(a);
        Web3.OnLogout += () => OnLogout?.Invoke();
        Web3.OnBalanceChange += b => OnBalanceChanged?.Invoke(b);
    }

    public async Task<bool> Connect(WalletType type)
    {
        try
        {
            object wallet = type switch
            {
                WalletType.Phantom => await Web3.Instance.LoginPhantom(),
                WalletType.WalletAdapter => await Web3.Instance.LoginWalletAdapter(),
                WalletType.InGame => await Web3.Instance.LoginInGameWallet("password"),
                WalletType.Web3Auth => await Web3.Instance.LoginWeb3Auth(Provider.GOOGLE),
                _ => null
            };
            return wallet != null;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Connection failed: {ex.Message}");
            return false;
        }
    }

    public async Task Disconnect() => await Web3.Instance.Logout();
}

public enum WalletType { Phantom, WalletAdapter, InGame, Web3Auth }
```

---

## RPC Operations

### Reading Accounts

```csharp
public class AccountReader
{
    public async Task<double> GetBalance(PublicKey address)
    {
        var result = await Web3.Rpc.GetBalanceAsync(address);
        if (!result.WasSuccessful) throw new Exception(result.Reason);
        return result.Result.Value / 1_000_000_000.0;
    }

    public async Task<AccountInfo> GetAccountInfo(PublicKey address)
    {
        var result = await Web3.Rpc.GetAccountInfoAsync(address);
        return result.WasSuccessful ? result.Result.Value : null;
    }

    public async Task<List<AccountInfo>> GetMultipleAccounts(PublicKey[] addresses)
    {
        var result = await Web3.Rpc.GetMultipleAccountsAsync(addresses);
        return result.WasSuccessful ? result.Result.Value : new();
    }

    public async Task<List<TokenAccount>> GetTokenAccounts(PublicKey owner)
    {
        var result = await Web3.Rpc.GetTokenAccountsByOwnerAsync(owner,
            tokenProgramId: TokenProgram.ProgramIdKey);
        return result.WasSuccessful ? result.Result.Value : new();
    }
}
```

### Account Deserialization

```csharp
using System;
using System.Buffers.Binary;

[Serializable]
public struct GameAccount
{
    public PublicKey Authority, Player;
    public ulong Score;
    public uint Level;
    public byte State;
    public long LastPlayed;
}

public static GameAccount Deserialize(byte[] data)
{
    var span = data.AsSpan();
    int offset = 8; // Skip discriminator

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

static PublicKey ReadPublicKey(ReadOnlySpan<byte> data, ref int offset)
{
    var key = new PublicKey(data.Slice(offset, 32).ToArray());
    offset += 32;
    return key;
}
```

---

## Transaction Building

### SOL Transfer

```csharp
public async Task<string> TransferSol(PublicKey to, ulong lamports)
{
    var blockHash = await Web3.Rpc.GetLatestBlockHashAsync();

    var tx = new TransactionBuilder()
        .SetRecentBlockHash(blockHash.Result.Value.Blockhash)
        .SetFeePayer(Web3.Account)
        .AddInstruction(SystemProgram.Transfer(Web3.Account.PublicKey, to, lamports))
        .Build(Web3.Account);

    return (await Web3.Wallet.SignAndSendTransaction(tx)).Result;
}
```

### Token Transfer

```csharp
public async Task<string> TransferToken(PublicKey mint, PublicKey toOwner, ulong amount)
{
    var fromAta = AssociatedTokenAccountProgram.DeriveAssociatedTokenAccount(
        Web3.Account.PublicKey, mint);
    var toAta = AssociatedTokenAccountProgram.DeriveAssociatedTokenAccount(toOwner, mint);
    var blockHash = await Web3.Rpc.GetLatestBlockHashAsync();

    var txBuilder = new TransactionBuilder()
        .SetRecentBlockHash(blockHash.Result.Value.Blockhash)
        .SetFeePayer(Web3.Account);

    // Create ATA if needed
    if ((await Web3.Rpc.GetAccountInfoAsync(toAta)).Result?.Value == null)
        txBuilder.AddInstruction(AssociatedTokenAccountProgram.CreateAssociatedTokenAccount(
            Web3.Account.PublicKey, toOwner, mint));

    txBuilder.AddInstruction(TokenProgram.Transfer(fromAta, toAta, amount,
        Web3.Account.PublicKey));

    return (await Web3.Wallet.SignAndSendTransaction(txBuilder.Build(Web3.Account))).Result;
}
```

### Custom Program Instructions

```csharp
public TransactionInstruction CreateGameInstruction(
    PublicKey programId, PublicKey gameAccount, PublicKey player, uint move)
{
    // Discriminator (8 bytes) + move (4 bytes)
    var data = new byte[12];
    new byte[] { 213, 157, 193, 142, 228, 56, 248, 150 }.CopyTo(data, 0);
    BitConverter.GetBytes(move).CopyTo(data, 8);

    return new TransactionInstruction
    {
        ProgramId = programId,
        Keys = new List<AccountMeta>
        {
            AccountMeta.Writable(gameAccount, false),
            AccountMeta.ReadOnly(player, true),
        },
        Data = data
    };
}
```

### PDA Derivation

```csharp
public static PublicKey FindGamePDA(PublicKey programId, PublicKey player)
{
    PublicKey.TryFindProgramAddress(
        new[] { Encoding.UTF8.GetBytes("game"), player.KeyBytes },
        programId,
        out var pda,
        out _
    );
    return pda;
}
```

---

## NFT Integration

### NFT Loading

```csharp
using Solana.Unity.SDK.Nft;
using UnityEngine;
using UnityEngine.Networking;

public class NFTManager : MonoBehaviour
{
    private static readonly Dictionary<string, Texture2D> _textureCache = new();

    public async Task<List<Nft>> GetOwnedNFTs(PublicKey owner)
    {
        try { return await Nft.TryGetNftsByOwnerAsync(owner, Web3.Rpc) ?? new(); }
        catch { return new(); }
    }

    public async Task<Nft> GetNFT(PublicKey mint)
    {
        try { return await Nft.TryGetNftData(mint, Web3.Rpc); }
        catch { return null; }
    }

    public async Task<Texture2D> LoadNFTTexture(string uri)
    {
        if (_textureCache.TryGetValue(uri, out var cached)) return cached;

        using var request = UnityWebRequestTexture.GetTexture(uri);
        var op = request.SendWebRequest();
        while (!op.isDone) await Task.Yield();

        if (request.result == UnityWebRequest.Result.Success)
        {
            var texture = DownloadHandlerTexture.GetContent(request);
            _textureCache[uri] = texture;
            return texture;
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

    public async Task SubscribeToAccount(PublicKey account, Action<AccountInfo> onUpdate)
    {
        var sub = await Web3.Rpc.SubscribeAccountInfoAsync(account,
            (_, info) => MainThread.Run(() => onUpdate(info)), Commitment.Confirmed);
        _subscriptions.Add(sub);
    }

    public async Task SubscribeToLogs(PublicKey programId, Action<LogInfo> onLog)
    {
        var sub = await Web3.Rpc.SubscribeLogInfoAsync(programId,
            (_, log) => MainThread.Run(() => onLog(log)));
        _subscriptions.Add(sub);
    }

    void OnDestroy()
    {
        foreach (var sub in _subscriptions) sub?.Unsubscribe();
        _subscriptions.Clear();
    }
}

public static class MainThread
{
    private static SynchronizationContext _context;

    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
    static void Init() => _context = SynchronizationContext.Current;

    public static void Run(Action action) => _context?.Post(_ => action(), null);
}
```

---

## Platform-Specific Code

```csharp
#if UNITY_WEBGL
public async Task<bool> ConnectBrowser() => await Web3.Instance.LoginWalletAdapter() != null;
#endif

#if UNITY_IOS || UNITY_ANDROID
public async Task<bool> ConnectMobile() => await Web3.Instance.LoginPhantom() != null;
#endif

#if UNITY_EDITOR
public async Task<bool> ConnectDev() => await Web3.Instance.LoginInGameWallet("devpass") != null;
#endif
```

---

## Common Patterns

### Retry with Exponential Backoff

```csharp
public async Task<T> WithRetry<T>(Func<Task<T>> op, int maxAttempts = 3)
{
    for (int i = 0; i < maxAttempts; i++)
    {
        try { return await op(); }
        catch when (i < maxAttempts - 1) { await Task.Delay(1000 * (i + 1)); }
    }
    throw new Exception("Max retry attempts exceeded");
}
```

### Transaction Confirmation

```csharp
public async Task<bool> WaitForConfirmation(string sig, int timeoutSec = 30)
{
    var deadline = DateTime.UtcNow.AddSeconds(timeoutSec);
    while (DateTime.UtcNow < deadline)
    {
        var status = await Web3.Rpc.GetSignatureStatusesAsync(new[] { sig });
        var conf = status.Result?.Value?[0]?.ConfirmationStatus;
        if (conf is "confirmed" or "finalized") return true;
        await Task.Delay(1000);
    }
    return false;
}
```

### RPC Call Optimization

```csharp
// Bad: Sequential calls
var balance1 = await rpc.GetBalanceAsync(address1);
var balance2 = await rpc.GetBalanceAsync(address2);

// Good: Parallel calls
var tasks = new[] {
    rpc.GetBalanceAsync(address1),
    rpc.GetBalanceAsync(address2)
};
var results = await Task.WhenAll(tasks);

// Better: Use getMultipleAccounts
var accounts = await rpc.GetMultipleAccountsAsync(new[] { address1, address2 });
```

---

## Error Handling

```csharp
public enum BlockchainError
{
    NetworkError,
    InsufficientFunds,
    TransactionFailed,
    AccountNotFound,
    Timeout
}

public class BlockchainException : Exception
{
    public BlockchainError ErrorType { get; }

    public BlockchainException(BlockchainError type, string message) : base(message)
    {
        ErrorType = type;
    }
}

// Usage
try
{
    await SendTransaction(tx);
}
catch (BlockchainException ex) when (ex.ErrorType == BlockchainError.InsufficientFunds)
{
    ShowMessage("Not enough SOL for transaction");
}
```

---

## Network Configuration

```csharp
public static class SolanaNetwork
{
    public const string Mainnet = "https://api.mainnet-beta.solana.com";
    public const string Devnet = "https://api.devnet.solana.com";
    public const string Testnet = "https://api.testnet.solana.com";

    // Recommended: Use private RPC for production
    // Helius, QuickNode, Triton, etc.
}
```
