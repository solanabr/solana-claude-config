# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this .NET/C# repository.

---

## ⚠️ Important Rules

- ALL instructions in this document MUST be followed — these are NOT optional.
- DO NOT edit more code than required to fulfill the user request.
- DO NOT waste tokens — be clear, concise, and surgical in code edits.
- DO NOT assume — ask for clarification if the project structure or framework is ambiguous.

### Git Attribution Policy

- Claude MUST NOT self-attribute or modify commit author name/email.
- All commits must use the user's provided configuration or leave attribution untouched.

---

## ⚙️ .NET/C# Runtime Configuration

- **Target SDK version:** .NET 9 (stable)
- If `global.json` is present, Claude MUST use the version it defines.
- If missing, assume the latest installed .NET 9 SDK.

### Multi-Target Frameworks

If a project targets multiple frameworks (e.g., `netstandard2.1;net9.0`), Claude MUST:
- Build and test against the highest compatible installed target.
- Notify the user if compatibility warnings occur.

---

## 🧱 Project Layout & CLI Conventions

### Directory Structure

```text
/src/
  ProjectName/
    ProjectName.csproj
  ProjectName.Tests/
    ProjectName.Tests.csproj
/tests/
  IntegrationTests/
    IntegrationTests.csproj
ProjectName.sln
```

### Common CLI Commands
```bash
dotnet restore
dotnet build ProjectName.sln
dotnet test ProjectName.sln
```

### Restore Rules
Always run `dotnet restore` before build or test if:
- Project was cloned
- Any `.csproj`, `.sln`, `Directory.Packages.props`, or `packages.config` file changed

```bash
dotnet restore
```

---

## 🚀 Core Workflow: Build → Respond → Iterate (Tight Feedback Loop)

Claude MUST operate in fast, surgical development cycles. The goal is rapid iteration, minimal token usage, and stopping after the second failure.

### 🔁 Execution Flow

1. **Understand the Request**
   - Analyze the minimum code required.
   - Avoid reviewing unrelated files.

2. **Make the Change**
   - Implement a surgical edit.
   - Keep responses minimal: describe only what was changed and why.

3. **Build the Solution**
   ```bash
   dotnet build src/ProjectName/ProjectName.csproj --no-restore --nologo --verbosity minimal
   ```
   If the build fails:
   - Retry only once if the issue is obvious (e.g., typo or missing ref).
   - If it fails again, **stop** and present:
     - The error output
     - The code change made
     - A clear request for user guidance

4. **Run Relevant Tests**
   ```bash
   dotnet test src/ProjectName.Tests/ProjectName.Tests.csproj --no-build --nologo --verbosity minimal
   ```

5. **If Tests Fail**
   Run focused failure extraction (do NOT analyze full output):
   ```bash
   dotnet test src/ProjectName.Tests/ProjectName.Tests.csproj --no-build --verbosity normal | rg -e "Failed" -e "Error Message:" -e "Stack trace:" -C 4
   ```

6. **Analyze Output and Respond**
   - If fix is clear and caused by Claude's change, fix and loop back to step 3.
   - If failure is ambiguous or same test fails again:
     - **STOP**
     - Provide the change, filtered error output, and request guidance.

### ✅ Success Example
```text
User: Add CalculateTotalPrice method in Order.cs
Claude:
- Adds method
- Builds successfully
- Runs tests (Order.Tests.csproj)
- Tests pass ✅
- Presents updated code
```

### ❌ Failure Example
```text
User: Add null check in Customer.cs
Claude:
- Adds null check
- Build fails (undefined symbol)
- Tries fixing it
- Fails again
- Stops and reports error + asks:
  "Should I define a fallback value, or is this injected elsewhere?"
```

### 🔁 Loop Summary
| Step | Command | If Fails |
|------|---------|----------|
| 1 | Implement change | — |
| 2 | `dotnet build --no-restore` | Retry once → then STOP |
| 3 | `dotnet test --no-build` | Run rg failure scan |
| 4 | Fix only if obvious → loop back | Else STOP and ask for help |

---

## 🔬 Focused Failure Analysis with `rg`

Claude MUST extract only the essential output from failing tests using ripgrep (preferred), grep, or findstr.

### Standard Command
```bash
dotnet test src/ProjectName.Tests/ProjectName.Tests.csproj --no-build --verbosity normal | rg -e "Failed" -e "Error Message:" -e "Stack trace:" -C 4
```
- `-C 4`: shows 4 lines of context around each match.
- Match lines: failure state, error message, stack trace.

### Fallbacks
If `rg` is not available:

**Using grep (Unix/macOS):**
```bash
dotnet test ... | grep -E "Failed|Error Message:|Stack trace:" -C 4
```

**Using findstr (Windows):**
```bash
dotnet test ... | findstr /I /C:"Failed" /C:"Error Message:" /C:"Stack trace:"
```

---

## 🧪 Test Execution Rules

- Unit tests are in `/src/ProjectName.Tests/`
- Integration tests in `/tests/IntegrationTests/`

### Test Output Tagging for Easy Filtering

When writing tests, Claude MUST use unique test-specific tags for EACH individual test method to enable precise log filtering:

```csharp
[Test]
public void CalculateTotalPrice_WithValidItems_ReturnsCorrectTotal()
{
    var testId = "TEST-ORDER-CALC-001";
    Console.WriteLine($"[{testId}] Starting test execution");
    
    try 
    {
        // Test logic here
        Console.WriteLine($"[{testId}] Calculation result: {result}");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[{testId}-FAIL] Error: {ex.Message}");
        throw;
    }
}

[Test]
public void CalculateTotalPrice_WithEmptyCart_ReturnsZero()
{
    var testId = "TEST-ORDER-CALC-002";
    Console.WriteLine($"[{testId}] Starting empty cart test");
    
    // Different test with its own unique ID
    Console.WriteLine($"[{testId}] Result: {result}");
}
```

This enables precise failure extraction for specific tests:
```bash
# Find all output for a specific test
dotnet test ... | rg "\[TEST-ORDER-CALC-001" -C 4

# Find only failures for a specific test
dotnet test ... | rg "\[TEST-ORDER-CALC-002-FAIL\]" -C 4
```

### Test Filters
Claude MAY use `[Category]`, `[Trait]`, or `[TestCategory]` filters:
```bash
dotnet test --filter Category=Integration
dotnet test --filter "FullyQualifiedName~MyNamespace.MyTestClass"
```

---

## 📏 Token Optimization

- OMIT all comments, logging, and debug lines unless user includes them.
- When reading `.csproj`, extract only:
  - `PackageReference`, `TargetFramework`, `ProjectReference`, `OutputType`
- NEVER read `.Designer.cs`, `obj/`, or `bin/`
- Only read `AssemblyInfo.cs` if explicitly requested

---

## 🛠 Code Quality & Analysis

- **Format:** `dotnet format`
- **Treat warnings as errors:** `dotnet build -warnaserror`
- **Environment hints:**
  - Check `launchSettings.json` under `Properties/`
  - Read `appsettings.json` for runtime settings
  - Use `global.json` for SDK pinning

---

## 📦 Dependency Management

- **Add packages:** `dotnet add package <name> --version <x.y.z>`
- **Remove:** `dotnet remove package <name>`
- **Add project refs:** `dotnet add reference ../OtherProject/OtherProject.csproj`