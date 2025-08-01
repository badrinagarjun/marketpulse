import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TradingJournal = () => {
  const [entries, setEntries] = useState([]);
  const [symbol, setSymbol] = useState('');
  const [tradeType, setTradeType] = useState('Buy');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');

  const fetchEntries = async () => {
    const res = await axios.get('http://localhost:5001/api/journal');
    setEntries(res.data);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newEntry = { symbol, tradeType, quantity, price, notes };
    await axios.post('http://localhost:5001/api/journal', newEntry);
    fetchEntries(); // Refresh the list
    // Reset form
    setSymbol(''); setQuantity(''); setPrice(''); setNotes('');
  };

  return (
    <div>
      <h3>Trading Journal</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="Symbol (e.g., AAPL)" required />
        <select value={tradeType} onChange={e => setTradeType(e.target.value)}>
          <option value="Buy">Buy</option>
          <option value="Sell">Sell</option>
        </select>
        <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Quantity" required />
        <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" step="0.01" required />
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes..." />
        <button type="submit">Add Entry</button>
      </form>
      <hr />
      {entries.map(entry => (
        <div key={entry._id} style={{ border: '1px solid grey', margin: '10px', padding: '10px' }}>
          <p><strong>{entry.symbol}</strong> - {entry.tradeType} {entry.quantity} @ ${entry.price}</p>
          <p><em>Notes: {entry.notes}</em></p>
          <small>{new Date(entry.tradeDate).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
};

export default TradingJournal;