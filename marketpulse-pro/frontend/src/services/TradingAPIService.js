// Enhanced API service for trading data and market information
import axios from 'axios';

class TradingAPIService {
  constructor() {
    this.baseURL = 'http://localhost:5001';
    // API keys - these should be set via environment variables
    this.alphaVantageKey = 'demo'; // Replace with actual key
    this.finnhubKey = 'sandbox_c3e6ol2ad3i91nd2jl40'; // Replace with actual key
    
    // Initialize axios instance
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 15000,
    });

    // Add auth interceptor
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Stock Data APIs
  async getStockPrice(symbol) {
    try {
      const response = await this.api.get(`/api/stock/${symbol}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error);
      throw error;
    }
  }

  async getStockIntraday(symbol, interval = '5min') {
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${this.alphaVantageKey}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch intraday data:', error);
      throw error;
    }
  }

  async getStockNews(symbol, limit = 10) {
    try {
      const response = await axios.get(
        `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${this.getDateString(-7)}&to=${this.getDateString(0)}&token=${this.finnhubKey}`
      );
      return response.data.slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch news:', error);
      return [];
    }
  }

  async getEarningsCalendar(from, to) {
    try {
      const response = await axios.get(
        `https://finnhub.io/api/v1/calendar/earnings?from=${from}&to=${to}&token=${this.finnhubKey}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch earnings calendar:', error);
      return { earningsCalendar: [] };
    }
  }

  // Market Data APIs
  async getMarketStatus() {
    try {
      const response = await axios.get(
        `https://finnhub.io/api/v1/stock/market-status?exchange=US&token=${this.finnhubKey}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch market status:', error);
      return { isOpen: false };
    }
  }

  async getTopGainers() {
    try {
      // Popular symbols for demo
      const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'];
      const promises = symbols.map(symbol => this.getStockPrice(symbol));
      const results = await Promise.all(promises);
      
      return results
        .filter(result => result && result['Global Quote'])
        .map(result => result['Global Quote'])
        .sort((a, b) => parseFloat(b['10. change percent'].replace('%', '')) - parseFloat(a['10. change percent'].replace('%', '')))
        .slice(0, 5);
    } catch (error) {
      console.error('Failed to fetch top gainers:', error);
      return [];
    }
  }

  // Challenge & Trading APIs
  async getChallengeAccount() {
    const response = await this.api.get('/api/challenge/account');
    return response.data;
  }

  async createChallengeAccount(accountData) {
    const response = await this.api.post('/api/challenge/account', accountData);
    return response.data;
  }

  async placeOrder(orderData) {
    const response = await this.api.post('/api/challenge/order', orderData);
    return response.data;
  }

  async getPositions() {
    const response = await this.api.get('/api/challenge/positions');
    return response.data;
  }

  async getChallengeLeaderboard() {
    try {
      const response = await this.api.get('/api/challenge/leaderboard');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      throw error;
    }
  }

  // Journal APIs
  async getJournalEntries() {
    const response = await this.api.get('/api/journal');
    return response.data;
  }

  async createJournalEntry(entryData) {
    const response = await this.api.post('/api/journal', entryData);
    return response.data;
  }

  async updateJournalEntry(id, entryData) {
    const response = await this.api.put(`/api/journal/${id}`, entryData);
    return response.data;
  }

  async deleteJournalEntry(id) {
    const response = await this.api.delete(`/api/journal/${id}`);
    return response.data;
  }

  // Alert APIs (for future implementation)
  async createPriceAlert(symbol, price, condition) {
    const response = await this.api.post('/api/alerts', {
      symbol,
      price,
      condition, // 'above' or 'below'
      type: 'price'
    });
    return response.data;
  }

  async getUserAlerts() {
    const response = await this.api.get('/api/alerts');
    return response.data;
  }

  async deleteAlert(id) {
    const response = await this.api.delete(`/api/alerts/${id}`);
    return response.data;
  }

  // Portfolio Analytics
  async getPortfolioAnalytics(accountId) {
    const response = await this.api.get(`/api/challenge/analytics/${accountId}`);
    return response.data;
  }

  async getTradeHistory(accountId, limit = 50) {
    const response = await this.api.get(`/api/challenge/history/${accountId}?limit=${limit}`);
    return response.data;
  }

  // Real-time Data (WebSocket connections for future)
  connectToRealTimeData(symbols, callback) {
    try {
      // This would be implemented with WebSocket for real-time price updates
      console.log('Connecting to real-time data for:', symbols);
      
      // Mock implementation with polling
      const interval = setInterval(async () => {
        try {
          const updates = await Promise.all(
            symbols.map(async (symbol) => {
              try {
                const data = await this.getStockPrice(symbol);
                return {
                  symbol,
                  price: data['Global Quote']?.['05. price'],
                  change: data['Global Quote']?.['09. change'],
                  changePercent: data['Global Quote']?.['10. change percent']
                };
              } catch (error) {
                return { symbol, error: error.message };
              }
            })
          );
          callback(updates);
        } catch (error) {
          console.error('Real-time update error:', error);
        }
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Failed to connect to real-time data:', error);
    }
  }

  // Utility methods
  getDateString(daysOffset) {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  calculatePnL(position, currentPrice) {
    const unrealizedPnL = (currentPrice - position.averagePrice) * position.quantity;
    const pnlPercent = ((currentPrice - position.averagePrice) / position.averagePrice) * 100;
    
    return {
      unrealizedPnL,
      pnlPercent,
      totalValue: currentPrice * position.quantity
    };
  }

  // Risk Management
  calculatePositionSize(accountBalance, riskPercent, entryPrice, stopPrice) {
    const riskAmount = accountBalance * (riskPercent / 100);
    const riskPerShare = Math.abs(entryPrice - stopPrice);
    const maxShares = Math.floor(riskAmount / riskPerShare);
    
    return {
      maxShares,
      riskAmount,
      positionValue: maxShares * entryPrice
    };
  }

  // Performance Metrics
  calculateSharpeRatio(returns, riskFreeRate = 0.02) {
    if (returns.length === 0) return 0;
    
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev === 0 ? 0 : (avgReturn - riskFreeRate) / stdDev;
  }

  calculateMaxDrawdown(equityCurve) {
    if (equityCurve.length === 0) return 0;
    
    let maxDrawdown = 0;
    let peak = equityCurve[0];
    
    for (let i = 1; i < equityCurve.length; i++) {
      if (equityCurve[i] > peak) {
        peak = equityCurve[i];
      } else {
        const drawdown = (peak - equityCurve[i]) / peak;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    }
    
    return maxDrawdown * 100; // Return as percentage
  }
}

// Export singleton instance
const tradingAPI = new TradingAPIService();
export default tradingAPI;
