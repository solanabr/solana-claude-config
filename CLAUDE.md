# Solana Claude Config - Meta Configuration

This repository contains Claude Code configuration for Solana development projects. The actual Solana builder configuration lives in `CLAUDE-solana.md` and should be copied to target projects as their `CLAUDE.md`.

**To use this config in a Solana project:**
```bash
# Option 1: One-liner installer
curl -fsSL https://raw.githubusercontent.com/solanabr/solana-claude-config/main/install.sh | bash

# Option 2: Manual setup
git clone --recurse-submodules https://github.com/solanabr/solana-claude-config.git
cp -r solana-claude-config/.claude /path/to/your-project/
cp solana-claude-config/CLAUDE-solana.md /path/to/your-project/CLAUDE.md
cd /path/to/your-project && git submodule update --init --recursive
```

---

## This Repo's Purpose

You are maintaining the **solana-claude-config** repository - a template/library of Claude Code configurations for Solana development. Your role is to improve, test, and maintain the agents, skills, commands, MCP servers, and rules that other projects will use.

## Communication Style

- Direct, efficient responses
- Explain rationale for config changes
- Consider token efficiency in all additions
- Test changes where possible

## Repository Structure

```
.
├── CLAUDE.md              # This file (meta-config for maintaining this repo)
├── CLAUDE-solana.md       # The actual Solana builder config (copy to projects)
├── README.md              # Documentation for users
├── QUICK-START.md         # Quick start guide
├── CHANGELOG.md           # Version history
├── install.sh             # One-liner installer script
├── update.sh              # Config updater script
├── validate.sh            # Config integrity checker
├── LICENSE
├── tests/                 # Config integrity test suite
│   ├── helpers.sh             # Shared test utilities
│   ├── run_all.sh             # Test runner
│   └── test_*.sh              # Individual test files
├── .github/workflows/
│   ├── ci.yml                 # PR validation (validate + tests)
│   └── claude-code.yml        # Claude Code action template
└── .claude/
    ├── agents/            # 15 specialized agents
    │   ├── solana-architect.md
    │   ├── anchor-engineer.md
    │   ├── pinocchio-engineer.md
    │   ├── defi-engineer.md
    │   ├── token-engineer.md
    │   ├── solana-frontend-engineer.md
    │   ├── mobile-engineer.md
    │   ├── rust-backend-engineer.md
    │   ├── devops-engineer.md
    │   ├── solana-qa-engineer.md
    │   ├── tech-docs-writer.md
    │   ├── game-architect.md
    │   ├── unity-engineer.md
    │   ├── solana-guide.md
    │   └── solana-researcher.md
    ├── commands/          # 22 workflow commands
    ├── skills/            # Progressive-loading knowledge files
    │   ├── SKILL.md           # Unified hub routing to all skills
    │   ├── ext/               # External skill submodules
    │   │   ├── solana-dev/        # solana-foundation/solana-dev-skill
    │   │   ├── sendai/            # sendaifun/skills (DeFi protocols)
    │   │   ├── solana-game/       # solanabr/solana-game-skill
    │   │   ├── cloudflare/        # cloudflare/skills
    │   │   └── trailofbits/       # trailofbits/skills (security)
    │   ├── token-2022.md      # Local: Token Extensions guide
    │   ├── backend-async.md   # Local: Axum/Tokio patterns
    │   └── deployment.md      # Local: Deployment workflows
    ├── mcp.json           # MCP server configurations (Helius, Context7, Puppeteer, etc.)
    ├── rules/             # Auto-loading constraint files
    └── settings.json      # Permissions, hooks, agent teams
```

## When Editing This Repo

### Adding/Modifying Agents (`.claude/agents/`)
- Each agent should have a clear, non-overlapping responsibility
- Include: identity, tools available, decision frameworks, skill references
- Keep agents focused - spawn other agents for cross-domain work
- Test agent behavior in real scenarios

### Adding/Modifying Skills (`.claude/skills/`)
- Skills load progressively - only when needed
- Reference from `SKILL.md` entry point
- Include version-specific information (stack versions, API changes)
- Prefer code examples over prose

### Adding/Modifying Commands (`.claude/commands/`)
- Commands are user-invocable workflows
- Include clear trigger conditions
- Document expected inputs/outputs
- Keep atomic - one command, one purpose

### Adding/Modifying Rules (`.claude/rules/`)
- Rules auto-load based on file patterns
- Keep rules minimal - they load on every matching file
- Use `globs` in frontmatter to specify patterns

### Adding/Modifying MCP Servers (`.claude/mcp.json`)
- Each server needs clear env var documentation
- Test connectivity before committing
- Document required API keys in setup-mcp command

## Agent Teams

Agent teams are dynamic — created via natural language, not static config. The `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` flag is enabled in settings.json.

Recommended team patterns for Solana development:

| Team Pattern | Agents | Use Case |
|-------------|--------|----------|
| **program-ship** | architect → anchor/pinocchio → qa | Build program from spec to tested |
| **full-stack** | architect → anchor → frontend → qa | End-to-end feature |
| **audit-and-fix** | qa → (trailofbits context) → anchor | Audit and remediate |
| **game-ship** | game-architect → unity → qa | Game feature end-to-end |
| **research-and-build** | researcher → architect → anchor | Research protocol then integrate |
| **defi-compose** | researcher → defi-engineer → qa | DeFi integration |
| **token-launch** | token-engineer → frontend → qa | Token creation and launch UI |

Users invoke teams via natural language: "Create an agent team to build a vault program. Use solana-architect for design, anchor-engineer for implementation, and solana-qa-engineer for testing."

## Quality Standards

When making changes:
1. **Token efficiency**: Will this addition justify its token cost?
2. **Clear separation**: Does this overlap with existing agents/skills?
3. **Testability**: Can this be validated in a real project?
4. **Maintenance**: Will this stay current or become stale?

## Branch Workflow

```bash
# All changes on feature branches
git checkout -b <type>/<scope>-<description>-<DD-MM-YYYY>

# Examples:
# feat/agent-new-specialist-15-01-2026
# fix/skill-outdated-api-15-01-2026
# docs/readme-examples-15-01-2026
```

## Testing Changes

### Automated
```bash
# Run full validation + test suite
bash validate.sh
bash tests/run_all.sh
```

### Manual
1. Creating a test Solana project
2. Running: `bash install.sh /tmp/test-project`
3. Running Claude Code in the test project
4. Verifying agent/skill/command behavior

## Pre-Merge Checklist

- [ ] Changes follow existing patterns
- [ ] No duplicate functionality or AI comments
- [ ] Token-efficient (no bloat)
- [ ] `bash validate.sh` passes
- [ ] `bash tests/run_all.sh` passes
- [ ] README updated if user-facing
- [ ] CHANGELOG.md updated

---

**Main config**: `CLAUDE-solana.md` | **Agents**: `.claude/agents/` | **Skills**: `.claude/skills/` | **Commands**: `.claude/commands/` | **MCP**: `.claude/mcp.json` | **Rules**: `.claude/rules/`
