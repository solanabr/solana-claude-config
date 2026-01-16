---
globs:
  - "**/*.cs"
  - "**/*.csproj"
  - "**/*.sln"
  - "**/Directory.Build.props"
---

# .NET/C# Development Rules

These rules apply when working with C# files in Unity or standard .NET projects.

## Important Rules

- ALL instructions in this document MUST be followed
- DO NOT edit more code than required to fulfill the request
- DO NOT waste tokens - be clear, concise, and surgical
- DO NOT assume - ask for clarification if ambiguous

## .NET Runtime Configuration

- **Target SDK**: .NET 9 (stable) or as specified in `global.json`
- If `global.json` exists, use the version it defines
- For multi-target frameworks, build/test against highest compatible target

## Build → Respond → Iterate Workflow

Operate in tight feedback loops:

1. **Make Change**: Surgical edit, minimal scope
2. **Build**: `dotnet build --no-restore --nologo --verbosity minimal`
3. **If Fails**: Retry once if obvious (typo, missing ref), then **STOP and ask**
4. **Test**: `dotnet test --no-build --nologo --verbosity minimal`
5. **If Fails**: Run `rg` failure scan, fix if obvious, else **STOP and ask**

### Two-Strike Rule

If same issue fails twice:
- **STOP** immediately
- Present error output and code change
- Ask for guidance

## Restore Rules

Run `dotnet restore` before build/test if:
- Project was cloned
- `.csproj`, `.sln`, `Directory.Packages.props`, or `packages.config` changed

## Code Style

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Classes, Structs, Enums | PascalCase | `PlayerAccount`, `WalletState` |
| Interfaces | IPascalCase | `IWalletService`, `IRpcClient` |
| Methods | PascalCase | `ConnectWallet()`, `GetBalance()` |
| Properties | PascalCase | `IsConnected`, `WalletAddress` |
| Public Fields | PascalCase | `MaxRetries`, `DefaultTimeout` |
| Private Fields | _camelCase | `_walletService`, `_isConnected` |
| Static Fields | s_camelCase | `s_instance`, `s_defaultConfig` |
| Parameters | camelCase | `walletAddress`, `tokenAmount` |
| Local Variables | camelCase | `balance`, `transactionResult` |
| Constants | PascalCase | `MaxConnections`, `DefaultRpcUrl` |

### Boolean Naming

Prefix booleans with verbs indicating state:

```csharp
// Good
public bool IsConnected { get; }
public bool HasPendingTransaction { get; }
public bool CanSign { get; }
private bool _wasInitialized;

// Avoid
public bool Connected { get; }
public bool Pending { get; }
```

### Unity-Specific

```csharp
// Serialized fields with backing property
[field: SerializeField]
public int Health { get; private set; } = 100;

// Multiple attributes on backing field
[field: SerializeField]
[field: Range(0, 100)]
[field: Tooltip("Player health points")]
public int MaxHealth { get; private set; } = 100;

// MonoBehaviour in file must match filename
// File: PlayerController.cs
public class PlayerController : MonoBehaviour { }
```

## Structure

### File Organization

```csharp
// 1. Using statements (sorted)
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Solana.Unity.SDK;
using UnityEngine;

// 2. Namespace (matches folder structure)
namespace MyGame.Blockchain
{
    // 3. One public class per file
    public class WalletManager : MonoBehaviour
    {
        // 4. Constants
        private const int MaxRetries = 3;

        // 5. Static fields
        private static WalletManager s_instance;

        // 6. Serialized fields
        [SerializeField] private WalletConfig _config;

        // 7. Private fields
        private bool _isConnected;
        private Account _account;

        // 8. Properties
        public static WalletManager Instance => s_instance;
        public bool IsConnected => _isConnected;

        // 9. Events
        public event Action<Account> OnConnected;

        // 10. Unity lifecycle methods
        private void Awake() { }
        private void Start() { }
        private void Update() { }
        private void OnDestroy() { }

        // 11. Public methods
        public async Task<bool> Connect() { }

        // 12. Private methods
        private void HandleConnection() { }
    }
}
```

### Project Structure (Unity)

```
Assets/
├── _Game/                          # Game-specific code
│   ├── Scripts/
│   │   ├── Runtime/
│   │   │   ├── _Game.asmdef       # Main assembly
│   │   │   ├── Core/              # Managers, state
│   │   │   ├── Blockchain/        # Solana integration
│   │   │   ├── UI/                # UI components
│   │   │   └── Gameplay/          # Game mechanics
│   │   └── Editor/
│   │       └── _Game.Editor.asmdef
│   └── Tests/
│       ├── EditMode/
│       │   └── _Game.Tests.asmdef
│       └── PlayMode/
│           └── _Game.PlayMode.Tests.asmdef
```

## Design Patterns

### Early Return

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

### Async/Await

```csharp
// Always use ConfigureAwait(false) in library code
public async Task<Balance> GetBalanceAsync()
{
    var result = await _rpc.GetBalanceAsync(_address).ConfigureAwait(false);
    return result.Value;
}

// In Unity MonoBehaviours, stay on main thread (no ConfigureAwait)
public async void OnConnectClicked()
{
    var success = await _walletService.Connect();
    _statusText.text = success ? "Connected" : "Failed"; // UI update on main thread
}
```

### Null Handling

```csharp
// Use null-conditional and null-coalescing
var balance = account?.Balance ?? 0;
var address = wallet?.Address?.ToString() ?? "Not connected";

// Use pattern matching for null checks
if (result is { IsSuccess: true, Value: var value })
{
    ProcessValue(value);
}
```

### Events

```csharp
// Use System.Action for events
public event Action OnDisconnected;
public event Action<Account> OnConnected;
public event Action<double> OnBalanceChanged;

// Invoke safely
private void RaiseConnected(Account account)
{
    OnConnected?.Invoke(account);
}

// Handler naming: Subject_Event
private void WalletService_OnConnected(Account account)
{
    UpdateUI();
}
```

## Blockchain-Specific

### Transaction Building

```csharp
// Use builder pattern
var transaction = new TransactionBuilder()
    .SetRecentBlockHash(blockHash)
    .SetFeePayer(payer)
    .AddInstruction(instruction1)
    .AddInstruction(instruction2)
    .Build(signers);
```

### Error Handling

```csharp
// Wrap blockchain calls with specific error handling
public async Task<TransactionResult> SendTransaction(Transaction tx)
{
    try
    {
        var signature = await _wallet.SignAndSendTransaction(tx);
        return TransactionResult.Success(signature);
    }
    catch (RpcException ex) when (ex.Message.Contains("insufficient funds"))
    {
        return TransactionResult.Failure(TransactionError.InsufficientFunds);
    }
    catch (TimeoutException)
    {
        return TransactionResult.Failure(TransactionError.Timeout);
    }
    catch (Exception ex)
    {
        Debug.LogError($"Transaction failed: {ex.Message}");
        return TransactionResult.Failure(TransactionError.Unknown);
    }
}
```

### Account Deserialization

```csharp
// Use explicit offset tracking
public static PlayerData Deserialize(ReadOnlySpan<byte> data)
{
    var offset = 8; // Skip discriminator

    return new PlayerData
    {
        Owner = new PublicKey(data.Slice(offset, 32)),
        Score = BinaryPrimitives.ReadUInt64LittleEndian(data.Slice(offset += 32, 8)),
        Level = BinaryPrimitives.ReadUInt32LittleEndian(data.Slice(offset += 8, 4)),
    };
}
```

## Testing Rules

### Test Naming

```csharp
// Pattern: MethodName_Condition_ExpectedResult
[Test]
public void Deserialize_ValidData_ReturnsCorrectScore() { }

[Test]
public void Connect_WhenAlreadyConnected_ReturnsTrue() { }

[Test]
public void SendTransaction_InsufficientFunds_ThrowsException() { }
```

### Test Structure (AAA)

```csharp
[Test]
public void CalculateReward_WithMultiplier_ReturnsScaledAmount()
{
    // Arrange
    var calculator = new RewardCalculator();
    var baseReward = 100UL;
    var multiplier = 1.5f;

    // Act
    var result = calculator.Calculate(baseReward, multiplier);

    // Assert
    Assert.That(result, Is.EqualTo(150UL));
}
```

### Unity Test Attributes

```csharp
[TestFixture]                    // Required for test class
[Test]                           // Synchronous test
[UnityTest]                      // Async/coroutine test
[TestCase(1), TestCase(2)]       // Parameterized test
[Category("Unit")]               // Test category
[Timeout(5000)]                  // Timeout in ms
[SetUp]                          // Before each test
[TearDown]                       // After each test
[OneTimeSetUp]                   // Before all tests
[OneTimeTearDown]                // After all tests
```

## Avoid

```csharp
// ❌ Don't use regions
#region Bad Practice
#endregion

// ❌ Don't use var for unclear types
var x = GetSomething(); // What type is x?

// ✅ Use var only when type is obvious
var balance = 100.0; // Clearly a double
var accounts = new List<Account>(); // Clearly a List

// ❌ Don't ignore async warnings
public void BadAsync() // Should be async Task
{
    _ = SomeAsyncMethod(); // Fire and forget is dangerous
}

// ✅ Proper async handling
public async Task GoodAsync()
{
    await SomeAsyncMethod();
}

// ❌ Don't block on async code
var result = GetDataAsync().Result; // Can deadlock

// ✅ Await properly
var result = await GetDataAsync();
```

## Token Optimization

When reading files, extract only what's needed:

- From `.csproj`: `PackageReference`, `TargetFramework`, `ProjectReference`, `OutputType`
- **NEVER read**: `.Designer.cs`, `obj/`, `bin/`
- Only read `AssemblyInfo.cs` if explicitly requested
- Omit comments, logging, debug lines unless user includes them

## Focused Failure Analysis

Use `rg` (ripgrep) to extract only essential test output:

```bash
dotnet test --no-build --verbosity normal | rg -e "Failed" -e "Error Message:" -e "Stack trace:" -C 4
```

## Test Output Tagging

Write tests with unique IDs for precise filtering:

```csharp
[Test]
public void Calculate_WithValidInput_ReturnsExpected()
{
    var testId = "TEST-CALC-001";
    Console.WriteLine($"[{testId}] Starting test");

    try
    {
        // Test logic
        Console.WriteLine($"[{testId}] Result: {result}");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[{testId}-FAIL] Error: {ex.Message}");
        throw;
    }
}
```

Filter with: `dotnet test | rg "\[TEST-CALC-001"`

## Modern C# Features (C# 12/13)

Use modern patterns where appropriate:

```csharp
// Primary constructors
public class WalletService(IRpcClient rpc, ILogger logger)
{
    public async Task<Balance> GetBalance() => await rpc.GetBalanceAsync();
}

// Collection expressions
List<int> numbers = [1, 2, 3, 4, 5];
int[] array = [..existingList, 6, 7];

// Pattern matching
if (result is { IsSuccess: true, Value: var value })
{
    Process(value);
}

// File-scoped namespaces
namespace MyGame.Blockchain;

public class TransactionBuilder { }
```

## Dependency Management

```bash
# Add package
dotnet add package <name> --version <x.y.z>

# Remove package
dotnet remove package <name>

# Add project reference
dotnet add reference ../OtherProject/OtherProject.csproj
```

## Code Quality Commands

```bash
# Format
dotnet format

# Treat warnings as errors
dotnet build -warnaserror
```

## Environment Configuration

Check these files for configuration:
- `Properties/launchSettings.json` - Environment hints
- `appsettings.json` - Runtime settings
- `global.json` - SDK pinning

## XML Documentation

```csharp
/// <summary>
/// Connects to a Solana wallet using the specified adapter.
/// </summary>
/// <param name="adapterType">The type of wallet adapter to use.</param>
/// <returns>True if connection succeeded, false otherwise.</returns>
/// <exception cref="WalletException">Thrown when wallet is unavailable.</exception>
public async Task<bool> Connect(WalletAdapterType adapterType)
{
    // Implementation
}

// For interface implementations, use inheritdoc
/// <inheritdoc/>
public async Task<bool> Connect(WalletAdapterType adapterType)
{
    // Implementation
}
```

## Performance

```csharp
// Cache frequently accessed data
private PublicKey _cachedAddress;
public PublicKey Address => _cachedAddress ??= DeriveAddress();

// Use object pooling for frequent allocations
private readonly Queue<NFTCard> _cardPool = new();

// Avoid allocations in Update loops
private readonly List<Enemy> _tempEnemyList = new(); // Reuse list

void Update()
{
    _tempEnemyList.Clear();
    GetActiveEnemies(_tempEnemyList); // Fills existing list
}
```
