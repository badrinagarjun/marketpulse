import React, { useEffect, useRef } from 'react';

const TradingViewChart = ({ symbol = "AAPL", theme = "light" }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any existing content
    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": `NASDAQ:${symbol}`,
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": theme,
      "style": "1",
      "locale": "en",
      "toolbar_bg": "#f1f3f6",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "container_id": `tradingview_${Date.now()}`,
      "studies": [
        "Volume@tv-basicstudies",
        "MACD@tv-basicstudies",
        "RSI@tv-basicstudies"
      ],
      "show_popup_button": true,
      "popup_width": "1000",
      "popup_height": "650",
      "support_host": "https://www.tradingview.com"
    });

    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [symbol, theme]);

  return (
    <div className="tradingview-widget-container" style={{ height: "500px", width: "100%" }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }}></div>
      <div className="tradingview-widget-copyright" style={{ fontSize: "13px", textAlign: "center", padding: "8px" }}>
        <a href={`https://www.tradingview.com/symbols/NASDAQ-${symbol}/`} rel="noopener nofollow" target="_blank">
          <span style={{ color: "#2962FF" }}>{symbol} stock chart</span>
        </a> by TradingView
      </div>
    </div>
  );
};

export default TradingViewChart;
