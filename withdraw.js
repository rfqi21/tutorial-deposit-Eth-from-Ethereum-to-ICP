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
