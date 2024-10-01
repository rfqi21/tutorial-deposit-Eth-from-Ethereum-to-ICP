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
