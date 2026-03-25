---
name: solana-game
description: Solana game development with Unity, React Native, and web. Extends solana-dev-skill with gaming-specific patterns including Solana.Unity-SDK, Mobile Wallet Adapter, PlaySolana/PSG1, wallet integration, NFT systems, transaction building, and game architecture. For program development (Anchor, Pinocchio), delegates to core solana-dev skill.
user-invocable: true
---

# Solana Game Development Skill

> **Extends**: [solana-dev-skill](../solana-dev/SKILL.md) - Core Solana development (programs, frontend, testing, security)

## What This Skill Is For

Use this skill when the user asks for:

### Unity Game Development
- Unity game development with Solana integration
- Wallet connection in Unity (Phantom, Solflare, InGame, Web3Auth)
- NFT loading, display, and game asset integration
- Transaction building and signing in C#
- PlaySolana/PSG1 console development

### Mobile Game Development (React Native)
- React Native mobile games with Solana
- Mobile Wallet Adapter integration
- Offline-first game architecture
- Deep linking with Solana wallets
- Cross-platform iOS/Android development

### Web Frontend (Gaming Context)
- Next.js/React frontends with Solana
- Wallet connection with framework-kit
- NFT galleries and game UIs
- Transaction UX patterns

### Game Architecture
- On-chain vs off-chain game state
- Player progression and achievements
- Token economics and in-game currencies
- Multiplayer architecture with blockchain validation

### Program Development (Delegate to Core Skill)
- For Anchor programs → [programs-anchor.md](../solana-dev/programs-anchor.md)
- For Pinocchio programs → [programs-pinocchio.md](../solana-dev/programs-pinocchio.md)
- For IDL/codegen → [idl-codegen.md](../solana-dev/idl-codegen.md)

## Default Stack Decisions (Opinionated)

### 1) Unity Games: Unity 6000+ LTS
- Solana.Unity-SDK 3.1.0+ via UPM
- Modern Input System, UI Toolkit
- .NET 9 / C# 13
- Assembly definitions for organization

### 2) Mobile Games: React Native 0.76+ with Expo
- Mobile Wallet Adapter 2.x
- Zustand 5.x for state
- MMKV 3.x for storage
- TanStack Query 5.x for RPC data

### 3) Web: framework-kit first
- @solana/client + @solana/react-hooks
- @solana/kit for transactions
- Next.js 15 with App Router

### 4) Testing
- Unity: Edit Mode + Play Mode tests
- React Native: Jest + RNTL + Detox
- Web: Vitest + React Testing Library
- Programs: LiteSVM, Mollusk, Surfpool (see core skill)

### 5) Platform Targets
- Default: Desktop (Windows/macOS) and WebGL
- Mobile: When explicitly specified
- PSG1: When explicitly targeting PlaySolana

## Operating Procedure

### 1. Classify the Task Layer

| Layer | Examples | Skill File(s) |
|-------|----------|---------------|
| Unity/C# | Game mechanics, UI, wallet | [unity-sdk.md](unity-sdk.md), [csharp-patterns.md](csharp-patterns.md) |
| Mobile/RN | Mobile apps, MWA, offline | [mobile.md](mobile.md), [react-native-patterns.md](react-native-patterns.md) |
| Web/Frontend | Next.js, React, wallet | [frontend-framework-kit.md](../solana-dev/frontend-framework-kit.md) |
| Game Architecture | On-chain state, economics | [game-architecture.md](game-architecture.md) |
| Program/Anchor | On-chain game logic | [programs-anchor.md](../solana-dev/programs-anchor.md) |
| Program/Pinocchio | High-perf programs | [programs-pinocchio.md](../solana-dev/programs-pinocchio.md) |

### 2. Pick the Right Agent

| Task Type | Agent | Model |
|-----------|-------|-------|
| High-level design | game-architect | opus |
| Unity code | unity-engineer | sonnet |
| Mobile code | mobile-engineer | sonnet |
| Learning/tutorials | solana-guide | sonnet |
| Documentation | tech-docs-writer | sonnet |

### 3. Apply Platform-Specific Patterns

**Unity:**
- Use WalletService pattern with events
- TransactionBuilder for building transactions
- NFTService with texture caching
- Async/await for all blockchain operations

**React Native:**
- Mobile Wallet Adapter for wallet connection
- Zustand stores for game state
- MMKV for offline persistence
- Network-aware sync patterns

**Web:**
- framework-kit hooks for wallet/balance
- React Query for RPC data
- Zustand for app state
- Kit types for transactions

### 4. Add Tests

- **Unity**: Edit Mode for logic, Play Mode for MonoBehaviours
- **React Native**: Component tests, hook tests, E2E
- **Web**: Component tests, hook tests
- **Programs**: LiteSVM/Mollusk (see [testing.md](../solana-dev/testing.md))
- **Two-strike rule**: If test fails twice, STOP and ask

### 5. Deliverables

When implementing changes, provide:
- Exact files changed with clear diffs
- Package dependencies (manifest.json, package.json)
- Build/test commands
- Platform considerations

---

## Progressive Disclosure (Read When Needed)

### Gaming-Specific Skills (This Addon)

#### Unity & C#
- [unity-sdk.md](unity-sdk.md) - Solana.Unity-SDK integration patterns
- [csharp-patterns.md](csharp-patterns.md) - C# coding standards and patterns

#### Mobile
- [mobile.md](mobile.md) - Mobile Wallet Adapter, Expo, offline-first
- [react-native-patterns.md](react-native-patterns.md) - React Native patterns

#### Game Systems
- [game-architecture.md](game-architecture.md) - On-chain vs off-chain, state design
- [playsolana.md](playsolana.md) - PSG1 console, PlayDex, PlayID
- [payments.md](payments.md) - Commerce, token transfers, in-game economy, Arcium rollups

#### Gaming Testing
- [testing.md](testing.md) - Unity Test Framework, Jest, React Native testing

#### Reference
- [resources.md](resources.md) - Curated links to SDKs and documentation

### Core Solana Dev Skills (from solana-dev-skill)

> These are provided by [solana-dev-skill](../solana-dev/SKILL.md) - install if not present

#### Web Frontend
- [frontend-framework-kit.md](../solana-dev/frontend-framework-kit.md) - React hooks, wallet connection
- [kit-web3-interop.md](../solana-dev/kit-web3-interop.md) - Kit ↔ web3.js boundary patterns

#### Program Development
- [programs-anchor.md](../solana-dev/programs-anchor.md) - Anchor framework patterns
- [programs-pinocchio.md](../solana-dev/programs-pinocchio.md) - Pinocchio high-performance programs
- [idl-codegen.md](../solana-dev/idl-codegen.md) - IDL generation and client codegen

#### Core Testing & Security
- [testing.md](../solana-dev/testing.md) - LiteSVM, Mollusk, Surfpool
- [security.md](../solana-dev/security.md) - Security checklist (programs + clients)
- [payments.md](../solana-dev/payments.md) - Core payment patterns
- [resources.md](../solana-dev/resources.md) - Core Solana resources

---

## Task Routing Guide

| User asks about... | Primary skill file(s) |
|--------------------|----------------------|
| Unity wallet connection | unity-sdk.md |
| Unity NFT loading | unity-sdk.md |
| Unity transaction building | unity-sdk.md, csharp-patterns.md |
| C# async patterns | csharp-patterns.md |
| React Native mobile game | mobile.md, react-native-patterns.md |
| Mobile Wallet Adapter | mobile.md |
| Offline sync | mobile.md |
| Web wallet connection | solana-dev → frontend-framework-kit.md |
| Kit vs web3.js | solana-dev → kit-web3-interop.md |
| Game state architecture | game-architecture.md |
| PSG1 console | playsolana.md |
| PlayDex achievements | playsolana.md |
| In-game purchases | payments.md |
| Arcium rollups | payments.md |
| Testing Unity | testing.md |
| Testing React Native | testing.md, react-native-patterns.md |
| Security review | solana-dev → security.md |
| DeFi integration | solana-dev → payments.md |
| Token standards | solana-dev → payments.md |
| **Anchor program** | solana-dev → programs-anchor.md |
| **Pinocchio program** | solana-dev → programs-pinocchio.md |
| **Program testing** | solana-dev → testing.md |

---

## Commands

| Command | Description |
|---------|-------------|
| /build-unity | Build Unity projects (WebGL, Desktop, PSG1) |
| /test-dotnet | Run .NET/C# tests (Unity Test Framework) |
| /build-react-native | Build React Native projects |
| /test-react-native | Run React Native tests |
| /quick-commit | Quick commit with conventional messages |

## Agents

| Agent | Purpose |
|-------|---------|
| **game-architect** | Game design, architecture, on-chain state, token economics |
| **unity-engineer** | Unity/C# implementation, wallet, NFT, transactions |
| **mobile-engineer** | React Native, MWA, offline-first, deep linking |
| **solana-guide** | Education, tutorials, concept explanations |
| **tech-docs-writer** | README files, API docs, integration guides |
