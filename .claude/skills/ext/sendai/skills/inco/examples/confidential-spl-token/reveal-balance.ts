/**
 * Inco SVM — Confidential SPL Token: Reveal Balance Example
 *
 * Demonstrates:
 * - Fetching encrypted token account data
 * - Extracting the balance handle from account bytes
 * - Attested reveal (decrypt for UI display)
 * - Attested decrypt (verify on-chain with Ed25519 signatures)
 */

import * as anchor from "@coral-xyz/anchor";
import {
  PublicKey,
  Connection,
  Transaction,
  SYSVAR_INSTRUCTIONS_PUBKEY,
} from "@solana/web3.js";
import { decrypt } from "@inco/solana-sdk/attested-decrypt";
import bs58 from "bs58";

// ============================================================
// Constants
// ============================================================

const INCO_LIGHTNING_PROGRAM_ID = new PublicKey(
  "5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj"
);
const CONNECTION_URL = "https://api.devnet.solana.com";

const INCO_ACCOUNT_DISCRIMINATOR = [18, 233, 131, 18, 230, 173, 249, 89];

// ============================================================
// Helpers
// ============================================================

/** Extract u128 handle from account data at byte offset */
function extractHandle(data: Buffer, offset: number = 72): bigint {
  const amountBytes = data.slice(offset, offset + 16);
  let handle = BigInt(0);
  for (let i = 15; i >= 0; i--) {
    handle = handle * BigInt(256) + BigInt(amountBytes[i]);
  }
  return handle;
}

// ============================================================
// Reveal Balance (Attested Reveal — for UI display)
// ============================================================

/**
 * Decrypt a token balance to display in the UI.
 * The covalidator checks the allowance PDA, then decrypts in its TEE.
 */
async function revealBalance(
  connection: Connection,
  program: anchor.Program,
  mint: PublicKey,
  owner: PublicKey,
  signMessage: (msg: Uint8Array) => Promise<Uint8Array>
): Promise<string> {
  console.log("Fetching token account for:", owner.toBase58());

  // Option 1: Derive the ATA PDA
  const [ata] = PublicKey.findProgramAddressSync(
    [
      owner.toBuffer(),
      INCO_LIGHTNING_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    program.programId // or ASSOCIATED_TOKEN_PROGRAM_ID depending on your setup
  );

  const accountInfo = await connection.getAccountInfo(ata);
  if (!accountInfo) {
    throw new Error("Token account not found");
  }

  // Decode using Anchor's coder
  const tokenAccount = program.coder.accounts.decode(
    "IncoTokenAccount",
    accountInfo.data
  );

  const balanceHandle = tokenAccount.amount.toString();
  console.log("Balance handle:", balanceHandle);

  // Request attested reveal
  const result = await decrypt([balanceHandle], {
    address: owner,
    signMessage,
  });

  const balance = result.plaintexts[0];
  console.log("Decrypted balance:", balance);
  return balance;
}

// ============================================================
// Reveal via getProgramAccounts (alternative)
// ============================================================

/**
 * Find and reveal balance using getProgramAccounts filters.
 * Useful when you don't know the exact PDA derivation.
 */
async function revealBalanceViaFilter(
  connection: Connection,
  programId: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
  signMessage: (msg: Uint8Array) => Promise<Uint8Array>
): Promise<string> {
  console.log("Searching for token account via filters...");

  const accounts = await connection.getProgramAccounts(programId, {
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: bs58.encode(Buffer.from(INCO_ACCOUNT_DISCRIMINATOR)),
        },
      },
      { memcmp: { offset: 8, bytes: mint.toBase58() } },
      { memcmp: { offset: 40, bytes: owner.toBase58() } },
    ],
  });

  if (accounts.length === 0) {
    throw new Error("No token account found for this mint/owner");
  }

  const data = accounts[0].account.data;
  const handle = extractHandle(Buffer.from(data), 72);
  console.log("Found handle:", handle.toString());

  const result = await decrypt([handle.toString()], {
    address: owner,
    signMessage,
  });

  console.log("Decrypted balance:", result.plaintexts[0]);
  return result.plaintexts[0];
}

// ============================================================
// On-Chain Verification (Attested Decrypt)
// ============================================================

/**
 * Decrypt a handle and verify the result on-chain using Ed25519 attestation.
 * Used when the program needs to act on the decrypted value.
 */
async function verifyDecryptionOnChain(
  program: anchor.Program,
  handle: bigint,
  owner: PublicKey,
  signMessage: (msg: Uint8Array) => Promise<Uint8Array>,
  sendTransaction: (tx: Transaction) => Promise<string>
): Promise<string> {
  console.log("Requesting attested decryption...");

  const result = await decrypt([handle.toString()], {
    address: owner,
    signMessage,
  });

  console.log("Plaintext:", result.plaintexts[0]);
  console.log("Ed25519 instructions:", result.ed25519Instructions.length);

  // Build transaction: Ed25519 verify instruction(s) + program instruction
  const tx = new Transaction();

  // Add Ed25519 signature verification instructions
  result.ed25519Instructions.forEach((ix) => tx.add(ix));

  // Add your program's verification instruction
  // The program calls is_validsignature() to verify the attestation
  const handleBytes = Buffer.alloc(16);
  let h = handle;
  for (let i = 0; i < 16; i++) {
    handleBytes[i] = Number(h & BigInt(0xff));
    h = h >> BigInt(8);
  }

  const plaintextBytes = Buffer.from(result.plaintexts[0]);

  const verifyIx = await program.methods
    .verifyDecryption([handleBytes], [plaintextBytes])
    .accounts({
      authority: owner,
      instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
      incoLightningProgram: INCO_LIGHTNING_PROGRAM_ID,
    })
    .instruction();

  tx.add(verifyIx);

  const txSig = await sendTransaction(tx);
  console.log("Verification tx:", txSig);

  return result.plaintexts[0];
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log("=== Confidential SPL Token: Reveal Balance ===\n");

  const connection = new Connection(CONNECTION_URL, "confirmed");
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Replace with your program and wallet
  // const program = anchor.workspace.IncoToken;
  // const mint = new PublicKey("YOUR_MINT_ADDRESS");

  // Attested Reveal (display in UI):
  // const balance = await revealBalance(
  //   connection, program, mint, wallet.publicKey, wallet.signMessage
  // );
  // console.log("Your balance:", balance);

  // Attested Reveal via filters (alternative):
  // const balance2 = await revealBalanceViaFilter(
  //   connection, program.programId, mint, wallet.publicKey, wallet.signMessage
  // );

  // Attested Decrypt (verify on-chain):
  // const verified = await verifyDecryptionOnChain(
  //   program, handleBigint, wallet.publicKey, wallet.signMessage, sendTx
  // );

  console.log("Uncomment the examples above with your deployed program.");
}

main().catch(console.error);
