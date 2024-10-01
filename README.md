# Tutorial: Depositing ETH from Ethereum to ICP Using ckEth

This tutorial will guide you through the process of depositing Ethereum (ETH) from the Ethereum network to the Internet Computer Protocol (ICP) using ckEth. You'll learn how to set up a basic frontend application that allows users to deposit and withdraw ETH between ICP and Ethereum. By the end of this tutorial, you'll have a working codebase hosted in a repository.

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Step 1: Setting Up the Development Environment](#step-1-setting-up-the-development-environment)
4. [Step 2: Deploying the ckEth Bridge Contracts](#step-2-deploying-the-cketh-bridge-contracts)
5. [Step 3: Building the Frontend](#step-3-building-the-frontend)
6. [Step 4: Implementing Deposit and Withdrawal Functionality](#step-4-implementing-deposit-and-withdrawal-functionality)
7. [Step 5: Testing the Application](#step-5-testing-the-application)
8. [Step 6: Setting Up the Repository](#step-6-setting-up-the-repository)
9. [Conclusion](#conclusion)

---

## Introduction

Transferring assets between different blockchain networks can be challenging due to varying protocols and standards. This tutorial focuses on bridging ETH from the Ethereum network to the Internet Computer Protocol (ICP) using **ckEth**, a cross-chain bridge solution. We will create a simple frontend application that facilitates the deposit and withdrawal of ETH between these two networks.

---

## Prerequisites

Before starting, ensure you have the following:

- **Basic Knowledge of Ethereum and ICP:** Familiarity with smart contracts, wallets, and blockchain concepts.
- **Development Tools:**
  - [Node.js](https://nodejs.org/en/) (v14.x or later)
  - [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
  - [Truffle](https://www.trufflesuite.com/truffle) or [Hardhat](https://hardhat.org/) for Ethereum smart contract development
  - [Motoko](https://motoko.org/) or [Rust](https://www.rust-lang.org/) for ICP canister development
- **Wallets:**
  - [MetaMask](https://metamask.io/) for Ethereum interactions
  - [NNS Dapp](https://nns.ic0.app/) for ICP interactions
- **GitHub Account:** To host your repository

---

## Step 1: Setting Up the Development Environment

### 1.1 Install Node.js and npm

Ensure you have Node.js and npm installed. You can download them from [here](https://nodejs.org/en/).

```bash
node -v
npm -v
```

### 1.2 Install Truffle or Hardhat

We'll use Hardhat for Ethereum smart contract development.

```bash
npm install --save-dev hardhat
```

Initialize Hardhat in your project directory:

```bash
npx hardhat
```

Follow the prompts to create a basic sample project.

### 1.3 Install ICP SDK

For ICP canister development, you can use the DFINITY SDK.

Download and install the DFINITY SDK from [here](https://sdk.dfinity.org/docs/quickstart/quickstart.html).

Verify installation:

```bash
dfx --version
```

### 1.4 Install Git

Ensure Git is installed on your machine. Download from [here](https://git-scm.com/downloads) if necessary.

---

## Step 2: Deploying the ckEth Bridge Contracts

### 2.1 Ethereum Smart Contract

We'll create a smart contract on Ethereum that interacts with the ckEth bridge.

#### 2.1.1 Initialize Hardhat Project

If not already initialized, navigate to your project directory and initialize Hardhat:

```bash
mkdir cketh-bridge
cd cketh-bridge
npx hardhat
```

Choose "Create a basic sample project" and follow the prompts.

#### 2.1.2 Install Dependencies

```bash
npm install @openzeppelin/contracts
```

#### 2.1.3 Create the Bridge Contract

Create a new file `contracts/Bridge.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Bridge is Ownable {
    ERC20 public token;
    mapping(address => uint256) public balances;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);

    constructor(address _token) {
        token = ERC20(_token);
    }

    function deposit(uint256 _amount) external {
        require(token.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        balances[msg.sender] += _amount;
        emit Deposit(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) external {
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        balances[msg.sender] -= _amount;
        require(token.transfer(msg.sender, _amount), "Transfer failed");
        emit Withdraw(msg.sender, _amount);
    }

    // Function to set a new token address
    function setToken(address _token) external onlyOwner {
        token = ERC20(_token);
    }
}
```

#### 2.1.4 Compile and Deploy the Contract

Update `hardhat.config.js` with your Ethereum network configuration (e.g., Ropsten, Mainnet).

```javascript
require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.0",
  networks: {
    ropsten: {
      url: "https://ropsten.infura.io/v3/YOUR_INFURA_PROJECT_ID",
      accounts: ["YOUR_PRIVATE_KEY"]
    },
    // Add other networks if needed
  },
};
```

Deploy the contract:

```bash
npx hardhat run scripts/deploy.js --network ropsten
```

*Note:* Replace `ropsten` with the desired network. Ensure you have test ETH for deployment.

### 2.2 ICP Canister

On the ICP side, we'll create a canister that interacts with the Ethereum bridge.

#### 2.2.1 Initialize ICP Project

```bash
mkdir icp-bridge
cd icp-bridge
dfx new --type=motoko icp_bridge
cd icp_bridge
```

#### 2.2.2 Implement the Bridge Canister

Edit `src/icp_bridge/main.mo`:

```motoko
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";

actor {
    stable var ethBalances : Trie.Map Text Nat = Trie.Map.empty<Text, Nat>();

    public func deposit(user: Text, amount: Nat) : async () {
        let current = ethBalances.get(user) ?? 0;
        ethBalances.put(user, current + amount);
        Debug.print("Deposited " # Nat.toText(amount) # " ETH for " # user);
    };

    public func withdraw(user: Text, amount: Nat) : async Bool {
        let current = ethBalances.get(user) ?? 0;
        if (current >= amount) {
            ethBalances.put(user, current - amount);
            Debug.print("Withdrew " # Nat.toText(amount) # " ETH for " # user);
            return true;
        };
        return false;
    };

    public query func getBalance(user: Text) : async Nat {
        return ethBalances.get(user) ?? 0;
    };
};
```

#### 2.2.3 Deploy the Canister

Start the ICP local network:

```bash
dfx start --background
```

Deploy the canister:

```bash
dfx deploy
```

Note the canister ID from the deployment output for frontend integration.

---

## Step 3: Building the Frontend

We'll create a simple React frontend that interacts with both Ethereum and ICP.

### 3.1 Initialize React Project

Navigate to the root project directory and create a React app:

```bash
npx create-react-app bridge-frontend
cd bridge-frontend
```

### 3.2 Install Dependencies

```bash
npm install ethers @dfinity/agent @dfinity/auth-client
```

### 3.3 Project Structure

Organize your project as follows:

```
bridge-frontend/
├── src/
│   ├── components/
│   │   ├── Deposit.js
│   │   └── Withdraw.js
│   ├── utils/
│   │   ├── ethereum.js
│   │   └── icp.js
│   ├── App.js
│   └── index.js
├── package.json
└── ...
```

---

## Step 4: Implementing Deposit and Withdrawal Functionality

### 4.1 Ethereum Integration (`src/utils/ethereum.js`)

```javascript
import { ethers } from 'ethers';
import BridgeABI from './BridgeABI.json'; // ABI of the deployed Bridge contract

const bridgeAddress = 'YOUR_BRIDGE_CONTRACT_ADDRESS';

let provider;
let signer;
let bridgeContract;

export const connectEthereum = async () => {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    signer = provider.getSigner();
    bridgeContract = new ethers.Contract(bridgeAddress, BridgeABI, signer);
    return bridgeContract;
  } else {
    alert('Please install MetaMask!');
  }
};

export const depositETH = async (amount) => {
  const bridge = await connectEthereum();
  const tx = await bridge.deposit(ethers.utils.parseEther(amount));
  await tx.wait();
  alert('Deposit Successful!');
};

export const withdrawETH = async (amount) => {
  const bridge = await connectEthereum();
  const tx = await bridge.withdraw(ethers.utils.parseEther(amount));
  await tx.wait();
  alert('Withdrawal Successful!');
};
```

*Ensure you have the `BridgeABI.json` file, which contains the ABI of your deployed Bridge contract.*

### 4.2 ICP Integration (`src/utils/icp.js`)

```javascript
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../../declarations/icp_bridge/icp_bridge.did.js';
import { AuthClient } from '@dfinity/auth-client';

const canisterId = 'YOUR_CANISTER_ID';

const agent = new HttpAgent({ host: 'https://ic0.app' });

export const connectICP = async () => {
  const authClient = await AuthClient.create();
  await authClient.login({
    onSuccess: () => {
      console.log('ICP Authenticated');
    },
  });

  const actor = Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });

  return actor;
};

export const depositICP = async (user, amount) => {
  const actor = await connectICP();
  await actor.deposit(user, amount);
  alert('ICP Deposit Successful!');
};

export const withdrawICP = async (user, amount) => {
  const actor = await connectICP();
  const success = await actor.withdraw(user, amount);
  if (success) {
    alert('ICP Withdrawal Successful!');
  } else {
    alert('Withdrawal Failed: Insufficient Balance');
  }
};
```

*Ensure you have the generated `idlFactory` from the canister deployment.*

### 4.3 Deposit Component (`src/components/Deposit.js`)

```javascript
import React, { useState } from 'react';
import { depositETH } from '../utils/ethereum';
import { depositICP } from '../utils/icp';

const Deposit = () => {
  const [amount, setAmount] = useState('');
  const [user, setUser] = useState('');

  const handleEthereumDeposit = () => {
    depositETH(amount);
  };

  const handleICPDeposit = () => {
    depositICP(user, amount);
  };

  return (
    <div>
      <h2>Deposit ETH to ICP</h2>
      <input
        type="text"
        placeholder="Amount in ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleEthereumDeposit}>Deposit to Ethereum</button>

      <h2>Deposit ETH to ICP</h2>
      <input
        type="text"
        placeholder="ICP User"
        value={user}
        onChange={(e) => setUser(e.target.value)}
      />
      <input
        type="text"
        placeholder="Amount in ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleICPDeposit}>Deposit to ICP</button>
    </div>
  );
};

export default Deposit;
```

### 4.4 Withdraw Component (`src/components/Withdraw.js`)

```javascript
import React, { useState } from 'react';
import { withdrawETH } from '../utils/ethereum';
import { withdrawICP } from '../utils/icp';

const Withdraw = () => {
  const [amount, setAmount] = useState('');
  const [user, setUser] = useState('');

  const handleEthereumWithdraw = () => {
    withdrawETH(amount);
  };

  const handleICPWithdraw = () => {
    withdrawICP(user, amount);
  };

  return (
    <div>
      <h2>Withdraw ETH from Ethereum</h2>
      <input
        type="text"
        placeholder="Amount in ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleEthereumWithdraw}>Withdraw from Ethereum</button>

      <h2>Withdraw ETH from ICP</h2>
      <input
        type="text"
        placeholder="ICP User"
        value={user}
        onChange={(e) => setUser(e.target.value)}
      />
      <input
        type="text"
        placeholder="Amount in ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleICPWithdraw}>Withdraw from ICP</button>
    </div>
  );
};

export default Withdraw;
```

### 4.5 App Component (`src/App.js`)

```javascript
import React from 'react';
import Deposit from './components/Deposit';
import Withdraw from './components/Withdraw';

function App() {
  return (
    <div className="App">
      <h1>ckEth Bridge</h1>
      <Deposit />
      <Withdraw />
    </div>
  );
}

export default App;
```

---

## Step 5: Testing the Application

### 5.1 Run the Frontend

Navigate to the `bridge-frontend` directory and start the React app:

```bash
npm start
```

The application should open at `http://localhost:3000`.

### 5.2 Test Ethereum Deposit and Withdrawal

1. **Connect MetaMask:**
   - Ensure MetaMask is installed and connected to the same network where the Bridge contract is deployed.
   - Import your test account.

2. **Deposit ETH:**
   - Enter the amount of ETH to deposit.
   - Click "Deposit to Ethereum".
   - Confirm the transaction in MetaMask.

3. **Withdraw ETH:**
   - Enter the amount of ETH to withdraw.
   - Click "Withdraw from Ethereum".
   - Confirm the transaction in MetaMask.

### 5.3 Test ICP Deposit and Withdrawal

1. **Connect ICP Wallet:**
   - Access the [NNS Dapp](https://nns.ic0.app/).
   - Connect your ICP wallet.

2. **Deposit ETH to ICP:**
   - Enter the ICP user identifier and the amount.
   - Click "Deposit to ICP".

3. **Withdraw ETH from ICP:**
   - Enter the ICP user identifier and the amount.
   - Click "Withdraw from ICP".

*Note:* Ensure the canister is correctly deployed and the frontend is pointing to the right canister ID.

---

## Step 6: Setting Up the Repository

### 6.1 Initialize Git Repository

In the root project directory, initialize Git:

```bash
git init
```

### 6.2 Create `.gitignore`

Create a `.gitignore` file to exclude unnecessary files:

```
# Node modules
node_modules/

# Build outputs
build/
dist/

# Hardhat files
cache/
artifacts/

# DFX files
dfx/
```

### 6.3 Commit the Code

```bash
git add .
git commit -m "Initial commit of ckEth Bridge tutorial"
```

### 6.4 Create GitHub Repository

1. Go to [GitHub](https://github.com/) and create a new repository named `cketh-bridge-tutorial`.
2. Follow the instructions to push your local repository to GitHub:

```bash
git remote add origin https://github.com/YOUR_USERNAME/cketh-bridge-tutorial.git
git branch -M main
git push -u origin main
```

### 6.5 Repository Structure

Your repository should have the following structure:

```
cketh-bridge-tutorial/
├── bridge-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Deposit.js
│   │   │   └── Withdraw.js
│   │   ├── utils/
│   │   │   ├── ethereum.js
│   │   │   └── icp.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── ...
├── icp-bridge/
│   ├── src/
│   │   └── icp_bridge/
│   │       └── main.mo
│   ├── dfx.json
│   └── ...
├── contracts/
│   ├── Bridge.sol
│   └── ...
├── scripts/
│   └── deploy.js
├── hardhat.config.js
├── package.json
├── .gitignore
└── README.md
```

### 6.6 Add README

Create a `README.md` file with the tutorial content provided here, including setup instructions, how to deploy, and how to run the application.

---

## Conclusion

You've successfully created a bridge application that allows users to deposit and withdraw ETH between Ethereum and ICP using ckEth. This tutorial covered setting up the development environment, deploying smart contracts on Ethereum and ICP, building a React frontend, and setting up a GitHub repository with the working code.

Feel free to enhance the application by adding features like transaction history, real-time balance updates, and improved security measures. Always ensure to test thoroughly on test networks before deploying to the mainnet.

---

## Repository

You can find the complete code for this tutorial in the [cketh-bridge-tutorial](https://github.com/YOUR_USERNAME/cketh-bridge-tutorial) GitHub repository.

*Replace `YOUR_USERNAME` with your actual GitHub username.*

---

# Additional Notes

- **Security Considerations:** Ensure that the smart contracts are audited and free from vulnerabilities before deploying to the mainnet.
- **Handling Fees:** Consider the gas fees on Ethereum and the transaction costs on ICP when designing the bridge.
- **Scalability:** For production-grade applications, implement robust error handling, logging, and monitoring.
- **User Experience:** Enhance the frontend with better UI/UX for a smoother user experience.

If you encounter any issues or have questions, feel free to reach out or open an issue in the repository.
