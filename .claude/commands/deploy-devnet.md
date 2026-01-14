---
description: "Deploy Solana program to devnet"
---

You are deploying to Solana devnet. This is safe for testing.

## Step 1: Verify Build

```bash
# Ensure program is built
anchor build
# or
cargo build-sbf

# Check program exists
ls -lh target/deploy/*.so
```

## Step 2: Configure Network

```bash
# Switch to devnet
solana config set --url devnet

# Verify configuration
solana config get

# Should show: RPC URL: https://api.devnet.solana.com
```

## Step 3: Check Wallet and Balance

```bash
# Check current wallet
solana address

# Check balance (need SOL for deployment)
solana balance

# If balance is low, airdrop SOL (devnet only!)
solana airdrop 2

# Verify balance after airdrop
solana balance
```

## Step 4: Deploy Program

### For Anchor

```bash
# Deploy to devnet
anchor deploy --provider.cluster devnet

# Save program ID
PROGRAM_ID=$(solana address -k target/deploy/program-keypair.json)
echo "Program ID: $PROGRAM_ID"

# Update lib.rs and Anchor.toml with program ID if needed
```

### For Native Rust

```bash
# Deploy program
solana program deploy target/deploy/program.so

# Or with specific keypair
solana program deploy \
    target/deploy/program.so \
    --program-id target/deploy/program-keypair.json
```

## Step 5: Verify Deployment

```bash
# Check program is deployed
solana program show $PROGRAM_ID

# Should show:
# - Program Id
# - Owner (your wallet or upgrade authority)
# - Data Length
# - Last Deployed Slot

# Verify upgrade authority
solana program show $PROGRAM_ID | grep "Upgrade Authority"
```

## Step 6: Test on Devnet

```bash
# For Anchor, run tests against devnet
anchor test --skip-build --skip-deploy

# Or test specific functionality
# (write custom test scripts here)
```

## Step 7: Share Devnet Program

```bash
# Program ID for frontend
echo "Program ID: $PROGRAM_ID"

# Explorer link
echo "Explorer: https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"

# If Anchor, share IDL
echo "IDL: target/idl/program_name.json"
```

## Common Issues

### Insufficient Balance
```bash
# Airdrop more SOL
solana airdrop 2

# Check airdrop limit (usually 5 SOL per request)
```

### Program Deployment Failed
```bash
# Check error message
# Common issues:
# - Program size too large (>400KB)
# - Insufficient funds
# - Network congestion (retry)
```

### Wrong Network
```bash
# Verify you're on devnet
solana config get

# Switch back to devnet if needed
solana config set --url devnet
```

## Deployment Checklist

After successful deployment:

- [ ] Program deployed to devnet
- [ ] Program ID saved and documented
- [ ] Upgrade authority verified
- [ ] Program visible on explorer
- [ ] Basic functionality tested
- [ ] Frontend can interact with program
- [ ] Ready for integration testing

## Next Steps

1. Test all program instructions on devnet
2. Integrate with frontend
3. Run through user flows
4. Fix any issues found
5. When ready, prepare for mainnet deployment
