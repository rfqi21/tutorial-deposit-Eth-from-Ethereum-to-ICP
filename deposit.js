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
