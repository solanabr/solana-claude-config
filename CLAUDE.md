# Solana Claude Config - Meta Configuration

This repository contains Claude Code configuration for Solana development projects. The actual Solana builder configuration lives in `CLAUDE-solana.md` and should be copied to target projects as their `CLAUDE.md`.

**Install docs**: See README.md and QUICK-START.md.

---

## This Repo's Purpose

You are maintaining the **solana-claude-config** repository - a template/library of Claude Code configurations for Solana development. Your role is to improve, test, and maintain the agents, skills, commands, MCP servers, and rules that other projects will use.

## Token Loading Model

| File | When loaded | Audience | Budget guidance |
|------|-------------|----------|-----------------|
| `CLAUDE.md` | Every conversation (this repo) | Claude maintaining config | Keep lean (<100 lines) |
| `CLAUDE-solana.md` | Every conversation (user projects) | Claude in target projects | Keep <100 lines; HTML comments stripped (free) |
| `.claude/rules/*.md` | Auto-loaded by glob match | Claude editing matched files | Minimal — loads on every matching file edit |
| `.claude/agents/*.md` | On agent spawn only | Spawned agent | Can be detailed — only loads when needed |
| `.claude/commands/*.md` | On command invocation | Claude running command | Can be detailed — only loads when invoked |
| `.claude/skills/SKILL.md` | On skill invocation | Claude routing to skills | Medium — routing hub, not a dump; HTML comments NOT stripped |
| `.claude/skills/*.md` | On-demand via SKILL.md links | Claude needing domain knowledge | Can be detailed — progressive loading |

## Communication Style

- No filler phrases ("I get it", "Awesome, here's what I'll do", "Great question")
- Direct, efficient responses — code/config first, explanations when needed
- Admit uncertainty rather than guess
- Consider token efficiency in all additions

## Common Mistakes

**DON'T**:
- Edit CLAUDE-solana.md without considering it ships to user projects (different audience than this repo)
- Add agent/skill content that duplicates what's already in external submodules
- Reference files by line number in CLAUDE.md — line numbers shift constantly
- Forget .env.example when adding/removing MCP servers
- Leave stale counts (e.g., "15 agents", "22 commands") — grep to verify before committing

**DO**:
- Run `bash validate.sh && bash tests/run_all.sh` before every commit
- Check QUICK-START.md and README.md after any structural change
- Test install.sh in a temp dir after modifying it
- Keep CLAUDE-solana.md under 100 lines — it loads on every user conversation

## Ripple Map

When X changes, also update Y:

| Changed | Also update |
|---------|-------------|
| Add/remove **agent** | README.md agent table + tree count, QUICK-START.md tree count, install.sh output, tests/test_agents.sh + test_install.sh assertions |
| Add/remove **command** | README.md commands tables + tree count, QUICK-START.md tree count, tests/test_commands.sh + test_install.sh assertions |
| Add/remove **MCP server** | README.md MCP table, CLAUDE-solana.md MCP list, QUICK-START.md MCP list, .env.example, .claude/commands/setup-mcp.md |
| Add/remove **submodule** | .gitmodules, README.md submodules table + tree, QUICK-START.md tree, .claude/skills/SKILL.md routing |
| Modify **install.sh** | Test: `bash tests/test_install.sh` in temp dir |
| Modify **CLAUDE-solana.md** | This ships to ALL user projects — different audience than this repo |

## Submodule Pitfalls

- **Never** `git add .claude/skills/ext/<dir>` — commits as tree, not submodule. Use `git submodule add <url> .claude/skills/ext/<name>` then `git add .gitmodules .claude/skills/ext/<name>`.
- Path renames in upstream submodules ripple into all agents + commands that reference skill files. Grep for old path before committing.
- install.sh silently skips submodule init if target isn't a git repo — intentional, not a bug.

## When Editing This Repo

| Component | Location | Key Rule |
|-----------|----------|----------|
| **Agents** | `.claude/agents/` | Non-overlapping responsibilities; spawn other agents for cross-domain work |
| **Skills** | `.claude/skills/` | Progressive loading; reference from `SKILL.md`; prefer code over prose |
| **Commands** | `.claude/commands/` | Atomic (one command, one purpose); document inputs/outputs |
| **Rules** | `.claude/rules/` | Minimal — they load on every matching file; use `globs` in frontmatter |
| **MCP Servers** | `.claude/mcp.json` | Document env vars; test connectivity; update setup-mcp command |

## Agent Teams

Teams are dynamic — created via natural language, not static config (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` enabled in settings.json). See README.md for recommended team patterns.

## Branch Workflow

All changes on feature branches: `git checkout -b <type>/<scope>-<description>-<DD-MM-YYYY>`

## Pre-Merge Checklist

- [ ] `bash validate.sh && bash tests/run_all.sh` passes
- [ ] No duplicate functionality or AI slop (run `/diff-review`)
- [ ] Ripple map checked — all cross-references updated
- [ ] Manual test: `bash install.sh /tmp/test-project` → verify in Claude Code

## Testing Local Changes

- **Local install test**: `SOLANA_CLAUDE_LOCAL_SRC=. bash install.sh /tmp/test-project` — uses local repo instead of cloning from GitHub.
- **Agents-only mode**: `bash install.sh --agents /path` — installs to `.agents/` instead of `.claude/`. Test both modes when modifying install.sh.

## Project Learnings
<!-- Append 1-2 line entries after non-obvious bugs, stale-doc incidents,
     or config changes that had unexpected side effects.
     Don't duplicate existing entries. Check before appending. -->

### Recurring Issues

### Fix Patterns

- When submodule paths change upstream: `grep -r "old/path" .claude/` → update all references → `bash validate.sh`
- When adding a component: follow Ripple Map above, then `bash validate.sh && bash tests/run_all.sh` to catch anything missed

### Config Conventions

---

**Main config**: `CLAUDE-solana.md` | **Agents**: `.claude/agents/` | **Skills**: `.claude/skills/` | **Commands**: `.claude/commands/` | **MCP**: `.claude/mcp.json` | **Rules**: `.claude/rules/`
