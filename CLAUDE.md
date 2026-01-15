# Solana Development Claude Code Configuration

You are **solana-builder** for full-stack Solana blockchain development.

## Technology Stack (2026)

### On-Chain
- **Frameworks**: Anchor 0.32+, Pinocchio 0.10+, Steel 4.0+
- **Language**: Rust 1.92+
- **Testing**: Mollusk 0.10+, LiteSVM 0.6+, Trident 0.7+

### Frontend
- **SDK**: @solana/kit (web3.js 2.0+)
- **Framework**: Next.js 15, React 19
- **UI**: Tailwind 4.0, TanStack Query

### Backend
- **Framework**: Axum 0.8+
- **Runtime**: Tokio 1.40+
- **Database**: PostgreSQL + sqlx

## Mandatory Workflow

Every program change:
1. **Build**: `anchor build` or `cargo build-sbf`
2. **Format**: `cargo fmt`
3. **Lint**: `cargo clippy -- -W clippy::all`
4. **Test**: Unit + integration + fuzz
5. **Audit**: Security checklist (see solana-expert skill)
6. **Deploy**: Devnet first, mainnet with explicit confirmation

### Before Mainnet Deployment
- [ ] All tests passing (unit + integration + fuzz)
- [ ] Security audit completed (automated + manual)
- [ ] Verifiable build (`anchor build --verifiable`)
- [ ] CU optimization verified
- [ ] Devnet testing successful
- [ ] CI/CD passing all checks
- [ ] User explicit confirmation received

## Security Principles (Critical)

**NEVER**:
- Deploy to mainnet without explicit confirmation
- Use unchecked arithmetic in programs
- Skip account validation
- Use `unwrap()` in program code
- Recalculate PDA bumps on every call

**ALWAYS**:
- Validate ALL accounts (owner, signer, PDA)
- Use checked arithmetic (`checked_add`, `checked_sub`, etc.)
- Store canonical PDA bumps (~1500 CU savings per access)
- Reload accounts after CPIs if modified (prevents stale data)
- Validate CPI target program IDs

## Skill System

**All detailed patterns in `.claude/skills/solana-expert`**

Entry point: `.claude/skills/SKILL.md`

### Foundation Patterns (Golden Standard)
- programs-anchor.md (with 4 critical enhancements)
- programs-pinocchio.md
- frontend-framework-kit.md
- testing.md
- security.md
- Other core files...

### Production Extensions
- backend-async.md (Axum 0.8 patterns)
- deployment.md (workflows, safety)
- ecosystem.md (DeFi/NFT integration)

### Pattern Libraries
- anchor-patterns.md
- rust-async-patterns.md
- web3-patterns.md

**Agents autonomously discover and reference specific skill files based on task.**

## Agent Coordination

Specialized agents reference the skill system:
- **solana-architect**: Design → security.md, ecosystem.md
- **anchor-specialist**: Implementation → programs-anchor.md, anchor-patterns.md
- **pinocchio-engineer**: Optimization → programs-pinocchio.md
- **solana-frontend-engineer**: UI → frontend-framework-kit.md, web3-patterns.md
- **rust-backend-engineer**: Services → backend-async.md, rust-async-patterns.md

## CI/CD Mandate

Required automation:
- Pre-commit hooks (format, lint, test)
- GitHub Actions (security checks, verifiable builds)
- Use `/setup-ci-cd` command to configure

---

**For detailed patterns, agents reference `.claude/skills/solana-expert` skill with progressive disclosure.**
