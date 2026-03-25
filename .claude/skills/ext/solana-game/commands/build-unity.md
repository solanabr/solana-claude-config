---
description: "Build Unity project (WebGL, Desktop, or PSG1)"
---

You are building a Unity project for Solana game development. Follow these steps:

## Step 1: Identify Project and Target

```bash
echo "Unity Build Process"
echo "==================="

# Check for Unity project
if [ ! -f "ProjectSettings/ProjectVersion.txt" ]; then
    echo "Not a Unity project (no ProjectSettings/ProjectVersion.txt)"
    exit 1
fi

# Display Unity version
echo "Unity Version:"
cat ProjectSettings/ProjectVersion.txt

# Check build targets
echo ""
echo "Available Build Targets:"
echo "  - WebGL (default)"
echo "  - StandaloneWindows64"
echo "  - StandaloneOSX"
echo "  - Android (for PSG1/mobile)"
```

## Step 2: Pre-Build Checks

```bash
echo "Running pre-build checks..."

# Check for Solana.Unity-SDK
if grep -q "com.solana.unity-sdk" Packages/manifest.json 2>/dev/null; then
    echo "Solana.Unity-SDK found"
else
    echo "Warning: Solana.Unity-SDK not found in manifest.json"
fi

# Check for PlaySolana SDK (optional)
if grep -q "com.playsolana" Packages/manifest.json 2>/dev/null; then
    echo "PlaySolana SDK found - PSG1 target supported"
fi
```

## Step 3: Build Commands

### WebGL Build (Browser)

```bash
echo "Building WebGL..."

unity-editor -quit -batchmode -nographics \
    -projectPath . \
    -buildTarget WebGL \
    -executeMethod BuildScript.BuildWebGL \
    -logFile build.log

if [ $? -eq 0 ]; then
    echo "WebGL build successful!"
    echo "Output: Build/WebGL/"
else
    echo "Build failed. Check build.log for details"
    tail -50 build.log
fi
```

### Windows Build (Desktop)

```bash
echo "Building Windows Standalone..."

unity-editor -quit -batchmode -nographics \
    -projectPath . \
    -buildTarget Win64 \
    -executeMethod BuildScript.BuildWindows \
    -logFile build.log
```

### macOS Build (Desktop)

```bash
echo "Building macOS..."

unity-editor -quit -batchmode -nographics \
    -projectPath . \
    -buildTarget OSXUniversal \
    -executeMethod BuildScript.BuildMacOS \
    -logFile build.log
```

### Android Build (PSG1/Mobile)

```bash
echo "Building Android..."

# Note: Requires Android SDK and NDK configured
unity-editor -quit -batchmode -nographics \
    -projectPath . \
    -buildTarget Android \
    -executeMethod BuildScript.BuildAndroid \
    -logFile build.log
```

## Step 4: Build Script Template

If no build script exists, create one:

```csharp
// Assets/Editor/BuildScript.cs
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;
using System.Linq;

public static class BuildScript
{
    private static readonly string[] Scenes = GetEnabledScenes();

    private static string[] GetEnabledScenes() =>
        EditorBuildSettings.scenes
            .Where(s => s.enabled)
            .Select(s => s.path)
            .ToArray();

    [MenuItem("Build/WebGL")]
    public static void BuildWebGL()
    {
        Build(new BuildPlayerOptions
        {
            scenes = Scenes,
            locationPathName = "Build/WebGL",
            target = BuildTarget.WebGL,
            options = BuildOptions.None
        });
    }

    [MenuItem("Build/Windows")]
    public static void BuildWindows()
    {
        Build(new BuildPlayerOptions
        {
            scenes = Scenes,
            locationPathName = "Build/Windows/Game.exe",
            target = BuildTarget.StandaloneWindows64,
            options = BuildOptions.None
        });
    }

    [MenuItem("Build/macOS")]
    public static void BuildMacOS()
    {
        Build(new BuildPlayerOptions
        {
            scenes = Scenes,
            locationPathName = "Build/macOS/Game.app",
            target = BuildTarget.StandaloneOSX,
            options = BuildOptions.None
        });
    }

    [MenuItem("Build/Android")]
    public static void BuildAndroid()
    {
        Build(new BuildPlayerOptions
        {
            scenes = Scenes,
            locationPathName = "Build/Android/Game.apk",
            target = BuildTarget.Android,
            options = BuildOptions.None
        });
    }

    private static void Build(BuildPlayerOptions options)
    {
        Debug.Log($"Building for {options.target}...");
        var report = BuildPipeline.BuildPlayer(options);

        if (report.summary.result == BuildResult.Succeeded)
        {
            Debug.Log($"Build succeeded: {report.summary.totalSize / 1024 / 1024} MB");
        }
        else
        {
            Debug.LogError($"Build failed with {report.summary.totalErrors} errors");
            EditorApplication.Exit(1);
        }
    }
}
```

## Step 5: Post-Build Verification

```bash
echo "Verifying build output..."

BUILD_DIR="Build"
if [ -d "$BUILD_DIR" ]; then
    echo "Build outputs:"
    ls -lh "$BUILD_DIR"
fi
```

## WebGL Optimization Tips

```csharp
// PlayerSettings recommendations for WebGL
PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Brotli;
PlayerSettings.WebGL.linkerTarget = WebGLLinkerTarget.Wasm;
PlayerSettings.WebGL.memorySize = 256; // MB
PlayerSettings.WebGL.exceptionSupport = WebGLExceptionSupport.FullWithStacktrace;

// Strip unused code
PlayerSettings.SetManagedStrippingLevel(BuildTargetGroup.WebGL, ManagedStrippingLevel.Medium);
```

## Build Checklist

Before release:

- [ ] All scenes included in build settings
- [ ] No compilation errors or warnings
- [ ] Solana.Unity-SDK configured correctly
- [ ] Wallet connection tested
- [ ] Build size acceptable (< 50MB for WebGL recommended)
- [ ] Performance tested on target platform
- [ ] PlaySolana SDK configured (if targeting PSG1)

## PSG1-Specific Build

When targeting PSG1:

```bash
echo "Building for PSG1..."

# Android build with PSG1 configuration
unity-editor -quit -batchmode -nographics \
    -projectPath . \
    -buildTarget Android \
    -executeMethod BuildScript.BuildPSG1 \
    -logFile build.log

# PSG1 screen: 1240x1080 (vertical)
# Android API level: 30+
# ARM64 architecture
```

---

**Remember**: Always test builds on target platform before release. WebGL has specific limitations compared to desktop builds.
