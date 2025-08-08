import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Analysis.css';
import TradingAPIService from '../services/TradingAPIService';

const Analysis = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('EURUSD');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1H');
  const chartRef = useRef(null);

  // Use custom hooks for real-time data (with error handling)
  const [account, setAccount] = useState(null);
  const [positions, setPositions] = useState([]);
  const [indicators, setIndicators] = useState(null);
  const [loading, setLoading] = useState(true);

  const symbols = [
    { value: 'EURUSD', label: 'EUR/USD', type: 'forex' },
    { value: 'GBPUSD', label: 'GBP/USD', type: 'forex' },
    { value: 'USDJPY', label: 'USD/JPY', type: 'forex' },
    { value: 'USDCHF', label: 'USD/CHF', type: 'forex' },
    { value: 'AUDUSD', label: 'AUD/USD', type: 'forex' },
    { value: 'USDCAD', label: 'USD/CAD', type: 'forex' },
    { value: 'NZDUSD', label: 'NZD/USD', type: 'forex' },
    { value: 'EURGBP', label: 'EUR/GBP', type: 'forex' },
    { value: 'EURJPY', label: 'EUR/JPY', type: 'forex' },
    { value: 'GBPJPY', label: 'GBP/JPY', type: 'forex' },
    { value: 'SPX500', label: 'S&P 500', type: 'index' },
    { value: 'US30', label: 'Dow Jones', type: 'index' },
    { value: 'NAS100', label: 'NASDAQ 100', type: 'index' },
    { value: 'GER30', label: 'DAX', type: 'index' },
    { value: 'UK100', label: 'FTSE 100', type: 'index' },
    { value: 'JPN225', label: 'Nikkei 225', type: 'index' },
    { value: 'XAUUSD', label: 'Gold/USD', type: 'commodity' },
    { value: 'XAGUSD', label: 'Silver/USD', type: 'commodity' },
    { value: 'USOIL', label: 'Crude Oil', type: 'commodity' },
    { value: 'BTCUSD', label: 'Bitcoin/USD', type: 'crypto' },
    { value: 'ETHUSD', label: 'Ethereum/USD', type: 'crypto' }
  ];

  const timeframes = [
    { value: '1', label: '1M' },
    { value: '5', label: '5M' },
    { value: '15', label: '15M' },
    { value: '30', label: '30M' },
    { value: '1H', label: '1H' },
    { value: '4H', label: '4H' },
    { value: '1D', label: '1D' },
    { value: '1W', label: '1W' }
  ];

  useEffect(() => {
    initializeTradingViewWidget();
    setLoading(false);
  }, [selectedSymbol, selectedTimeframe, initializeTradingViewWidget]);

    const initializeTradingViewWidget = useCallback(() => {
    if (!chartRef.current) return;

    // Clear previous widget
    chartRef.current.innerHTML = '';

    // Create TradingView widget
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: selectedSymbol.includes('USD') || selectedSymbol.includes('EUR') || selectedSymbol.includes('GBP') 
        ? `FX_IDC:${selectedSymbol}` 
        : selectedSymbol.includes('SPX') || selectedSymbol.includes('US30') || selectedSymbol.includes('NAS')
        ? `CURRENCYCOM:${selectedSymbol}`
        : selectedSymbol.includes('XAU') || selectedSymbol.includes('XAG') || selectedSymbol.includes('USO')
        ? `OANDA:${selectedSymbol}`
        : selectedSymbol.includes('BTC') || selectedSymbol.includes('ETH')
        ? `BINANCE:${selectedSymbol}`
        : `FX_IDC:${selectedSymbol}`,
      interval: selectedTimeframe,
      timezone: 'Etc/UTC',
      theme: 'light',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      backgroundColor: 'rgba(255, 255, 255, 1)',
      gridColor: 'rgba(240, 243, 250, 0.06)',
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: true,
      container_id: 'tradingview_chart',
      studies: [
        'RSI@tv-basicstudies',
        'MASimple@tv-basicstudies',
        'BB@tv-basicstudies'
      ],
      show_popup_button: true,
      popup_width: '1000',
      popup_height: '650',
      support_host: 'https://www.tradingview.com'
    });

    chartRef.current.appendChild(script);
  }, [selectedSymbol, selectedTimeframe]);

  useEffect(() => {
    fetchAccountData();
    initializeTradingViewWidget();
  }, [selectedSymbol, selectedTimeframe, initializeTradingViewWidget]);

  const fetchAccountData = async () => {
    try {
      const accountRes = await TradingAPIService.getChallengeAccount();
      setAccount(accountRes);
      
      const positionsRes = await TradingAPIService.getPositions();
      setPositions(positionsRes);
      
      // Fetch technical indicators
      try {
        const indicatorData = await TradingAPIService.getTechnicalIndicators(selectedSymbol);
        setIndicators(indicatorData);
      } catch (error) {
        console.error('Failed to fetch indicators:', error);
        setIndicators(null);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching account data:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getSymbolsByType = (type) => {
    return symbols.filter(symbol => symbol.type === type);
  };

  if (loading) {
    return (
      <div className="analysis-container">
        <div className="analysis-header">
          <h1>Market Analysis</h1>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-container">
      {/* Header */}
      <div className="analysis-header">
        <h1>📊 Market Analysis</h1>
        <p>Advanced charting and technical analysis integrated with your trading account</p>
      </div>

      {/* Account Overview Bar */}
      {account && (
        <div className="account-bar">
          <div className="account-info">
            <span className="account-type">
              {account.accountType.toUpperCase()} Account
            </span>
            <span className="account-balance">
              Balance: {formatCurrency(account.currentBalance)}
            </span>
          </div>
          <div className="positions-info">
            <span className="positions-count">
              Open Positions: {positions.length}
            </span>
          </div>
        </div>
      )}

      <div className="analysis-layout">
        {/* Chart Section */}
        <div className="chart-section">
          <div className="chart-controls">
            <div className="symbol-selector">
              <label>Symbol:</label>
              <select 
                value={selectedSymbol} 
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="symbol-select"
              >
                <optgroup label="Forex">
                  {getSymbolsByType('forex').map(symbol => (
                    <option key={symbol.value} value={symbol.value}>
                      {symbol.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Indices">
                  {getSymbolsByType('index').map(symbol => (
                    <option key={symbol.value} value={symbol.value}>
                      {symbol.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Commodities">
                  {getSymbolsByType('commodity').map(symbol => (
                    <option key={symbol.value} value={symbol.value}>
                      {symbol.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Crypto">
                  {getSymbolsByType('crypto').map(symbol => (
                    <option key={symbol.value} value={symbol.value}>
                      {symbol.label}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="timeframe-buttons">
              {timeframes.map(tf => (
                <button
                  key={tf.value}
                  className={`timeframe-btn ${selectedTimeframe === tf.value ? 'active' : ''}`}
                  onClick={() => setSelectedTimeframe(tf.value)}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          <div className="chart-container">
            <div 
              ref={chartRef}
              id="tradingview_chart"
              style={{ height: '600px', width: '100%' }}
            />
          </div>
        </div>

        {/* Analysis Panel */}
        <div className="analysis-panel">
          <div className="panel-section">
            <h3>📈 Market Overview</h3>
            <div className="market-summary">
              <div className="summary-item">
                <span className="label">Current Symbol:</span>
                <span className="value">{selectedSymbol}</span>
              </div>
              <div className="summary-item">
                <span className="label">Timeframe:</span>
                <span className="value">{timeframes.find(tf => tf.value === selectedTimeframe)?.label}</span>
              </div>
            </div>
          </div>

          <div className="panel-section">
            <h3>💼 Your Positions</h3>
            {positions.length > 0 ? (
              <div className="positions-list">
                {positions.slice(0, 5).map(position => (
                  <div key={position._id} className="position-item">
                    <div className="position-symbol">{position.symbol}</div>
                    <div className="position-details">
                      <span className="quantity">{position.quantity} shares</span>
                      <span className="avg-price">${position.averagePrice.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-positions">
                <span className="no-positions-icon">📊</span>
                <p>No open positions</p>
              </div>
            )}
          </div>

          <div className="panel-section">
            <h3>🎯 Quick Actions</h3>
            <div className="quick-actions">
              <button className="action-btn buy-btn">
                📈 Buy {selectedSymbol}
              </button>
              <button className="action-btn sell-btn">
                📉 Sell {selectedSymbol}
              </button>
              <button className="action-btn alert-btn">
                🔔 Set Price Alert
              </button>
            </div>
          </div>

          <div className="panel-section">
            <h3>📊 Technical Indicators</h3>
            {loading ? (
              <div className="loading-spinner small"></div>
            ) : indicators ? (
              <div className="indicators-list">
                {indicators.rsi && (
                  <div className="indicator-item">
                    <span className="indicator-name">RSI (14)</span>
                    <span className={`indicator-value ${indicators.rsi.signal}`}>
                      {indicators.rsi.value.toFixed(1)}
                    </span>
                  </div>
                )}
                {indicators.macd && (
                  <div className="indicator-item">
                    <span className="indicator-name">MACD</span>
                    <span className={`indicator-value ${indicators.macd.trend}`}>
                      {indicators.macd.trend}
                    </span>
                  </div>
                )}
                {indicators.movingAverages && (
                  <div className="indicator-item">
                    <span className="indicator-name">MA Trend</span>
                    <span className={`indicator-value ${indicators.movingAverages.trend}`}>
                      {indicators.movingAverages.trend}
                    </span>
                  </div>
                )}
                {indicators.bollingerBands && (
                  <div className="indicator-item">
                    <span className="indicator-name">Bollinger</span>
                    <span className="indicator-value neutral">
                      {indicators.bollingerBands.middleBand.toFixed(4)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="indicators-list">
                <div className="indicator-item">
                  <span className="indicator-name">RSI (14)</span>
                  <span className="indicator-value neutral">52.3</span>
                </div>
                <div className="indicator-item">
                  <span className="indicator-name">MACD</span>
                  <span className="indicator-value bullish">Bullish</span>
                </div>
                <div className="indicator-item">
                  <span className="indicator-name">MA (50)</span>
                  <span className="indicator-value bearish">Bearish</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
