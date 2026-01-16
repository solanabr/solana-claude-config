Please implement code that satisfies the specifications in the $ARGUMENTS file, following Kent Beck's Canon TDD.

Follow these steps:

1. If the specification does not contain any test cases, abort running this command.
2. Create only the types and public method signatures for the product code that can be compiled. It's okay even if it does not work.
3. Implement only one test case from the top of the test case list by following "Inner Steps".
4. Repeat step 3 until all test cases are implemented. Never leave the loop.

Inner Steps:

1. Implement test code based on the single test case.
2. Run the added tests, and confirm that they fail.
3. Implement the product code that passes the added test.
4. Resolve diagnostics at the `error` severity level, using the `mcp__jetbrains__open_file_in_editor` and `get_current_file_errors` tools.
5. Run the tests. If it does not pass, fix the code. If the test fails twice in a row, revert to the previous code and go back to step 1.
6. Refactoring with KISS and SOLID principles in mind, re-run tests to pass.
7. Resolve diagnostics at the `suggestion` or higher severity level, re-run tests to pass.
8. Reformat the modified files, using `mcp__jetbrains__reformat_file` tool.
9. Commit to git.

Notes:

- For information about running the tests, see @.claude/commands/run-tests.md file.
