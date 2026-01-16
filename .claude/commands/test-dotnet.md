---
description: "Run .NET/C# tests for Unity projects and backend services"
---

You are running .NET/C# tests. This command covers Unity Test Framework (Edit Mode and Play Mode) and standard .NET testing.

## Related Skills

- [unity.md](../skills/unity.md) - Unity patterns and testing
- [playsolana.md](../skills/playsolana.md) - PlaySolana specifics

## Step 1: Identify Project Type

```bash
echo "🔍 Detecting .NET project type..."

if [ -f "ProjectSettings/ProjectVersion.txt" ]; then
    echo "🎮 Unity project detected"
    PROJECT_TYPE="unity"
    cat ProjectSettings/ProjectVersion.txt
elif [ -f "*.sln" ] || [ -f "*.csproj" ]; then
    echo "📦 .NET solution/project detected"
    PROJECT_TYPE="dotnet"
else
    echo "❓ No .NET project found"
    exit 1
fi
```

---

## Unity Test Framework

### Run All Tests

```bash
echo "🧪 Running Unity tests..."

# Run all tests (Edit Mode + Play Mode)
unity-editor -runTests -batchmode -nographics \
    -projectPath . \
    -testResults TestResults.xml \
    -logFile test.log

# Check results
if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Some tests failed"
    # Parse results
    grep -E "Failed|Error" test.log | head -20
fi
```

### Run Edit Mode Tests Only

```bash
echo "📝 Running Edit Mode tests..."

unity-editor -runTests -batchmode -nographics \
    -projectPath . \
    -testPlatform EditMode \
    -testResults EditModeResults.xml \
    -logFile editmode.log

if [ $? -eq 0 ]; then
    echo "✅ Edit Mode tests passed!"
else
    echo "❌ Edit Mode tests failed"
    grep -E "Failed|Error" editmode.log | head -20
fi
```

### Run Play Mode Tests Only

```bash
echo "🎮 Running Play Mode tests..."

unity-editor -runTests -batchmode -nographics \
    -projectPath . \
    -testPlatform PlayMode \
    -testResults PlayModeResults.xml \
    -logFile playmode.log

if [ $? -eq 0 ]; then
    echo "✅ Play Mode tests passed!"
else
    echo "❌ Play Mode tests failed"
    grep -E "Failed|Error" playmode.log | head -20
fi
```

### Run Specific Test Assembly

```bash
# Run tests from specific assembly
unity-editor -runTests -batchmode -nographics \
    -projectPath . \
    -testPlatform EditMode \
    -assemblyNames "MyGame.Tests" \
    -testResults Results.xml \
    -logFile test.log
```

### Run Specific Test Class or Method

```bash
# Run specific test class
unity-editor -runTests -batchmode -nographics \
    -projectPath . \
    -testFilter "WalletServiceTest" \
    -testResults Results.xml \
    -logFile test.log

# Run specific test method
unity-editor -runTests -batchmode -nographics \
    -projectPath . \
    -testFilter "WalletServiceTest.Connect_WithValidCredentials_ReturnsTrue" \
    -testResults Results.xml \
    -logFile test.log
```

### Parse Test Results

```bash
echo "📊 Parsing test results..."

if [ -f "TestResults.xml" ]; then
    # Count results
    TOTAL=$(grep -c "test-case" TestResults.xml || echo "0")
    PASSED=$(grep -c 'result="Passed"' TestResults.xml || echo "0")
    FAILED=$(grep -c 'result="Failed"' TestResults.xml || echo "0")

    echo "Total: $TOTAL | Passed: $PASSED | Failed: $FAILED"

    # Show failed tests
    if [ "$FAILED" -gt 0 ]; then
        echo ""
        echo "❌ Failed tests:"
        grep -B1 'result="Failed"' TestResults.xml | grep "name=" | head -10
    fi
fi
```

---

## Standard .NET Testing

### Run All Tests

```bash
echo "🧪 Running .NET tests..."

# Restore and build first
dotnet restore
dotnet build --no-restore --configuration Release

# Run tests
dotnet test --no-build --configuration Release \
    --logger "console;verbosity=normal" \
    --results-directory TestResults

if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Some tests failed"
fi
```

### Run Tests with Coverage

```bash
echo "📊 Running tests with coverage..."

dotnet test --no-build --configuration Release \
    --collect:"XPlat Code Coverage" \
    --results-directory TestResults

# Generate report (requires reportgenerator)
if command -v reportgenerator &> /dev/null; then
    reportgenerator \
        -reports:"TestResults/**/coverage.cobertura.xml" \
        -targetdir:"TestResults/CoverageReport" \
        -reporttypes:Html

    echo "📁 Coverage report: TestResults/CoverageReport/index.html"
fi
```

### Run Specific Test Project

```bash
# Run specific test project
dotnet test src/MyProject.Tests/MyProject.Tests.csproj \
    --no-build \
    --verbosity normal
```

### Run Tests with Filter

```bash
# Run by category
dotnet test --filter "Category=Unit"

# Run by fully qualified name
dotnet test --filter "FullyQualifiedName~WalletService"

# Run by test name
dotnet test --filter "Name~Connect"

# Combine filters
dotnet test --filter "Category=Integration&Name~Wallet"
```

### Focused Failure Analysis

```bash
echo "🔍 Analyzing test failures..."

# Run tests and capture output
dotnet test --no-build --verbosity normal 2>&1 | tee test_output.txt

# Extract failures
echo ""
echo "❌ Failed tests summary:"
grep -E "Failed|Error Message:|Stack Trace:" test_output.txt | head -30
```

---

## Unity Test Patterns

### Edit Mode Test Structure

```csharp
using NUnit.Framework;

[TestFixture]
public class PlayerAccountTest
{
    [Test]
    public void Deserialize_ValidData_ReturnsCorrectScore()
    {
        // Arrange
        var data = CreateTestData(score: 1000);

        // Act
        var account = PlayerAccount.Deserialize(data);

        // Assert
        Assert.That(account.Score, Is.EqualTo(1000));
    }

    [TestCase(0)]
    [TestCase(100)]
    [TestCase(ulong.MaxValue)]
    public void Deserialize_VariousScores_ParsesCorrectly(ulong expectedScore)
    {
        var data = CreateTestData(score: expectedScore);

        var account = PlayerAccount.Deserialize(data);

        Assert.That(account.Score, Is.EqualTo(expectedScore));
    }

    private byte[] CreateTestData(ulong score)
    {
        // Create test byte array
        var data = new byte[100];
        BitConverter.GetBytes(score).CopyTo(data, 40);
        return data;
    }
}
```

### Play Mode Test Structure

```csharp
using System.Collections;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;

[TestFixture]
public class WalletUITest
{
    private GameObject _testObject;
    private WalletConnectUI _ui;

    [SetUp]
    public void SetUp()
    {
        _testObject = new GameObject("TestUI");
        _ui = _testObject.AddComponent<WalletConnectUI>();
    }

    [TearDown]
    public void TearDown()
    {
        Object.Destroy(_testObject);
    }

    [UnityTest]
    public IEnumerator Initialize_SetsDisconnectedState()
    {
        yield return null; // Wait one frame

        Assert.That(_ui.IsConnected, Is.False);
    }

    [UnityTest]
    public IEnumerator ConnectButton_WhenClicked_ShowsLoading()
    {
        // Simulate button click
        _ui.OnConnectClicked();

        yield return null;

        Assert.That(_ui.IsLoading, Is.True);
    }
}
```

### Test Doubles Directory Structure

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

---

## Test Categories

Use categories to organize tests:

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

Run by category:

```bash
# Unity
unity-editor -runTests -batchmode -nographics \
    -projectPath . \
    -testCategory "Unit" \
    -logFile test.log

# .NET
dotnet test --filter "Category=Unit"
```

---

## CI Test Script

```bash
#!/bin/bash
set -e

echo "🧪 Running CI Test Suite"
echo "========================"

# For Unity projects
if [ -f "ProjectSettings/ProjectVersion.txt" ]; then
    echo "📋 Unity project detected"

    # Edit Mode tests (fast)
    echo "📝 Running Edit Mode tests..."
    unity-editor -runTests -batchmode -nographics \
        -projectPath . \
        -testPlatform EditMode \
        -testResults EditModeResults.xml \
        -logFile editmode.log

    # Play Mode tests
    echo "🎮 Running Play Mode tests..."
    unity-editor -runTests -batchmode -nographics \
        -projectPath . \
        -testPlatform PlayMode \
        -testResults PlayModeResults.xml \
        -logFile playmode.log

    echo "✅ Unity tests complete!"

# For .NET projects
elif [ -f "*.sln" ]; then
    echo "📋 .NET solution detected"

    dotnet restore
    dotnet build --no-restore -c Release
    dotnet test --no-build -c Release --logger "trx"

    echo "✅ .NET tests complete!"
fi
```

---

## Debugging Failed Tests

### Unity Test Failures

```bash
# Get detailed output
unity-editor -runTests -batchmode -nographics \
    -projectPath . \
    -testFilter "FailingTestName" \
    -logFile - 2>&1 | tee debug.log

# Check for specific errors
grep -E "Assert|Exception|Error" debug.log
```

### .NET Test Failures

```bash
# Verbose output
dotnet test --verbosity detailed --filter "FailingTest" 2>&1 | tee debug.log

# With stack traces
RUST_BACKTRACE=1 dotnet test --filter "FailingTest"
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

---

## Common Issues

### Unity Tests Not Found

```bash
# Ensure assembly definitions are correct
find . -name "*.asmdef" -exec grep -l "Test" {} \;

# Check test assembly references
cat Assets/**/Tests/**/*.asmdef
```

### Play Mode Tests Timeout

```csharp
// Increase timeout for async tests
[UnityTest]
[Timeout(30000)] // 30 seconds
public IEnumerator LongRunningTest()
{
    // ...
}
```

### Mock/Stub Blockchain Calls

```csharp
// Create stub for RPC client
public class StubRpcClient : IRpcClient
{
    public Task<AccountInfo> GetAccountInfoAsync(PublicKey pubkey)
    {
        return Task.FromResult(new AccountInfo { /* test data */ });
    }
}
```

---

**Remember**: Fast feedback loops matter. Run unit tests frequently, integration tests before commits.
