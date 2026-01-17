# Quick Start: Use This Config in 2 Minutes

## TL;DR

```bash
# 1. Clone or download this repo
git clone https://github.com/your-org/solana-claude-config.git

# 2. Copy to your Solana project
cp -r solana-claude-config/.claude /path/to/your-project/
cp solana-claude-config/CLAUDE-solana.md /path/to/your-project/CLAUDE.md

# 3. Start Claude Code in your project
cd /path/to/your-project
claude
```

That's it. Claude now has Solana superpowers.

---

## What You Get

### 11 Specialized Agents

| Agent | Use For |
|-------|---------|
| **solana-architect** | System design, account structures, PDAs |
| **anchor-engineer** | Anchor program development |
| **pinocchio-engineer** | CU-optimized native programs |
| **game-architect** | Solana game design, concept docs |
| **unity-engineer** | Unity/C# with Solana.Unity-SDK |
| **solana-frontend-engineer** | React/Next.js dApp frontends |
| **rust-backend-engineer** | Rust backend services |
| **solana-qa-engineer** | Testing, fuzzing, security |
| **tech-docs-writer** | Documentation |
| **solana-guide** | Learning and tutorials |
| **solana-researcher** | Ecosystem research |

### 14 Slash Commands

**Building:**
- `/build-program` - Build Anchor or native programs
- `/build-unity` - Build Unity projects (WebGL, PSG1)

**Testing:**
- `/test-rust` - Run Rust tests
- `/test-typescript` - Run TypeScript tests
- `/test-dotnet` - Run .NET/Unity tests
- `/test-and-fix` - Run tests and auto-fix issues
- `/audit-solana` - Security audit

**Deployment:**
- `/deploy` - Deploy to devnet/mainnet

**Workflow:**
- `/quick-commit` - Format, lint, and commit
- `/setup-ci-cd` - Setup CI/CD pipeline
- `/write-docs` - Generate documentation
- `/explain-code` - Explain complex code
- `/plan-feature` - Plan feature implementation

### Auto-Loading Rules

Rules automatically activate based on file patterns:
- `.rs` files → Rust rules
- `.cs` files → C#/.NET rules
- `.ts/.tsx` files → TypeScript rules

### Progressive Skills

Knowledge loads on-demand:
- Solana fundamentals
- Anchor patterns
- Token-2022 extensions
- Unity SDK patterns
- PlaySolana/PSG1 integration

---

## Supported Tech Stack

### Programs
- **Anchor** - Rapid development with macros
- **Pinocchio** - Maximum CU optimization
- **Native Rust** - Full control

### Clients
- **TypeScript** - @solana/kit, Anchor client
- **Rust** - solana-sdk, anchor-client
- **C#/Unity** - Solana.Unity-SDK

### Testing
- **Bankrun** - Fast TypeScript testing
- **LiteSVM** - Lightweight Rust testing
- **Mollusk** - Instruction-level testing
- **Trident** - Fuzz testing

### Platforms
- **Web** - React, Next.js
- **Desktop** - Tauri, Electron
- **Mobile** - React Native
- **Gaming** - Unity (WebGL, PSG1)

---

## Project Structure After Setup

```
your-project/
├── CLAUDE.md              # ← Main config (copied from CLAUDE-solana.md)
├── .claude/
│   ├── agents/            # Specialized AI agents
│   ├── commands/          # Slash commands
│   ├── skills/            # Progressive knowledge
│   ├── rules/             # Auto-loading rules
│   └── settings.json      # Permissions
├── programs/              # Your Solana programs
├── app/                   # Your frontend
└── ...
```

---

## Usage Examples

### Start a New Program
```
You: Create an escrow program
Claude: [Uses solana-architect to design, anchor-engineer to implement]
```

### Build and Test
```
You: /build-program
Claude: [Runs anchor build, reports any errors]

You: /test-rust
Claude: [Runs cargo test, shows results]
```

### Deploy
```
You: /deploy devnet
Claude: [Deploys to devnet, provides program ID]
```

### Get Help
```
You: Explain how PDAs work
Claude: [Uses solana-guide agent with visual diagrams]
```

---

## Customization

### Add Project-Specific Context

Edit your `CLAUDE.md` to add:

```markdown
## Project-Specific

- Program ID: `YourProgram...`
- Main token: `TokenMint...`
- Custom patterns for this project
```

### Adjust Permissions

Edit `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(anchor build)",
      "Bash(cargo test)"
    ]
  }
}
```

---

## Updating

To get the latest config:

```bash
cd solana-claude-config
git pull

# Re-copy to your project
cp -r .claude /path/to/your-project/
cp CLAUDE-solana.md /path/to/your-project/CLAUDE.md
```

---

## Troubleshooting

**Claude doesn't use the config:**
- Ensure `CLAUDE.md` is in your project root
- Ensure `.claude/` folder is in your project root
- Restart Claude Code

**Commands not working:**
- Check `.claude/settings.json` permissions
- Ensure command files are in `.claude/commands/`

**Agent not spawning:**
- Verify agent file exists in `.claude/agents/`
- Check agent description matches your request

---

## Resources

- [CLAUDE-solana.md](./CLAUDE-solana.md) - Full configuration reference
- [.claude/agents/](./claude/agents/) - All agent definitions
- [.claude/commands/](./claude/commands/) - All commands
- [.claude/skills/](./claude/skills/) - Knowledge base

---

**Ready to build on Solana!**
