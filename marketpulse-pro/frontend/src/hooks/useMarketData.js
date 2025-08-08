// Real-time Market Data Hook
import { useState, useEffect, useCallback, useRef } from 'react';
import TradingAPIService from '../services/TradingAPIService';

export const useRealTimeMarketData = (symbols = [], updateInterval = 30000) => {
  const [data, setData] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // WebSocket connection reference
  const wsRef = useRef(null);
  const intervalRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (symbols.length === 0) return;

    try {
      setError(null);
      
      const promises = symbols.map(async (symbol) => {
        try {
          const quote = await TradingAPIService.getRealTimeQuote(symbol);
          return { symbol, data: quote, success: true };
        } catch (err) {
          console.warn(`Failed to fetch ${symbol}:`, err.message);
          return { symbol, data: null, success: false, error: err.message };
        }
      });

      const results = await Promise.allSettled(promises);
      const newData = new Map();
      
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.success) {
          newData.set(result.value.symbol, result.value.data);
        }
      });

      setData(prevData => {
        // Merge with existing data to maintain continuity
        const mergedData = new Map(prevData);
        newData.forEach((value, key) => {
          mergedData.set(key, value);
        });
        return mergedData;
      });

      setLastUpdate(new Date());
      setLoading(false);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [symbols]);

  // Initialize WebSocket for real-time updates
  const initializeWebSocket = useCallback(() => {
    if (symbols.length === 0) return;

    try {
      const cleanup = TradingAPIService.connectWebSocket(symbols, (updates) => {
        const newData = new Map(data);
        updates.forEach(update => {
          if (update.error) return;
          
          newData.set(update.symbol, {
            ...newData.get(update.symbol),
            price: update.price,
            volume: update.volume,
            timestamp: update.timestamp
          });
        });
        setData(newData);
        setLastUpdate(new Date());
      });

      wsRef.current = cleanup;
    } catch (err) {
      console.warn('WebSocket connection failed, using polling:', err);
      // Fallback to polling
      intervalRef.current = setInterval(fetchData, updateInterval);
    }
  }, [symbols, data, fetchData, updateInterval]);

  useEffect(() => {
    fetchData();
    
    // Try WebSocket first, fallback to polling
    if (import.meta.env?.VITE_ENABLE_WEBSOCKET !== 'false') {
      initializeWebSocket();
    } else {
      intervalRef.current = setInterval(fetchData, updateInterval);
    }

    return () => {
      if (wsRef.current) wsRef.current();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData, initializeWebSocket, updateInterval]);

  const getQuote = useCallback((symbol) => {
    return data.get(symbol) || null;
  }, [data]);

  const getAllQuotes = useCallback(() => {
    return Array.from(data.entries()).map(([symbol, quote]) => ({
      symbol,
      ...quote
    }));
  }, [data]);

  return {
    data: getAllQuotes(),
    getQuote,
    loading,
    error,
    lastUpdate,
    refresh: fetchData
  };
};

// Market Status Hook
export const useMarketStatus = () => {
  const [marketStatus, setMarketStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketStatus = async () => {
      try {
        const status = await TradingAPIService.getEnhancedMarketStatus();
        setMarketStatus(status);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch market status:', error);
        setLoading(false);
      }
    };

    fetchMarketStatus();
    const interval = setInterval(fetchMarketStatus, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  return { marketStatus, loading };
};

// News Hook
export const useMarketNews = (category = 'general', limit = 20) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setError(null);
        const newsData = await TradingAPIService.getRealTimeMarketNews(category, limit);
        setNews(newsData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 300000); // Update every 5 minutes
    
    return () => clearInterval(interval);
  }, [category, limit]);

  return { news, loading, error };
};

// Technical Indicators Hook
export const useTechnicalIndicators = (symbol, timeframe = '1D') => {
  const [indicators, setIndicators] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;

    const fetchIndicators = async () => {
      try {
        setError(null);
        setLoading(true);
        const data = await TradingAPIService.getTechnicalIndicators(symbol, timeframe);
        setIndicators(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchIndicators();
  }, [symbol, timeframe]);

  return { indicators, loading, error };
};

// Portfolio Hook
export const usePortfolio = () => {
  const [account, setAccount] = useState(null);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPortfolioData = useCallback(async () => {
    try {
      setError(null);
      const [accountData, positionsData] = await Promise.allSettled([
        TradingAPIService.getChallengeAccount(),
        TradingAPIService.getPositions()
      ]);

      if (accountData.status === 'fulfilled') {
        setAccount(accountData.value);
      }

      if (positionsData.status === 'fulfilled') {
        setPositions(positionsData.value);
      }

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolioData();
    const interval = setInterval(fetchPortfolioData, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [fetchPortfolioData]);

  const executeOrder = async (orderData) => {
    try {
      const result = await TradingAPIService.placeOrder(orderData);
      await fetchPortfolioData(); // Refresh portfolio after order
      return result;
    } catch (err) {
      throw new Error(`Order failed: ${err.message}`);
    }
  };

  return {
    account,
    positions,
    loading,
    error,
    executeOrder,
    refresh: fetchPortfolioData
  };
};

export default {
  useRealTimeMarketData,
  useMarketStatus,
  useMarketNews,
  useTechnicalIndicators,
  usePortfolio
};
