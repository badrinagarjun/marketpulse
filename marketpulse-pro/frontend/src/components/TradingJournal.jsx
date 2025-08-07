import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig.js'; // Updated import

const TradingJournal = () => {
  const [entries, setEntries] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({
    symbol: '', tradeType: 'Buy', quantity: '', price: '', notes: ''
  });

  const fetchEntries = async () => {
    const res = await api.get('/api/journal');
    setEntries(res.data);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (entry) => {
    setIsEditing(entry._id);
    setFormData({
      symbol: entry.symbol,
      tradeType: entry.tradeType,
      quantity: entry.quantity,
      price: entry.price,
      notes: entry.notes || ''
    });
  };

  const resetForm = () => {
    setIsEditing(null);
    setFormData({ symbol: '', tradeType: 'Buy', quantity: '', price: '', notes: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      await api.put(`/api/journal/${isEditing}`, formData);
    } else {
      await api.post('/api/journal', formData);
    }
    fetchEntries();
    resetForm();
  };
  
  const handleDelete = async (id) => {
    await api.delete(`/api/journal/${id}`);
    fetchEntries();
  };

  return (
    <div>
      <h3>{isEditing ? 'Edit Entry' : 'Add New Entry'}</h3>
      <form onSubmit={handleSubmit}>
        <input name="symbol" type="text" value={formData.symbol} onChange={handleInputChange} placeholder="Symbol" required />
        <select name="tradeType" value={formData.tradeType} onChange={handleInputChange}>
          <option value="Buy">Buy</option>
          <option value="Sell">Sell</option>
        </select>
        <input name="quantity" type="number" value={formData.quantity} onChange={handleInputChange} placeholder="Quantity" required />
        <input name="price" type="number" value={formData.price} onChange={handleInputChange} placeholder="Price" step="0.01" required />
        <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Notes..." />
        <button type="submit">{isEditing ? 'Update Entry' : 'Add Entry'}</button>
        {isEditing && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>
      <hr />
      <h3>Entries</h3>
      {entries.map(entry => (
        <div key={entry._id} style={{ border: '1px solid grey', margin: '10px', padding: '10px' }}>
          <p><strong>{entry.symbol}</strong> - {entry.tradeType} {entry.quantity} @ ${entry.price}</p>
          <p><em>Notes: {entry.notes}</em></p>
          <small>{new Date(entry.tradeDate).toLocaleString()}</small>
          <button onClick={() => handleEditClick(entry)}>Edit</button>
          <button onClick={() => handleDelete(entry._id)} style={{ marginLeft: '10px', color: 'red' }}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default TradingJournal;