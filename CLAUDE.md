# Solana Claude Config - Meta Configuration

This repository contains Claude Code configuration for Solana development projects. The actual Solana builder configuration lives in `CLAUDE-solana.md` and should be copied to target projects as their `CLAUDE.md`.

**To use this config in a Solana project:**
```bash
cp -r .claude /path/to/your-project/
cp CLAUDE-solana.md /path/to/your-project/CLAUDE.md
```

---

## This Repo's Purpose

You are maintaining the **solana-claude-config** repository - a template/library of Claude Code configurations for Solana development. Your role is to improve, test, and maintain the agents, skills, commands, and rules that other projects will use.

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
├── LICENSE
└── .claude/
    ├── agents/            # Specialized agent definitions
    ├── commands/          # Workflow command definitions
    ├── skills/            # Progressive-loading knowledge files
    ├── rules/             # Auto-loading constraint files
    └── settings.json      # Permissions and hooks
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

Since this is a config repo, test changes by:
1. Creating a test Solana project
2. Copying the config: `cp -r .claude /tmp/test-project/ && cp CLAUDE-solana.md /tmp/test-project/CLAUDE.md`
3. Running Claude Code in the test project
4. Verifying agent/skill/command behavior

## Pre-Merge Checklist

- [ ] Changes follow existing patterns
- [ ] No duplicate functionality or AI comments
- [ ] Token-efficient (no bloat)
- [ ] README updated if user-facing

---

**Main config**: `CLAUDE-solana.md` | **Agents**: `.claude/agents/` | **Skills**: `.claude/skills/` | **Commands**: `.claude/commands/` | **Rules**: `.claude/rules/`
