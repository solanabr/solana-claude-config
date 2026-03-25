---
description: "Interactive MCP server setup wizard — configure API keys and verify connections"
---

You are guiding the user through MCP server configuration for their Solana project.

## Step 1: Check Configuration File

Check if `.claude/mcp.json` exists in the project root. If not, inform the user they need to copy it from solana-claude-config:

```bash
if [ -f ".claude/mcp.json" ]; then
    echo "Found .claude/mcp.json"
    cat .claude/mcp.json
else
    echo "ERROR: .claude/mcp.json not found."
    echo "Copy it from solana-claude-config:"
    echo "  cp -r solana-claude-config/.claude/mcp.json .claude/mcp.json"
fi
```

## Step 2: Configure Each Server

Walk through each MCP server one at a time. For each, explain what it does and what credentials are needed.

### 2a. Helius (Solana RPC + DAS + Webhooks)

**What it provides**: 60+ tools for Solana queries, transactions, DAS (Digital Asset Standard) API, webhooks, and priority fee estimation via Helius APIs.

**Required**: `HELIUS_API_KEY`

**How to get it**:
- Go to https://dev.helius.xyz and create a free account
- Copy your API key from the dashboard
- Alternatively, the MCP server supports autonomous signup — ask Claude to call `generateKeypair`, fund it with ~0.001 SOL + 1 USDC, then call `agenticSignup`

**Optional env**: `HELIUS_NETWORK` — set to `devnet` for testing (defaults to `mainnet-beta`)

Ask the user: "Do you have a Helius API key? Paste it or type 'skip' to configure later."

If provided, update `.claude/mcp.json` with the key in `mcpServers.helius.env.HELIUS_API_KEY`.

### 2b. Solana Agent Kit (On-chain Actions)

**What it provides**: 60+ on-chain actions — token swaps, launches, lending, NFT minting, staking, domain resolution, and wallet management via the Solana Agent Kit.

**Required**:
- `RPC_URL` — Your Solana RPC endpoint (can use the Helius RPC if configured: `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`)
- `SOLANA_PRIVATE_KEY` — Base58-encoded private key for signing transactions

**How to get it**:
- RPC_URL: Use your Helius endpoint, or any Solana RPC provider
- Private key: Export from your wallet (Phantom: Settings > Security > Export Private Key)

**SECURITY WARNING**: This server signs transactions with your private key. Use a dedicated development wallet, never your main wallet.

Ask the user for RPC_URL and SOLANA_PRIVATE_KEY (or 'skip').

If provided, update `.claude/mcp.json` with the values in `mcpServers.solana-agent-kit.env`.

### 2c. Solana Developer MCP (Docs + Expert)

**What it provides**: Real-time Solana documentation search, account queries, transaction analysis, CPI statement generation, and Anchor framework expertise. Connects to the official Solana Developer MCP at mcp.solana.com.

**Required**: Nothing — this is a remote MCP server with no API keys needed.

Inform the user this server is ready to use with no configuration.

### 2d. Context7 (Up-to-date Library Docs)

**What it provides**: Fetches current documentation for any library or framework directly into context. Useful when working with fast-moving dependencies (Anchor, SPL, web3.js).

**Required**: Nothing — no API keys needed.

Inform the user this server is ready to use with no configuration.

### 2e. Puppeteer (Browser Automation)

**What it provides**: Browser automation — navigate pages, take screenshots, fill forms, click elements, execute JavaScript. Useful for testing frontends and scraping documentation.

**Required**: Nothing — no API keys needed (uses local Chromium).

Inform the user this server is ready to use with no configuration.

## Step 3: Summary

Print a status table showing which servers are configured:

```
MCP Server Status:
─────────────────────────────────────────────────
  helius            [CONFIGURED / NEEDS API KEY]
  solana-agent-kit  [CONFIGURED / NEEDS KEYS]
  solana-dev        [READY - no config needed]
  context7          [READY - no config needed]
  puppeteer         [READY - no config needed]
─────────────────────────────────────────────────
```

A server is "CONFIGURED" if its required env vars are non-empty in `.claude/mcp.json`. It "NEEDS KEYS" if any required env value is empty.

## Step 4: Next Steps

Tell the user:
- To apply changes, restart Claude Code or run `claude mcp list` to verify
- Servers with empty keys will fail to connect until configured
- They can re-run `/setup-mcp` anytime to update keys
- For Helius, recommend starting with devnet: set `HELIUS_NETWORK=devnet`
