# Unity Testing for Solana Games

Testing patterns and workflows for Unity game development with Solana integration.

---

## Test Structure

| Location | Use For |
|----------|---------|
| `Tests/EditMode/` | Pure C# logic, deserialization, calculations |
| `Tests/PlayMode/` | MonoBehaviours, coroutines, scene-dependent code |
| `Tests/*/TestDoubles/` | Stubs, Spies, Dummies, Fakes, Mocks |
| `Tests/Scenes/` | Test-specific scene files |

---

## TDD Workflow (6 Phases)

### Phase 1: RED - Write Failing Test

```csharp
[Test]
public void Calculate_WithValidInput_ReturnsExpected()
{
    var sut = new Calculator();  // Class doesn't exist yet

    var actual = sut.Calculate(10, 2);

    Assert.That(actual, Is.EqualTo(12));
}
```

### Phase 2: GREEN - Make Test Pass

Write minimal production code to pass - no more.

```csharp
public class Calculator
{
    public int Calculate(int a, int b) => a + b;
}
```

### Phase 3: REFACTOR - Clean Up

Improve code structure without changing behavior, keeping tests green.

### Phase 4: Iterate

Return to Phase 1 for next test case. Build up functionality incrementally.

### Phase 5: Integration

After unit tests pass, run integration tests. For Unity: run Play Mode tests.

### Phase 6: Review

Review test coverage, check for missing edge cases, remove redundant tests.

---

## Test Naming

Pattern: `MethodName_Condition_ExpectedResult`

```csharp
[Test]
public void Deserialize_ValidData_ReturnsCorrectScore() { }

[Test]
public void Connect_WhenAlreadyConnected_ReturnsTrue() { }

[Test]
public void SendTransaction_InsufficientFunds_ThrowsException() { }

// Test class naming: TargetClassName + "Test"
[TestFixture]
public class PlayerAccountTest { }
```

---

## Test Design Rules

1. **AAA Pattern**: Arrange, Act, Assert (blank line separation, no comments needed)
2. **Single Assert**: One assertion per test method
3. **Constraint Model**: Use `Assert.That(actual, Is.EqualTo(expected))`
4. **No Message Parameter**: Test name and constraint should convey intent
5. **No Control Flow**: Never use `if`, `switch`, `for`, `foreach`, or ternary in tests
6. **Parameterized Tests**: Use `[TestCase]`, `[TestCaseSource]`, `[Values]` for variations

---

## Test Variable Naming

| Role | Name |
|------|------|
| System Under Test | `sut` |
| Actual result | `actual` |
| Expected value | `expected` |
| Test doubles | `stub*`, `spy*`, `dummy*`, `fake*`, `mock*` |

---

## Edit Mode Test Pattern

```csharp
using NUnit.Framework;

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

---

## Play Mode Test Pattern

```csharp
using System.Collections;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;

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

    [UnityTest]
    public IEnumerator ConnectButton_WhenClicked_ShowsLoading()
    {
        _sut.OnConnectClicked();

        yield return null;

        Assert.That(_sut.IsLoading, Is.True);
    }
}
```

---

## Account Deserialization Test

```csharp
[TestFixture]
public class PlayerAccountTest
{
    [Test]
    public void Deserialize_ValidData_ReturnsCorrectScore()
    {
        var data = CreateTestData(score: 1000);

        var account = PlayerAccount.Deserialize(data);

        Assert.That(account.Score, Is.EqualTo(1000UL));
    }

    [TestCase(0UL)]
    [TestCase(1000UL)]
    [TestCase(ulong.MaxValue)]
    public void Deserialize_VariousScores_ParsesCorrectly(ulong expected)
    {
        var data = CreateTestData(score: expected);

        var account = PlayerAccount.Deserialize(data);

        Assert.That(account.Score, Is.EqualTo(expected));
    }

    private byte[] CreateTestData(ulong score)
    {
        var data = new byte[100];
        BitConverter.GetBytes(score).CopyTo(data, 40);
        return data;
    }
}
```

---

## Async Exception Testing

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

---

## Test Doubles Directory

```
Assets/
├── _Game/
│   └── Tests/
│       ├── EditMode/
│       │   ├── TestDoubles/
│       │   │   ├── StubWalletService.cs
│       │   │   └── SpyTransactionService.cs
│       │   └── PlayerAccountTest.cs
│       └── PlayMode/
│           ├── TestDoubles/
│           │   └── FakeRpcClient.cs
│           └── WalletUITest.cs
```

### Stub Example

```csharp
public class StubRpcClient : IRpcClient
{
    public Task<AccountInfo> GetAccountInfoAsync(PublicKey pubkey)
    {
        return Task.FromResult(new AccountInfo { /* test data */ });
    }
}
```

---

## Test Categories

```csharp
[TestFixture]
[Category("Unit")]
public class UnitTests { }

[TestFixture]
[Category("Integration")]
public class IntegrationTests { }

[TestFixture]
[Category("Blockchain")]
public class BlockchainTests { }
```

---

## Unity Test Attributes

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

---

## Running Tests

### All Tests

```bash
unity-editor -runTests -batchmode -nographics \
    -projectPath . \
    -testResults TestResults.xml \
    -logFile test.log
```

### Edit Mode Only

```bash
unity-editor -runTests -batchmode -nographics \
    -projectPath . \
    -testPlatform EditMode \
    -testResults EditModeResults.xml \
    -logFile editmode.log
```

### Play Mode Only

```bash
unity-editor -runTests -batchmode -nographics \
    -projectPath . \
    -testPlatform PlayMode \
    -testResults PlayModeResults.xml \
    -logFile playmode.log
```

### Specific Test Filter

```bash
unity-editor -runTests -batchmode -nographics \
    -projectPath . \
    -testFilter "WalletServiceTest" \
    -testResults Results.xml \
    -logFile test.log
```

---

## Test Result Handling

| Result | Action |
|--------|--------|
| **Passed** | Continue |
| **Failed** | Investigate and fix |
| **Inconclusive** | Treat as failure |
| **Skipped** | Ignore |

### Two-Strike Rule

If a test fails twice consecutively:
1. **STOP** immediately
2. Present error output
3. Show the code change made
4. Ask for user guidance

---

## Test Output Tagging

Write tests with unique IDs for precise filtering:

```csharp
[Test]
public void CalculateReward_WithMultiplier_ReturnsScaledAmount()
{
    var testId = "TEST-REWARD-CALC-001";
    Console.WriteLine($"[{testId}] Starting test execution");

    try
    {
        var sut = new RewardCalculator();
        var actual = sut.Calculate(100UL, 1.5f);

        Console.WriteLine($"[{testId}] Result: {actual}");
        Assert.That(actual, Is.EqualTo(150UL));
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[{testId}-FAIL] Error: {ex.Message}");
        throw;
    }
}
```

---

## Common Issues

### Tests Not Found

```bash
# Ensure assembly definitions are correct
find . -name "*.asmdef" -exec grep -l "Test" {} \;

# Check test assembly references
cat Assets/**/Tests/**/*.asmdef
```

### Play Mode Tests Timeout

```csharp
[UnityTest]
[Timeout(30000)] // 30 seconds
public IEnumerator LongRunningTest()
{
    // ...
}
```

---

## CI Test Script

```bash
#!/bin/bash
set -e

echo "Running CI Test Suite"

# Edit Mode tests (fast)
unity-editor -runTests -batchmode -nographics \
    -projectPath . \
    -testPlatform EditMode \
    -testResults EditModeResults.xml \
    -logFile editmode.log

# Play Mode tests
unity-editor -runTests -batchmode -nographics \
    -projectPath . \
    -testPlatform PlayMode \
    -testResults PlayModeResults.xml \
    -logFile playmode.log

echo "Tests complete!"
```

---

## Test Checklist

Before merging:

- [ ] All Edit Mode tests pass
- [ ] All Play Mode tests pass
- [ ] No new test warnings
- [ ] Test coverage maintained (80%+ recommended)
- [ ] New features have tests
- [ ] Blockchain integration tests pass (if applicable)
