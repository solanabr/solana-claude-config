#!/usr/bin/env bash
set -euo pipefail

# Test runner for Solana Claude Config
# Runs all test_*.sh files and reports results.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

TOTAL_SUITES=0
PASSED_SUITES=0
FAILED_SUITES=0
FAILED_NAMES=""

echo "========================================"
echo " Solana Claude Config - Test Suite"
echo "========================================"
echo ""

for test_file in "$SCRIPT_DIR"/test_*.sh; do
  test_name="$(basename "$test_file" .sh)"
  TOTAL_SUITES=$((TOTAL_SUITES + 1))

  echo "--- $test_name ---"
  if bash "$test_file"; then
    PASSED_SUITES=$((PASSED_SUITES + 1))
  else
    FAILED_SUITES=$((FAILED_SUITES + 1))
    FAILED_NAMES="$FAILED_NAMES  - $test_name\n"
  fi
  echo ""
done

echo "========================================"
echo " Final Summary"
echo "========================================"
echo "Suites: $PASSED_SUITES passed, $FAILED_SUITES failed (of $TOTAL_SUITES)"

if [ "$FAILED_SUITES" -gt 0 ]; then
  echo ""
  echo "Failed suites:"
  printf "$FAILED_NAMES"
  exit 1
else
  echo "All test suites passed!"
fi
