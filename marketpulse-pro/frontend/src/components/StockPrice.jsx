import React, { useState } from 'react';
import axios from 'axios';

const StockPrice = () => {
  const [symbol, setSymbol] = useState('RELIANCE.BSE');
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState('');

  const fetchPrice = async () => {
    try {
      setError('');
      setStockData(null);
      const response = await axios.get(`http://localhost:5001/api/stock/${symbol}`);
      console.log('API response:', response.data); // Debug log

      // Check if response contains 'Global Quote'
      if (response.data && response.data['Global Quote'] && Object.keys(response.data['Global Quote']).length > 0) {
        setStockData(response.data['Global Quote']);
      } else {
        setError('No data found for this symbol. Check symbol or try again.');
      }
    } catch (err) {
      setError('Could not fetch price. Check server, symbol, or try again.');
      console.error(err);
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
      {stockData && (
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