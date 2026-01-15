---
name: solana-expert
description: End-to-end Solana development (Jan 2026). Foundation patterns + production extensions. Covers Anchor/Pinocchio, frontend (@solana/kit), backend (Axum), testing, deployment, security.
user-invocable: true
---

# Solana Development Skill

## What This Skill Covers
- On-chain programs (Anchor/Pinocchio)
- Frontend (React/Next.js, @solana/kit)
- Backend services (Axum 0.8+, async patterns)
- Testing (LiteSVM/Mollusk/Trident)
- Security hardening
- Deployment workflows
- Ecosystem integration (DeFi/NFT)

## Default Stack (2026)
- **Frontend**: @solana/kit + framework-kit (web3.js 2.0)
- **Programs**: Anchor (default) | Pinocchio (performance)
- **Testing**: LiteSVM/Mollusk (unit) + Trident (fuzz)
- **Backend**: Axum 0.8+ + Tokio 1.40+

## Progressive Disclosure

### Foundation Patterns (Authoritative)
Reference when needed:
- **programs-anchor.md** - Anchor patterns, security, CPIs (Foundation + 4 enhancements)
- **programs-pinocchio.md** - Zero-copy, CU optimization
- **frontend-framework-kit.md** - React hooks, wallet adapters
- **testing.md** - LiteSVM, Mollusk, Trident, Surfpool
- **security.md** - Comprehensive security checklist
- **idl-codegen.md** - Codama client generation
- **kit-web3-interop.md** - web3.js boundary patterns
- **payments.md** - Payment integration
- **resources.md** - Official documentation links

### Production Extensions (Custom)
- **backend-async.md** - Axum 0.8/Tokio patterns, spawn_blocking, RPC integration
- **deployment.md** - Devnet/mainnet workflows, verifiable builds, safety checks
- **ecosystem.md** - DeFi protocols, NFT standards, data indexing

### Pattern Libraries
- **anchor-patterns.md** - Common Anchor patterns (account validation, PDAs, CPIs, error handling)
- **rust-async-patterns.md** - Async backend patterns (Axum 0.8, error handling, DB, WebSocket)
- **web3-patterns.md** - Frontend integration patterns (Web3.js 2.0, wallet adapters, React Query)

## Operating Principles
1. **Foundation files are the golden standard**
2. **Enhanced sections marked with "### Enhanced:"**
3. **Load specific files only when needed**
4. **Agents discover patterns autonomously**

## For Agents
Reference specific skill files based on task:
- **Architecture/Design** → security.md, ecosystem.md
- **Anchor Implementation** → programs-anchor.md, anchor-patterns.md
- **CU Optimization** → programs-pinocchio.md
- **Frontend** → frontend-framework-kit.md, web3-patterns.md
- **Backend Services** → backend-async.md, rust-async-patterns.md
- **Testing** → testing.md
- **Deployment** → deployment.md
- **Security Audit** → security.md

## Key Enhancements in programs-anchor.md
The Foundation version includes 4 critical custom enhancements:
1. **Canonical Bump Pattern** - Save ~1500 CU per PDA access
2. **Account Reloading After CPIs** - Critical for correctness (prevent stale data)
3. **Event Emission** - Observability best practice
4. **Security Checklist** - Actionable per-instruction verification

All enhancements clearly marked with "### Enhanced:" prefix.
