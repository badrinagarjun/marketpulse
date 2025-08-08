import React, { useEffect, useRef } from 'react';

const AdvancedTradingViewChart = ({ 
  symbol = "AAPL", 
  theme = "light", 
  interval = "D",
  studies = [],
  allowDrawing = true,
  allowAlerts = true,
  style = "1" // 1: Candles, 2: Area, 3: Line
}) => {
  const containerRef = useRef(null);
  const widgetInstanceRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any existing content
    container.innerHTML = '';

    // Create the widget div
    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    container.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    
    // Enhanced configuration with advanced features
    const config = {
      "autosize": true,
      "symbol": `NASDAQ:${symbol}`,
      "interval": interval,
      "timezone": "Etc/UTC",
      "theme": theme,
      "style": style,
      "locale": "en",
      "toolbar_bg": theme === "light" ? "#f1f3f6" : "#2a2e39",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "details": true,
      "hotlist": true,
      "calendar": true,
      "support_host": "https://www.tradingview.com",
      
      // Advanced features
      "studies": [
        "Volume@tv-basicstudies",
        "MACD@tv-basicstudies", 
        "RSI@tv-basicstudies",
        "BB@tv-basicstudies", // Bollinger Bands
        "EMA@tv-basicstudies", // Exponential Moving Average
        ...studies
      ],
      
      // Chart features
      "show_popup_button": true,
      "popup_width": "1000",
      "popup_height": "650",
      "container_id": `tradingview_${Date.now()}`,
      
      // Drawing tools (if supported)
      "drawings_access": {
        "type": "black",
        "tools": allowDrawing ? [
          { "name": "Regression Trend" },
          { "name": "Trend Line" },
          { "name": "Horizontal Line" },
          { "name": "Vertical Line" },
          { "name": "Rectangle" },
          { "name": "Ellipse" },
          { "name": "Triangle" },
          { "name": "Polyline" },
          { "name": "Path" },
          { "name": "Arrow" },
          { "name": "Text" },
          { "name": "Note" },
          { "name": "Pitchfork" },
          { "name": "Fib Retracement" },
          { "name": "Fib Extension" },
          { "name": "Fib Fan" },
          { "name": "Gann Box" },
          { "name": "Gann Fan" }
        ] : []
      },
      
      // Watchlist
      "watchlist": [
        "NASDAQ:AAPL",
        "NASDAQ:MSFT", 
        "NASDAQ:GOOGL",
        "NASDAQ:AMZN",
        "NASDAQ:TSLA",
        "NASDAQ:NVDA",
        "NASDAQ:META",
        "NASDAQ:NFLX"
      ],
      
      // News and fundamentals
      "news": ["headlines"],
      "show_ideas": true,
      
      // Advanced chart options
      "withdateranges": true,
      "hide_side_toolbar": false,
      "save_image": true,
      "hide_volume": false
    };

    script.innerHTML = JSON.stringify(config);
    container.appendChild(script);

    // Store reference for cleanup
    widgetInstanceRef.current = {
      container,
      script
    };

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [symbol, theme, interval, studies, allowDrawing, allowAlerts, style]);

  return (
    <div className="tradingview-widget-container" style={{ height: "600px", width: "100%" }}>
      <div 
        ref={containerRef} 
        style={{ 
          height: "100%", 
          width: "100%",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
        }}
      />
      
      {/* Chart Controls */}
      <div style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(10px)",
        borderRadius: "8px",
        padding: "8px",
        display: "flex",
        gap: "4px",
        zIndex: 100
      }}>
        <button
          onClick={() => {
            // This would need to be implemented with TradingView's API
            console.log('Setting price alert for', symbol);
          }}
          style={{
            padding: "6px 12px",
            border: "none",
            borderRadius: "6px",
            background: "#667eea",
            color: "white",
            fontSize: "12px",
            cursor: "pointer",
            fontWeight: "600"
          }}
          title="Set Price Alert"
        >
          🔔 Alert
        </button>
        
        <button
          onClick={() => {
            // Screenshot functionality
            console.log('Taking screenshot of chart');
          }}
          style={{
            padding: "6px 12px",
            border: "none", 
            borderRadius: "6px",
            background: "#10b981",
            color: "white",
            fontSize: "12px",
            cursor: "pointer",
            fontWeight: "600"
          }}
          title="Save Chart Image"
        >
          📷 Save
        </button>
      </div>
      
      <div 
        className="tradingview-widget-copyright" 
        style={{ 
          fontSize: "13px", 
          textAlign: "center", 
          padding: "8px",
          background: "rgba(248,250,252,0.8)",
          color: "#64748b"
        }}
      >
        <a 
          href={`https://www.tradingview.com/symbols/NASDAQ-${symbol}/`} 
          rel="noopener nofollow" 
          target="_blank"
          style={{ color: "#2962FF", textDecoration: "none" }}
        >
          <span>{symbol} Advanced Chart</span>
        </a> by TradingView
      </div>
    </div>
  );
};

export default AdvancedTradingViewChart;
