import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

const MarketStatus = () => {
  const [status, setStatus] = useState('');
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const calculateStatus = () => {
      // Market hours: 9:15 AM to 3:30 PM IST
      const now = dayjs();
      const marketOpen = now.set('hour', 9).set('minute', 15).set('second', 0);
      const marketClose = now.set('hour', 15).set('minute', 30).set('second', 0);

      if (now.isBetween(marketOpen, marketClose)) {
        setStatus('Open');
        const diff = marketClose.diff(now, 'second');
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        setCountdown(`Closes in ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setStatus('Closed');
        // This logic can be expanded to handle pre-market, weekends, etc.
        setCountdown('Market is currently closed.');
      }
    };

    calculateStatus(); // Run once on load
    const interval = setInterval(calculateStatus, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  return (
    <div>
      <h3>Market Status: <span style={{ color: status === 'Open' ? 'green' : 'red' }}>{status}</span></h3>
      <p>{countdown}</p>
    </div>
  );
};

export default MarketStatus;