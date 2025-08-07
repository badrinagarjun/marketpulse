import React, { useState } from 'react';
import api from '../api/axiosConfig.js'; // Updated import

const StockPrice = () => {
  const [symbol, setSymbol] = useState('RELIANCE.BSE');
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState('');

  const fetchPrice = async () => {
    try {
      setError('');
      setStockData(null);
      const response = await api.get(`/api/stock/${symbol}`);
      setStockData(response.data['Global Quote']);
    } catch (err) {
      console.error('Error',err);
      setError('Could not fetch price. Check symbol or try again.');
    }
  };

  return (
    <div>
      <h3>Get Stock Price</h3>
      <input 
        type="text" 
        value={symbol} 
        onChange={(e) => setSymbol(e.target.value)} 
        placeholder="e.g., RELIANCE.BSE"
      />
      <button onClick={fetchPrice}>Get Price</button>
      {error && <p style={{color: 'red'}}>{error}</p>}
      {stockData && Object.keys(stockData).length > 0 && (
        <div>
          <p><strong>Symbol:</strong> {stockData['01. symbol']}</p>
          <p><strong>Price:</strong> {stockData['05. price']}</p>
          <p><strong>Change:</strong> {stockData['10. change percent']}</p>
        </div>
      )}
    </div>
  );
};

export default StockPrice;