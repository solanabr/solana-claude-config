---
paths:
  - "**/*.cs"
---

# Refer to the Official Documentation

## Unity Documentation

When using the Unity Engine and Editor APIs, check the facts by referring to the official documentation below.
Note that "6000.0" in the URL is the Unity version. To reference the documentation for the same version as this project, replace it with the version in the ./ProjectSettings/ProjectVersion.txt file.

- https://docs.unity3d.com/6000.0/Documentation/Manual/UnityManual.html
- https://docs.unity3d.com/6000.0/Documentation/ScriptReference/index.html

For API documentation of the `UnityEngine.UI`, `UnityEngine.Event`, and `TMPro` namespaces, please refer to the following URL:

- https://docs.unity3d.com/Packages/com.unity.ugui@latest

## Dependent Packages

### UPM Packages

Dependent UPM packages are cached under ./Library/PackageCache/ directory.
The primary focus is README.md, and source files are referenced as necessary.
You can also refer to the URL in the "documentationUrl" of package.json.

### NuGet Packages

Dependent NuGet packages are listed in ./Assets/packages.config file.
README can be obtained from https://www.nuget.org/packages/ + package name.
You can also clone from the GitHub repository to the ./.claude/sandbox/ directory to refer to the source code.
