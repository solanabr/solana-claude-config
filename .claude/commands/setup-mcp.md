---
description: "Interactive MCP server setup wizard — configure API keys and verify connections"
---

You are guiding the user through MCP server configuration for their Solana project.

## Step 1: Check Configuration Files

Check if `.mcp.json` exists at the project root. If not, inform the user they need to run `install.sh`:

```bash
if [ -f ".mcp.json" ]; then
    echo "Found .mcp.json"
    cat .mcp.json
else
    echo "ERROR: .mcp.json not found."
    echo "Run the installer: curl -fsSL https://raw.githubusercontent.com/solanabr/solana-claude-config/main/install.sh | bash"
fi
```

Check if `.env` exists. If not, create it from `.env.example`:

```bash
if [ -f ".env" ]; then
    echo "Found .env"
else
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "Created .env from .env.example"
    else
        echo "ERROR: Neither .env nor .env.example found."
    fi
fi
```

## Step 2: Show Current Status

Read `.env` and show which variables are set (mask actual values):

```bash
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ "$key" =~ ^[[:space:]]*# ]] && continue
    [[ -z "$key" ]] && continue
    key="$(echo "$key" | xargs)"
    if [ -n "$value" ]; then
        echo "  $key = ****"
    else
        echo "  $key = (not set)"
    fi
done < .env
```

## Step 3: Configure Each Server

Walk through each MCP server one at a time. For each, explain what it does and what credentials are needed.

### 3a. Helius (Solana RPC + DAS + Webhooks)

**What it provides**: 60+ tools for Solana queries, transactions, DAS (Digital Asset Standard) API, webhooks, and priority fee estimation via Helius APIs.

**Required**: `HELIUS_API_KEY`

**How to get it**:
- Go to https://dev.helius.xyz and create a free account
- Copy your API key from the dashboard
- Alternatively, the MCP server supports autonomous signup — ask Claude to call `generateKeypair`, fund it with ~0.001 SOL + 1 USDC, then call `agenticSignup`

**Optional env**: `HELIUS_NETWORK` — set to `devnet` for testing (defaults to `mainnet-beta`)

Ask the user: "Do you have a Helius API key? Paste it or type 'skip' to configure later."

If provided, write it to `.env` by updating the `HELIUS_API_KEY=` line. **Never modify `.mcp.json`.**

### 3b. Solana Agent Kit (On-chain Actions)

**What it provides**: 60+ on-chain actions — token swaps, launches, lending, NFT minting, staking, domain resolution, and wallet management via the Solana Agent Kit.

**Required**:
- `RPC_URL` — Your Solana RPC endpoint (can use the Helius RPC if configured: `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`)
- `SOLANA_PRIVATE_KEY` — Base58-encoded private key for signing transactions

**How to get it**:
- RPC_URL: Use your Helius endpoint, or any Solana RPC provider
- Private key: Export from your wallet (Phantom: Settings > Security > Export Private Key)

**SECURITY WARNING**: This server signs transactions with your private key. Use a dedicated development wallet, never your main wallet.

Ask the user for RPC_URL and SOLANA_PRIVATE_KEY (or 'skip').

If provided, write them to `.env`. **Never modify `.mcp.json`.**

### 3c. Solana Developer MCP (Docs + Expert)

**What it provides**: Real-time Solana documentation search, account queries, transaction analysis, CPI statement generation, and Anchor framework expertise. Connects to the official Solana Developer MCP at mcp.solana.com.

**Required**: Nothing — this is a remote MCP server with no API keys needed.

Inform the user this server is ready to use with no configuration.

### 3d. Context7 (Up-to-date Library Docs)

**What it provides**: Fetches current documentation for any library or framework directly into context. Useful when working with fast-moving dependencies (Anchor, SPL, web3.js).

**Required**: Nothing — no API keys needed.

Inform the user this server is ready to use with no configuration.

### 3e. Puppeteer (Browser Automation)

**What it provides**: Browser automation — navigate pages, take screenshots, fill forms, click elements, execute JavaScript. Useful for testing frontends and scraping documentation.

**Required**: Nothing — no API keys needed (uses local Chromium).

Inform the user this server is ready to use with no configuration.

## Step 4: Summary

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

A server is "CONFIGURED" if its required env vars are non-empty in `.env`. It "NEEDS KEYS" if any required env value is empty.

## Step 5: Next Steps

Tell the user:
- To apply changes, restart Claude Code or run `claude mcp list` to verify
- Servers with empty keys will fail to connect until configured
- They can re-run `/setup-mcp` anytime to update keys
- Credentials are in `.env` (gitignored) — never committed to the repo
- For Helius, recommend starting with devnet: set `HELIUS_NETWORK=devnet` in `.env`
