import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';
import AccountSelection from './AccountSelection';
import './FundedAccountDashboard.css';

const ChallengeDashboard = () => {
  const [account, setAccount] = useState(null);
  const [needsAccount, setNeedsAccount] = useState(false);
  const [unrealizedPnL, setUnrealizedPnL] = useState(0);
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [positionsWithPnL, setPositionsWithPnL] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const accountRes = await api.get('/api/challenge/account');
      setAccount(accountRes.data);
      setNeedsAccount(false);
      
      const positionsRes = await api.get('/api/challenge/positions');
      await calculatePositionsPnL(positionsRes.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setNeedsAccount(true);
      } else {
        console.error('Failed to fetch data:', error);
      }
    }
  }, []);

  const calculatePositionsPnL = async (currentPositions) => {
    let totalPnL = 0;
    const positionsWithCurrentPrices = [];

    for (const pos of currentPositions) {
      try {
        const res = await api.get(`/api/stock/${pos.symbol}`);
        const globalQuote = res.data['Global Quote'];
        if (globalQuote && globalQuote['05. price']) {
          const currentPrice = parseFloat(globalQuote['05. price']);
          const unrealizedPnL = (currentPrice - pos.averagePrice) * pos.quantity;
          const pnlPercent = ((currentPrice - pos.averagePrice) / pos.averagePrice) * 100;
          
          totalPnL += unrealizedPnL;
          positionsWithCurrentPrices.push({
            ...pos,
            currentPrice,
            unrealizedPnL,
            pnlPercent
          });
        }
      } catch (error) {
        console.error(`Failed to fetch price for ${pos.symbol}:`, error);
        console.warn(`Could not fetch P&L for ${pos.symbol}.`);
        positionsWithCurrentPrices.push({
          ...pos,
          currentPrice: pos.averagePrice,
          unrealizedPnL: 0,
          pnlPercent: 0
        });
      }
    }
    
    setUnrealizedPnL(totalPnL);
    setPositionsWithPnL(positionsWithCurrentPrices);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAccountCreated = (newAccount) => {
    setAccount(newAccount);
    setNeedsAccount(false);
    fetchData();
  };

  const handleOrder = async (e, tradeType) => {
    e.preventDefault();
    if (!symbol || !quantity) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const order = { symbol: symbol.toUpperCase(), tradeType, quantity };
      const res = await api.post('/api/challenge/order', order);
      setMessage(res.data.message);
      setSymbol('');
      setQuantity('');
      await fetchData(); 
    } catch (error) {
      setMessage(error.response?.data?.message || 'Order failed.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getBalanceColor = (amount) => {
    if (amount > 0) return 'balance-positive';
    if (amount < 0) return 'balance-negative';
    return 'balance-neutral';
  };

  // Show account selection if user doesn't have an account
  if (needsAccount) {
    return (
      <div className="funded-dashboard">
        <div className="dashboard-header">
          <h1 className="header-title">🚀 Funded Trading Challenge</h1>
          <p className="header-subtitle">Choose your challenge account and start trading</p>
        </div>
        <AccountSelection onAccountCreated={handleAccountCreated} />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="funded-dashboard">
        <div className="dashboard-card">
          <div className="loading"></div>
          <p>Loading Challenge Account...</p>
        </div>
      </div>
    );
  }

  const totalEquity = account.currentBalance + unrealizedPnL;
  const totalPnL = totalEquity - account.startingBalance;
  const totalPnLPercent = (totalPnL / account.startingBalance) * 100;

  return (
    <div className="funded-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="header-title">💼 {account.accountType.toUpperCase()} Challenge Account</h1>
        <p className="header-subtitle">Professional Trading Simulation</p>
      </div>

      {/* Account Overview */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3 className="card-title">
            <span className="card-icon">💰</span>
            Account Overview
          </h3>
          
          <div className={`balance-display ${getBalanceColor(totalPnL)}`}>
            {formatCurrency(totalEquity)}
          </div>
          
          <div className="balance-details">
            <div className="balance-item">
              <div className="balance-label">Starting Balance</div>
              <div className="balance-value">{formatCurrency(account.startingBalance)}</div>
            </div>
            <div className="balance-item">
              <div className="balance-label">Available Cash</div>
              <div className="balance-value">{formatCurrency(account.currentBalance)}</div>
            </div>
            <div className="balance-item">
              <div className="balance-label">Unrealized P&L</div>
              <div className={`balance-value ${getBalanceColor(unrealizedPnL)}`}>
                {formatCurrency(unrealizedPnL)}
              </div>
            </div>
            <div className="balance-item">
              <div className="balance-label">Total Return</div>
              <div className={`balance-value ${getBalanceColor(totalPnL)}`}>
                {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* Trading Interface */}
        <div className="dashboard-card">
          <h3 className="card-title">
            <span className="card-icon">📈</span>
            Place Order
          </h3>
          
          <form className="trading-form" onSubmit={(e) => handleOrder(e, 'Buy')}>
            <div className="form-group">
              <label className="form-label">Symbol</label>
              <input 
                type="text" 
                className="form-input"
                value={symbol} 
                onChange={(e) => setSymbol(e.target.value.toUpperCase())} 
                placeholder="e.g. AAPL, TSLA, MSFT" 
                required 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input 
                type="number" 
                className="form-input"
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)} 
                placeholder="Number of shares" 
                min="1"
                required 
              />
            </div>
            
            <div className="btn-group">
              <button 
                type="submit" 
                className="btn btn-buy"
                disabled={loading}
              >
                {loading ? <span className="loading"></span> : '📈 BUY'}
              </button>
              <button 
                type="button" 
                className="btn btn-sell"
                onClick={(e) => handleOrder(e, 'Sell')}
                disabled={loading}
              >
                {loading ? <span className="loading"></span> : '📉 SELL'}
              </button>
            </div>
          </form>
          
          {message && (
            <div style={{ 
              marginTop: '16px', 
              padding: '12px', 
              borderRadius: '8px',
              backgroundColor: message.includes('Successfully') ? '#f0f9ff' : '#fef2f2',
              border: `1px solid ${message.includes('Successfully') ? '#0ea5e9' : '#ef4444'}`,
              color: message.includes('Successfully') ? '#0c4a6e' : '#991b1b'
            }}>
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Positions */}
      <div className="dashboard-card">
        <h3 className="card-title">
          <span className="card-icon">📊</span>
          Open Positions ({positionsWithPnL.length})
        </h3>
        
        {positionsWithPnL.length > 0 ? (
          <table className="positions-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Quantity</th>
                <th>Avg. Price</th>
                <th>Current Price</th>
                <th>Market Value</th>
                <th>Unrealized P&L</th>
                <th>Return %</th>
              </tr>
            </thead>
            <tbody>
              {positionsWithPnL.map(pos => (
                <tr key={pos._id}>
                  <td className="position-symbol">{pos.symbol}</td>
                  <td>{pos.quantity.toLocaleString()}</td>
                  <td>{formatCurrency(pos.averagePrice)}</td>
                  <td>{formatCurrency(pos.currentPrice)}</td>
                  <td>{formatCurrency(pos.currentPrice * pos.quantity)}</td>
                  <td className={pos.unrealizedPnL >= 0 ? 'pnl-positive' : 'pnl-negative'}>
                    {formatCurrency(pos.unrealizedPnL)}
                  </td>
                  <td className={pos.pnlPercent >= 0 ? 'pnl-positive' : 'pnl-negative'}>
                    {pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#64748b',
            fontSize: '1.1rem'
          }}>
            <span style={{ fontSize: '3rem', marginBottom: '16px', display: 'block' }}>📊</span>
            No open positions yet. Place your first trade to get started!
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeDashboard;
