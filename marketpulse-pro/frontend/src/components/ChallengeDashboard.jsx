import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChallengeDashboard = () => {
  const [account, setAccount] = useState(null);
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState('');

  const fetchAccountData = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/challenge/account');
      setAccount(res.data);
    } catch (error) {
      console.error('Failed to fetch account data:', error);
      setMessage('Could not load account data.');
    }
  };

  useEffect(() => {
    fetchAccountData();
  }, []);

  const handleBuyOrder = async (e) => {
    e.preventDefault();
    try {
      const order = { symbol, tradeType: 'Buy', quantity };
      const res = await axios.post('http://localhost:5001/api/challenge/order', order);
      setMessage(res.data.message);
      fetchAccountData(); // Refresh account data after trade
    } catch (error) {
      setMessage(error.response?.data?.message || 'Order failed.');
    }
  };

  if (!account) {
    return <p>Loading Challenge Account...</p>;
  }

  return (
    <div>
      <h3>Challenge Account</h3>
      <p><strong>Balance:</strong> ${account.currentBalance.toFixed(2)}</p>
      <hr />
      <h4>Place Order</h4>
      <form onSubmit={handleBuyOrder}>
        <input 
          type="text" 
          value={symbol} 
          onChange={(e) => setSymbol(e.target.value.toUpperCase())} 
          placeholder="Symbol (e.g. AAPL)" 
          required 
        />
        <input 
          type="number" 
          value={quantity} 
          onChange={(e) => setQuantity(e.target.value)} 
          placeholder="Quantity" 
          required 
        />
        <button type="submit">Buy</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ChallengeDashboard;