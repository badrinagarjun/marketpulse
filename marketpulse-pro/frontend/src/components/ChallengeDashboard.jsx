import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChallengeDashboard = () => {
  const [account, setAccount] = useState(null);
  const [positions, setPositions] = useState([]);
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      const accountRes = await axios.get('http://localhost:5001/api/challenge/account');
      setAccount(accountRes.data);
      const positionsRes = await axios.get('http://localhost:5001/api/challenge/positions');
      setPositions(positionsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setMessage('Could not load challenge data.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOrder = async (e, tradeType) => {
    e.preventDefault();
    if (!symbol || !quantity) return; // Prevent empty submission
    
    try {
      const order = { symbol, tradeType, quantity };
      const res = await axios.post('http://localhost:5001/api/challenge/order', order);
      setMessage(res.data.message);
      setSymbol('');
      setQuantity('');
      fetchData(); 
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
      <form onSubmit={(e) => handleOrder(e, 'Buy')}>
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
        <button type="button" onClick={(e) => handleOrder(e, 'Sell')} style={{marginLeft: '10px'}}>Sell</button>
      </form>
      {message && <p>{message}</p>}
      <hr />
      <h4>Open Positions</h4>
      {positions.length > 0 ? (
        positions.map(pos => (
          <div key={pos._id}>
            <p><strong>{pos.symbol}</strong>: {pos.quantity} shares @ avg ${pos.averagePrice.toFixed(2)}</p>
          </div>
        ))
      ) : (
        <p>No open positions.</p>
      )}
    </div>
  );
};

export default ChallengeDashboard;