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
