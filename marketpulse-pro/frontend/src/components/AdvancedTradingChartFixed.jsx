/**
 * 📈 FREE TradingView Advanced Chart Component - Fixed Version
 * Features: Professional charts, Technical indicators, Drawing tools
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import './AdvancedTradingChart.css';

const AdvancedTradingChart = ({ 
  symbol = 'AAPL',
  interval = '1D',
  theme = 'dark',
  height = 600,
  onSymbolChange = null 
}) => {
  const chartRef = useRef(null);
  const widgetRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);

  const initChart = useCallback(() => {
    if (window.TradingView && chartRef.current) {
      try {
        widgetRef.current = new window.TradingView.widget({
          autosize: true,
          symbol: symbol,
          interval: interval,
          container: chartRef.current,
          
          // 🎨 Theme & Styling
          theme: theme,
          style: '1',
          locale: 'en',
          toolbar_bg: theme === 'dark' ? '#1e1e1e' : '#ffffff',
          
          // 📊 Chart Features (ALL FREE)
          enable_publishing: false,
          withdateranges: true,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          
          // 🔧 Technical Analysis Tools (FREE)
          studies: [
            'RSI@tv-basicstudies',
            'MACD@tv-basicstudies',
            'BB@tv-basicstudies',
            'Volume@tv-basicstudies'
          ],
          
          // 🎯 Advanced Features (FREE)
          details: true,
          hotlist: true,
          calendar: true,
          news: ['headlines'],
          
          // 📈 Chart Settings
          timezone: 'Etc/UTC',
          studies_overrides: {
            'volume.volume.color.0': theme === 'dark' ? '#ff4757' : '#ff6b6b',
            'volume.volume.color.1': theme === 'dark' ? '#2ed573' : '#51cf66'
          },
          
          overrides: {
            'mainSeriesProperties.candleStyle.upColor': '#26a69a',
            'mainSeriesProperties.candleStyle.downColor': '#ef5350',
            'mainSeriesProperties.candleStyle.borderUpColor': '#26a69a',
            'mainSeriesProperties.candleStyle.borderDownColor': '#ef5350',
            'mainSeriesProperties.candleStyle.wickUpColor': '#26a69a',
            'mainSeriesProperties.candleStyle.wickDownColor': '#ef5350',
            'paneProperties.background': theme === 'dark' ? '#1e1e1e' : '#ffffff',
            'paneProperties.vertGridProperties.color': theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
            'paneProperties.horzGridProperties.color': theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
            'scalesProperties.textColor': theme === 'dark' ? '#cccccc' : '#333333',
            'scalesProperties.backgroundColor': theme === 'dark' ? '#1e1e1e' : '#ffffff',
          },
          
          onChartReady: () => {
            setIsLoading(false);
            setChartReady(true);
            console.log('📈 TradingView Chart Ready!');
          },
          
          ...(onSymbolChange && {
            symbol_search_request_delay: 1000,
            onSymbolChanged: onSymbolChange
          })
        });

      } catch (error) {
        console.error('Error initializing TradingView chart:', error);
        setIsLoading(false);
      }
    }
  }, [symbol, interval, theme, onSymbolChange]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = initChart;
    document.body.appendChild(script);

    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove();
      }
      const scripts = document.querySelectorAll('script[src*="tradingview"]');
      scripts.forEach(s => s.remove());
    };
  }, [initChart]);

  useEffect(() => {
    if (chartReady && widgetRef.current) {
      widgetRef.current.setSymbol(symbol, interval);
    }
  }, [symbol, interval, chartReady]);

  const addIndicator = (indicatorName) => {
    if (widgetRef.current && widgetRef.current.chart) {
      widgetRef.current.chart().createStudy(indicatorName);
    }
  };

  const saveChart = () => {
    if (widgetRef.current) {
      const chartData = widgetRef.current.save();
      localStorage.setItem(`tradingview_chart_${symbol}`, JSON.stringify(chartData));
      console.log('📊 Chart layout saved!');
    }
  };

  const loadChart = () => {
    const savedChart = localStorage.getItem(`tradingview_chart_${symbol}`);
    if (savedChart && widgetRef.current) {
      try {
        widgetRef.current.load(JSON.parse(savedChart));
        console.log('📊 Chart layout loaded!');
      } catch (error) {
        console.error('Error loading chart:', error);
      }
    }
  };

  return (
    <div className="advanced-trading-chart">
      <div className="chart-controls-header">
        <div className="chart-info">
          <h3 className="chart-symbol">{symbol}</h3>
          <span className="chart-interval">{interval}</span>
        </div>
        
        <div className="chart-actions">
          <button className="chart-btn" onClick={saveChart} title="Save Chart Layout">
            💾 Save
          </button>
          <button className="chart-btn" onClick={loadChart} title="Load Chart Layout">
            📁 Load
          </button>
          <button 
            className="chart-btn" 
            onClick={() => addIndicator('RSI@tv-basicstudies')}
            title="Add RSI Indicator"
          >
            📊 RSI
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="chart-loading">
          <div className="loading-spinner"></div>
          <p>Loading TradingView Chart...</p>
        </div>
      )}

      <div 
        ref={chartRef}
        className="tradingview-chart-container"
        style={{ height: `${height}px` }}
      />

      <div className="chart-status">
        <div className="status-item">
          <span className={`status-dot ${chartReady ? 'connected' : 'disconnected'}`}></span>
          <span>Chart: {chartReady ? 'Ready' : 'Loading...'}</span>
        </div>
        <div className="status-item">
          <span className="status-dot connected"></span>
          <span>Data: Real-time</span>
        </div>
      </div>
    </div>
  );
};

export const TimeframeSelector = ({ currentInterval, onIntervalChange }) => {
  const timeframes = [
    { label: '1m', value: '1' },
    { label: '5m', value: '5' },
    { label: '15m', value: '15' },
    { label: '30m', value: '30' },
    { label: '1h', value: '60' },
    { label: '4h', value: '240' },
    { label: '1D', value: '1D' },
    { label: '1W', value: '1W' },
    { label: '1M', value: '1M' }
  ];

  return (
    <div className="timeframe-selector">
      {timeframes.map(tf => (
        <button
          key={tf.value}
          className={`timeframe-btn ${currentInterval === tf.value ? 'active' : ''}`}
          onClick={() => onIntervalChange(tf.value)}
        >
          {tf.label}
        </button>
      ))}
    </div>
  );
};

export const SymbolSearch = ({ onSymbolSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const popularSymbols = [
    'AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 
    'AMZN', 'META', 'SPY', 'QQQ', 'BTC'
  ];

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
    
    if (searchQuery.length > 0) {
      const filtered = popularSymbols.filter(symbol =>
        symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="symbol-search">
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Search symbols (AAPL, TSLA, etc.)"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="symbol-search-input"
        />
        <span className="search-icon">🔍</span>
      </div>
      
      {suggestions.length > 0 && (
        <div className="search-suggestions">
          {suggestions.map(symbol => (
            <div
              key={symbol}
              className="suggestion-item"
              onClick={() => {
                onSymbolSelect(symbol);
                setQuery('');
                setSuggestions([]);
              }}
            >
              {symbol}
            </div>
          ))}
        </div>
      )}
      
      {query === '' && (
        <div className="popular-symbols">
          <span className="popular-label">Popular:</span>
          {popularSymbols.slice(0, 5).map(symbol => (
            <button
              key={symbol}
              className="popular-symbol-btn"
              onClick={() => onSymbolSelect(symbol)}
            >
              {symbol}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedTradingChart;
