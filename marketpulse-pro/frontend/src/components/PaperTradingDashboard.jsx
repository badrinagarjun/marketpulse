/**
 * 📊 FREE Paper Trading Dashboard
 * Features: Virtual trading, Portfolio tracking, Real-time P&L
 */

import React, { useState, useEffect } from 'react';
import AlpacaService from '../services/AlpacaService';
import AdvancedTradingChart, { TimeframeSelector, SymbolSearch } from './AdvancedTradingChartFixed';
import './PaperTradingDashboard.css';

const PaperTradingDashboard = () => {
  // 📊 State Management
  const [account, setAccount] = useState(null);
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [loading, setLoading] = useState(true);
  
  // 🛒 Trading State
  const [tradeForm, setTradeForm] = useState({
    symbol: 'AAPL',
    quantity: '',
    side: 'buy',
    orderType: 'market',
    limitPrice: ''
  });
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(null);

  // 📈 Data Fetching
  useEffect(() => {
    fetchAccountData();
    const interval = setInterval(fetchAccountData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedSymbol) {
      fetchQuote(selectedSymbol);
      setTradeForm(prev => ({ ...prev, symbol: selectedSymbol }));
    }
  }, [selectedSymbol]);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      const [accountData, positionsData, ordersData] = await Promise.all([
        AlpacaService.getAccount(),
        AlpacaService.getPositions(),
        AlpacaService.getOrders()
      ]);

      setAccount(accountData);
      setPositions(positionsData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching account data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuote = async (symbol) => {
    try {
      const quote = await AlpacaService.getQuote(symbol);
      setCurrentQuote(quote);
    } catch (error) {
      console.error('Error fetching quote:', error);
    }
  };

  // 🛒 Trading Functions
  const handleTrade = async (e) => {
    e.preventDefault();
    
    try {
      const orderData = {
        symbol: tradeForm.symbol,
        qty: parseInt(tradeForm.quantity),
        side: tradeForm.side,
        type: tradeForm.orderType,
        ...(tradeForm.orderType === 'limit' && { limit_price: parseFloat(tradeForm.limitPrice) })
      };

      await AlpacaService.placeOrder(orderData);
      
      // Refresh data after trade
      await fetchAccountData();
      setShowTradeModal(false);
      setTradeForm({
        symbol: selectedSymbol,
        quantity: '',
        side: 'buy',
        orderType: 'market',
        limitPrice: ''
      });
      
      alert(`🎉 ${tradeForm.side.toUpperCase()} order placed successfully for ${tradeForm.quantity} shares of ${tradeForm.symbol}!`);
    } catch (error) {
      console.error('Error placing trade:', error);
      alert('❌ Error placing trade. Please try again.');
    }
  };

  // 💰 Calculate Portfolio Metrics
  const calculateTotalValue = () => {
    if (!account) return 0;
    return parseFloat(account.portfolio_value || account.equity || 0);
  };

  const calculateDayPnL = () => {
    if (!account) return 0;
    const current = parseFloat(account.equity || 0);
    const previous = parseFloat(account.last_equity || current);
    return current - previous;
  };

  const calculateDayPnLPercent = () => {
    if (!account) return 0;
    const dayPnL = calculateDayPnL();
    const previous = parseFloat(account.last_equity || account.equity || 1);
    return (dayPnL / previous) * 100;
  };

  // 🎨 Format Currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // 🎨 Format Percentage
  const formatPercent = (percent) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  if (loading && !account) {
    return (
      <div className="paper-trading-loading">
        <div className="loading-spinner"></div>
        <p>Loading your paper trading account...</p>
      </div>
    );
  }

  return (
    <div className="paper-trading-dashboard">
      {/* 📊 Account Overview */}
      <div className="account-overview">
        <div className="overview-card balance-card">
          <h3>💰 Account Balance</h3>
          <div className="balance-amount">
            {formatCurrency(calculateTotalValue())}
          </div>
          <div className="balance-details">
            <span>Cash: {formatCurrency(parseFloat(account?.cash || 0))}</span>
            <span>Buying Power: {formatCurrency(parseFloat(account?.buying_power || 0))}</span>
          </div>
        </div>

        <div className="overview-card pnl-card">
          <h3>📈 Day P&L</h3>
          <div className={`pnl-amount ${calculateDayPnL() >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(calculateDayPnL())}
          </div>
          <div className={`pnl-percent ${calculateDayPnL() >= 0 ? 'positive' : 'negative'}`}>
            {formatPercent(calculateDayPnLPercent())}
          </div>
        </div>

        <div className="overview-card positions-card">
          <h3>📊 Positions</h3>
          <div className="positions-count">
            {positions.length}
          </div>
          <div className="positions-value">
            Total: {formatCurrency(parseFloat(account?.long_market_value || 0))}
          </div>
        </div>

        <div className="overview-card orders-card">
          <h3>📋 Orders</h3>
          <div className="orders-count">
            {orders.filter(order => order.status === 'new' || order.status === 'partially_filled').length}
          </div>
          <div className="orders-label">Active Orders</div>
        </div>
      </div>

      {/* 📈 Main Trading Interface */}
      <div className="trading-interface">
        {/* Left Panel - Chart */}
        <div className="chart-panel">
          <div className="panel-header">
            <h2>📈 Advanced Chart</h2>
            <div className="chart-controls">
              <SymbolSearch onSymbolSelect={setSelectedSymbol} />
              <TimeframeSelector 
                currentInterval={selectedTimeframe}
                onIntervalChange={setSelectedTimeframe}
              />
            </div>
          </div>
          
          <AdvancedTradingChart
            symbol={selectedSymbol}
            interval={selectedTimeframe}
            theme="dark"
            height={500}
          />

          {/* 💹 Quick Trade Actions */}
          <div className="quick-trade-actions">
            <button 
              className="trade-btn buy-btn"
              onClick={() => {
                setTradeForm(prev => ({ ...prev, side: 'buy' }));
                setShowTradeModal(true);
              }}
            >
              📈 Buy {selectedSymbol}
            </button>
            <button 
              className="trade-btn sell-btn"
              onClick={() => {
                setTradeForm(prev => ({ ...prev, side: 'sell' }));
                setShowTradeModal(true);
              }}
            >
              📉 Sell {selectedSymbol}
            </button>
            {currentQuote && (
              <div className="current-price">
                <span>Current Price:</span>
                <span className="price-value">{formatCurrency(currentQuote.price)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Positions & Orders */}
        <div className="data-panel">
          {/* 💼 Active Positions */}
          <div className="positions-section">
            <h3>💼 Your Positions</h3>
            {positions.length > 0 ? (
              <div className="positions-list">
                {positions.map((position, index) => (
                  <div key={index} className="position-item">
                    <div className="position-header">
                      <span className="symbol">{position.symbol}</span>
                      <span className={`pnl ${parseFloat(position.unrealized_pl) >= 0 ? 'positive' : 'negative'}`}>
                        {formatCurrency(parseFloat(position.unrealized_pl || 0))}
                      </span>
                    </div>
                    <div className="position-details">
                      <div className="detail">
                        <span>Quantity:</span>
                        <span>{position.qty} shares</span>
                      </div>
                      <div className="detail">
                        <span>Avg Price:</span>
                        <span>{formatCurrency(parseFloat(position.avg_entry_price || 0))}</span>
                      </div>
                      <div className="detail">
                        <span>Market Value:</span>
                        <span>{formatCurrency(parseFloat(position.market_value || 0))}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-positions">
                <div className="no-data-icon">📊</div>
                <p>No open positions</p>
                <p>Start trading to see your positions here</p>
              </div>
            )}
          </div>

          {/* 📋 Recent Orders */}
          <div className="orders-section">
            <h3>📋 Recent Orders</h3>
            {orders.length > 0 ? (
              <div className="orders-list">
                {orders.slice(0, 10).map((order, index) => (
                  <div key={index} className="order-item">
                    <div className="order-header">
                      <span className="symbol">{order.symbol}</span>
                      <span className={`status ${order.status}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="order-details">
                      <div className="detail">
                        <span>{order.side.toUpperCase()} {order.qty} shares</span>
                      </div>
                      <div className="detail">
                        <span>Price: {formatCurrency(parseFloat(order.filled_avg_price || 0))}</span>
                      </div>
                      <div className="detail">
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-orders">
                <div className="no-data-icon">📋</div>
                <p>No recent orders</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🛒 Trade Modal */}
      {showTradeModal && (
        <div className="trade-modal-overlay" onClick={() => setShowTradeModal(false)}>
          <div className="trade-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🛒 Place Order</h3>
              <button 
                className="close-btn"
                onClick={() => setShowTradeModal(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleTrade} className="trade-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Symbol</label>
                  <input
                    type="text"
                    value={tradeForm.symbol}
                    onChange={(e) => setTradeForm(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Side</label>
                  <select
                    value={tradeForm.side}
                    onChange={(e) => setTradeForm(prev => ({ ...prev, side: e.target.value }))}
                  >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={tradeForm.quantity}
                    onChange={(e) => setTradeForm(prev => ({ ...prev, quantity: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Order Type</label>
                  <select
                    value={tradeForm.orderType}
                    onChange={(e) => setTradeForm(prev => ({ ...prev, orderType: e.target.value }))}
                  >
                    <option value="market">Market</option>
                    <option value="limit">Limit</option>
                  </select>
                </div>
              </div>

              {tradeForm.orderType === 'limit' && (
                <div className="form-group">
                  <label>Limit Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={tradeForm.limitPrice}
                    onChange={(e) => setTradeForm(prev => ({ ...prev, limitPrice: e.target.value }))}
                    required
                  />
                </div>
              )}

              {currentQuote && (
                <div className="order-summary">
                  <div className="summary-item">
                    <span>Current Price:</span>
                    <span>{formatCurrency(currentQuote.price)}</span>
                  </div>
                  {tradeForm.quantity && (
                    <div className="summary-item">
                      <span>Estimated Value:</span>
                      <span>{formatCurrency(currentQuote.price * parseInt(tradeForm.quantity || 0))}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowTradeModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`btn-primary ${tradeForm.side === 'buy' ? 'buy' : 'sell'}`}
                >
                  Place {tradeForm.side.toUpperCase()} Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaperTradingDashboard;
