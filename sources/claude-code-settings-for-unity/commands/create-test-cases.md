Please think about the test cases necessary to verify that the specifications in the $ARGUMENTS file are met, and add them to the file.

Follow these steps:

1. Read and analyze specifications. If they are not clear, abort running this command.
2. Choose public classes and methods under test in order of the least integrated level.
3. Select the testing technique (such as equivalence partitioning, boundary value analysis, or state transition testing) to use to derive coverage-aware test cases.
4. Create test cases in natural language using the testing technique, note that follows:
    - Never create sequential IDs.
    - Describe the verification content. Drop the test case if they cannot be verified.
5. Repeat steps 2 to 4 until all classes under test are covered.
6. Add test cases to the $ARGUMENTS file.
7. Commit to git.
