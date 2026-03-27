#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

source "$SCRIPT_DIR/helpers.sh"

MCP_FILE="$REPO_ROOT/.mcp.json"
ENV_EXAMPLE="$REPO_ROOT/.env.example"

echo "[test_mcp_config] Checking MCP configuration..."

assert_file_exists "$MCP_FILE" ".mcp.json exists"
assert_json_valid "$MCP_FILE" ".mcp.json is valid JSON"

# Check for mcpServers key
MCP_CONTENT="$(cat "$MCP_FILE")"
assert_contains "$MCP_CONTENT" '"mcpServers"' ".mcp.json has mcpServers key"

# Check expected server names
assert_contains "$MCP_CONTENT" '"helius"' ".mcp.json has helius server"
assert_contains "$MCP_CONTENT" '"context7"' ".mcp.json has context7 server"
assert_contains "$MCP_CONTENT" '"puppeteer"' ".mcp.json has puppeteer server"
assert_contains "$MCP_CONTENT" '"solana-agent-kit"' ".mcp.json has solana-agent-kit server"
assert_contains "$MCP_CONTENT" '"solana-dev"' ".mcp.json has solana-dev server"

# Check that credentials use ${VAR} expansion, not empty strings
assert_contains "$MCP_CONTENT" '${HELIUS_API_KEY}' ".mcp.json uses \${VAR} expansion for Helius"
assert_contains "$MCP_CONTENT" '${RPC_URL}' ".mcp.json uses \${VAR} expansion for RPC_URL"

# Check .env.example exists
assert_file_exists "$ENV_EXAMPLE" ".env.example exists"

print_summary
