---
description: "Deploy Solana program to mainnet (REQUIRES CONFIRMATION)"
---

You are deploying to Solana MAINNET. This is IRREVERSIBLE and costs real SOL.

## ⚠️  CRITICAL PRE-DEPLOYMENT CHECKLIST

**STOP: Do NOT proceed without ALL items checked:**

- [ ] All tests passing (unit + integration + fuzz)
- [ ] Security audit completed (use /audit-solana)
- [ ] CU usage optimized and verified
- [ ] Devnet testing successful (multiple days)
- [ ] Program audited by professional firm (for financial programs)
- [ ] Emergency procedures documented
- [ ] Upgrade authority strategy decided
- [ ] Monitoring/alerts configured
- [ ] User explicitly confirmed deployment

## Step 1: FINAL CONFIRMATION

**ASK USER FOR EXPLICIT CONFIRMATION:**

```
🚨 MAINNET DEPLOYMENT CONFIRMATION REQUIRED 🚨

Network: Solana Mainnet-Beta
Program: [program name]
Estimated Cost: [X SOL for deployment + buffer]

This action will:
- Deploy program to MAINNET (IRREVERSIBLE)
- Spend real SOL (~[X] SOL for deployment)
- Make program publicly accessible
- Potentially handle user funds

⚠️  HAVE YOU COMPLETED:
- [ ] Security audit
- [ ] Professional code review
- [ ] Extensive devnet testing
- [ ] Emergency procedures

Type 'DEPLOY TO MAINNET' to confirm:
```

**DO NOT PROCEED WITHOUT USER TYPING "DEPLOY TO MAINNET"**

## Step 2: Verify Environment

```bash
# Switch to mainnet
solana config set --url mainnet-beta

# VERIFY YOU'RE ON MAINNET
solana config get
# Must show: RPC URL: https://api.mainnet-beta.solana.com

# Check deployer wallet
solana address

# Check balance (need ~3-5 SOL for deployment + buffer)
solana balance

# If balance insufficient, STOP and fund wallet
```

## Step 3: Final Build Verification

```bash
# Clean build
anchor clean
anchor build --verifiable

# Verify program size
ls -lh target/deploy/*.so

# Run all tests one more time
anchor test

# Run security audit
cargo clippy -- -W clippy::all
cargo audit
```

## Step 4: Calculate Deployment Cost

```bash
# Estimate deployment cost
solana program deploy target/deploy/program.so --dry-run

# Should show estimated cost in SOL
# Ensure you have 2x this amount for safety
```

## Step 5: Deploy to Mainnet

```bash
# FINAL CHECK
echo "⚠️  FINAL CONFIRMATION"
echo "Network: $(solana config get | grep 'RPC URL')"
echo "Deployer: $(solana address)"
echo "Balance: $(solana balance)"
read -p "Proceed with MAINNET deployment? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled"
    exit 1
fi

# Deploy with Anchor (recommended for Anchor projects)
anchor deploy --provider.cluster mainnet-beta

# SAVE PROGRAM ID IMMEDIATELY
PROGRAM_ID=$(solana address -k target/deploy/program-keypair.json)
echo "🎯 DEPLOYED PROGRAM ID: $PROGRAM_ID"

# Save to file
echo $PROGRAM_ID > .program-id-mainnet
```

## Step 6: Verify Deployment

```bash
# Verify program is on mainnet
solana program show $PROGRAM_ID

# Check upgrade authority
UPGRADE_AUTH=$(solana program show $PROGRAM_ID | grep "Upgrade Authority" | awk '{print $3}')
echo "Upgrade Authority: $UPGRADE_AUTH"

# View on explorer
echo "Explorer: https://explorer.solana.com/address/$PROGRAM_ID"

# Verify program data
solana program dump $PROGRAM_ID program-dump.so
diff target/deploy/program.so program-dump.so
# Should be identical
```

## Step 7: Initial Testing on Mainnet

**Test with SMALL amounts first!**

```bash
# Test read-only operations first
# (query program accounts, etc.)

# Test write operations with MINIMAL amounts
# Start with 0.01 SOL or smallest possible amounts

# Monitor for any issues
```

## Step 8: Post-Deployment Actions

### Update Configuration

```bash
# Save deployment info
cat > deployment-mainnet.json <<EOF
{
  "programId": "$PROGRAM_ID",
  "deployedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "deployer": "$(solana address)",
  "network": "mainnet-beta",
  "upgradeAuthority": "$UPGRADE_AUTH",
  "deploymentCost": "[X SOL]"
}
EOF

# Update frontend configuration
echo "Update frontend with Program ID: $PROGRAM_ID"

# Update environment variables
echo "NEXT_PUBLIC_PROGRAM_ID=$PROGRAM_ID" >> .env.production
```

### Documentation

Create `docs/mainnet-deployment-$(date +%Y%m%d).md`:

```markdown
# Mainnet Deployment Report

**Date**: $(date)
**Program ID**: $PROGRAM_ID
**Network**: Mainnet-Beta
**Deployer**: $(solana address)

## Deployment Details
- Transaction: [TX_HASH]
- Block: [BLOCK_NUMBER]
- Cost: [X SOL]
- Upgrade Authority: $UPGRADE_AUTH

## Verification
- [ ] Program visible on explorer
- [ ] Correct program binary deployed
- [ ] Upgrade authority correct
- [ ] Initial tests passed

## Next Steps
1. Monitor program for 24-48 hours
2. Gradually increase test amounts
3. Enable monitoring/alerts
4. Communicate to users
```

### Setup Monitoring

```bash
# Monitor program logs
solana logs $PROGRAM_ID

# Setup alerts (external service)
# - Transaction volume
# - Error rates
# - Unusual activity
```

## Step 9: Gradual Rollout

1. **Day 1-2**: Internal testing only, small amounts
2. **Day 3-7**: Beta users, limited exposure
3. **Week 2+**: Public launch, monitor closely

## Emergency Procedures

### If Issues Detected

1. **Pause if possible** (if program has pause function)
2. **Document the issue** immediately
3. **Assess severity** (critical/high/medium/low)
4. **Prepare upgrade** if needed
5. **Communicate** to users

### Program Upgrade Process

```bash
# Prepare upgrade
anchor build --verifiable

# Deploy upgrade
anchor upgrade target/deploy/program.so \
    --program-id $PROGRAM_ID \
    --upgrade-authority <path-to-upgrade-authority-keypair>

# Verify upgrade
solana program show $PROGRAM_ID
```

### Revoking Upgrade Authority

```bash
# Only after program is battle-tested (months)
solana program set-upgrade-authority \
    $PROGRAM_ID \
    --final
```

## Critical Reminders

- ⚠️  Mainnet deployment is IRREVERSIBLE
- 💰 Uses REAL SOL (not airdropped)
- 🔒 Program will handle REAL user funds
- 📊 Monitor constantly after deployment
- 🚨 Have emergency procedures ready
- ⏸️  Consider pause mechanism
- 🔐 Secure upgrade authority properly
- 📝 Document everything
- 🧪 Test with minimal amounts first
- 👥 Gradual rollout is safer

## If Deployment Fails

1. **Read error message carefully**
2. **Check balance** (may need more SOL)
3. **Verify network** (ensure mainnet)
4. **Check program size** (must be < max limit)
5. **Retry** if transient network issue
6. **Return to devnet** if fundamental issue

## Success Criteria

- [ ] Program deployed successfully
- [ ] Visible on Solana explorer
- [ ] Program ID documented everywhere
- [ ] Basic operations tested successfully
- [ ] Monitoring active
- [ ] Emergency procedures ready
- [ ] Team notified
- [ ] Users can interact safely

---

**Remember**: You're responsible for user funds. Take every precaution. When in doubt, test more on devnet.
