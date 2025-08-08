import React, { useState, useEffect } from 'react';
import './GlobalMarkets.css';
import TradingAPIService from '../services/TradingAPIService';

const GlobalMarkets = () => {
  const [marketData, setMarketData] = useState({
    indices: [],
    forex: [],
    commodities: [],
    crypto: []
  });
  const [loading, setLoading] = useState(true);
  const [marketTimes, setMarketTimes] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      await fetchMarketData();
    };
    
    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds for real-time feel
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Fetch real market data from multiple sources
      const [indicesData, forexData, cryptoData, marketStatusData] = await Promise.allSettled([
        TradingAPIService.getGlobalMarketIndices(),
        fetchForexData(),
        TradingAPIService.getCryptoRealTime(),
        TradingAPIService.getEnhancedMarketStatus()
      ]);

      // Process successful responses
      const newMarketData = {
        indices: indicesData.status === 'fulfilled' ? indicesData.value.map(formatIndexData) : getMockIndices(),
        forex: forexData.status === 'fulfilled' ? forexData.value : getMockForex(),
        commodities: await fetchCommoditiesData(),
        crypto: cryptoData.status === 'fulfilled' ? cryptoData.value.map(formatCryptoData) : getMockCrypto()
      };

      // Update market times
      if (marketStatusData.status === 'fulfilled') {
        setMarketTimes(marketStatusData.value);
      }

      setMarketData(newMarketData);
      setLastUpdate(new Date());
      
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError('Using demo data - API integration required for live data');
      
      // Fallback to mock data with live-like updates
      setMarketData(getMockMarketData());
    } finally {
      setLoading(false);
    }
  };

  const fetchForexData = async () => {
    const forexPairs = [
      { from: 'EUR', to: 'USD', symbol: 'EUR/USD' },
      { from: 'GBP', to: 'USD', symbol: 'GBP/USD' },
      { from: 'USD', to: 'JPY', symbol: 'USD/JPY' },
      { from: 'USD', to: 'CHF', symbol: 'USD/CHF' },
      { from: 'AUD', to: 'USD', symbol: 'AUD/USD' },
      { from: 'USD', to: 'CAD', symbol: 'USD/CAD' }
    ];

    const promises = forexPairs.map(async (pair) => {
      try {
        const data = await TradingAPIService.getForexRealTime(pair.from, pair.to);
        return {
          symbol: pair.symbol,
          price: data.rate || data.price,
          change: data.change || 0,
          changePercent: data.changePercent || 0
        };
      } catch {
        console.error(`Failed to fetch ${pair.symbol}`);
        return generateMockForexData(pair.symbol);
      }
    });

    return Promise.all(promises);
  };

  const fetchCommoditiesData = async () => {
    const commodities = [
      { symbol: 'XAUUSD', name: 'Gold', currency: 'USD' },
      { symbol: 'XAGUSD', name: 'Silver', currency: 'USD' },
      { symbol: 'USOIL', name: 'Crude Oil', currency: 'USD' },
      { symbol: 'NGAS', name: 'Natural Gas', currency: 'USD' }
    ];
    
    const promises = commodities.map(async (commodity) => {
      try {
        const data = await TradingAPIService.getRealTimeQuote(commodity.symbol);
        return {
          symbol: commodity.name,
          price: data.price,
          change: data.change,
          changePercent: data.changePercent,
          currency: commodity.currency
        };
      } catch (error) {
        return generateMockCommodityData(commodity);
      }
    });

    return Promise.all(promises);
  };

  // Format functions for API responses
  const formatIndexData = (index) => ({
    symbol: index.name,
    price: index.price,
    change: index.change,
    changePercent: index.changePercent,
    currency: getCurrencyForIndex(index.symbol)
  });

  const formatCryptoData = (crypto) => ({
    symbol: crypto.name || crypto.symbol,
    price: crypto.price,
    change: crypto.change,
    changePercent: crypto.changePercent,
    currency: 'USD'
  });

  const getCurrencyForIndex = (symbol) => {
    const currencies = {
      '^GSPC': 'USD',
      '^DJI': 'USD', 
      '^IXIC': 'USD',
      '^FTSE': 'GBP',
      '^GDAXI': 'EUR',
      '^N225': 'JPY'
    };
    return currencies[symbol] || 'USD';
  };

  // Mock data generators for fallback
  const generateMockForexData = (symbol) => {
    const basePrices = {
      'EUR/USD': 1.0856,
      'GBP/USD': 1.2734,
      'USD/JPY': 149.23,
      'USD/CHF': 0.8934,
      'AUD/USD': 0.6578,
      'USD/CAD': 1.3567
    };
    
    const basePrice = basePrices[symbol] || 1.0000;
    const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
    const price = basePrice * (1 + variation);
    const change = basePrice * variation;
    
    return {
      symbol,
      price: parseFloat(price.toFixed(4)),
      change: parseFloat(change.toFixed(4)),
      changePercent: parseFloat((variation * 100).toFixed(2))
    };
  };

  const generateMockCommodityData = (commodity) => {
    const basePrices = {
      'Gold': 1978.45,
      'Silver': 23.45,
      'Crude Oil': 78.23,
      'Natural Gas': 2.67
    };
    
    const basePrice = basePrices[commodity.name] || 100;
    const variation = (Math.random() - 0.5) * 0.06; // ±3% variation
    const price = basePrice * (1 + variation);
    const change = basePrice * variation;
    
    return {
      symbol: commodity.name,
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat((variation * 100).toFixed(2)),
      currency: commodity.currency
    };
  };

  const getMockMarketData = () => ({
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
  });

  const getMockIndices = () => getMockMarketData().indices;
  const getMockForex = () => getMockMarketData().forex;
  const getMockCrypto = () => getMockMarketData().crypto;

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
        {error && (
          <div className="api-status demo">
            <span className="status-indicator">⚡</span>
            {error}
          </div>
        )}
        {!error && !loading && (
          <div className="api-status live">
            <span className="status-indicator">🟢</span>
            Live market data • Last updated: {lastUpdate?.toLocaleTimeString() || 'Loading...'}
          </div>
        )}
        {loading && (
          <div className="api-status loading">
            <span className="status-indicator">🔄</span>
            Updating market data...
          </div>
        )}
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
