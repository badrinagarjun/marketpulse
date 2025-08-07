import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig.js'; // Updated import

const ChallengeDashboard = () => {
  const [account, setAccount] = useState(null);
  const [positions, setPositions] = useState([]);
  const [unrealizedPnL, setUnrealizedPnL] = useState(0);
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      const accountRes = await api.get('/api/challenge/account');
      setAccount(accountRes.data);
      const positionsRes = await api.get('/api/challenge/positions');
      setPositions(positionsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const calculatePnL = async () => {
      let totalPnL = 0;
      for (const pos of positions) {
        try {
          const res = await api.get(`/api/stock/${pos.symbol}`);
          const globalQuote = res.data['Global Quote'];
          if (globalQuote && globalQuote['05. price']) {
            const currentPrice = parseFloat(globalQuote['05. price']);
            const pnl = (currentPrice - pos.averagePrice) * pos.quantity;
            totalPnL += pnl;
          }
        } catch (error) {
          console.error('Error',error);
          console.warn(`Could not fetch P&L for ${pos.symbol}.`);
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
      const res = await api.post('/api/challenge/order', order);
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
      <p><strong>Unrealized P&L:</strong> <span style={{ color: pnlColor }}>${unrealizedPnL.toFixed(2)}</span></p>
      <hr />
      <h4>Place Order</h4>
      <form onSubmit={(e) => handleOrder(e, 'Buy')}>
        <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="Symbol (e.g. AAPL)" required />
        <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Quantity" required />
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