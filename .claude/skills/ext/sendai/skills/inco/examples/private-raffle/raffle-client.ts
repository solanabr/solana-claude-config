/**
 * Inco SVM — Private Raffle Client Example
 *
 * Demonstrates a full raffle lifecycle using encrypted operations:
 * 1. Create raffle with ticket price
 * 2. Players buy tickets with encrypted guesses
 * 3. Authority draws winning number
 * 4. Players check if they won (encrypted comparison)
 * 5. Winners claim and withdraw prizes
 *
 * Based on the Private Raffle tutorial from Inco docs.
 */

import * as anchor from "@coral-xyz/anchor";
import {
  PublicKey,
  Keypair,
  Connection,
  SystemProgram,
  Transaction,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { encryptValue } from "@inco/solana-sdk/encryption";
import { decrypt } from "@inco/solana-sdk/attested-decrypt";

// ============================================================
// Constants
// ============================================================

const INCO_LIGHTNING_PROGRAM_ID = new PublicKey(
  "5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj"
);
const CONNECTION_URL = "https://api.devnet.solana.com";
const TICKET_PRICE = 10_000_000; // 0.01 SOL in lamports

// ============================================================
// PDA Helpers
// ============================================================

function getLotteryPda(programId: PublicKey, lotteryId: number): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("lottery"),
      new anchor.BN(lotteryId).toArrayLike(Buffer, "le", 8),
    ],
    programId
  );
  return pda;
}

function getVaultPda(programId: PublicKey, lotteryPda: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), lotteryPda.toBuffer()],
    programId
  );
  return pda;
}

function getTicketPda(
  programId: PublicKey,
  lotteryPda: PublicKey,
  player: PublicKey
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("ticket"), lotteryPda.toBuffer(), player.toBuffer()],
    programId
  );
  return pda;
}

// ============================================================
// 1. Create Raffle
// ============================================================

async function createRaffle(
  program: anchor.Program,
  authority: Keypair,
  lotteryId: number
) {
  console.log("Creating raffle...");

  const lotteryPda = getLotteryPda(program.programId, lotteryId);
  const vaultPda = getVaultPda(program.programId, lotteryPda);

  const tx = await program.methods
    .createLottery(new anchor.BN(lotteryId), new anchor.BN(TICKET_PRICE))
    .accounts({
      authority: authority.publicKey,
      lottery: lotteryPda,
      vault: vaultPda,
      systemProgram: SystemProgram.programId,
    })
    .signers([authority])
    .rpc();

  console.log("Raffle created at:", lotteryPda.toBase58());
  console.log("Vault:", vaultPda.toBase58());
  console.log("Ticket price:", TICKET_PRICE / LAMPORTS_PER_SOL, "SOL");
  console.log("Tx:", tx);

  return { lotteryPda, vaultPda };
}

// ============================================================
// 2. Buy Ticket (encrypted guess)
// ============================================================

async function buyTicket(
  program: anchor.Program,
  lotteryPda: PublicKey,
  vaultPda: PublicKey,
  player: Keypair,
  guess: number // 1-100
) {
  console.log(`\nPlayer ${player.publicKey.toBase58().slice(0, 8)}... buying ticket with guess: ${guess}`);

  const ticketPda = getTicketPda(program.programId, lotteryPda, player.publicKey);

  // Encrypt the guess — no one can see it on-chain
  const encryptedGuess = await encryptValue(BigInt(guess));

  const tx = await program.methods
    .buyTicket(Buffer.from(encryptedGuess, "hex"))
    .accounts({
      player: player.publicKey,
      lottery: lotteryPda,
      ticket: ticketPda,
      vault: vaultPda,
      incoLightningProgram: INCO_LIGHTNING_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .signers([player])
    .rpc();

  console.log("Ticket PDA:", ticketPda.toBase58());
  console.log("Tx:", tx);
  return ticketPda;
}

// ============================================================
// 3. Draw Winner (authority sets encrypted winning number)
// ============================================================

async function drawWinner(
  program: anchor.Program,
  lotteryPda: PublicKey,
  authority: Keypair,
  winningNumber: number
) {
  console.log(`\nDrawing winner with number: ${winningNumber}`);

  const encryptedWinning = await encryptValue(BigInt(winningNumber));

  const tx = await program.methods
    .drawWinner(Buffer.from(encryptedWinning, "hex"))
    .accounts({
      authority: authority.publicKey,
      lottery: lotteryPda,
      incoLightningProgram: INCO_LIGHTNING_PROGRAM_ID,
    })
    .signers([authority])
    .rpc();

  console.log("Draw tx:", tx);
}

// ============================================================
// 4. Check Winner (encrypted comparison: e_eq)
// ============================================================

/**
 * On-chain, the program does:
 *   let is_winner: Ebool = e_eq(ctx, ticket.guess_handle, lottery.winning_number_handle, 0)?;
 *   ticket.is_winner_handle = is_winner.0;
 *
 * The result is an encrypted boolean — no one knows if you won until decrypted.
 */
async function checkWinner(
  program: anchor.Program,
  lotteryPda: PublicKey,
  ticketPda: PublicKey,
  player: Keypair
) {
  console.log(`\nChecking if player ${player.publicKey.toBase58().slice(0, 8)}... won...`);

  const tx = await program.methods
    .checkWinner()
    .accounts({
      player: player.publicKey,
      lottery: lotteryPda,
      ticket: ticketPda,
      incoLightningProgram: INCO_LIGHTNING_PROGRAM_ID,
    })
    .signers([player])
    .rpc();

  console.log("Check tx:", tx);
}

// ============================================================
// 5. Claim Prize (encrypted conditional: e_select)
// ============================================================

/**
 * On-chain:
 *   let actual_prize = e_select(ctx, Ebool(ticket.is_winner_handle), encrypted_prize, zero, 0)?;
 *   ticket.prize_handle = actual_prize.0;
 *
 * If won → prize amount, if lost → 0. All encrypted.
 */
async function claimPrize(
  program: anchor.Program,
  lotteryPda: PublicKey,
  ticketPda: PublicKey,
  player: Keypair
) {
  console.log(`\nClaiming prize...`);

  const tx = await program.methods
    .claimPrize()
    .accounts({
      player: player.publicKey,
      lottery: lotteryPda,
      ticket: ticketPda,
      incoLightningProgram: INCO_LIGHTNING_PROGRAM_ID,
    })
    .signers([player])
    .rpc();

  console.log("Claim tx:", tx);
}

// ============================================================
// 6. Withdraw Prize (attested decrypt + on-chain verification)
// ============================================================

/**
 * The player decrypts their prize amount, then submits an on-chain tx
 * with the Ed25519 attestation so the program can verify and transfer SOL.
 *
 * On-chain:
 *   is_validsignature(ctx, 1, Some(handles), Some(plaintexts))?;
 *   // Transfer SOL from vault to player
 */
async function withdrawPrize(
  program: anchor.Program,
  connection: Connection,
  lotteryPda: PublicKey,
  vaultPda: PublicKey,
  ticketPda: PublicKey,
  player: PublicKey,
  signMessage: (msg: Uint8Array) => Promise<Uint8Array>,
  sendTransaction: (tx: Transaction) => Promise<string>
) {
  console.log(`\nWithdrawing prize...`);

  // Fetch the prize handle from the ticket account
  const ticketInfo = await connection.getAccountInfo(ticketPda);
  if (!ticketInfo) throw new Error("Ticket not found");

  const ticketData = program.coder.accounts.decode("Ticket", ticketInfo.data);
  const prizeHandle = ticketData.prizeHandle.toString();

  // Attested decrypt — get plaintext + Ed25519 proof
  const result = await decrypt([prizeHandle], {
    address: player,
    signMessage,
  });

  console.log("Prize amount:", result.plaintexts[0]);

  if (result.plaintexts[0] === "0") {
    console.log("No prize to withdraw.");
    return;
  }

  // Build on-chain verification tx
  const tx = new Transaction();

  // Add Ed25519 attestation instructions
  result.ed25519Instructions.forEach((ix) => tx.add(ix));

  // Add withdraw instruction
  const handleBytes = Buffer.alloc(16);
  let h = BigInt(prizeHandle);
  for (let i = 0; i < 16; i++) {
    handleBytes[i] = Number(h & BigInt(0xff));
    h = h >> BigInt(8);
  }

  const withdrawIx = await program.methods
    .withdrawPrize([handleBytes], [Buffer.from(result.plaintexts[0])])
    .accounts({
      player,
      lottery: lotteryPda,
      ticket: ticketPda,
      vault: vaultPda,
      instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
      incoLightningProgram: INCO_LIGHTNING_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  tx.add(withdrawIx);

  const txSig = await sendTransaction(tx);
  console.log("Withdraw tx:", txSig);
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log("=== Private Raffle: Full Lifecycle ===\n");

  const connection = new Connection(CONNECTION_URL, "confirmed");
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Replace with your deployed program
  // const program = anchor.workspace.PrivateLottery;
  // const authority = Keypair.fromSecretKey(...);
  // const player1 = Keypair.fromSecretKey(...);
  // const player2 = Keypair.fromSecretKey(...);

  // Example flow:
  // const lotteryId = 1;
  // const { lotteryPda, vaultPda } = await createRaffle(program, authority, lotteryId);
  // const ticket1 = await buyTicket(program, lotteryPda, vaultPda, player1, 42);
  // const ticket2 = await buyTicket(program, lotteryPda, vaultPda, player2, 77);
  // await drawWinner(program, lotteryPda, authority, 42);
  // await checkWinner(program, lotteryPda, ticket1, player1);
  // await checkWinner(program, lotteryPda, ticket2, player2);
  // await claimPrize(program, lotteryPda, ticket1, player1);
  // await claimPrize(program, lotteryPda, ticket2, player2);
  // await withdrawPrize(program, connection, lotteryPda, vaultPda, ticket1, player1.publicKey, signMsg, sendTx);

  console.log("Uncomment the flow above with your deployed program.");
}

main().catch(console.error);
