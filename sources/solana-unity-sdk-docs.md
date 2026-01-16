# Solana.Unity-SDK Documentation

Complete documentation for the Solana Unity SDK - Open-Source Unity-Solana integration framework with NFT support & Full RPC coverage. Mirrored from [docs](https://solana.unity-sdk.gg/).

---

## Table of Contents

### Prologue
- [Contribution Guide](#contribution-guide)

### Getting Started
- [Introduction](#introduction)
- [Installation](#installation)
- [Sample Scene](#sample-scene)
- [Configuration](#configuration)

### Core Concepts
- [Events, Balance and NFTs](#events-balance-and-nfts)
- [Associated Token Account](#associated-token-account)
- [Transfer Token](#transfer-token)
- [Transaction Builder](#transaction-builder)
- [Staking](#staking)
- [Add Signature](#add-signature)

### Guides
- [Mint an NFT](#mint-an-nft)
- [Mint an NFT with a Candy Machine](#mint-an-nft-with-a-candy-machine)
- [Creating a CandyMachine with the Unity Tool](#creating-a-candymachine-with-the-unity-tool)
- [Host Your Game on Github Pages](#host-your-game-on-github-pages)
- [Publishing a Game as Xnft](#publishing-a-game-as-xnft)
- [Soar Integration: Leaderboards & Rankings](#soar-integration-leaderboards--rankings)
- [DEX Integration: Orca](#dex-integration-orca)
- [DEX Integration: Jupiter](#dex-integration-jupiter)
- [Additional Examples](#additional-examples)

---

## Introduction

**Solana.Unity-SDK** is a comprehensive set of open-source tools to easily access Solana in your Unity-based games.

### Key Features

- **Full JSON RPC API coverage**
- **Wallet and accounts**: Set up of a non-custodial Solana wallet in Unity (sollet and solana-keygen compatible)
- **Phantom and Web3auth support**: Non-custodial signup/login through social accounts
- **Transaction decoding**: From base64 and wire format and encoding back into wire format
- **Message decoding**: From base64 and wire format and encoding back into wire format
- **Instruction decompilation**
- **TokenWallet object**: Send and receive SPL tokens and JIT provisioning of Associated Token Accounts
- **Basic UI examples**
- **NFTs**: Full NFT support with minting capabilities
- **Compile games to xNFTs (Backpack)**
- **Native DEX operations**: Orca, Jupiter, and more

### About

Solana.Unity-SDK uses [Solana.Unity-Core](https://github.com/garbles-labs/Solana.Unity-Core) implementation, native .NET Standard 2.0 (Unity compatible) with full RPC API coverage, MPL, native DEXes operations and more.

The project started as a fork of [unity-solana-wallet](https://github.com/allartprotocol/unity-solana-wallet), but it has been detached due to the several changes made and the upcoming pipeline of wallet integrations, including SMS and Raindrops.

### Quick Links

- **Discord**: [Join Community](https://discord.gg/MBkdC3gxcv)
- **Twitter**: [@garblesfun](https://twitter.com/garblesfun)
- **GitHub**: [Solana.Unity-SDK](https://github.com/garbles-labs/Solana.Unity-SDK)
- **Demo**: [View Demo](https://magicblock-labs.github.io/Solana.Unity-SDK/)

---

## Installation

### Video Tutorial

Here's a quick tutorial on how to setup the Unity SDK:

**YouTube**: [Setup Tutorial](https://www.youtube.com/watch?v=D0uk6oDVezM)

### Prerequisites

#### Unity

Go to [Unity Download](https://unity.com/download) to install Unity.

> **Note**: This tutorial is made in Unity 2021.3.5f1

### Import the SDK Package

1. Open the [Unity Package Manager](https://docs.unity3d.com/Manual/upm-ui.html) window.

2. Click the **add +** button in the status bar.

3. The options for adding packages appear.

4. Select **Add package from git URL** from the add menu. A text box and an Add button appear.

5. Enter the following Git URL in the text box and click **Add**:
   ```
   https://github.com/magicblock-labs/Solana.Unity-SDK.git
   ```

6. Once the package is installed, in the Package Manager inspector you will have **Samples**. Click on **Import**.

### Install Specific Version

You may also install a specific package version by using the URL with the specified version:

```
https://github.com/magicblock-labs/Solana.Unity-SDK.git#X.Y.Z
```

> **Note**: Replace `X.Y.Z` with the version you would like to get.

You can find all available releases at: [GitHub Releases](https://github.com/magicblock-labs/Solana.Unity-SDK/releases)

**Latest Release**: [![Last Release](https://img.shields.io/github/v/release/magicblock-labs/Solana.Unity-SDK)](https://github.com/magicblock-labs/Solana.Unity-SDK/releases/latest)

### Import Sample Scene

1. Import the Sample Scene from the Package Manager

2. You will find a sample scene with a configured wallet at:
   ```
   Samples/Solana SDK/0.0.2/Simple Wallet/Solana Wallet/scenes/wallet_scene.unity
   ```

---

## Sample Scene

After importing the SDK and the sample scene, you can explore the pre-configured wallet setup and test basic functionality.

The sample scene includes:
- Pre-configured wallet connection
- Basic UI examples
- RPC interaction examples
- Token and NFT management demonstrations

---

## Configuration

Learn how to configure your preferred wallet.

### Supported Wallets

The SDK supports a variety of wallets:

| Wallet | Support | Type |
|--------|---------|------|
| In-game (new or restore) | ✅ | In-app |
| In-game (Web3auth) | ✅ | In-app |
| Wallet Adapter | ✅ | External |
| Mobile Wallet Adapter | ✅ | External |
| Seed Vault | 🏗 | In-app |

### Interface

`IWalletBase` defines the common [interface](https://github.com/garbles-labs/Solana.Unity-SDK/blob/main/Runtime/codebase/IWalletBase.cs)

The `WalletBase` abstract class implements the `IWalletBase` interface and provides convenient methods shared by all wallet adapters.

#### Common Methods

- Connection to Mainnet/Devnet/Testnet or custom RPC
- Login/logout
- Account creation
- Get balance
- Get token accounts
- Sign/partially sign transactions
- Send transactions

For the complete list of methods, see: [WalletBase.cs](https://github.com/garbles-labs/Solana.Unity-SDK/blob/main/Runtime/codebase/WalletBase.cs)

### Login Example

You can attach the [Web3.cs](https://github.com/magicblock-labs/Solana.Unity-SDK/blob/main/Runtime/codebase/Web3.cs) script to any game object on the scene, then call:

```csharp
Web3.Instance.LoginWalletAdapter();
```

### Wallet Adapter

To configure a wallet following the [Wallet Adapter](https://solana-mobile.github.io/mobile-wallet-adapter/spec/spec.html) standard, use the [SolanaWalletAdapter](https://github.com/magicblock-labs/Solana.Unity-SDK/blob/main/Runtime/codebase/SolanaWalletAdapter.cs) implementation:

```csharp
WalletBase wallet = new SolanaWalletAdapter(walletAdapterOptions, RpcCluster.DevNet, ...);
```

### Solana Mobile Stack (SMS)

Solana Mobile Stack is a set of libraries for wallets and apps, allowing developers to create rich mobile experiences for the Solana network. 

For more information about SMS, check out the [official documentation](https://solanamobile.com/developers).

### Mobile Wallet Adapter

To establish a wallet configuration in accordance with the Mobile Wallet Adapter standard, employ the [SolanaWalletAdapter](https://github.com/magicblock-labs/Solana.Unity-SDK/blob/main/Runtime/codebase/SolanaWalletAdapter.cs) implementation.

This adapter intelligently detects the target platform during development, seamlessly utilizing the appropriate underlying implementation:

- **WebGL**: Uses [SolanaWalletAdapterWebGL](https://github.com/magicblock-labs/Solana.Unity-SDK/blob/main/Runtime/codebase/SolanaWalletAdapterWebGL/SolanaWalletAdapterWebGL.cs)
- **Android/iOS**: Uses [SolanaMobileWalletAdapter](https://github.com/magicblock-labs/Solana.Unity-SDK/blob/main/Runtime/codebase/SolanaMobileStack/SolanaMobileWalletAdapter.cs)

### Configuring Deep Links

Some wallets on iOS (e.g., Phantom) are currently implemented using Deep Links. Deep links are URLs that link to a specific piece of content or functionality within an app. In the context of Solana transactions, deep links can be used to sign a transaction by allowing users to approve a transaction using their Solana wallet.

#### Enabling Deep Linking for Android

> **Note**: `SolanaWalletAdapter` does not use deep links on Android. Unless you are manually instantiating the [PhantomDeepLink](https://github.com/magicblock-labs/Solana.Unity-SDK/blob/main/Runtime/codebase/DeepLinkWallets/PhantomDeepLink.cs) implementation, this step is not necessary.

To enable deep linking for Android applications, use an [intent filter](https://developer.android.com/guide/components/intents-filters). An intent filter overrides the standard Android App [Manifest](https://docs.unity3d.com/Manual/android-manifest.html) to include a specific intent filter section for [Activity](https://developer.android.com/reference/android/app/Activity).

**To set up the wallet intent filter:**

1. In the Project window, go to the folder `Assets > Plugins > Android` (or create it).

2. Create a new file and call it `AndroidManifest.xml`. Unity automatically processes this file when you build your application.

3. Copy the [code sample](https://github.com/magicblock-labs/Solana.Unity-SDK/blob/main/Samples~/Solana%20Wallet/Plugins/Android/AndroidManifest.xml) into the new file and save it.

> **Important**: `android:scheme="unitydl"` should match the value defined in the wallet configuration.

See the detailed explanation on the Unity [documentation page](https://docs.unity3d.com/Manual/deep-linking-android.html).

#### Enabling Deep Linking for iOS

The defined schema should match the value defined in the `SolanaWalletAdapter` wallet configuration.

See the detailed explanation on the Unity [documentation page](https://docs.unity3d.com/Manual/deep-linking-android.html).

---

## Events, Balance and NFTs

The Unity SDK uses delegates to offer an event-based system that allows users to observe balance changes and NFTs. You can register for events from anywhere.

### Login Event

```csharp
private void OnEnable()
{
    Web3.OnLogin += OnLogin;
}

private void OnDisable()
{
    Web3.OnLogin -= OnLogin;
}

private void OnLogin(Account account)
{
    Debug.Log(account.PublicKey);
}
```

### Balance Change Event

```csharp
private void OnEnable()
{
    Web3.OnBalanceChange += OnBalanceChange;
}

private void OnDisable()
{
    Web3.OnBalanceChange -= OnBalanceChange;
}

private void OnBalanceChange(double solBalance)
{
    Debug.Log($"Balance changed to {solBalance}");
}
```

### NFTs Update Event

```csharp
private void OnEnable()
{
    Web3.OnNFTsUpdate += OnNFTsUpdate;
}

private void OnDisable()
{
    Web3.OnNFTsUpdate -= OnNFTsUpdate;
}

private void OnNFTsUpdate(List<Nft> nfts, int total)
{
    Debug.Log($"NFTs updated. Total: {total}");
}
```

---

## Associated Token Account

For a comprehensive overview of Associated Token Accounts, you can rely on the [official Solana documentation](https://docs.solana.com/developing/programming-model/accounts#associated-token-account).

### Overview

The Associated Token Account Program defines the convention and provides the mechanism for mapping the user's wallet address to the associated token accounts they hold.

### Example: Creating an Associated Token Account

```csharp
// This public key is from a random account created via www.sollet.io
// To test this locally, create a wallet on sollet and derive this
PublicKey associatedTokenAccountOwner = new PublicKey("65EoWs57dkMEWbK4TJkPDM76rnbumq7r3fiZJnxggj2G");

PublicKey associatedTokenAccount = AssociatedTokenAccountProgram
    .DeriveAssociatedTokenAccount(associatedTokenAccountOwner, mintAccount);

Console.WriteLine($"AssociatedTokenAccountOwner: {associatedTokenAccountOwner}");
Console.WriteLine($"AssociatedTokenAccount: {associatedTokenAccount}");

byte[] createAssociatedTokenAccountTx = new TransactionBuilder()
    .SetRecentBlockHash(blockHash.Result.Value.Blockhash)
    .SetFeePayer(ownerAccount)
    .AddInstruction(AssociatedTokenAccountProgram.CreateAssociatedTokenAccount(
        ownerAccount,
        associatedTokenAccountOwner,
        mintAccount))
    .AddInstruction(TokenProgram.Transfer(
        initialAccount,
        associatedTokenAccount,
        25000,
        ownerAccount)) // The ownerAccount was set as the mint authority
    .Build(new List<Account> { ownerAccount });
```

### Complete Mint and Transfer Example

```csharp
AddInstruction(SystemProgram.CreateAccount(
    ownerAccount,
    mintAccount,
    minBalanceForExemptionMint,
    TokenProgram.MintAccountDataSize,
    TokenProgram.ProgramIdKey))
.AddInstruction(TokenProgram.InitializeMint(
    mintAccount.PublicKey,
    2,
    ownerAccount.PublicKey,
    ownerAccount.PublicKey))
.AddInstruction(SystemProgram.CreateAccount(
    ownerAccount,
    initialAccount,
    minBalanceForExemptionAcc,
    TokenProgram.TokenAccountDataSize,
    TokenProgram.ProgramIdKey))
.AddInstruction(TokenProgram.InitializeAccount(
    initialAccount.PublicKey,
    mintAccount.PublicKey,
    ownerAccount.PublicKey))
.AddInstruction(TokenProgram.MintTo(
    mintAccount.PublicKey,
    initialAccount.PublicKey,
    1_000_000,
    ownerAccount))
.AddInstruction(MemoProgram.NewMemo(initialAccount, "Hello from Sol.Net"))
.Build(new List<Account> { ownerAccount, mintAccount, initialAccount });
```

---

## Transfer Token

You can learn about Token Program on the [official Solana documentation](https://docs.solana.com/developing/programming-model/accounts#token-program).

### Overview

The Token program defines a common implementation for Fungible and Non-Fungible tokens. Balances can be transferred between Accounts using the Transfer instruction. The owner of the source Account must be present as a signer in the Transfer instruction when the source and destination accounts are different.

### Transfer Token Example

```csharp
public class TransferTokenExample : IExample
{
    private static readonly IRpcClient rpcClient = ClientFactory.GetClient(Cluster.TestNet);
    
    private const string MnemonicWords = 
        "route clerk disease box emerge airport loud waste attitude film army tray " +
        "forward deal onion eight catalog surface unit card window walnut wealth medal";
    
    public void Run()
    {
        Wallet.Wallet wallet = new Wallet.Wallet(MnemonicWords);
        
        RequestResult<ResponseValue<BlockHash>> blockHash = rpcClient.GetRecentBlockHash();
        
        ulong minBalanceForExemptionAcc = 
            rpcClient.GetMinimumBalanceForRentExemption(TokenProgram.TokenAccountDataSize).Result;
        
        Console.WriteLine($"MinBalanceForRentExemption Account >> {minBalanceForExemptionAcc}");
        
        Account mintAccount = wallet.GetAccount(31);
        Console.WriteLine($"MintAccount: {mintAccount}");
        
        Account ownerAccount = wallet.GetAccount(10);
        Console.WriteLine($"OwnerAccount: {ownerAccount}");
        
        Account initialAccount = wallet.GetAccount(32);
        Console.WriteLine($"InitialAccount: {initialAccount}");
        
        // ... continue with transfer logic
    }
}
```

---

## Transaction Builder

Learn about Transactions on the [official Anchor documentation](https://www.anchor-lang.com/).

### Transaction Builder Example

```csharp
using Solana.Unity.Programs;
using Solana.Unity.Programs.Models;
using Solana.Unity.Rpc;
using Solana.Unity.Rpc.Builders;
using Solana.Unity.Rpc.Core.Http;
using Solana.Unity.Rpc.Messages;
using Solana.Unity.Rpc.Models;
using Solana.Unity.Wallet;
using System;
using System.Collections.Generic;

namespace Solana.Unity.Examples
{
    public class TransactionBuilderExample : IExample
    {
        private static readonly IRpcClient rpcClient = ClientFactory.GetClient(Cluster.TestNet);
        
        private const string MnemonicWords = 
            "route clerk disease box emerge airport loud waste attitude film army tray " +
            "forward deal onion eight catalog surface unit card window walnut wealth medal";
        
        public void Run()
        {
            Wallet.Wallet wallet = new Wallet.Wallet(MnemonicWords);
            
            Account fromAccount = wallet.GetAccount(10);
            Account toAccount = wallet.GetAccount(8);
            
            RequestResult<ResponseValue<BlockHash>> blockHash = rpcClient.GetRecentBlockHash();
            Console.WriteLine($"BlockHash >> {blockHash.Result.Value.Blockhash}");
            
            byte[] tx = new TransactionBuilder()
                .SetRecentBlockHash(blockHash.Result.Value.Blockhash)
                .SetFeePayer(fromAccount)
                .AddInstruction(SystemProgram.Transfer(
                    fromAccount.PublicKey,
                    toAccount.PublicKey,
                    10000000))
                .Build(fromAccount);
            
            // Sign and send transaction
            // ...
        }
    }
}
```

---

## Staking

You can learn about Staking on the [official Solana documentation](https://docs.solana.com/staking).

### Overview

SOL token holders can earn rewards and help secure the network by staking tokens to one or more validators. Rewards for staked tokens are based on:
- The current inflation rate
- Total number of SOL staked on the network
- An individual validator's uptime and commission (fee)

---

## Add Signature

Learn about Signatures on the [official Solana documentation](https://docs.solana.com/developing/programming-model/transactions#signatures).

### Overview

Signatures are cryptographic proofs that validate transactions on the Solana blockchain. The SDK provides methods to add signatures to transactions for multi-signature workflows.

---

## Mint an NFT

For minting an NFT we will interact with the [Token Metadata](https://docs.metaplex.com/programs/token-metadata/) program. See the metaplex [documentation](https://docs.metaplex.com/) for a comprehensive overview.

### Step 1: Create Mint and Associated Token Account

First, create a new mint account for the NFT and an associated token account for owning it:

```csharp
var mint = new Account();
var associatedTokenAccount = AssociatedTokenAccountProgram
    .DeriveAssociatedTokenAccount(Web3.Account, mint.PublicKey);
```

### Step 2: Define NFT Metadata

```csharp
var metadata = new Metadata()
{ 
    name = "Test",
    symbol = "TST",
    uri = "https://y5fi7acw5f5r4gu6ixcsnxs6bhceujz4ijihcebjly3zv3lcoqkq.arweave.net/x0qPgFbpex4ankXFJt5eCcRKJzxCUHEQKV43mu1idBU",
    sellerFeeBasisPoints = 0,
    creators = new List<Creator> { new(Web3.Account.PublicKey, 100, true)}
};
```

### Step 3: Get Blockhash and Minimum Rent

```csharp
var blockHash = await Web3.Rpc.GetLatestBlockHashAsync();
var minimumRent = await Web3.Rpc.GetMinimumBalanceForRentExemptionAsync(
    TokenProgram.MintAccountDataSize
);
```

### Step 4: Build Transaction

The transaction consists of 6 instructions:
1. Creating the Mint Account
2. Initializing the Mint Account
3. Creating the AssociatedTokenAccount
4. Minting the NFT
5. Creating the Metadata Account
6. Creating the Master Edition

```csharp
var transaction = new TransactionBuilder()
    .SetRecentBlockHash(blockHash.Result.Value.Blockhash)
    .SetFeePayer(Web3.Account)
    .AddInstruction(
        SystemProgram.CreateAccount(
            Web3.Account,
            mint.PublicKey,
            minimumRent.Result,
            TokenProgram.MintAccountDataSize,
            TokenProgram.ProgramIdKey))
    .AddInstruction(
        TokenProgram.InitializeMint(
            mint.PublicKey,
            0,
            Web3.Account,
            Web3.Account))
    .AddInstruction(
        AssociatedTokenAccountProgram.CreateAssociatedTokenAccount(
            Web3.Account,
            Web3.Account,
            mint.PublicKey))
    .AddInstruction(
        TokenProgram.MintTo(
            mint.PublicKey,
            associatedTokenAccount,
            1,
            Web3.Account))
    .AddInstruction(MetadataProgram.CreateMetadataAccount(
        PDALookup.FindMetadataPDA(mint), 
        mint.PublicKey, 
        Web3.Account, 
        Web3.Account, 
        Web3.Account.PublicKey, 
        metadata,
        TokenStandard.NonFungible, 
        true, 
        true, 
        null,
        metadataVersion: MetadataVersion.V3))
    .AddInstruction(MetadataProgram.CreateMasterEdition(
        maxSupply: null,
        masterEditionKey: PDALookup.FindMasterEditionPDA(mint),
        mintKey: mint,
        updateAuthorityKey: Web3.Account,
        mintAuthority: Web3.Account,
        payer: Web3.Account,
        metadataKey: PDALookup.FindMetadataPDA(mint),
        version: CreateMasterEditionVersion.V3
    ));
```

### Step 5: Sign and Send Transaction

```csharp
var tx = Transaction.Deserialize(transaction.Build(new List<Account> {Web3.Account, mint}));
var res = await Web3.Wallet.SignAndSendTransaction(tx);
Debug.Log(res.Result);
```

### Result

The console will print the transaction signature. You can view it in the Solana Explorer:
- Example transaction: [View on Explorer](https://explorer.solana.com/tx/TPSviDzpzTFEyfJkYwmQzqaPJTTsGMZTuPuG9q1LiKrhZnwg5WWHH7ARR8eYAdoB8rt8qcjKwqbcZj43b84Ls5C?cluster=devnet)
- Example NFT: [View on Explorer](https://explorer.solana.com/address/4X199VtLKVJUeLMXzwXzSsFgapVQcrYx9vnqxNDkH2Xa?cluster=devnet)

---

## Mint an NFT with a Candy Machine

The Metaplex Protocol Candy Machine is the leading minting and distribution program for fair NFT collection launches on Solana. Much like its name suggests, you can think of a Candy Machine as a temporary structure which is first loaded by creators and then unloaded by buyers. It allows creators to bring their digital assets on-chain in a secure and customizable way.

**Read the full documentation**: [Metaplex Candy Machine](https://docs.metaplex.com/programs/candy-machine/overview)

### Candy Machine vs Normal Minting

#### Advantages

The candy machine is the perfect tool if you want to mint NFTs without an authoritative server. It allows you to:

- Accept payments in SOL, NFTs or any Solana token
- Restrict your launch via start/end dates, mint limits, third party signers, etc.
- Protect your launch against bots via configurable bot taxes and gatekeepers like Captchas
- Restrict minting to specific NFT/Token holders or to a curated list of wallets
- Create multiple minting groups with different sets of rules
- Reveal your NFTs after the launch whilst allowing your users to verify that information
- And many more features!

#### Disadvantage

The candy machine is not the right tool if you don't know in advance the number of NFTs in the collection or if you need dynamic minting.

### How to Create a Candy Machine

- **With the Unity Editor**: Follow the [Unity tool tutorial](#creating-a-candymachine-with-the-unity-tool)
- **With the Sugar CLI**: Follow the [official documentation](https://docs.metaplex.com/programs/candy-machine/how-to-guides/my-first-candy-machine-part1)

### How to Mint from a Candy Machine

The following example assumes you created a Candy Machine, and uses the [sol-payment](https://docs.metaplex.com/programs/candy-machine/available-guards/sol-payment) guard for minting.

#### Step 1: Create Mint and Associated Token Account

```csharp
var mint = new Account();
var associatedTokenAccount = AssociatedTokenAccountProgram
    .DeriveAssociatedTokenAccount(Web3.Account, mint.PublicKey);
```

#### Step 2: Define Candy Machine and Guard

```csharp
var candyMachineKey = new PublicKey("5SQCxpkvhAPwahXmMg53PQHND3JbEZk9WEfq3jceuUY3");
var candyGuardKey = new PublicKey("5FrkJp9jnArgYv1p9S4tsSUMuHCCBrGu8HM3JNKGV5bM");
```

#### Step 3: Retrieve Candy Machine Information

```csharp
var candyMachineClient = new CandyMachineClient(
    Web3.Rpc, 
    null, 
    CandyMachineCommands.CandyMachineProgramId
);

var stateRequest = await candyMachineClient.GetCandyMachineAsync(candyMachineKey);
var candyMachine = stateRequest.ParsedResult;
var candyMachineCreator = CandyMachineCommands.GetCandyMachineCreator(candyMachineKey);
var collectionNft = await Nft.TryGetNftData(candyMachine.CollectionMint, Web3.Rpc);
```

#### Step 4: Build Mint Transaction

```csharp
var mintNftAccounts = new Solana.Unity.Metaplex.CandyGuard.Program.MintV2Accounts {
    CandyMachineAuthorityPda = candyMachineCreator,
    Payer = Web3.Account,
    Minter = Web3.Account,
    CandyMachine = candyMachineKey,
    NftMetadata = PDALookup.FindMetadataPDA(mint),
    NftMasterEdition = PDALookup.FindMasterEditionPDA(mint),
    SystemProgram = SystemProgram.ProgramIdKey,
    TokenMetadataProgram = MetadataProgram.ProgramIdKey,
    SplTokenProgram = TokenProgram.ProgramIdKey,
    CollectionDelegateRecord = PDALookup.FindDelegateRecordPDA(
        candyMachine.Authority, 
        candyMachine.CollectionMint, 
        candyMachineCreator, 
        MetadataDelegateRole.Collection
    ),
    CollectionMasterEdition = PDALookup.FindMasterEditionPDA(candyMachine.CollectionMint),
    CollectionMetadata = PDALookup.FindMetadataPDA(candyMachine.CollectionMint),
    CollectionMint = candyMachine.CollectionMint,
    CollectionUpdateAuthority = collectionNft.metaplexData.data.updateAuthority,
    NftMint = mint,
    NftMintAuthority = Web3.Account,
    Token = associatedTokenAccount,
    TokenRecord = PDALookup.FindTokenRecordPDA(associatedTokenAccount, mint),
    SplAtaProgram = AssociatedTokenAccountProgram.ProgramIdKey,
    SysvarInstructions = SysVars.InstructionAccount,
    RecentSlothashes = new PublicKey("SysvarS1otHashes111111111111111111111111111"),
    CandyGuard = candyGuardKey,
    CandyMachineProgram = CandyMachineCommands.CandyMachineProgramId
};

// Use the sol payment Guard
CandyGuardMintSettings mintSettings = new CandyGuardMintSettings()
{
    SolPayment = new CandyGuardMintSettings.SolPaymentMintSettings()
    {
        Destination = candyMachine.Authority
    },
};

// Build the Transaction
var mintSettingsAccounts = mintSettings.GetMintArgs(
    Web3.Account, 
    mint, 
    candyMachineKey, 
    candyGuardKey
);

var computeInstruction = ComputeBudgetProgram.SetComputeUnitLimit(800_000);

var candyMachineInstruction = CandyGuardProgram.MintV2(
    mintNftAccounts,
    Array.Empty<byte>(),
    null,
    CandyMachineCommands.CandyGuardProgramId
);

candyMachineInstruction = new TransactionInstruction {
    Data = candyMachineInstruction.Data,
    ProgramId = candyMachineInstruction.ProgramId,
    Keys = candyMachineInstruction.Keys.Select(k => {
        if (k.PublicKey == mint.PublicKey) {
            return AccountMeta.Writable(mint, true);
        }
        return k;
    }).Concat(mintSettingsAccounts).ToList()
};

var blockHash = await Web3.Rpc.GetLatestBlockHashAsync();
var transaction = new TransactionBuilder()
    .SetRecentBlockHash(blockHash.Result.Value.Blockhash)
    .SetFeePayer(Web3.Account)
    .AddInstruction(computeInstruction)
    .AddInstruction(candyMachineInstruction)
    .Build(new List<Account> { Web3.Account, mint });

var tx = Transaction.Deserialize(transaction);
```

#### Step 5: Sign and Send Transaction

```csharp
var res = await Web3.Wallet.SignAndSendTransaction(tx);
Debug.Log(res.Result);
```

### Result

The console will print the transaction signature:
- Example transaction: [View on Explorer](https://explorer.solana.com/tx/5V8PcL1Av16P8L1wxdcMnM2sp3wQmvbBHYbZcksksCbNWPJmaXxvx4QVAvwmy1VsL7mJMSUUcBdEeUHS387xuYtA?cluster=devnet)
- Example NFT: [View on Explorer](https://explorer.solana.com/address/6FdPEzdwLRbA9V8uGuDGfih8qviT4CoRjZGKmT7eC7uj?cluster=devnet)

---

## Creating a CandyMachine with the Unity Tool

The runtime library provides convenience methods for executing CandyMachine commands during runtime, such as minting or revealing.

*Full documentation for the Unity Editor tool is coming soon.*

---

## Host Your Game on GitHub Pages

Solana.Unity SDK is fully compatible with WebGL. In this tutorial you will compile the Solana.Unity-SDK demo scene and publish it using GitHub pages.

### Overview

With GitHub Pages, GitHub allows you to host a webpage from your repository.

### Prerequisites

- Download and Install Unity
- Install the Solana.Unity-SDK following the instructions and import the example

### Steps

#### 1. Compile to WebGL

Compile the scene to WebGL. **Important**: Be sure to disable compression, as GitHub Pages does not support serving compressed files.

#### 2. Skip Compilation (Optional)

If you want to skip the compilation step, you can fork the SDK repository, which contains a pre-compiled WebGL build in the `gh-pages` branch.

#### 3. Create a New Repository

Navigate to the build folder containing the `index.html` file.

#### 4. Initialize Git and Push

```bash
git init
git add .
git commit -m "WebGL game"
git remote add origin <remote_repo_url>
git push origin <branch>
```

Your repository should now look similar to the SDK `gh-pages` branch.

#### 5. Enable GitHub Pages

Enable gh-pages deployment from the repository settings.

GitHub will provide a URL for the live deployment, for example:
```
https://garbles-labs.github.io/Solana.Unity-SDK
```

### Custom Domain

Learn how to set up a custom domain on [GitHub Pages documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

### Next Steps

Follow the [xNFT guide](#publishing-a-game-as-xnft) to publish your game as an xNFT in less than 2 minutes.

Happy game development 🎈 and don't forget to ⭐ the repo!

---

## Publishing a Game as Xnft

*Documentation for publishing games as xNFTs (Backpack) coming soon.*

---

## Soar Integration: Leaderboards & Rankings

*Documentation for Soar integration coming soon.*

---

## DEX Integration: Orca

Orca is natively supported in the SDK. Utility methods are provided to easily build the transactions needed to make swaps, open positions, manage cash and interact with Whirlpools.

### About Orca

Orca is the easiest place to trade cryptocurrency on the Solana blockchain. For a detailed description refer to:
- [Official Orca Documentation](https://docs.orca.so/orca-for-traders/master)
- [Orca Developer Portal](https://orca-so.gitbook.io/orca-developer-portal/orca/welcome)

### Perform a Swap

#### Step 1: Create IDex Instance

```csharp
IDex dex = new OrcaDex(
    Web3.Account, 
    Web3.Rpc
);
```

#### Step 2: Get Token Data

```csharp
TokenData tokenA = await dex.GetTokenBySymbol("USDC");
TokenData tokenB = await dex.GetTokenBySymbol("ORCA");
```

#### Step 3: Find Whirlpool

```csharp
Pool whirlpool = await dex.FindWhirlpoolAddress(
    tokenA.MintAddress, 
    tokenB.MintAddress
);
```

#### Step 4: Get Swap Quote

```csharp
SwapQuote swapQuote = await dex.GetSwapQuoteFromWhirlpool(
    whirlpool.Address, 
    DecimalUtil.ToUlong(1, tokenA.Decimals),
    tokenA.MintAddress,
    slippageTolerance: 0.1
);

var quote = DecimalUtil.FromBigInteger(swapQuote.EstimatedAmountOut, tokenB.Decimals);
Debug.Log(quote); // Amount of expected ORCA tokens to receive
```

#### Step 5: Create Swap Transaction

```csharp
Transaction tx = await dex.SwapWithQuote(
    whirlpool,
    swapQuote
);
```

#### Step 6: Sign and Send Transaction

```csharp
await Web3.Wallet.SignAndSendTransaction(tx);
```

### Open a Position and Increase Liquidity

Example of adding 5 ORCA and 5 USDC to the liquidity of the pool, minting a Metaplex NFT representing the position:

```csharp
OrcaDex dex = new OrcaDex(
    Web3.Account, 
    Web3.Rpc
);

var orcaToken = await dex.GetTokenBySymbol("ORCA");
var usdcToken = await dex.GetTokenBySymbol("USDC");

Debug.Log($"Token A: {orcaToken}");
Debug.Log($"Token B: {usdcToken}");

var whirlpool = await dex.FindWhirlpoolAddress(
    usdcToken.MintAddress, 
    orcaToken.MintAddress
);

Debug.Log($"Whirlpool: {whirlpool.Address}");

Account mint = new Account();

Transaction tx = await dex.OpenPositionWithLiquidity(
    whirlpool.Address,
    mint,
    -443520,
    443520,
    DecimalUtil.ToUlong(0.1, orcaToken.Decimals),
    DecimalUtil.ToUlong(0.25, usdcToken.Decimals),
    slippageTolerance: 0.5,
    withMetadata: true,
    commitment: Commitment.Confirmed
);

tx.PartialSign(Web3.Account);
tx.PartialSign(mint);

var res = await Web3.Wallet.SignAndSendTransaction(tx, commitment: Commitment.Confirmed);
Debug.Log(res.Result);
```

---

## DEX Integration: Jupiter

Jupiter is natively supported in the SDK. Utility methods are provided to easily get swap quotes, build and send the transactions needed to perform swaps.

### About Jupiter

Jupiter is the key liquidity aggregator for Solana, offering the widest range of tokens and best route discovery between any token pair. For a detailed description refer to the [official Jupiter documentation](https://station.jup.ag/).

### Perform a Swap

#### Step 1: Create IDexAggregator Instance

```csharp
IDexAggregator dex = new JupiterDexAg(Web3.Account);
```

#### Step 2: Get Token Data

```csharp
TokenData tokenA = await dex.GetTokenBySymbol("SOL");
TokenData tokenB = await dex.GetTokenBySymbol("USDC");
```

#### Step 3: Get Swap Quote

Get a swap quote for 1 SOL:

```csharp
SwapQuoteAg swapQuote = await dex.GetSwapQuote(
    tokenA.MintAddress,
    tokenB.MintAddress,
    DecimalUtil.ToUlong(1, tokenA.Decimals)
);

var quote = DecimalUtil.FromBigInteger(swapQuote.OutputAmount, tokenB.Decimals);
Debug.Log(quote); // Amount of expected USDC tokens to receive
```

#### Step 4: Display Route Path

```csharp
Debug.Log(string.Join(" -> ", swapQuote.RoutePlan.Select(p => p.SwapInfo.Label)));
// Example output: Lifinity V2 -> Whirlpool
```

#### Step 5: Create Swap Transaction

```csharp
Transaction tx = await dex.Swap(swapQuote);
```

#### Step 6: Sign and Send Transaction

```csharp
await Web3.Wallet.SignAndSendTransaction(tx);
```

### Use the Jupiter Payments API

The Jupiter Payments API is also available, enabling you to utilize Jupiter + SolanaPay for facilitating user payments with any SPL token, allowing pricing in USDC or other tokens.

#### Example: ExactOut Mode

Get a swap quote for the amount of SOL needed to obtain exactly 5 USDC:

```csharp
IDexAggregator dex = new JupiterDexAg(Web3.Account);

TokenData tokenA = await dex.GetTokenBySymbol("SOL");
TokenData tokenB = await dex.GetTokenBySymbol("USDC");

SwapQuoteAg swapQuote = await dex.GetSwapQuote(
    tokenA.MintAddress,
    tokenB.MintAddress,
    DecimalUtil.ToUlong(5, tokenB.Decimals),
    SwapMode.ExactOut
);

var quote = DecimalUtil.FromBigInteger(swapQuote.InputAmount, tokenA.Decimals);
Debug.Log(quote); // Amount of expected SOL tokens to pay
```

Create and send the swap transaction:

```csharp
Transaction tx = await dex.Swap(swapQuote);
await Web3.Wallet.SignAndSendTransaction(tx);
```

---

## Additional Examples

More examples are available in the SDK repository and community resources.

For comprehensive examples, check out:
- [GitHub Repository Examples](https://github.com/magicblock-labs/Solana.Unity-SDK/tree/main/Samples)
- [Community Examples and Tutorials](https://github.com/magicblock-labs/Solana.Unity-SDK/discussions)

---

## Contribution Guide

*Contribution guidelines coming soon.*

We welcome contributions from the community! The Solana Unity SDK is a community-developed and maintained project. Please be understanding if certain areas are still under development. Your contributions are always welcome to help address any issues you may encounter.

---

## Resources and Links

### Official Links

- **GitHub**: [https://github.com/garbles-labs/Solana.Unity-SDK](https://github.com/garbles-labs/Solana.Unity-SDK)
- **Discord Community**: [https://discord.gg/MBkdC3gxcv](https://discord.gg/MBkdC3gxcv)
- **Twitter**: [@garblesfun](https://twitter.com/garblesfun)
- **Live Demo**: [https://magicblock-labs.github.io/Solana.Unity-SDK/](https://magicblock-labs.github.io/Solana.Unity-SDK/)

### Related Projects

- **Solana.Unity-Core**: [https://github.com/garbles-labs/Solana.Unity-Core](https://github.com/garbles-labs/Solana.Unity-Core)
- **Unity Asset Store**: Available as a Verified Solution

### External Documentation

- **Solana Documentation**: [https://docs.solana.com/](https://docs.solana.com/)
- **Metaplex Documentation**: [https://docs.metaplex.com/](https://docs.metaplex.com/)
- **Anchor Documentation**: [https://www.anchor-lang.com/](https://www.anchor-lang.com/)
- **Jupiter Documentation**: [https://station.jup.ag/](https://station.jup.ag/)
- **Orca Documentation**: [https://docs.orca.so/](https://docs.orca.so/)
- **Solana Mobile Stack**: [https://solanamobile.com/developers](https://solanamobile.com/developers)

---

## Support

If you encounter any issues or have questions:

1. Check the [GitHub Issues](https://github.com/magicblock-labs/Solana.Unity-SDK/issues)
2. Join our [Discord Community](https://discord.gg/MBkdC3gxcv)
3. Review the [GitHub Discussions](https://github.com/magicblock-labs/Solana.Unity-SDK/discussions)

---

*Last Updated: January 2025*

*This documentation is maintained by the community. For the most up-to-date information, please visit the official GitHub repository.*