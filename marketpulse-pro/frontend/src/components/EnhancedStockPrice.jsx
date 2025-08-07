import React, { useState } from 'react';
import axios from 'axios';
import TradingViewChart from './TradingViewChart';
import './FundedAccountDashboard.css';

const EnhancedStockPrice = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChart, setShowChart] = useState(false);

  const fetchPrice = async () => {
    try {
      setError('');
      setStockData(null);
      setLoading(true);
      
      const response = await axios.get(`http://localhost:5001/api/stock/${symbol}`);
      console.log('API response:', response.data);

      if (response.data && response.data['Global Quote'] && Object.keys(response.data['Global Quote']).length > 0) {
        setStockData(response.data['Global Quote']);
        setShowChart(true);
      } else {
        setError('No data found for this symbol. Check symbol or try again.');
      }
    } catch (err) {
      setError('Could not fetch price. Check server, symbol, or try again.');
      console.error(err);
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

  const formatPercent = (value) => {
    const percent = parseFloat(value.replace('%', ''));
    return {
      value: Math.abs(percent).toFixed(2) + '%',
      isPositive: percent >= 0
    };
  };

  const popularSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'];

  return (
    <div className="dashboard-card">
      <h3 className="card-title">
        <span className="card-icon">📈</span>
        Stock Price & Charts
      </h3>
      
      {/* Symbol Input */}
      <div className="trading-form">
        <div className="form-group">
          <label className="form-label">Stock Symbol</label>
          <input 
            type="text" 
            className="form-input"
            value={symbol} 
            onChange={(e) => setSymbol(e.target.value.toUpperCase())} 
            placeholder="e.g., AAPL, TSLA, MSFT"
            onKeyDown={(e) => e.key === 'Enter' && fetchPrice()}
          />
        </div>
        
        {/* Popular Symbols */}
        <div style={{ marginBottom: '16px' }}>
          <label className="form-label">Popular Stocks:</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {popularSymbols.map(sym => (
              <button
                key={sym}
                onClick={() => {
                  setSymbol(sym);
                  setStockData(null);
                  setError('');
                }}
                style={{
                  padding: '6px 12px',
                  border: `1px solid ${symbol === sym ? '#667eea' : '#e5e7eb'}`,
                  borderRadius: '20px',
                  background: symbol === sym ? '#667eea' : 'white',
                  color: symbol === sym ? 'white' : '#374151',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
        
        <button 
          onClick={fetchPrice}
          disabled={loading || !symbol}
          className="btn btn-buy"
          style={{ width: '100%' }}
        >
          {loading ? 'Fetching...' : 'Get Price & Chart'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          margin: '16px 0',
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: '#fef2f2',
          border: '1px solid #ef4444',
          color: '#991b1b'
        }}>
          {error}
        </div>
      )}

      {/* Stock Data Display */}
      {stockData && (
        <div style={{ marginTop: '24px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
                {stockData['01. symbol']}
              </h4>
              <span style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '600',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                color: '#667eea'
              }}>
                LIVE
              </span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
              <div>
                <div className="balance-label">Current Price</div>
                <div className="balance-value" style={{ fontSize: '2rem', fontWeight: '700' }}>
                  {formatCurrency(stockData['05. price'])}
                </div>
              </div>
              
              <div>
                <div className="balance-label">Change</div>
                <div className={`balance-value ${
                  parseFloat(stockData['09. change']) >= 0 ? 'balance-positive' : 'balance-negative'
                }`}>
                  {parseFloat(stockData['09. change']) >= 0 ? '+' : ''}{formatCurrency(stockData['09. change'])}
                </div>
              </div>
              
              <div>
                <div className="balance-label">Change %</div>
                <div className={`balance-value ${
                  formatPercent(stockData['10. change percent']).isPositive ? 'balance-positive' : 'balance-negative'
                }`}>
                  {formatPercent(stockData['10. change percent']).isPositive ? '+' : '-'}{formatPercent(stockData['10. change percent']).value}
                </div>
              </div>
              
              <div>
                <div className="balance-label">Volume</div>
                <div className="balance-value">
                  {parseInt(stockData['06. volume']).toLocaleString()}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <div>
                <div className="balance-label">Previous Close</div>
                <div className="balance-value">{formatCurrency(stockData['08. previous close'])}</div>
              </div>
              <div>
                <div className="balance-label">Open</div>
                <div className="balance-value">{formatCurrency(stockData['02. open'])}</div>
              </div>
              <div>
                <div className="balance-label">High</div>
                <div className="balance-value">{formatCurrency(stockData['03. high'])}</div>
              </div>
              <div>
                <div className="balance-label">Low</div>
                <div className="balance-value">{formatCurrency(stockData['04. low'])}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TradingView Chart */}
      {showChart && stockData && (
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ marginBottom: '16px', color: '#1e293b' }}>
            📊 {stockData['01. symbol']} Chart & Technical Analysis
          </h4>
          <div style={{
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <TradingViewChart symbol={stockData['01. symbol']} theme="light" />
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedStockPrice;
