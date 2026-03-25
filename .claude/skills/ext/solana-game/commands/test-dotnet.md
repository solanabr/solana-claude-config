---
description: "Run .NET/C# tests for Unity projects"
---

You are running .NET/C# tests. This command covers Unity Test Framework (Edit Mode and Play Mode).

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

### Phase 3: REFACTOR - Clean Up

Improve code structure without changing behavior, keeping tests green.

### Phase 4: Iterate

Return to Phase 1 for next test case.

### Phase 5: Integration

After unit tests pass, run Play Mode tests.

### Phase 6: Review

Review test coverage, check for missing edge cases.

---

## Core Workflow: Build → Respond → Iterate

1. **Understand the Request**: Analyze minimum code required
2. **Make the Change**: Implement surgical edit
3. **Build**: Verify compilation
4. **If Build Fails**: Retry once if obvious fix, then **STOP and ask**
5. **Run Tests**: Execute relevant tests
6. **If Tests Fail**: Fix if obvious, else **STOP and ask**

### Two-Strike Rule

If build or test fails twice on the same issue:
1. **STOP** immediately
2. Present the error output
3. Show the code change made
4. Ask for user guidance

---

## Unity Test Framework

### Run All Tests

```bash
echo "Running Unity tests..."

unity-editor -runTests -batchmode -nographics \
    -projectPath . \
    -testResults TestResults.xml \
    -logFile test.log

if [ $? -eq 0 ]; then
    echo "All tests passed!"
else
    echo "Some tests failed"
    grep -E "Failed|Error" test.log | head -20
fi
```

### Run Edit Mode Tests Only

```bash
echo "Running Edit Mode tests..."

unity-editor -runTests -batchmode -nographics \
    -projectPath . \
    -testPlatform EditMode \
    -testResults EditModeResults.xml \
    -logFile editmode.log
```

### Run Play Mode Tests Only

```bash
echo "Running Play Mode tests..."

unity-editor -runTests -batchmode -nographics \
    -projectPath . \
    -testPlatform PlayMode \
    -testResults PlayModeResults.xml \
    -logFile playmode.log
```

### Run Specific Test Filter

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

---

## Test Patterns

### Edit Mode Test Structure

```csharp
using NUnit.Framework;

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
    [TestCase(100UL)]
    [TestCase(ulong.MaxValue)]
    public void Deserialize_VariousScores_ParsesCorrectly(ulong expectedScore)
    {
        var data = CreateTestData(score: expectedScore);

        var account = PlayerAccount.Deserialize(data);

        Assert.That(account.Score, Is.EqualTo(expectedScore));
    }

    private byte[] CreateTestData(ulong score)
    {
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
    public IEnumerator Initialize_SetsDisconnectedState()
    {
        yield return null;

        Assert.That(_sut.IsConnected, Is.False);
    }
}
```

---

## Test Design Rules

1. **AAA Pattern**: Arrange, Act, Assert (blank lines between)
2. **Single Assert**: One assertion per test
3. **Constraint Model**: `Assert.That(actual, Is.EqualTo(expected))`
4. **No Control Flow**: No `if`, `switch`, `for` in tests
5. **Parameterized Tests**: Use `[TestCase]` for variations

### Variable Naming

| Role | Name |
|------|------|
| System Under Test | `sut` |
| Actual result | `actual` |
| Expected value | `expected` |
| Test doubles | `stub*`, `spy*`, `fake*`, `mock*` |

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

Run by category:

```bash
unity-editor -runTests -batchmode -nographics \
    -projectPath . \
    -testCategory "Unit" \
    -logFile test.log
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

---

**Remember**: Fast feedback loops matter. Run unit tests frequently, integration tests before commits.
