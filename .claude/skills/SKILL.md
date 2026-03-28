---
name: solana-dev
description: Unified skill hub for Solana development. Routes to external submodule skills (solana-foundation, sendai, solana-game, trailofbits, cloudflare, qedgen, colosseum) and local skills. Progressive disclosure — read only what you need.
user-invocable: true
---

# Solana Development Skill Hub

Routes to the right skill file based on the task. Read the relevant section, follow the link, load that skill.

## Core Solana Development

**Primary entry point** — read first for any Solana program, frontend, testing, or client task:

- [ext/solana-dev/skill/SKILL.md](ext/solana-dev/skill/SKILL.md) — Solana Foundation skill (framework-kit-first, Kit types, wallet-standard)

Key references within:
- [programs/anchor.md](ext/solana-dev/skill/references/programs/anchor.md) — Anchor patterns, IDL, constraints (canonical)
- [programs/pinocchio.md](ext/solana-dev/skill/references/programs/pinocchio.md) — Zero-copy, CU optimization (canonical)
- [frontend-framework-kit.md](ext/solana-dev/skill/references/frontend-framework-kit.md) — React hooks, wallet connection, @solana/kit UI
- [kit-web3-interop.md](ext/solana-dev/skill/references/kit-web3-interop.md) — Kit ↔ web3.js boundary patterns
- [testing.md](ext/solana-dev/skill/references/testing.md) — LiteSVM, Mollusk, Surfpool, CI
- [security.md](ext/solana-dev/skill/references/security.md) — Vulnerability categories, checklists
- [idl-codegen.md](ext/solana-dev/skill/references/idl-codegen.md) — Codama/Shank client generation
- [payments.md](ext/solana-dev/skill/references/payments.md) — Commerce Kit, Kora, Solana Pay
- [resources.md](ext/solana-dev/skill/references/resources.md) — Official documentation links

## Token Extensions

- [token-2022.md](token-2022.md) — SPL Token-2022 extensions: transfer hooks, confidential transfers, transfer fees, metadata, CPI guard, soulbound tokens, and all extension types with Anchor/native patterns

## DeFi & Ecosystem Protocols

Protocol-specific skills from [SendAI](ext/sendai/skills/):

| Protocol | Skill | Use for |
|----------|-------|---------|
| Jupiter | [jupiter/](ext/sendai/skills/jupiter/) | Swaps, DCA, limit orders |
| Drift | [drift/](ext/sendai/skills/drift/) | Perpetuals, margin trading |
| Raydium | [raydium/](ext/sendai/skills/raydium/) | AMM, CLMM pools |
| Meteora | [meteora/](ext/sendai/skills/meteora/) | DLMM, dynamic pools |
| Orca | [orca/](ext/sendai/skills/orca/) | Whirlpools, concentrated liquidity |
| Kamino | [kamino/](ext/sendai/skills/kamino/) | Lending, vaults |
| Marginfi | [marginfi/](ext/sendai/skills/marginfi/) | Lending protocol |
| Sanctum | [sanctum/](ext/sendai/skills/sanctum/) | LST staking |
| Metaplex | [metaplex/](ext/sendai/skills/metaplex/) | NFT standards, metadata |
| PumpFun | [pumpfun/](ext/sendai/skills/pumpfun/) | Token launch |
| Pyth | [pyth/](ext/sendai/skills/pyth/) | Price oracles |
| Switchboard | [switchboard/](ext/sendai/skills/switchboard/) | Oracles, VRF |
| Squads | [squads/](ext/sendai/skills/squads/) | Multisig |
| Helius | [helius/](ext/sendai/skills/helius/) | RPC, webhooks, DAS |
| DeBridge | [debridge/](ext/sendai/skills/debridge/) | Cross-chain bridging |
| Light Protocol | [light-protocol/](ext/sendai/skills/light-protocol/) | ZK compression |
| Solana Agent Kit | [solana-agent-kit/](ext/sendai/skills/solana-agent-kit/) | AI agent framework |
| Phantom Connect | [phantom-connect/](ext/sendai/skills/phantom-connect/) | Phantom wallet connection |
| MagicBlock | [magicblock/](ext/sendai/skills/magicblock/) | On-chain game engine |
| QuickNode | [quicknode/](ext/sendai/skills/quicknode/) | RPC, streams, functions |
| Solana Kit | [solana-kit/](ext/sendai/skills/solana-kit/) | @solana/kit patterns |
| Solana Kit Migration | [solana-kit-migration/](ext/sendai/skills/solana-kit-migration/) | web3.js → Kit migration |
| Manifest | [manifest/](ext/sendai/skills/manifest/) | Order book DEX |
| dFlow | [dflow/](ext/sendai/skills/dflow/) | Payment-for-order-flow |
| VulnHunter | [vulnhunter/](ext/sendai/skills/vulnhunter/) | Vulnerability scanning |

## Security Auditing

From [Trail of Bits](ext/trailofbits/plugins/building-secure-contracts/skills/):

- [solana-vulnerability-scanner/](ext/trailofbits/plugins/building-secure-contracts/skills/solana-vulnerability-scanner/) — Automated Solana vulnerability detection
- [audit-prep-assistant/](ext/trailofbits/plugins/building-secure-contracts/skills/audit-prep-assistant/) — Prepare codebase for audit
- [code-maturity-assessor/](ext/trailofbits/plugins/building-secure-contracts/skills/code-maturity-assessor/) — Assess code maturity level
- [token-integration-analyzer/](ext/trailofbits/plugins/building-secure-contracts/skills/token-integration-analyzer/) — Token integration analysis
- [guidelines-advisor/](ext/trailofbits/plugins/building-secure-contracts/skills/guidelines-advisor/) — Security guidelines

## Formal Verification

From [QEDGen](ext/qedgen/):

- [ext/qedgen/SKILL.md](ext/qedgen/SKILL.md) — Formal verification for Solana programs using Lean 4 theorem proving (Leanstral). Verifies access control, CPI correctness, state machines, arithmetic safety. Requires `qedgen` CLI and `MISTRAL_API_KEY`.

## Infrastructure & Deployment

From [Cloudflare](ext/cloudflare/skills/):

- [workers-best-practices/](ext/cloudflare/skills/workers-best-practices/) — Cloudflare Workers deployment
- [agents-sdk/](ext/cloudflare/skills/agents-sdk/) — Agents SDK
- [building-mcp-server-on-cloudflare/](ext/cloudflare/skills/building-mcp-server-on-cloudflare/) — MCP server deployment
- [building-ai-agent-on-cloudflare/](ext/cloudflare/skills/building-ai-agent-on-cloudflare/) — AI agent deployment on Workers
- [durable-objects/](ext/cloudflare/skills/durable-objects/) — Durable Objects patterns
- [wrangler/](ext/cloudflare/skills/wrangler/) — Wrangler CLI usage

Local:
- [deployment.md](deployment.md) — Devnet/mainnet workflows, verifiable builds, multisig, CI/CD

## Game Development

From [solana-game-skill](ext/solana-game/skill/):

- [ext/solana-game/skill/SKILL.md](ext/solana-game/skill/SKILL.md) — Game skill entry point
- [unity-sdk.md](ext/solana-game/skill/unity-sdk.md) — Solana.Unity-SDK, wallet integration, NFT loading
- [playsolana.md](ext/solana-game/skill/playsolana.md) — PlaySolana, PSG1 console, PlayDex, PlayID
- [game-architecture.md](ext/solana-game/skill/game-architecture.md) — On-chain game state, ECS patterns
- [mobile.md](ext/solana-game/skill/mobile.md) — Mobile game patterns
- [csharp-patterns.md](ext/solana-game/skill/csharp-patterns.md) — C# patterns for Solana

## Mobile Development

From [solana-mobile](ext/solana-mobile/):

- [mwa/](ext/solana-mobile/mwa/) — Mobile Wallet Adapter 2.0 integration
- [genesis-token/](ext/solana-mobile/genesis-token/) — Saga Genesis Token patterns
- [skr-address-resolution/](ext/solana-mobile/skr-address-resolution/) — SKR address resolution

## Ideation & Research

From [Colosseum](ext/colosseum/skills/colosseum-copilot/):

- [ext/colosseum/skills/colosseum-copilot/SKILL.md](ext/colosseum/skills/colosseum-copilot/SKILL.md) — Solana startup research: idea validation, competitive analysis, hackathon project discovery (5,400+ submissions), crypto archives, and The Grid ecosystem data. Requires `COLOSSEUM_COPILOT_PAT`.

## Backend

- [backend-async.md](backend-async.md) — Axum 0.8/Tokio patterns, spawn_blocking, RPC integration, Redis caching

## Task Routing

| User asks about... | Primary skill |
|--------------------|---------------|
| Wallet connection, React hooks | ext/solana-dev → frontend-framework-kit.md |
| Transaction building, Kit types | ext/solana-dev → kit-web3-interop.md |
| Anchor program code | ext/solana-dev → programs/anchor.md |
| CU optimization, Pinocchio | ext/solana-dev → programs/pinocchio.md |
| Unit testing, CU benchmarks | ext/solana-dev → testing.md |
| Security review, audit | ext/solana-dev → security.md + ext/trailofbits |
| Backend API, indexer | backend-async.md |
| Deploy to devnet/mainnet | deployment.md |
| DeFi integration (swaps, lending) | ext/sendai → protocol-specific skill |
| NFT standards, metadata | ext/sendai → metaplex/ |
| Payment flows, checkout | ext/solana-dev → payments.md |
| Generated clients, IDL | ext/solana-dev → idl-codegen.md |
| Unity game development | ext/solana-game → unity-sdk.md |
| PlaySolana, PSG1 console | ext/solana-game → playsolana.md |
| Game architecture, ECS | ext/solana-game → game-architecture.md |
| Workers, edge deployment | ext/cloudflare → workers-best-practices/ |
| Mobile wallet adapter, MWA | ext/solana-mobile → mwa/ |
| Saga Genesis Token | ext/solana-mobile → genesis-token/ |
| Token-2022, transfer hooks, extensions | token-2022.md |
| Vulnerability scanning | ext/trailofbits → solana-vulnerability-scanner/ |
| Formal verification, proofs | ext/qedgen → SKILL.md |
| Idea validation, competitive research, hackathon projects | ext/colosseum → colosseum-copilot/SKILL.md |
