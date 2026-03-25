# Agent Skills Specification

This document outlines the specification for creating skills compatible with Claude Code.

## Skill Structure

A skill is a directory containing at minimum a `SKILL.md` file.

```
skill-name/
├── SKILL.md          # Required: Skill definition
├── scripts/          # Optional: Supporting scripts
├── resources/        # Optional: Additional resources
└── examples/         # Optional: Example files
```

## SKILL.md Format

### Frontmatter (Required)

The file must begin with YAML frontmatter:

```yaml
---
name: skill-name
description: Description of the skill
---
```

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique identifier, lowercase with hyphens |
| `description` | Yes | What the skill does and when to invoke it |

### Body Content

The markdown body contains instructions Claude follows when the skill is active. Common sections include:

- **Overview** - High-level description
- **Instructions** - Step-by-step guidance
- **Examples** - Usage patterns
- **Guidelines** - Constraints and best practices

## Skill Discovery

Skills are discovered by scanning directories for `SKILL.md` files. The parent folder name should match the `name` field in frontmatter.

## Invocation

Skills can be invoked:
- Explicitly via slash command (`/skill-name`)
- Automatically based on context matching the description

## Best Practices

1. Keep skill scope focused and specific
2. Write clear, unambiguous instructions
3. Include practical examples
4. Define edge cases and limitations
5. Test skills with various inputs

## References

- [Agent Skills Standard](https://agentskills.io)
- [Anthropic Skills Repository](https://github.com/anthropics/skills)
