/**
 * Inco SVM — Confidential SPL Token: Mint & Transfer Example
 *
 * Demonstrates:
 * - Initializing a confidential mint
 * - Creating token accounts
 * - Minting encrypted tokens with allowance PDA
 * - Transferring tokens privately between accounts
 * - Simulation-then-submit pattern for handle discovery
 */

import * as anchor from "@coral-xyz/anchor";
import {
  PublicKey,
  Keypair,
  Connection,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { encryptValue } from "@inco/solana-sdk/encryption";

// ============================================================
// Constants
// ============================================================

const INCO_LIGHTNING_PROGRAM_ID = new PublicKey(
  "5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj"
);
const CONNECTION_URL = "https://api.devnet.solana.com";

// Account discriminators for getProgramAccounts queries
const INCO_MINT_DISCRIMINATOR = [254, 129, 245, 169, 202, 143, 198, 4];
const INCO_ACCOUNT_DISCRIMINATOR = [18, 233, 131, 18, 230, 173, 249, 89];

// ============================================================
// Helpers
// ============================================================

/** Derive allowance PDA from handle and allowed address */
function getAllowancePda(
  handle: bigint,
  allowedAddress: PublicKey
): [PublicKey, number] {
  const handleBuffer = Buffer.alloc(16);
  let h = handle;
  for (let i = 0; i < 16; i++) {
    handleBuffer[i] = Number(h & BigInt(0xff));
    h = h >> BigInt(8);
  }
  return PublicKey.findProgramAddressSync(
    [handleBuffer, allowedAddress.toBuffer()],
    INCO_LIGHTNING_PROGRAM_ID
  );
}

/** Extract u128 handle from account data at given byte offset */
function extractHandle(data: Buffer, offset: number = 72): bigint {
  const amountBytes = data.slice(offset, offset + 16);
  let handle = BigInt(0);
  for (let i = 15; i >= 0; i--) {
    handle = handle * BigInt(256) + BigInt(amountBytes[i]);
  }
  return handle;
}

/** Simulate transaction and extract handle from account data */
async function simulateAndGetHandle(
  connection: Connection,
  tx: Transaction,
  accountPubkey: PublicKey,
  walletKeypair: Keypair,
  handleOffset: number = 72
): Promise<bigint | null> {
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = walletKeypair.publicKey;
  tx.sign(walletKeypair);

  const simulation = await connection.simulateTransaction(tx, undefined, [
    accountPubkey,
  ]);

  if (simulation.value.err) {
    console.error("Simulation error:", simulation.value.err);
    return null;
  }

  if (simulation.value.accounts?.[0]?.data) {
    const data = Buffer.from(
      simulation.value.accounts[0].data[0],
      "base64"
    );
    return extractHandle(data, handleOffset);
  }
  return null;
}

// ============================================================
// Initialize Mint
// ============================================================

async function initializeMint(
  program: anchor.Program,
  mintKeypair: Keypair,
  authority: Keypair,
  decimals: number = 9
) {
  console.log("Initializing confidential mint...");

  const tx = await program.methods
    .initializeMint(decimals, authority.publicKey, null)
    .accounts({
      mint: mintKeypair.publicKey,
      payer: authority.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([authority, mintKeypair])
    .rpc();

  console.log("Mint initialized:", mintKeypair.publicKey.toBase58());
  console.log("Tx:", tx);
  return mintKeypair.publicKey;
}

// ============================================================
// Create Token Account
// ============================================================

async function createTokenAccount(
  program: anchor.Program,
  mint: PublicKey,
  owner: PublicKey,
  payer: Keypair
): Promise<PublicKey> {
  console.log("Creating token account for:", owner.toBase58());

  // Derive the token account PDA (structure depends on your program)
  const [tokenAccountPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_account"), mint.toBuffer(), owner.toBuffer()],
    program.programId
  );

  const tx = await program.methods
    .createAccount()
    .accounts({
      mint,
      tokenAccount: tokenAccountPda,
      owner,
      payer: payer.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([payer])
    .rpc();

  console.log("Token account:", tokenAccountPda.toBase58());
  console.log("Tx:", tx);
  return tokenAccountPda;
}

// ============================================================
// Mint Tokens (with simulation-then-submit)
// ============================================================

async function mintTokens(
  program: anchor.Program,
  connection: Connection,
  mint: PublicKey,
  tokenAccount: PublicKey,
  owner: PublicKey,
  authority: Keypair,
  amount: bigint
) {
  console.log(`\nMinting ${amount} tokens...`);

  // Step 1: Encrypt the amount
  const encryptedHex = await encryptValue(amount);

  // Step 2: Build instruction for simulation (no remaining_accounts)
  const ix = await program.methods
    .mintTo(Buffer.from(encryptedHex, "hex"), 0)
    .accounts({
      mint,
      tokenAccount,
      authority: authority.publicKey,
      incoLightningProgram: INCO_LIGHTNING_PROGRAM_ID,
    })
    .instruction();

  // Step 3: Simulate to get the new balance handle
  const simTx = new Transaction().add(ix);
  const handle = await simulateAndGetHandle(
    connection,
    simTx,
    tokenAccount,
    authority
  );

  if (!handle) {
    throw new Error("Failed to get handle from simulation");
  }
  console.log("Simulated handle:", handle.toString());

  // Step 4: Derive allowance PDA from handle
  const [allowancePda] = getAllowancePda(handle, owner);
  console.log("Allowance PDA:", allowancePda.toBase58());

  // Step 5: Submit with remaining_accounts
  const tx = await program.methods
    .mintTo(Buffer.from(encryptedHex, "hex"), 0)
    .accounts({
      mint,
      tokenAccount,
      authority: authority.publicKey,
      incoLightningProgram: INCO_LIGHTNING_PROGRAM_ID,
    })
    .remainingAccounts([
      { pubkey: allowancePda, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: false, isWritable: false },
    ])
    .signers([authority])
    .rpc();

  console.log("Mint tx:", tx);
}

// ============================================================
// Transfer Tokens (with simulation-then-submit)
// ============================================================

async function transferTokens(
  program: anchor.Program,
  connection: Connection,
  sourceAccount: PublicKey,
  destAccount: PublicKey,
  sourceOwner: PublicKey,
  destOwner: PublicKey,
  authority: Keypair,
  amount: bigint
) {
  console.log(`\nTransferring ${amount} tokens...`);

  // Encrypt the transfer amount
  const encryptedHex = await encryptValue(amount);

  // Build instruction for simulation
  const ix = await program.methods
    .transfer(Buffer.from(encryptedHex, "hex"), 0)
    .accounts({
      source: sourceAccount,
      destination: destAccount,
      authority: authority.publicKey,
      incoLightningProgram: INCO_LIGHTNING_PROGRAM_ID,
    })
    .instruction();

  // Simulate to get handles for both source and dest
  const simTx = new Transaction().add(ix);
  const { blockhash } = await connection.getLatestBlockhash();
  simTx.recentBlockhash = blockhash;
  simTx.feePayer = authority.publicKey;
  simTx.sign(authority);

  const simulation = await connection.simulateTransaction(simTx, undefined, [
    sourceAccount,
    destAccount,
  ]);

  if (simulation.value.err) {
    throw new Error(`Simulation failed: ${JSON.stringify(simulation.value.err)}`);
  }

  // Extract handles from both accounts
  const sourceData = Buffer.from(
    simulation.value.accounts![0]!.data[0],
    "base64"
  );
  const destData = Buffer.from(
    simulation.value.accounts![1]!.data[0],
    "base64"
  );

  const sourceHandle = extractHandle(sourceData);
  const destHandle = extractHandle(destData);

  // Derive allowance PDAs
  const [sourceAllowancePda] = getAllowancePda(sourceHandle, sourceOwner);
  const [destAllowancePda] = getAllowancePda(destHandle, destOwner);

  // Submit with remaining_accounts
  const tx = await program.methods
    .transfer(Buffer.from(encryptedHex, "hex"), 0)
    .accounts({
      source: sourceAccount,
      destination: destAccount,
      authority: authority.publicKey,
      incoLightningProgram: INCO_LIGHTNING_PROGRAM_ID,
    })
    .remainingAccounts([
      { pubkey: sourceAllowancePda, isSigner: false, isWritable: true },
      { pubkey: sourceOwner, isSigner: false, isWritable: false },
      { pubkey: destAllowancePda, isSigner: false, isWritable: true },
      { pubkey: destOwner, isSigner: false, isWritable: false },
    ])
    .signers([authority])
    .rpc();

  console.log("Transfer tx:", tx);
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log("=== Confidential SPL Token: Mint & Transfer ===\n");

  const connection = new Connection(CONNECTION_URL, "confirmed");
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Replace with your deployed program
  // const program = anchor.workspace.IncoToken;
  // const authority = Keypair.fromSecretKey(...);

  // Example flow:
  // 1. Initialize mint
  // const mintKeypair = Keypair.generate();
  // const mint = await initializeMint(program, mintKeypair, authority);

  // 2. Create token accounts
  // const aliceAccount = await createTokenAccount(program, mint, alice.publicKey, authority);
  // const bobAccount = await createTokenAccount(program, mint, bob.publicKey, authority);

  // 3. Mint tokens to Alice
  // await mintTokens(program, connection, mint, aliceAccount, alice.publicKey, authority, 1_000_000_000n);

  // 4. Transfer from Alice to Bob
  // await transferTokens(program, connection, aliceAccount, bobAccount, alice.publicKey, bob.publicKey, alice, 500_000_000n);

  console.log("\nDone. Uncomment the flow above with your deployed program.");
}

main().catch(console.error);
