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

// MonoBehaviour in file must match filename
// File: PlayerController.cs
public class PlayerController : MonoBehaviour { }
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
    _statusText.text = success ? "Connected" : "Failed"; // UI update
}
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

## Testing Rules

### Test Naming

```csharp
// Pattern: MethodName_Condition_ExpectedResult
[Test]
public void Deserialize_ValidData_ReturnsCorrectScore() { }

[Test]
public void Connect_WhenAlreadyConnected_ReturnsTrue() { }
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

## Avoid

```csharp
// Don't use regions
#region Bad Practice
#endregion

// Don't use var for unclear types
var x = GetSomething(); // What type is x?

// Don't block on async code
var result = GetDataAsync().Result; // Can deadlock

// Do await properly
var result = await GetDataAsync();
```

## Token Optimization

When reading files, extract only what's needed:

- From `.csproj`: `PackageReference`, `TargetFramework`, `ProjectReference`
- **NEVER read**: `.Designer.cs`, `obj/`, `bin/`

---

**Remember**: These rules ensure code safety, maintainability, and Unity compatibility.
