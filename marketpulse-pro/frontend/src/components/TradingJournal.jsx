import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axiosConfig.js';
import './EnhancedTradingJournal.css';

const TradingJournal = () => {
  const [entries, setEntries] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [formData, setFormData] = useState({
    symbol: '', tradeType: 'Buy', quantity: '', price: '', notes: ''
  });
  const [loading, setLoading] = useState(false);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/journal');
      setEntries(res.data);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Calculate performance statistics
  const performanceStats = useMemo(() => {
    if (entries.length === 0) {
      return {
        totalTrades: 0,
        buyTrades: 0,
        sellTrades: 0,
        totalVolume: 0,
        avgTradeSize: 0,
        avgPrice: 0
      };
    }

    const buyTrades = entries.filter(e => e.tradeType === 'Buy').length;
    const sellTrades = entries.filter(e => e.tradeType === 'Sell').length;
    const totalVolume = entries.reduce((sum, e) => sum + (parseFloat(e.quantity) * parseFloat(e.price)), 0);
    const avgTradeSize = entries.reduce((sum, e) => sum + parseFloat(e.quantity), 0) / entries.length;
    const avgPrice = entries.reduce((sum, e) => sum + parseFloat(e.price), 0) / entries.length;

    return {
      totalTrades: entries.length,
      buyTrades,
      sellTrades,
      totalVolume,
      avgTradeSize,
      avgPrice
    };
  }, [entries]);

  // Filter and sort entries
  const filteredEntries = useMemo(() => {
    let filtered = entries;

    if (filterType !== 'all') {
      filtered = entries.filter(entry => entry.tradeType.toLowerCase() === filterType);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.tradeDate) - new Date(a.tradeDate);
        case 'symbol':
          return a.symbol.localeCompare(b.symbol);
        case 'price':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'quantity':
          return parseFloat(b.quantity) - parseFloat(a.quantity);
        default:
          return 0;
      }
    });
  }, [entries, filterType, sortBy]);

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
    setLoading(true);
    
    try {
      if (isEditing) {
        await api.put(`/api/journal/${isEditing}`, formData);
      } else {
        await api.post('/api/journal', formData);
      }
      await fetchEntries();
      resetForm();
    } catch (error) {
      console.error('Failed to save entry:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    
    setLoading(true);
    try {
      await api.delete(`/api/journal/${id}`);
      await fetchEntries();
    } catch (error) {
      console.error('Failed to delete entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(value));
  };

  return (
    <div className="journal-container">
      {/* Header */}
      <div className="journal-header">
        <h3 className="journal-title">
          <span className="journal-icon">📊</span>
          Trading Journal
        </h3>
        
        <div className="journal-stats">
          <div className="stat-item">
            <span className="stat-value">{performanceStats.totalTrades}</span>
            <span className="stat-label">Total Trades</span>
          </div>
          <div className="stat-item">
            <span className="stat-value performance-positive">{performanceStats.buyTrades}</span>
            <span className="stat-label">Buy Orders</span>
          </div>
          <div className="stat-item">
            <span className="stat-value performance-negative">{performanceStats.sellTrades}</span>
            <span className="stat-label">Sell Orders</span>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      {entries.length > 0 && (
        <div className="performance-summary">
          <div className="performance-grid">
            <div className="performance-item">
              <div className="performance-value performance-neutral">
                {formatCurrency(performanceStats.totalVolume)}
              </div>
              <div className="performance-label">Total Volume</div>
            </div>
            <div className="performance-item">
              <div className="performance-value performance-neutral">
                {performanceStats.avgTradeSize.toFixed(0)}
              </div>
              <div className="performance-label">Avg Quantity</div>
            </div>
            <div className="performance-item">
              <div className="performance-value performance-neutral">
                {formatCurrency(performanceStats.avgPrice)}
              </div>
              <div className="performance-label">Avg Price</div>
            </div>
          </div>
        </div>
      )}

      {/* Entry Form */}
      <div className={`journal-form ${isEditing ? 'editing' : ''}`}>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Symbol</label>
              <input 
                name="symbol" 
                type="text" 
                className="form-input"
                value={formData.symbol} 
                onChange={handleInputChange} 
                placeholder="e.g., AAPL, TSLA, MSFT" 
                required 
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Trade Type</label>
              <select 
                name="tradeType" 
                className="form-select"
                value={formData.tradeType} 
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="Buy">📈 Buy</option>
                <option value="Sell">📉 Sell</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input 
                name="quantity" 
                type="number" 
                className="form-input"
                value={formData.quantity} 
                onChange={handleInputChange} 
                placeholder="Shares" 
                min="1"
                required 
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Price</label>
              <input 
                name="price" 
                type="number" 
                className="form-input"
                value={formData.price} 
                onChange={handleInputChange} 
                placeholder="0.00" 
                step="0.01" 
                min="0"
                required 
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Trading Notes</label>
            <textarea 
              name="notes" 
              className="form-textarea"
              value={formData.notes} 
              onChange={handleInputChange} 
              placeholder="Add your thoughts, strategy, or market analysis..."
              disabled={loading}
            />
          </div>

          <div className="btn-group">
            {isEditing && (
              <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={loading}>
                ❌ Cancel
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳' : isEditing ? '✅ Update Entry' : '➕ Add Entry'}
            </button>
          </div>
        </form>
      </div>

      {/* Entries Section */}
      <div className="entries-section">
        <div className="entries-header">
          <h4 className="entries-title">Trade History</h4>
          
          <div className="entries-filter">
            <select 
              className="filter-select"
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Trades</option>
              <option value="buy">Buy Orders</option>
              <option value="sell">Sell Orders</option>
            </select>
            
            <select 
              className="filter-select"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Sort by Date</option>
              <option value="symbol">Sort by Symbol</option>
              <option value="price">Sort by Price</option>
              <option value="quantity">Sort by Quantity</option>
            </select>
          </div>
        </div>

        <div className="entries-grid">
          {filteredEntries.length > 0 ? (
            filteredEntries.map(entry => (
              <div key={entry._id} className="entry-card">
                <div className="entry-header">
                  <div className="entry-symbol">
                    📈 {entry.symbol}
                    <span className={`trade-type-badge trade-type-${entry.tradeType.toLowerCase()}`}>
                      {entry.tradeType}
                    </span>
                  </div>
                </div>

                <div className="entry-date">
                  🗓️ {new Date(entry.tradeDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>

                <div className="entry-details">
                  <div className="detail-item">
                    <span className="detail-value">{entry.quantity.toLocaleString()}</span>
                    <span className="detail-label">Shares</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-value">{formatCurrency(entry.price)}</span>
                    <span className="detail-label">Price</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-value">{formatCurrency(entry.quantity * entry.price)}</span>
                    <span className="detail-label">Total Value</span>
                  </div>
                </div>

                {entry.notes && (
                  <div className="entry-notes">
                    💭 {entry.notes}
                  </div>
                )}

                <div className="entry-actions">
                  <button 
                    className="btn-icon btn-edit"
                    onClick={() => handleEditClick(entry)}
                    disabled={loading}
                    title="Edit Entry"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-icon btn-delete"
                    onClick={() => handleDelete(entry._id)}
                    disabled={loading}
                    title="Delete Entry"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3 className="empty-title">No Trading Entries Yet</h3>
              <p className="empty-description">
                Start by adding your first trade entry to track your trading journey!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingJournal;