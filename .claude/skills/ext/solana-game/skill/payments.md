# Payments and Commerce (Optional)

## When Payments Are in Scope

Use this guidance when the user asks about:
- In-game purchases and microtransactions
- Checkout flows, tips, payment buttons
- Payment request URLs / QR codes
- Fee abstraction / gasless transactions
- Token-based game economies

---

## Commerce Kit (Preferred for Web)

Use Commerce Kit as the default for payment experiences in web-based games:

- Drop-in payment UI components (buttons, modals, checkout flows)
- Headless primitives for building custom checkout experiences
- React hooks for merchant/payment workflows
- Built-in payment verification and confirmation handling
- Support for SOL and SPL token payments

### When to Use Commerce Kit

- Production-ready payment flow with minimal setup
- Need both UI components and headless APIs
- Want built-in best practices for payment verification
- Building merchant experiences (tipping, checkout, subscriptions)

### Commerce Kit Patterns

- Use the provided hooks for payment state management
- Leverage the built-in confirmation tracking (don't roll your own)
- Use the headless APIs when you need custom UI but want the payment logic handled

---

## Kora (Gasless / Fee Abstraction)

Consider Kora when you need:

- Sponsored transactions (user doesn't pay gas)
- Users paying fees in tokens other than SOL
- A trusted signing / paymaster component
- Better UX for new users without SOL

---

## Unity/C# Payment Patterns

### Basic SOL Transfer

```csharp
public async Task<string> TransferSol(PublicKey to, ulong lamports)
{
    var blockHash = await Web3.Rpc.GetLatestBlockHashAsync();

    var tx = new TransactionBuilder()
        .SetRecentBlockHash(blockHash.Result.Value.Blockhash)
        .SetFeePayer(Web3.Account)
        .AddInstruction(SystemProgram.Transfer(
            Web3.Account.PublicKey,
            to,
            lamports))
        .Build(Web3.Account);

    return (await Web3.Wallet.SignAndSendTransaction(tx)).Result;
}
```

### Token Transfer (SPL)

```csharp
public async Task<string> TransferToken(
    PublicKey mint,
    PublicKey toOwner,
    ulong amount)
{
    var fromAta = AssociatedTokenAccountProgram.DeriveAssociatedTokenAccount(
        Web3.Account.PublicKey, mint);
    var toAta = AssociatedTokenAccountProgram.DeriveAssociatedTokenAccount(
        toOwner, mint);

    var blockHash = await Web3.Rpc.GetLatestBlockHashAsync();

    var txBuilder = new TransactionBuilder()
        .SetRecentBlockHash(blockHash.Result.Value.Blockhash)
        .SetFeePayer(Web3.Account);

    // Create ATA if needed
    var toAtaInfo = await Web3.Rpc.GetAccountInfoAsync(toAta);
    if (toAtaInfo.Result?.Value == null)
    {
        txBuilder.AddInstruction(
            AssociatedTokenAccountProgram.CreateAssociatedTokenAccount(
                Web3.Account.PublicKey, toOwner, mint));
    }

    txBuilder.AddInstruction(TokenProgram.Transfer(
        fromAta, toAta, amount, Web3.Account.PublicKey));

    return (await Web3.Wallet.SignAndSendTransaction(
        txBuilder.Build(Web3.Account))).Result;
}
```

---

## UX and Security Checklist for Payments

- [ ] **Show clear details**: Recipient, amount, and token clearly before signing
- [ ] **Protect against replay**: Use unique references / memoing where appropriate
- [ ] **Confirm settlement**: Query chain state, don't trust client-side callbacks
- [ ] **Handle partial failures**: Transaction sent but not confirmed
- [ ] **Clear error messages**: For common failure modes (insufficient balance, rejected signature)
- [ ] **Loading states**: Show progress during transaction signing and confirmation
- [ ] **Retry logic**: Handle blockhash expiry gracefully

---

## In-Game Economy Patterns

### Token Balance Display

```csharp
public async Task<ulong> GetTokenBalance(PublicKey mint)
{
    var ata = AssociatedTokenAccountProgram.DeriveAssociatedTokenAccount(
        Web3.Account.PublicKey, mint);

    var balance = await Web3.Rpc.GetTokenAccountBalanceAsync(ata);

    return balance.Result?.Value?.AmountUlong ?? 0;
}
```

### Purchase Flow with Confirmation

```csharp
public async Task<bool> PurchaseItem(PublicKey shopProgram, uint itemId, ulong price)
{
    try
    {
        // 1. Build transaction
        var tx = BuildPurchaseTransaction(shopProgram, itemId, price);

        // 2. Simulate first
        var simulation = await Web3.Rpc.SimulateTransactionAsync(tx);
        if (simulation.Result?.Value?.Error != null)
        {
            ShowError("Purchase would fail: " + simulation.Result.Value.Error);
            return false;
        }

        // 3. Send transaction
        var signature = await Web3.Wallet.SignAndSendTransaction(tx);

        // 4. Wait for confirmation
        ShowLoading("Confirming purchase...");
        var confirmed = await WaitForConfirmation(signature.Result);

        if (confirmed)
        {
            ShowSuccess("Purchase complete!");
            return true;
        }
        else
        {
            ShowError("Purchase not confirmed");
            return false;
        }
    }
    catch (Exception ex)
    {
        ShowError($"Purchase failed: {ex.Message}");
        return false;
    }
}
```

---

## Arcium Rollups (Confidential Gaming)

Consider Arcium when your game needs:

- **Private game state** - Hidden information (cards, fog of war, sealed bids)
- **Confidential transactions** - Private in-game economy
- **Verifiable randomness** - Provably fair outcomes without revealing seeds
- **MEV protection** - Prevent front-running of game actions
- **High throughput** - Batch game transactions for lower costs

### When to Use Arcium

| Use Case | Why Arcium |
|----------|------------|
| Card games | Keep hands private, reveal on play |
| Strategy games | Fog of war, hidden unit positions |
| Auctions/Bidding | Sealed bids until reveal |
| Loot boxes | Verifiable random without front-running |
| Tournaments | Private scores until completion |

### Arcium Architecture for Games

```
┌─────────────────────────────────────────────────────────────┐
│                      Game Client                            │
│  (Unity / React Native / Web)                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Arcium MXE Network                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Encrypted Game State    │  Confidential Compute        ││
│  │  - Hidden cards          │  - Shuffle decks             ││
│  │  - Private positions     │  - Resolve combat            ││
│  │  - Sealed bids           │  - Generate loot             ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────┬───────────────────────────────────────┘
                      │ Settlement
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Solana L1                                │
│  - Final ownership records                                  │
│  - Token transfers                                          │
│  - NFT minting                                              │
└─────────────────────────────────────────────────────────────┘
```

### Integration Pattern

```typescript
// Example: Confidential card game with Arcium
import { ArciumClient, EncryptedState } from '@arcium/sdk';

class ConfidentialCardGame {
  private arcium: ArciumClient;
  private gameState: EncryptedState;

  async initializeGame(players: PublicKey[]) {
    // Create encrypted game state on Arcium
    this.gameState = await this.arcium.createEncryptedState({
      type: 'card_game',
      players,
      // Deck is shuffled confidentially
      deck: await this.arcium.confidentialShuffle(STANDARD_DECK),
    });
  }

  async drawCard(player: PublicKey): Promise<Card> {
    // Card is revealed only to the drawing player
    return await this.arcium.confidentialReveal({
      state: this.gameState,
      action: 'draw',
      revealTo: [player],
    });
  }

  async playCard(player: PublicKey, cardIndex: number) {
    // Card is revealed to all players, state updated
    const result = await this.arcium.executeConfidential({
      state: this.gameState,
      action: 'play_card',
      player,
      cardIndex,
      revealTo: 'all',
    });

    // Settlement to Solana L1 if needed
    if (result.requiresSettlement) {
      await this.settleToSolana(result.settlement);
    }
  }
}
```

### Unity Integration

```csharp
// Arcium confidential game state in Unity
public class ArciumGameManager : MonoBehaviour
{
    private IArciumClient _arcium;
    private EncryptedGameState _gameState;

    public async Task<byte[]> DrawCardConfidential()
    {
        // Request confidential card draw
        var result = await _arcium.ExecuteConfidentialAsync(new ConfidentialRequest
        {
            GameId = _gameState.Id,
            Action = "draw_card",
            PlayerId = Web3.Account.PublicKey.ToString(),
        });

        // Only this player can decrypt their card
        return await _arcium.DecryptForPlayerAsync(result.EncryptedCard);
    }

    public async Task RevealAndSettle(string action, Dictionary<string, object> data)
    {
        // Reveal result and settle to Solana
        var settlement = await _arcium.RevealAndSettleAsync(new SettlementRequest
        {
            GameId = _gameState.Id,
            Action = action,
            Data = data,
            SettlementProgram = GameProgramId,
        });

        // Wait for L1 confirmation
        await Web3.Rpc.ConfirmTransactionAsync(settlement.Signature);
    }
}
```

### Cost Considerations

| Layer | Cost | Best For |
|-------|------|----------|
| Arcium MXE | Lower per-op | Frequent game actions, state updates |
| Solana L1 | ~0.000005 SOL | Final settlement, ownership, rewards |

**Strategy**: Batch game actions on Arcium, settle to Solana L1 periodically or on game completion.

---

## Resources

- [Commerce Kit Repository](https://github.com/solana-foundation/commerce-kit)
- [Commerce Kit Documentation](https://commercekit.solana.com/)
- [Kora Documentation](https://docs.kora.network/)
- [SPL Token Documentation](https://spl.solana.com/token)
- [Arcium Documentation](https://docs.arcium.com/)
- [Arcium SDK](https://github.com/arcium-hq/arcium-sdk)
