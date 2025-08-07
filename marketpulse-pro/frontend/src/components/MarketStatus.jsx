import React, { useState, useEffect } from 'react';

const MarketStatus = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [markets, setMarkets] = useState([]);

  useEffect(() => {
    const updateMarketStatus = () => {
      const now = new Date();
      setCurrentTime(now);

      const marketData = [
        {
          name: 'NYSE (New York)',
          timezone: 'America/New_York',
          openTime: '09:30',
          closeTime: '16:00',
          symbol: '🇺🇸'
        },
        {
          name: 'LSE (London)',
          timezone: 'Europe/London',
          openTime: '08:00',
          closeTime: '16:30',
          symbol: '🇬🇧'
        },
        {
          name: 'TSE (Tokyo)',
          timezone: 'Asia/Tokyo',
          openTime: '09:00',
          closeTime: '15:00',
          symbol: '🇯🇵'
        },
        {
          name: 'ASX (Sydney)',
          timezone: 'Australia/Sydney',
          openTime: '10:00',
          closeTime: '16:00',
          symbol: '🇦🇺'
        },
        {
          name: 'NSE (Mumbai)',
          timezone: 'Asia/Kolkata',
          openTime: '09:15',
          closeTime: '15:30',
          symbol: '🇮🇳'
        },
        {
          name: 'SSE (Shanghai)',
          timezone: 'Asia/Shanghai',
          openTime: '09:30',
          closeTime: '15:00',
          symbol: '🇨🇳'
        }
      ];

      const marketsWithStatus = marketData.map(market => {
        const marketTime = new Date().toLocaleString("en-US", {timeZone: market.timezone});
        const marketDate = new Date(marketTime);
        const day = marketDate.getDay();
        const hour = marketDate.getHours();
        const minute = marketDate.getMinutes();
        const currentMinutes = hour * 60 + minute;
        
        const [openHour, openMin] = market.openTime.split(':').map(Number);
        const [closeHour, closeMin] = market.closeTime.split(':').map(Number);
        const openMinutes = openHour * 60 + openMin;
        const closeMinutes = closeHour * 60 + closeMin;
        
        const isWeekday = day >= 1 && day <= 5;
        const isOpen = isWeekday && currentMinutes >= openMinutes && currentMinutes < closeMinutes;
        
        return {
          ...market,
          localTime: marketDate.toLocaleTimeString('en-US', {
            timeZone: market.timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }),
          isOpen,
          status: isOpen ? 'OPEN' : 'CLOSED'
        };
      });

      setMarkets(marketsWithStatus);
    };

    updateMarketStatus();
    const interval = setInterval(updateMarketStatus, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>🌍 Global Market Status</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '15px',
        marginBottom: '20px'
      }}>
        {markets.map((market, index) => (
          <div 
            key={index}
            style={{
              padding: '15px',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: `2px solid ${market.isOpen ? '#28a745' : '#dc3545'}`,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
                  {market.symbol} {market.name}
                </h4>
                <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold' }}>
                  {market.localTime}
                </p>
              </div>
              <span 
                style={{
                  padding: '5px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: 'white',
                  backgroundColor: market.isOpen ? '#28a745' : '#dc3545'
                }}
              >
                {market.status}
              </span>
            </div>
            <p style={{ 
              margin: '5px 0 0 0', 
              fontSize: '12px', 
              color: '#666' 
            }}>
              {market.openTime} - {market.closeTime}
            </p>
          </div>
        ))}
      </div>

      <div style={{ 
        textAlign: 'center', 
        padding: '10px',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
          Your Local Time: {currentTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          })}
        </p>
      </div>
    </div>
  );
};

export default MarketStatus;