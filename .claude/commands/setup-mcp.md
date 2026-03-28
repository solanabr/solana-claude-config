---
description: "Configure MCP server API keys in .env"
---

You are guiding the user through MCP API key setup. All secrets go in `.env` (never in `mcp.json`).

## Step 1: Ensure .env exists

Check if `.env` exists in the project root. If not, copy from `.env.example`:

```bash
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
elif [ ! -f ".env" ]; then
  touch .env
  echo "Created empty .env"
else
  echo "Found existing .env"
fi
```

## Step 2: Configure secrets

For each key below, ask the user to paste a value or say "skip":

1. **HELIUS_API_KEY** — Helius RPC + DAS API (get one at https://dev.helius.xyz)
2. **COLOSSEUM_COPILOT_PAT** — Colosseum Copilot for startup research (optional, get at https://arena.colosseum.org/copilot)
3. **MISTRAL_API_KEY** — QEDGen formal verification (optional, get at https://console.mistral.ai)

For each value provided, write or update the line in `.env`. Skip means leave it empty.

## Step 3: Summary

Print which keys are configured vs skipped:

```
MCP secrets (.env):
  HELIUS_API_KEY        [configured / skipped]
  COLOSSEUM_COPILOT_PAT [configured / skipped]
  MISTRAL_API_KEY       [configured / skipped]
```

Remind the user: restart Claude Code to pick up changes.
