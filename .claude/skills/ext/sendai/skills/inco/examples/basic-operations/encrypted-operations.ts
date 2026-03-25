/**
 * Inco SVM — Basic Encrypted Operations Example
 *
 * Demonstrates:
 * - Setting up an Anchor program with Inco Lightning
 * - Encrypting values client-side
 * - Performing arithmetic and comparison operations on encrypted data
 * - Decrypting results with attested reveal
 */

import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair, Connection, SystemProgram } from "@solana/web3.js";
import { encryptValue } from "@inco/solana-sdk/encryption";
import { decrypt } from "@inco/solana-sdk/attested-decrypt";

// ============================================================
// Configuration
// ============================================================

const INCO_LIGHTNING_PROGRAM_ID = new PublicKey(
  "5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj"
);
const CONNECTION_URL = "https://api.devnet.solana.com";

// ============================================================
// Setup
// ============================================================

async function setup() {
  const connection = new Connection(CONNECTION_URL, "confirmed");
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Load your program (replace with your IDL and program ID)
  // const program = anchor.workspace.MyConfidentialProgram;

  return { connection, provider };
}

// ============================================================
// Encrypt and Deposit
// ============================================================

/**
 * Encrypt a value client-side and send it to the program.
 * The program creates an Euint128 handle via CPI to Inco Lightning.
 */
async function encryptAndDeposit(
  program: anchor.Program,
  vaultPda: PublicKey,
  authority: Keypair,
  amount: bigint
) {
  // Encrypt the deposit amount
  const encryptedHex = await encryptValue(amount);
  console.log("Encrypted value (hex):", encryptedHex.slice(0, 40) + "...");

  // Send to program — the program calls new_euint128() via CPI
  const tx = await program.methods
    .deposit(Buffer.from(encryptedHex, "hex"))
    .accounts({
      authority: authority.publicKey,
      vault: vaultPda,
      incoLightningProgram: INCO_LIGHTNING_PROGRAM_ID,
    })
    .signers([authority])
    .rpc();

  console.log("Deposit tx:", tx);
  return tx;
}

// ============================================================
// Reveal Balance (Attested Reveal)
// ============================================================

/**
 * Decrypt a handle to view the plaintext value.
 * Requires wallet signature for authentication.
 */
async function revealBalance(
  program: anchor.Program,
  connection: Connection,
  vaultPda: PublicKey,
  owner: PublicKey,
  signMessage: (msg: Uint8Array) => Promise<Uint8Array>
) {
  // Fetch account data to get the encrypted handle
  const accountInfo = await connection.getAccountInfo(vaultPda);
  if (!accountInfo) throw new Error("Vault account not found");

  const vault = program.coder.accounts.decode("Vault", accountInfo.data);
  const balanceHandle = vault.balance.toString();

  console.log("Balance handle:", balanceHandle);

  // Request decryption (covalidator checks allowance PDA, decrypts in TEE)
  const result = await decrypt([balanceHandle], {
    address: owner,
    signMessage,
  });

  console.log("Decrypted balance:", result.plaintexts[0]);
  return result.plaintexts[0];
}

// ============================================================
// Example: Encrypted Comparison + Conditional Transfer
// ============================================================

/**
 * On-chain pattern for conditional logic on encrypted values.
 *
 * In Rust, the program does:
 *   let has_enough: Ebool = e_ge(ctx, balance, amount, 0)?;
 *   let actual = e_select(ctx, has_enough, amount, zero, 0)?;
 *   let new_balance = e_sub(ctx, balance, actual, 0)?;
 *
 * The client just encrypts the amount and sends it.
 */
async function conditionalWithdraw(
  program: anchor.Program,
  vaultPda: PublicKey,
  authority: Keypair,
  amount: bigint
) {
  const encryptedAmount = await encryptValue(amount);

  const tx = await program.methods
    .withdraw(Buffer.from(encryptedAmount, "hex"))
    .accounts({
      authority: authority.publicKey,
      vault: vaultPda,
      incoLightningProgram: INCO_LIGHTNING_PROGRAM_ID,
    })
    .signers([authority])
    .rpc();

  console.log("Withdraw tx:", tx);
  return tx;
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log("=== Inco SVM: Encrypted Operations Example ===\n");

  const { connection, provider } = await setup();

  // Replace with your program setup
  // const program = anchor.workspace.MyConfidentialProgram;
  // const [vaultPda] = PublicKey.findProgramAddressSync(
  //   [Buffer.from("vault"), provider.wallet.publicKey.toBuffer()],
  //   program.programId
  // );

  console.log("1. Encrypt a value:");
  const encrypted = await encryptValue(1000n);
  console.log("   Encrypted hex length:", encrypted.length);

  console.log("\n2. Encrypt different types:");
  const encBigint = await encryptValue(500_000_000n);
  const encNumber = await encryptValue(42);
  const encBool = await encryptValue(true);
  console.log("   bigint:", encBigint.slice(0, 20) + "...");
  console.log("   number:", encNumber.slice(0, 20) + "...");
  console.log("   bool:  ", encBool.slice(0, 20) + "...");

  // Uncomment when program is deployed:
  // await encryptAndDeposit(program, vaultPda, authority, 1000n);
  // await revealBalance(program, connection, vaultPda, authority.publicKey, signMessage);
  // await conditionalWithdraw(program, vaultPda, authority, 500n);

  console.log("\nDone.");
}

main().catch(console.error);
