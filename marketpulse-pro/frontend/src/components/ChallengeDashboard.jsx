import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChallengeDashboard = () => {
  const [account, setAccount] = useState(null);
  const [positions, setPositions] = useState([]);
  const [unrealizedPnL, setUnrealizedPnL] = useState(0); // New state for P&L
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
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // New useEffect to calculate P&L when positions change
  useEffect(() => {
    const calculatePnL = async () => {
      let totalPnL = 0;
      for (const pos of positions) {
        try {
          const res = await axios.get(`http://localhost:5001/api/stock/${pos.symbol}`);
          const globalQuote = res.data['Global Quote'];
          if (globalQuote && globalQuote['05. price']) {
            const currentPrice = parseFloat(globalQuote['05. price']);
            const pnl = (currentPrice - pos.averagePrice) * pos.quantity;
            totalPnL += pnl;
          }
        } catch (error) {
          console.warn(`Could not fetch P&L for ${pos.symbol}.`, error);
        }
      }
      setUnrealizedPnL(totalPnL);
    };

    if (positions.length > 0) {
      calculatePnL();
    } else {
      setUnrealizedPnL(0);
    }
  }, [positions]);

  const handleOrder = async (e, tradeType) => {
    e.preventDefault();
    if (!symbol || !quantity) return;
    
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

  if (!account) return <p>Loading Challenge Account...</p>;

  const pnlColor = unrealizedPnL >= 0 ? 'green' : 'red';

  return (
    <div>
      <h3>Challenge Account</h3>
      <p><strong>Balance:</strong> ${account.currentBalance.toFixed(2)}</p>
      {/* New line to display P&L */}
      <p><strong>Unrealized P&L:</strong> <span style={{ color: pnlColor }}>${unrealizedPnL.toFixed(2)}</span></p>
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