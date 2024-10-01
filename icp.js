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
