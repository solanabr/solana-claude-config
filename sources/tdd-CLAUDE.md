# Test-Driven Development Workflow for Unity PlayMode Tests

## Overview
This workflow enforces strict Test-Driven Development (TDD) for Unity features using PlayMode tests. Follow each phase sequentially.

## How It Works

When you mention `@claude` in a GitHub issue, PR comment, or review:
1. GitHub Actions workflow is triggered
2. Unity license is activated in a separate job using game-ci
3. License is securely transferred to the Claude Code container
4. Claude runs with full `unity-editor` CLI access
5. Claude autonomously executes the complete TDD cycle
6. Claude commits and pushes changes by creating a Pull Request. It will NEVER commit directly to main. This allows for code review and WebGL preview deployment.

**You have access to `unity-editor` CLI for running tests!** The workflow pre-activates Unity licensing, so you can run PlayMode tests directly.

---

## Phase 1: Requirements Clarification

**Input:** User's feature request

**Process:**
1. Read the feature request carefully
2. Identify any ambiguities or missing details
3. If requirements are unclear:
   - **STOP** implementation
   - Reply with specific clarifying questions:
     - What are the expected inputs and outputs?
     - What are the success criteria?
     - Are there edge cases to consider?
     - What components/systems will this interact with?
   - **WAIT** for user response before proceeding
4. If requirements are clear:
   - Summarize your understanding
   - List testable acceptance criteria
   - Proceed to Phase 2

**Exit Criteria:** Clear, testable requirements documented

---

## Phase 2: Write Failing Tests

**Process:**
1. Create or locate PlayMode test file in `Assets/Tests/PlayMode/`
2. Write tests that verify ALL requirements:
   - One test per acceptance criterion
   - Use descriptive test names: `When[Condition]_Should[ExpectedBehavior]`
   - Test edge cases and error conditions
   - Tests MUST fail initially (no implementation exists yet)
3. **Run tests using unity-editor CLI to confirm they fail:**
   ```bash
   unity-editor -runTests -batchmode -nographics -projectPath . -testPlatform PlayMode -logFile -
   ```
4. Verify failure messages are clear and helpful

**Example Test Structure:**
```csharp
[UnityTest]
public IEnumerator WhenPlayerCollectsItem_ShouldIncreaseScore()
{
    // Arrange - Set up test conditions

    // Act - Execute the behavior

    // Assert - Verify expected outcome
    yield return null;
}
```

**Exit Criteria:**
- All tests written and documented
- All tests fail with clear error messages
- Test run output confirmed

---

## Phase 3: Implement Minimum Code

**Process:**
1. Write the **simplest possible code** to make ONE test pass
2. No premature optimization or extra features
3. Hard-code values if necessary (will refactor later)
4. **Run tests after each change using unity-editor CLI:**
   ```bash
   unity-editor -runTests -batchmode -nographics -projectPath . -testPlatform PlayMode -logFile -
   ```
5. If test passes, commit that change
6. Move to next failing test
7. Repeat until ALL tests pass

**Rules:**
- ❌ Do NOT add features not required by tests
- ❌ Do NOT refactor yet (that's Phase 4)
- ✅ DO use the simplest solution
- ✅ DO make incremental changes
- ✅ DO verify each test individually

**Exit Criteria:** ALL tests pass (green)

---

## Phase 4: Refactor Implementation

**Process:**
1. Review the implementation for:
   - Code duplication
   - Hard-coded values that should be parameterized
   - Long methods that should be split
   - Complex logic that needs simplification
   - Missing modular structure
2. Refactor to achieve:
   - **Simple:** Easy to understand and maintain
   - **Modular:** Clear separation of concerns
   - **DRY:** No unnecessary duplication
   - **SOLID:** Follow good design principles
3. After EACH refactor:
   - **Run all tests using unity-editor CLI:**
     ```bash
     unity-editor -runTests -batchmode -nographics -projectPath . -testPlatform PlayMode -logFile -
     ```
   - Ensure all tests still pass
   - If tests fail, revert the refactor
4. Commit each successful refactor separately

**Exit Criteria:**
- Clean, modular implementation
- All tests still passing
- Code follows Unity best practices

---

## Phase 5: Final Verification

**Process:**
1. **Run complete test suite one final time using unity-editor CLI:**
   ```bash
   unity-editor -runTests -batchmode -nographics -projectPath . -testPlatform PlayMode -logFile -
   ```
2. Verify all tests pass
3. Review test coverage:
   - All requirements tested?
   - Edge cases covered?
   - Error conditions handled?
4. If gaps found, return to Phase 2

**Exit Criteria:**
- 100% of requirements have passing tests
- No test failures
- Code is clean and refactored

---

## Phase 6: Commit Changes

**Process:**
1. Commit all changes with descriptive messages:
   ```
   test: Add PlayMode tests for [feature]
   feat: Implement [feature] with TDD approach
   refactor: Simplify [component] logic
   ```
   The committed changes will be available on the current branch. A human is then responsible for pushing these changes and creating a Pull Request for review.

**Exit Criteria:** Changes committed with descriptive messages

---

## TDD Workflow Checklist

Use this checklist for each feature:

- [ ] Phase 1: Requirements clarified and documented
- [ ] Phase 2: Failing tests written (all requirements covered)
- [ ] Phase 3: Minimal implementation (all tests green)
- [ ] Phase 4: Refactored to clean, modular code
- [ ] Phase 5: Final verification passed
- [ ] Phase 6: Changes committed

---

## Important Reminders

⚠️ **NEVER skip writing tests first**
⚠️ **NEVER implement without failing tests**
⚠️ **NEVER refactor before tests pass**
⚠️ **NEVER commit failing tests**
⚠️ **ALWAYS run tests after changes using unity-editor CLI**
⚠️ **ALWAYS clarify unclear requirements before coding**

---

## Unity PlayMode Test Guidelines

**File Location:** `Assets/Tests/PlayMode/[FeatureName]Tests.cs`

**Required Attributes:**
```csharp
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;
using System.Collections;

[TestFixture]
public class FeatureNameTests
{
    [UnityTest]
    public IEnumerator TestName()
    {
        // Test implementation
        yield return null;
    }
}
```

**Best Practices:**
- Use `[UnityTest]` for async/coroutine tests
- Use `[Test]` for synchronous tests
- Clean up test objects in `[TearDown]`
- Use `LogAssert` for testing Debug.Log calls
- Leverage `yield return new WaitForSeconds()` for timing tests

---

## Creating Assets and .meta Files

**CRITICAL: NEVER manually create `.meta` files!** Unity generates these automatically with valid GUIDs and checksums.

### Creating Scripts and Generating .meta Files

1. **Write the C# script file directly:**
   ```bash
   # Use Write tool to create the script
   Write Assets/Scripts/MyFeature.cs
   ```

2. **Trigger Unity to generate .meta files:**
   ```bash
   # Unity will auto-generate missing .meta files during import
   unity-editor -batchmode -quit -projectPath . -logFile -
   ```

3. **Commit both the script and auto-generated .meta:**
   ```bash
   git add Assets/Scripts/MyFeature.cs Assets/Scripts/MyFeature.cs.meta
   git commit -m "feat: Add MyFeature script"
   ```

### Creating Unity Assets (Materials, Scenes, Prefabs, etc.)

For assets that cannot be created as simple text files, use **temporary Editor scripts**:

1. **Write a temporary Editor script to create the assets:**
   ```bash
   Write Assets/Editor/TempAssetCreator.cs
   ```

   **Example script:**
   ```csharp
   using UnityEditor;
   using UnityEngine;
   using UnityEditor.SceneManagement;

   public class TempAssetCreator
   {
       [MenuItem("Tools/CreateTestAssets")]
       public static void CreateAssets()
       {
           // Create a material
           Material mat = new Material(Shader.Find("Standard"));
           mat.color = Color.red;
           AssetDatabase.CreateAsset(mat, "Assets/Materials/RedMaterial.mat");

           // Create a scene
           var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects);
           EditorSceneManager.SaveScene(scene, "Assets/Scenes/TestScene.unity");

           // Create a prefab
           GameObject obj = new GameObject("TestObject");
           PrefabUtility.SaveAsPrefabAsset(obj, "Assets/Prefabs/TestObject.prefab");
           Object.DestroyImmediate(obj);

           AssetDatabase.SaveAssets();
           AssetDatabase.Refresh();

           Debug.Log("Assets created successfully");
       }
   }
   ```

2. **Execute the Editor script to create assets:**
   ```bash
   unity-editor -batchmode -quit \
     -projectPath . \
     -executeMethod TempAssetCreator.CreateAssets \
     -logFile -
   ```

3. **Delete the temporary Editor script:**
   ```bash
   rm Assets/Editor/TempAssetCreator.cs
   rm Assets/Editor/TempAssetCreator.cs.meta
   ```

4. **Commit the generated assets (with their auto-generated .meta files):**
   ```bash
   git add Assets/Materials/ Assets/Scenes/ Assets/Prefabs/
   git commit -m "feat: Add test materials, scenes, and prefabs"
   ```

### Asset Creation Strategy

| Asset Type | Recommended Approach |
|------------|---------------------|
| C# Scripts | Write directly → trigger import |
| Simple Materials | Temporary Editor script |
| Scenes | Temporary Editor script |
| Prefabs | Temporary Editor script |

**Key Rules:**
- ❌ **NEVER** manually create `.meta` files
- ❌ **NEVER** manually write Unity YAML asset files (`.mat`, `.prefab`, `.unity`)
- ✅ **ALWAYS** let Unity generate `.meta` files via import
- ✅ **ALWAYS** use Editor scripts for complex asset creation
- ✅ **ALWAYS** delete temporary Editor scripts after use

---

## Running Tests

You have access to the `unity-editor` CLI command to run tests directly.

**Command to run PlayMode tests:**
```bash
unity-editor -runTests -batchmode -nographics -projectPath . -testPlatform PlayMode -logFile -
```

**Notes:**
- Tests run in headless mode (no graphics)
- Results output to stdout via `-logFile -`
- Exit code indicates test success (0) or failure (non-zero)

---

## GitHub Actions Workflow Architecture

The workflow consists of two jobs:

### Job 1: activate-unity
- Runs on standard Ubuntu runner (outside container)
- Uses `game-ci/unity-activate@v2` to activate Unity license
- Reads the generated `.ulf` license file
- Masks license content for security
- Base64 encodes and passes to next job via outputs

### Job 2: claude
- Runs in Unity container: `unityci/editor:ubuntu-6000.0.31f1-base-3`
- Receives and installs the activated license
- Launches Claude Code with `unity-editor` CLI access
- Claude executes complete TDD workflow autonomously
- Claude has permission to use `unity-editor` via `--allowed-tools Bash(unity-editor*)`

**Security Measures:**
- License content masked before any output using `::add-mask::`
- Both plain and base64 versions masked
- No artifacts used (would be publicly visible)
- License never appears in public logs

**Key Point:** You (Claude) have full access to run Unity tests because the license is pre-activated in your container!