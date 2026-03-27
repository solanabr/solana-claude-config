# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-03-26

### Added
- **External Skill**: Colosseum Copilot (startup research, idea validation, hackathon projects) as submodule at `ext/colosseum/`
- Ideation & Research section in SKILL.md skill hub
- Colosseum references in solana-researcher and solana-architect agents

## [1.1.0] - 2026-03-25

### Added
- **External Skill**: QEDGen formal verification (Lean 4 theorem proving) as submodule at `ext/qedgen/`
- Formal verification section in SKILL.md skill hub
- QEDGen references in solana-qa-engineer and solana-architect agents

## [1.0.0] - 2026-03-24

### Added
- **MCP Servers**: Helius, Solana Agent Kit, Solana native, Context7, Puppeteer configurations in `.mcp.json` with `${VAR}` credential expansion
- **New Agents** (4): defi-engineer, mobile-engineer, devops-engineer, token-engineer — total now 15
- **New Commands** (8): /setup-mcp, /update-skills, /profile-cu, /migrate-web3, /scaffold, /diff-review, /benchmark, /generate-idl-client — total now 22
- **New Skill**: token-2022.md — comprehensive Token Extensions guide covering all 12+ extension types
- **External Skills** (5 submodules): solana-dev (Solana Foundation), sendai (DeFi protocols), solana-game (Unity/PSG1), cloudflare (Workers/Agents), trailofbits (security)
- **DX Scripts**: install.sh (one-liner setup), update.sh (config updater), validate.sh (config integrity checker)
- **Test Suite**: 8 test files in tests/ with shared helpers, validating all config integrity
- **GitHub Actions**: CI workflow (validate + test on PRs), Claude Code action template (for @claude in PRs)
- **SKILL.md**: Unified hub routing to all external and local skills
- **Token Extensions section** in SKILL.md skill hub

### Changed
- Restructured skills from local files to external submodule architecture
- Updated CLAUDE-solana.md with MCP references and new agent/command inventory
- Updated README.md with full feature inventory (15 agents, 22 commands, 5 submodules)
- Updated QUICK-START.md with install.sh option and new commands list

### Removed
- Individual local skill files replaced by ext/ submodules (ecosystem.md, frontend-framework-kit.md, idl-codegen.md, etc.)
