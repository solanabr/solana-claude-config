# Skill List

Complete inventory of all skills encapsulated in this repository. Skills are progressively loaded by Claude Code via the [SKILL.md](.claude/skills/SKILL.md) routing hub.

**Total: 115+ skills** across 9 sources.

---

## Local Skills

| Skill | Path | Description |
|-------|------|-------------|
| Skill Hub | `.claude/skills/SKILL.md` | Unified routing hub — entry point for all skills |
| Token-2022 | `.claude/skills/token-2022.md` | SPL Token-2022 extensions: transfer hooks, confidential transfers, transfer fees, metadata, CPI guard, soulbound tokens |
| Backend Async | `.claude/skills/backend-async.md` | Axum 0.8+/Tokio patterns, spawn_blocking, RPC integration, Redis caching |
| Deployment | `.claude/skills/deployment.md` | Devnet/mainnet workflows, verifiable builds, multisig, CI/CD |

---

## Solana Foundation (`ext/solana-dev`)

Source: [solana-foundation/solana-dev-skill](https://github.com/solana-foundation/solana-dev-skill)

### Entry Point

| Skill | Path | Description |
|-------|------|-------------|
| Solana Dev | `ext/solana-dev/skill/SKILL.md` | End-to-end Solana development playbook (Kit-first, wallet-standard) |

### Core References

| Skill | Path | Description |
|-------|------|-------------|
| Anchor Programs | `ext/solana-dev/skill/references/programs/anchor.md` | Anchor patterns, IDL, constraints, account validation |
| Pinocchio Programs | `ext/solana-dev/skill/references/programs/pinocchio.md` | Zero-copy, CU optimization, manual validation |
| Frontend Kit | `ext/solana-dev/skill/references/frontend-framework-kit.md` | React hooks, wallet connection, @solana/kit UI |
| Kit ↔ web3.js Interop | `ext/solana-dev/skill/references/kit-web3-interop.md` | Kit ↔ web3.js boundary patterns and migration |
| Testing | `ext/solana-dev/skill/references/testing.md` | LiteSVM, Mollusk, Surfpool, CI testing |
| Security | `ext/solana-dev/skill/references/security.md` | Vulnerability categories, checklists |
| IDL Codegen | `ext/solana-dev/skill/references/idl-codegen.md` | Codama/Shank client generation |
| Payments | `ext/solana-dev/skill/references/payments.md` | Commerce Kit, Kora, Solana Pay |
| Resources | `ext/solana-dev/skill/references/resources.md` | Official documentation links |
| Common Errors | `ext/solana-dev/skill/references/common-errors.md` | GLIBC errors, Anchor version conflicts, RPC errors, dependency fixes |
| Compatibility Matrix | `ext/solana-dev/skill/references/compatibility-matrix.md` | Anchor/Solana CLI/Rust/Node.js version matching |
| Confidential Transfers | `ext/solana-dev/skill/references/confidential-transfers.md` | ZK confidential transfer deep-dive |

### Surfpool

| Skill | Path | Description |
|-------|------|-------------|
| Surfpool Overview | `ext/solana-dev/skill/references/surfpool/overview.md` | Surfpool local network setup and usage |
| Surfpool Cheatcodes | `ext/solana-dev/skill/references/surfpool/cheatcodes.md` | Surfpool cheatcodes reference |

### Kit (Solana Kit Deep-Dive)

| Skill | Path | Description |
|-------|------|-------------|
| Kit Overview | `ext/solana-dev/skill/references/kit/overview.md` | @solana/kit architecture and getting started |
| Kit Accounts | `ext/solana-dev/skill/references/kit/accounts.md` | Account fetching, decoding, subscriptions |
| Kit Codecs | `ext/solana-dev/skill/references/kit/codecs.md` | Codec system for serialization/deserialization |
| Kit Codama | `ext/solana-dev/skill/references/kit/codama.md` | Codama IDL-driven client generation for Kit |
| Kit Plugins | `ext/solana-dev/skill/references/kit/plugins.md` | Kit plugin system and extensions |
| Kit Advanced | `ext/solana-dev/skill/references/kit/advanced.md` | Advanced Kit patterns and techniques |
| Kit Gotchas | `ext/solana-dev/skill/references/kit/gotchas.md` | Common pitfalls and solutions |
| Kit React | `ext/solana-dev/skill/references/kit/react.md` | React integration with @solana/kit |
| Kit — Token Program | `ext/solana-dev/skill/references/kit/programs/token.md` | Kit client patterns for SPL Token |
| Kit — Token-2022 | `ext/solana-dev/skill/references/kit/programs/token-2022.md` | Kit client patterns for Token-2022 |
| Kit — System Program | `ext/solana-dev/skill/references/kit/programs/system.md` | Kit client patterns for System Program |
| Kit — Compute Budget | `ext/solana-dev/skill/references/kit/programs/compute-budget.md` | Kit client patterns for Compute Budget |

---

## SendAI DeFi & Ecosystem (`ext/sendai`)

Source: [sendaifun/skills](https://github.com/sendaifun/skills)

### DeFi Protocols

| Skill | Path | Description |
|-------|------|-------------|
| Jupiter | `ext/sendai/skills/jupiter/` | Swaps, DCA, limit orders, Ultra Swap, Perps, Trigger, Recurring |
| Drift | `ext/sendai/skills/drift/` | Perpetual futures, spot trading, margin trading |
| Raydium | `ext/sendai/skills/raydium/` | AMM, CLMM pools, swaps |
| Meteora | `ext/sendai/skills/meteora/` | DLMM, dynamic pools, bonding curves, vaults, token launches |
| Orca | `ext/sendai/skills/orca/` | Whirlpools, concentrated liquidity AMM |
| Kamino | `ext/sendai/skills/kamino/` | Lending, borrowing, leverage, vaults |
| Marginfi | `ext/sendai/skills/marginfi/` | Decentralized lending protocol |
| Sanctum | `ext/sendai/skills/sanctum/` | LST staking, LST swaps, Infinity pool |
| Lulo | `ext/sendai/skills/lulo/` | Lending aggregator with API integration |
| Ranger Finance | `ext/sendai/skills/ranger-finance/` | Perps aggregator for perpetual futures trading |
| Manifest | `ext/sendai/skills/manifest/` | DEX market reads and order placement |
| GLAM | `ext/sendai/skills/glam/` | Tokenized vaults and asset management |

### NFTs & Tokens

| Skill | Path | Description |
|-------|------|-------------|
| Metaplex | `ext/sendai/skills/metaplex/` | NFT standards — Core, Token Metadata, Bubblegum, Candy Machine |
| PumpFun | `ext/sendai/skills/pumpfun/` | Token launches, bonding curves, AMM integrations |

### Oracles

| Skill | Path | Description |
|-------|------|-------------|
| Pyth | `ext/sendai/skills/pyth/` | Decentralized real-time price feeds for DeFi |
| Switchboard | `ext/sendai/skills/switchboard/` | Permissionless oracle feeds, VRF, on-demand data |

### Infrastructure & Wallets

| Skill | Path | Description |
|-------|------|-------------|
| Helius | `ext/sendai/skills/helius/` | RPC, DAS API, WebSockets, webhooks, wallet operations |
| Helius + DFlow | `ext/sendai/skills/helius-dflow/` | Trading APIs combined with Helius infrastructure |
| Helius + Phantom | `ext/sendai/skills/helius-phantom/` | Frontend dApps with Phantom Connect + Helius |
| QuickNode | `ext/sendai/skills/quicknode/` | RPC endpoints, DAS API for NFTs and compressed accounts |
| Squads | `ext/sendai/skills/squads/` | Smart account and multisig infrastructure |
| Phantom Connect | `ext/sendai/skills/phantom-connect/` | Phantom wallet connection SDK integration |
| Phantom Wallet MCP | `ext/sendai/skills/phantom-wallet-mcp/` | Wallet operations via Phantom MCP server |

### Cross-Chain & Privacy

| Skill | Path | Description |
|-------|------|-------------|
| deBridge | `ext/sendai/skills/debridge/` | Cross-chain bridges, message passing, token transfers |
| Light Protocol | `ext/sendai/skills/light-protocol/` | ZK Compression for rent-free tokens and PDAs |
| Inco | `ext/sendai/skills/inco/` | Confidential dApps using Inco Lightning encryption |

### Developer Tools

| Skill | Path | Description |
|-------|------|-------------|
| Solana Kit | `ext/sendai/skills/solana-kit/` | @solana/kit modern SDK guide |
| Solana Kit Migration | `ext/sendai/skills/solana-kit-migration/` | Migration guide from @solana/web3.js to @solana/kit |
| Solana Agent Kit | `ext/sendai/skills/solana-agent-kit/` | AI agents that interact with Solana blockchain |
| Pinocchio Development | `ext/sendai/skills/pinocchio-development/` | High-performance programs with Pinocchio zero-copy framework |
| Surfpool | `ext/sendai/skills/surfpool/` | Drop-in replacement for solana-test-validator |
| SVM Internals | `ext/sendai/skills/svm/` | Solana architecture internals — SVM engine, accounts, consensus |

### Security & Analytics

| Skill | Path | Description |
|-------|------|-------------|
| VulnHunter | `ext/sendai/skills/vulnhunter/` | Vulnerability detection and dangerous API pattern analysis |
| Code Recon | `ext/sendai/skills/zz-code-recon/` | Deep architectural context building for security audits |
| CoinGecko | `ext/sendai/skills/coingecko/` | Token prices, DEX pools, OHLCV charts, market analytics |
| MetEngine | `ext/sendai/skills/metengine/` | Smart money analytics for Polymarket and Hyperliquid |
| CT Alpha | `ext/sendai/skills/ct-alpha/` | Template skill (standard skill structure demo) |

### Gaming

| Skill | Path | Description |
|-------|------|-------------|
| MagicBlock | `ext/sendai/skills/magicblock/` | Ephemeral Rollups — sub-10ms latency execution for games |

---

## Trail of Bits Security (`ext/trailofbits`)

Source: [trailofbits/skills](https://github.com/trailofbits/skills)

### Smart Contract Security

| Skill | Path | Description |
|-------|------|-------------|
| Solana Vulnerability Scanner | `ext/trailofbits/.../solana-vulnerability-scanner/` | Automated Solana program vulnerability detection |
| Audit Prep Assistant | `ext/trailofbits/.../audit-prep-assistant/` | Prepare codebase for security review |
| Code Maturity Assessor | `ext/trailofbits/.../code-maturity-assessor/` | 9-category code maturity assessment |
| Secure Workflow Guide | `ext/trailofbits/.../secure-workflow-guide/` | 5-step secure development workflow |
| Guidelines Advisor | `ext/trailofbits/.../guidelines-advisor/` | Smart contract development best practices |
| Token Integration Analyzer | `ext/trailofbits/.../token-integration-analyzer/` | Token integration checklist and analysis |
| Entry Point Analyzer | `ext/trailofbits/.../entry-point-analyzer/` | State-changing entry point identification |

### Multi-Chain Vulnerability Scanners

| Skill | Path | Description |
|-------|------|-------------|
| Algorand Scanner | `ext/trailofbits/.../algorand-vulnerability-scanner/` | Algorand smart contract vulnerabilities |
| Cairo Scanner | `ext/trailofbits/.../cairo-vulnerability-scanner/` | Cairo/StarkNet contract vulnerabilities |
| Cosmos Scanner | `ext/trailofbits/.../cosmos-vulnerability-scanner/` | Cosmos SDK consensus-critical vulnerabilities |
| Substrate Scanner | `ext/trailofbits/.../substrate-vulnerability-scanner/` | Substrate/Polkadot pallet vulnerabilities |
| TON Scanner | `ext/trailofbits/.../ton-vulnerability-scanner/` | TON smart contract vulnerabilities |

### Testing & Fuzzing

| Skill | Path | Description |
|-------|------|-------------|
| Harness Writing | `ext/trailofbits/.../harness-writing/` | Fuzzing harness creation |
| libFuzzer | `ext/trailofbits/.../libfuzzer/` | libFuzzer guidance and integration |
| cargo-fuzz | `ext/trailofbits/.../cargo-fuzz/` | Rust fuzzing with cargo-fuzz |
| AFL++ | `ext/trailofbits/.../aflpp/` | AFL++ fuzzing techniques |
| LibAFL | `ext/trailofbits/.../libafl/` | LibAFL framework usage |
| OSS-Fuzz | `ext/trailofbits/.../ossfuzz/` | OSS-Fuzz integration |
| Atheris | `ext/trailofbits/.../atheris/` | Python fuzzing with Atheris |
| Ruzzy | `ext/trailofbits/.../ruzzy/` | Ruby fuzzing with Ruzzy |
| Fuzzing Dictionary | `ext/trailofbits/.../fuzzing-dictionary/` | Fuzzing dictionary generation |
| Fuzzing Obstacles | `ext/trailofbits/.../fuzzing-obstacles/` | Identify and overcome fuzzing obstacles |
| Wycheproof | `ext/trailofbits/.../wycheproof/` | Crypto testing with Wycheproof vectors |
| Testing Handbook | `ext/trailofbits/.../testing-handbook-generator/` | Testing handbook generation |
| Property-Based Testing | `ext/trailofbits/.../property-based-testing/` | Property-based testing across languages |

### Static Analysis

| Skill | Path | Description |
|-------|------|-------------|
| Semgrep | `ext/trailofbits/.../semgrep/` | Semgrep static analysis rules and usage |
| CodeQL | `ext/trailofbits/.../codeql/` | CodeQL static analysis queries |
| SARIF Parsing | `ext/trailofbits/.../sarif-parsing/` | Parse SARIF static analysis output |
| Semgrep Rule Creator | `ext/trailofbits/.../semgrep-rule-creator/` | Custom Semgrep rule creation |
| Semgrep Rule Variants | `ext/trailofbits/.../semgrep-rule-variant-creator/` | Language variants for Semgrep rules |

### Advanced Security Analysis

| Skill | Path | Description |
|-------|------|-------------|
| Constant-Time Analysis | `ext/trailofbits/.../constant-time-analysis/` | Timing side-channel vulnerability detection |
| Constant-Time Testing | `ext/trailofbits/.../constant-time-testing/` | Verify constant-time code execution |
| Variant Analysis | `ext/trailofbits/.../variant-analysis/` | Pattern-based cross-codebase vulnerability search |
| Zeroize Audit | `ext/trailofbits/.../zeroize-audit/` | Missing zeroization of sensitive data |
| Supply Chain Risk | `ext/trailofbits/.../supply-chain-risk-auditor/` | Dependency exploitation risk identification |
| Agentic Actions Auditor | `ext/trailofbits/.../agentic-actions-auditor/` | GitHub Actions AI agent security audit |
| Sharp Edges | `ext/trailofbits/.../sharp-edges/` | Error-prone APIs and footgun pattern detection |
| Insecure Defaults | `ext/trailofbits/.../insecure-defaults/` | Fail-open insecure default detection |
| Audit Context Building | `ext/trailofbits/.../audit-context-building/` | Line-by-line code analysis for audit prep |
| Spec-to-Code Compliance | `ext/trailofbits/.../spec-to-code-compliance/` | Verify code matches documentation spec |
| FP Check | `ext/trailofbits/.../fp-check/` | False positive elimination for security bugs |
| Differential Review | `ext/trailofbits/.../differential-review/` | Differential code review for security |
| Coverage Analysis | `ext/trailofbits/.../coverage-analysis/` | Code coverage analysis |
| Address Sanitizer | `ext/trailofbits/.../address-sanitizer/` | Memory error detection with ASan |

### General Development Tools

| Skill | Path | Description |
|-------|------|-------------|
| DWARF Expert | `ext/trailofbits/.../dwarf-expert/` | DWARF debug file analysis (v3-v5) |
| Modern Python | `ext/trailofbits/.../modern-python/` | Python project setup with uv, ruff, type checking |
| Devcontainer Setup | `ext/trailofbits/.../devcontainer-setup/` | Devcontainer configuration with language-specific tooling |
| Git Cleanup | `ext/trailofbits/.../git-cleanup/` | Safe local git branch and worktree cleanup |
| Second Opinion | `ext/trailofbits/.../second-opinion/` | External LLM code review (OpenAI/Gemini) |
| Skill Improver | `ext/trailofbits/.../skill-improver/` | Claude Code skill quality review and fixes |
| Ask Questions | `ext/trailofbits/.../ask-questions-if-underspecified/` | Requirement clarification before implementation |
| Dimensional Analysis | `ext/trailofbits/.../dimensional-analysis/` | Unit annotation and dimensional analysis |
| YARA Rule Authoring | `ext/trailofbits/.../yara-rule-authoring/` | YARA rule creation for malware detection |
| Firebase APK Scanner | `ext/trailofbits/.../firebase-apk-scanner/` | Android APK Firebase security scanning |
| Burp Suite Parser | `ext/trailofbits/.../burpsuite-project-parser/` | Burp Suite project file exploration |
| Seatbelt Sandboxer | `ext/trailofbits/.../seatbelt-sandboxer/` | macOS Seatbelt sandbox configuration |
| Chrome MCP Troubleshoot | `ext/trailofbits/.../claude-in-chrome-troubleshooting/` | Claude in Chrome MCP extension debugging |
| GitHub CLI | `ext/trailofbits/.codex/skills/gh-cli/` | GitHub CLI patterns and usage |

---

## Cloudflare (`ext/cloudflare`)

Source: [cloudflare/skills](https://github.com/cloudflare/skills)

| Skill | Path | Description |
|-------|------|-------------|
| Workers Best Practices | `ext/cloudflare/skills/workers-best-practices/` | Production Workers code review and authoring |
| Agents SDK | `ext/cloudflare/skills/agents-sdk/` | Stateful AI agents on Cloudflare Workers |
| MCP Server on Cloudflare | `ext/cloudflare/skills/building-mcp-server-on-cloudflare/` | MCP server deployment on Workers |
| AI Agent on Cloudflare | `ext/cloudflare/skills/building-ai-agent-on-cloudflare/` | AI agent deployment on Workers |
| Cloudflare Platform | `ext/cloudflare/skills/cloudflare/` | Full platform — Workers, Pages, KV, D1, R2, AI |
| Wrangler CLI | `ext/cloudflare/skills/wrangler/` | Workers CLI for deploy, develop, and manage |
| Durable Objects | `ext/cloudflare/skills/durable-objects/` | Stateful coordination (chat, multiplayer, auctions) |
| Sandbox SDK | `ext/cloudflare/skills/sandbox-sdk/` | Sandboxed code execution and AI interpreters |
| Web Performance | `ext/cloudflare/skills/web-perf/` | Core Web Vitals and performance analysis |

---

## Solana Game Development (`ext/solana-game`)

Source: [solanabr/solana-game-skill](https://github.com/solanabr/solana-game-skill)

| Skill | Path | Description |
|-------|------|-------------|
| Game Skill Hub | `ext/solana-game/skill/SKILL.md` | Game development entry point and routing |
| Unity SDK | `ext/solana-game/skill/unity-sdk.md` | Solana.Unity-SDK, wallet integration, NFT loading |
| PlaySolana | `ext/solana-game/skill/playsolana.md` | PlaySolana, PSG1 console, PlayDex, PlayID |
| Game Architecture | `ext/solana-game/skill/game-architecture.md` | On-chain game state, ECS patterns |
| Mobile Games | `ext/solana-game/skill/mobile.md` | Mobile game patterns |
| C# Patterns | `ext/solana-game/skill/csharp-patterns.md` | C# patterns for Solana |
| React Native Patterns | `ext/solana-game/skill/react-native-patterns.md` | React Native game patterns |
| Game Payments | `ext/solana-game/skill/payments.md` | In-game payment flows |
| Game Testing | `ext/solana-game/skill/testing.md` | Game testing strategies |
| Game Resources | `ext/solana-game/skill/resources.md` | Game development resources and links |

---

## Solana Mobile (`ext/solana-mobile`)

Source: [solana-mobile/solana-mobile-dev-skill](https://github.com/solana-mobile/solana-mobile-dev-skill)

| Skill | Path | Description |
|-------|------|-------------|
| Mobile Stack Overview | `ext/solana-mobile/README.md` | Solana Mobile Stack overview and entry point |
| MWA Setup | `ext/solana-mobile/mwa/mwa-setup/SKILL.md` | Mobile Wallet Adapter setup (deps, polyfills, providers) |
| MWA Connection | `ext/solana-mobile/mwa/mwa-connection/SKILL.md` | Wallet connect/disconnect with MWA |
| MWA Transactions | `ext/solana-mobile/mwa/mwa-transactions/SKILL.md` | Transaction signing and SOL transfers via MWA |
| MWA React Native | `ext/solana-mobile/mwa/mobile-wallet-adapter-react-native/SKILL.md` | Full MWA integration for React Native Expo |
| Genesis Token | `ext/solana-mobile/genesis-token/SKILL.md` | Seeker device ownership verification (SGT) |
| SKR Address Resolution | `ext/solana-mobile/skr-address-resolution/SKILL.md` | .skr domain name resolution in React Native |

---

## QEDGen Formal Verification (`ext/qedgen`)

Source: [QEDGen/solana-skills](https://github.com/QEDGen/solana-skills)

| Skill | Path | Description |
|-------|------|-------------|
| Formal Verification | `ext/qedgen/SKILL.md` | Lean 4 theorem proving for Solana programs (Leanstral). Verifies access control, CPI correctness, state machines, arithmetic safety. |

---

## Colosseum (`ext/colosseum`)

Source: [ColosseumOrg/colosseum-copilot](https://github.com/ColosseumOrg/colosseum-copilot)

| Skill | Path | Description |
|-------|------|-------------|
| Colosseum Copilot | `ext/colosseum/skills/colosseum-copilot/SKILL.md` | Solana startup research: idea validation, competitive analysis, hackathon projects (5,400+ submissions), crypto archives, The Grid ecosystem data |
