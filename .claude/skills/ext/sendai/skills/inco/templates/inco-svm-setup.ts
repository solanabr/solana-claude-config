/**
 * Inco SVM — Starter Template
 *
 * Complete setup template for building confidential dApps on Solana
 * with Inco Lightning encryption.
 *
 * Features:
 * - Anchor program client setup
 * - Value encryption helpers
 * - Attested reveal (decrypt for UI)
 * - Attested decrypt (verify on-chain)
 * - Allowance PDA derivation
 * - Transaction simulation for handle discovery
 * - Account data parsing
 *
 * Usage:
 *   Copy this file into your project and update the CONFIG section.
 *   Install dependencies: npm install @coral-xyz/anchor @solana/web3.js @inco/solana-sdk
 */

import * as anchor from "@coral-xyz/anchor";
import {
  PublicKey,
  Keypair,
  Connection,
  Transaction,
  TransactionInstruction,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SystemProgram,
} from "@solana/web3.js";
import { encryptValue } from "@inco/solana-sdk/encryption";
import { decrypt, AttestedDecryptError } from "@inco/solana-sdk/attested-decrypt";
import { hexToBuffer } from "@inco/solana-sdk/utils";

// ============================================================
// CONFIG — Update these for your project
// ============================================================

const CONFIG = {
  /** Solana RPC endpoint */
  rpcUrl: process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",

  /** Your deployed program ID */
  programId: process.env.PROGRAM_ID || "YOUR_PROGRAM_ID_HERE",

  /** Commitment level */
  commitment: "confirmed" as anchor.web3.Commitment,
};

// ============================================================
// CONSTANTS
// ============================================================

const INCO_LIGHTNING_PROGRAM_ID = new PublicKey(
  "5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj"
);

// ============================================================
// CONNECTION SETUP
// ============================================================

/** Create Anchor provider and program instance */
function setupProgram(idl: anchor.Idl, walletKeypair?: Keypair) {
  const connection = new Connection(CONFIG.rpcUrl, CONFIG.commitment);

  let provider: anchor.AnchorProvider;
  if (walletKeypair) {
    const wallet = new anchor.Wallet(walletKeypair);
    provider = new anchor.AnchorProvider(connection, wallet, {
      commitment: CONFIG.commitment,
    });
  } else {
    provider = anchor.AnchorProvider.env();
  }
  anchor.setProvider(provider);

  const programId = new PublicKey(CONFIG.programId);
  const program = new anchor.Program(idl, provider);

  return { connection, provider, program, programId };
}

// ============================================================
// ENCRYPTION HELPERS
// ============================================================

/** Encrypt a numeric value for use in program instructions */
async function encryptAmount(amount: bigint): Promise<Buffer> {
  const hex = await encryptValue(amount);
  return Buffer.from(hex, "hex");
}

/** Encrypt a boolean value */
async function encryptBoolean(value: boolean): Promise<Buffer> {
  const hex = await encryptValue(value);
  return Buffer.from(hex, "hex");
}

// ============================================================
// DECRYPTION HELPERS
// ============================================================

interface WalletSigner {
  publicKey: PublicKey;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
}

/**
 * Attested Reveal — decrypt a handle for display in UI.
 * Returns the plaintext value as a string.
 */
async function revealValue(
  handle: bigint | string,
  wallet: WalletSigner
): Promise<string> {
  const handleStr = typeof handle === "bigint" ? handle.toString() : handle;

  try {
    const result = await decrypt([handleStr], {
      address: wallet.publicKey,
      signMessage: wallet.signMessage,
    });
    return result.plaintexts[0];
  } catch (error) {
    if (error instanceof AttestedDecryptError) {
      throw new Error(`Decryption failed: ${error.message}. Check allowance PDA.`);
    }
    throw error;
  }
}

/**
 * Attested Decrypt — decrypt and get Ed25519 instructions for on-chain verification.
 * Returns both the plaintext and the instructions to include in a transaction.
 */
async function attestedDecrypt(
  handles: (bigint | string)[],
  wallet: WalletSigner
): Promise<{
  plaintexts: string[];
  ed25519Instructions: TransactionInstruction[];
}> {
  const handleStrs = handles.map((h) =>
    typeof h === "bigint" ? h.toString() : h
  );

  const result = await decrypt(handleStrs, {
    address: wallet.publicKey,
    signMessage: wallet.signMessage,
  });

  return {
    plaintexts: result.plaintexts,
    ed25519Instructions: result.ed25519Instructions,
  };
}

// ============================================================
// ALLOWANCE PDA HELPERS
// ============================================================

/** Derive the allowance PDA for a given handle and allowed address */
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

/** Convert a handle bigint to a 16-byte little-endian Buffer */
function handleToLeBytes(handle: bigint): Buffer {
  const buf = Buffer.alloc(16);
  let h = handle;
  for (let i = 0; i < 16; i++) {
    buf[i] = Number(h & BigInt(0xff));
    h = h >> BigInt(8);
  }
  return buf;
}

// ============================================================
// TRANSACTION SIMULATION
// ============================================================

/** Extract a u128 handle from account data at a given byte offset */
function extractHandleFromData(data: Buffer, offset: number = 72): bigint {
  const bytes = data.slice(offset, offset + 16);
  let handle = BigInt(0);
  for (let i = 15; i >= 0; i--) {
    handle = handle * BigInt(256) + BigInt(bytes[i]);
  }
  return handle;
}

/**
 * Simulate a transaction and extract handles from account data.
 * Used for the simulation-then-submit pattern required by allowance PDAs.
 */
async function simulateForHandles(
  connection: Connection,
  transaction: Transaction,
  accountPubkeys: PublicKey[],
  walletKeypair: Keypair,
  handleOffsets: number[] = [72]
): Promise<(bigint | null)[]> {
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = walletKeypair.publicKey;
  transaction.sign(walletKeypair);

  const simulation = await connection.simulateTransaction(
    transaction,
    undefined,
    accountPubkeys
  );

  if (simulation.value.err) {
    console.error("Simulation error:", JSON.stringify(simulation.value.err));
    return accountPubkeys.map(() => null);
  }

  return accountPubkeys.map((_, idx) => {
    const accountData = simulation.value.accounts?.[idx]?.data;
    if (!accountData) return null;

    const data = Buffer.from(accountData[0], "base64");
    const offset = handleOffsets[idx] ?? handleOffsets[0] ?? 72;
    return extractHandleFromData(data, offset);
  });
}

// ============================================================
// COMMON ACCOUNT PATTERNS
// ============================================================

/** Build remaining_accounts array for a mint_to operation */
function mintRemainingAccounts(
  allowancePda: PublicKey,
  ownerAddress: PublicKey
): anchor.web3.AccountMeta[] {
  return [
    { pubkey: allowancePda, isSigner: false, isWritable: true },
    { pubkey: ownerAddress, isSigner: false, isWritable: false },
  ];
}

/** Build remaining_accounts array for a transfer operation */
function transferRemainingAccounts(
  sourceAllowancePda: PublicKey,
  sourceOwner: PublicKey,
  destAllowancePda: PublicKey,
  destOwner: PublicKey
): anchor.web3.AccountMeta[] {
  return [
    { pubkey: sourceAllowancePda, isSigner: false, isWritable: true },
    { pubkey: sourceOwner, isSigner: false, isWritable: false },
    { pubkey: destAllowancePda, isSigner: false, isWritable: true },
    { pubkey: destOwner, isSigner: false, isWritable: false },
  ];
}

// ============================================================
// EXPORTS
// ============================================================

export {
  // Config
  CONFIG,
  INCO_LIGHTNING_PROGRAM_ID,
  // Setup
  setupProgram,
  // Encryption
  encryptAmount,
  encryptBoolean,
  // Decryption
  revealValue,
  attestedDecrypt,
  // Allowance PDAs
  getAllowancePda,
  handleToLeBytes,
  // Simulation
  extractHandleFromData,
  simulateForHandles,
  // Account patterns
  mintRemainingAccounts,
  transferRemainingAccounts,
};

// ============================================================
// EXAMPLE USAGE
// ============================================================

async function exampleUsage() {
  // 1. Setup
  // const idl = require("./target/idl/my_program.json");
  // const { connection, program } = setupProgram(idl);

  // 2. Encrypt a deposit
  const encrypted = await encryptAmount(1_000_000_000n);
  console.log("Encrypted buffer length:", encrypted.length);

  // 3. Derive allowance PDA
  const exampleHandle = BigInt("12345678901234567890");
  const exampleAddress = Keypair.generate().publicKey;
  const [pda, bump] = getAllowancePda(exampleHandle, exampleAddress);
  console.log("Allowance PDA:", pda.toBase58(), "bump:", bump);

  // 4. Reveal would require a deployed program and wallet connection
  // const balance = await revealValue(handle, wallet);
  // console.log("Balance:", balance);
}

if (require.main === module) {
  exampleUsage().catch(console.error);
}
