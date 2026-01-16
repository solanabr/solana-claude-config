Please run the tests on Unity editor via `UnityNaturalMCP`.

## Choose the right tool

Use the `mcp__UnityNaturalMCP__RunEditModeTests` tool if the modified class namespace or assembly name contains "Editor".
Use the `mcp__UnityNaturalMCP__RunPlayModeTests` tool if the modified class namespace does not contain "Editor".

## Specify filters

The filters are determined in the following order to minimize the number of tests performed:

1. **testNames**: Specify when only a specific test is failing, or when only a limited number of tests are affected.
2. **groupNames**: Specify the test class that is the counterpart of the modified class. The namespace is the same as the modified class, the class name with "Test" appended.
3. **assemblyNames**: Specify the name of the test assembly that is the counterpart of the assembly containing the modified class. Specify the assembly name with ".Tests" appended.

## Troubleshooting

When a tool fails with a connection error, it may be due to the following reasons:

- The connection may have been disconnected due to domain reloading caused by compilation, etc. Wait a moment and try again.
- Play Mode tests cannot be run if there are any compilation errors. Check for any compilation errors using the `mcp__jetbrains__open_file_in_editor` and `get_current_file_errors` tools.
- The test may be timing out due to a long execution time. Review the filter settings to narrow down the tests to be executed, or ask the user to extend the timeout setting.
