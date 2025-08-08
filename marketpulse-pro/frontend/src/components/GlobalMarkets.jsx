import React, { useState, useEffect } from 'react';
import './GlobalMarkets.css';

const GlobalMarkets = () => {
  const [marketData, setMarketData] = useState({
    indices: [],
    forex: [],
    commodities: [],
    crypto: []
  });
  const [loading, setLoading] = useState(true);
  const [marketTimes, setMarketTimes] = useState({});

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      // Simulated market data - in production, you'd call real APIs
      const mockData = {
        indices: [
          { symbol: 'S&P 500', price: 4567.89, change: 23.45, changePercent: 0.52, currency: 'USD' },
          { symbol: 'NASDAQ', price: 14234.56, change: -45.67, changePercent: -0.32, currency: 'USD' },
          { symbol: 'DOW JONES', price: 34567.12, change: 156.78, changePercent: 0.46, currency: 'USD' },
          { symbol: 'FTSE 100', price: 7456.23, change: 12.34, changePercent: 0.17, currency: 'GBP' },
          { symbol: 'DAX', price: 15234.67, change: -23.45, changePercent: -0.15, currency: 'EUR' },
          { symbol: 'NIKKEI 225', price: 28456.78, change: 234.56, changePercent: 0.83, currency: 'JPY' }
        ],
        forex: [
          { symbol: 'EUR/USD', price: 1.0856, change: 0.0023, changePercent: 0.21 },
          { symbol: 'GBP/USD', price: 1.2734, change: -0.0045, changePercent: -0.35 },
          { symbol: 'USD/JPY', price: 149.23, change: 0.67, changePercent: 0.45 },
          { symbol: 'USD/CHF', price: 0.8934, change: 0.0012, changePercent: 0.13 },
          { symbol: 'AUD/USD', price: 0.6578, change: -0.0023, changePercent: -0.35 },
          { symbol: 'USD/CAD', price: 1.3567, change: 0.0034, changePercent: 0.25 }
        ],
        commodities: [
          { symbol: 'Gold', price: 1978.45, change: 12.34, changePercent: 0.63, currency: 'USD' },
          { symbol: 'Silver', price: 23.45, change: -0.67, changePercent: -2.78, currency: 'USD' },
          { symbol: 'Crude Oil', price: 78.23, change: 1.45, changePercent: 1.89, currency: 'USD' },
          { symbol: 'Natural Gas', price: 2.67, change: -0.12, changePercent: -4.30, currency: 'USD' }
        ],
        crypto: [
          { symbol: 'Bitcoin', price: 43567.89, change: 1234.56, changePercent: 2.92, currency: 'USD' },
          { symbol: 'Ethereum', price: 2567.34, change: -45.67, changePercent: -1.75, currency: 'USD' },
          { symbol: 'BNB', price: 234.56, change: 5.67, changePercent: 2.48, currency: 'USD' },
          { symbol: 'Cardano', price: 0.456, change: 0.023, changePercent: 5.31, currency: 'USD' }
        ]
      };

      const mockMarketTimes = {
        'NYSE': { status: 'OPEN', openTime: '09:30', closeTime: '16:00', timezone: 'EST' },
        'NASDAQ': { status: 'OPEN', openTime: '09:30', closeTime: '16:00', timezone: 'EST' },
        'LSE': { status: 'CLOSED', openTime: '08:00', closeTime: '16:30', timezone: 'GMT' },
        'TSE': { status: 'CLOSED', openTime: '09:00', closeTime: '15:00', timezone: 'JST' },
        'FOREX': { status: 'OPEN', openTime: '24/5', closeTime: '24/5', timezone: 'Global' }
      };

      setMarketData(mockData);
      setMarketTimes(mockMarketTimes);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching market data:', error);
      setLoading(false);
    }
  };

  const formatPrice = (price, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(price);
  };

  const formatChange = (change, percent) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${percent.toFixed(2)}%)`;
  };

  const getChangeClass = (change) => {
    return change >= 0 ? 'positive' : 'negative';
  };

  if (loading) {
    return (
      <div className="global-markets">
        <div className="markets-header">
          <h1>Global Markets</h1>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="global-markets">
      {/* Header */}
      <div className="markets-header">
        <h1>🌍 Global Markets</h1>
        <p>Real-time market data and trading hours</p>
        <div className="last-updated">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Market Timings */}
      <div className="market-timings">
        <h2>Market Hours</h2>
        <div className="timings-grid">
          {Object.entries(marketTimes).map(([market, data]) => (
            <div key={market} className={`timing-card ${data.status.toLowerCase()}`}>
              <div className="timing-header">
                <span className="market-name">{market}</span>
                <span className={`status ${data.status.toLowerCase()}`}>
                  {data.status}
                </span>
              </div>
              <div className="timing-details">
                <span>{data.openTime} - {data.closeTime}</span>
                <span className="timezone">{data.timezone}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Data Sections */}
      <div className="markets-grid">
        {/* Stock Indices */}
        <div className="market-section">
          <h2>📈 Global Indices</h2>
          <div className="market-list">
            {marketData.indices.map((item, index) => (
              <div key={index} className="market-item">
                <div className="symbol-info">
                  <span className="symbol">{item.symbol}</span>
                </div>
                <div className="price-info">
                  <span className="price">{formatPrice(item.price, item.currency)}</span>
                  <span className={`change ${getChangeClass(item.change)}`}>
                    {formatChange(item.change, item.changePercent)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Forex */}
        <div className="market-section">
          <h2>💱 Forex</h2>
          <div className="market-list">
            {marketData.forex.map((item, index) => (
              <div key={index} className="market-item">
                <div className="symbol-info">
                  <span className="symbol">{item.symbol}</span>
                </div>
                <div className="price-info">
                  <span className="price">{item.price.toFixed(4)}</span>
                  <span className={`change ${getChangeClass(item.change)}`}>
                    {formatChange(item.change, item.changePercent)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commodities */}
        <div className="market-section">
          <h2>🏗️ Commodities</h2>
          <div className="market-list">
            {marketData.commodities.map((item, index) => (
              <div key={index} className="market-item">
                <div className="symbol-info">
                  <span className="symbol">{item.symbol}</span>
                </div>
                <div className="price-info">
                  <span className="price">{formatPrice(item.price, item.currency)}</span>
                  <span className={`change ${getChangeClass(item.change)}`}>
                    {formatChange(item.change, item.changePercent)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cryptocurrency */}
        <div className="market-section">
          <h2>₿ Cryptocurrency</h2>
          <div className="market-list">
            {marketData.crypto.map((item, index) => (
              <div key={index} className="market-item">
                <div className="symbol-info">
                  <span className="symbol">{item.symbol}</span>
                </div>
                <div className="price-info">
                  <span className="price">{formatPrice(item.price, item.currency)}</span>
                  <span className={`change ${getChangeClass(item.change)}`}>
                    {formatChange(item.change, item.changePercent)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalMarkets;
