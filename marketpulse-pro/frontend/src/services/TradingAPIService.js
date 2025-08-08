// Enhanced API service for trading data and market information
import axios from 'axios';

class TradingAPIService {
  constructor() {
    this.baseURL = 'http://localhost:5001';
    
    // Real API Keys (you'll need to get these from the providers)
    this.alphaVantageKey = import.meta.env?.VITE_ALPHA_VANTAGE_KEY || 'demo';
    this.finnhubKey = import.meta.env?.VITE_FINNHUB_KEY || 'co2h9cpr01qicbkj40egco2h9cpr01qicbkj40f0';
    this.newsApiKey = import.meta.env?.VITE_NEWS_API_KEY || 'demo';
    this.polygonKey = import.meta.env?.VITE_POLYGON_KEY || 'demo';
    
    // Initialize axios instances
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 15000,
    });

    // External API instances
    this.alphaVantage = axios.create({
      baseURL: 'https://www.alphavantage.co/query',
      timeout: 10000
    });
    
    this.finnhub = axios.create({
      baseURL: 'https://finnhub.io/api/v1',
      timeout: 10000
    });
    
    this.newsAPI = axios.create({
      baseURL: 'https://newsapi.org/v2',
      timeout: 10000
    });

    this.polygon = axios.create({
      baseURL: 'https://api.polygon.io/v2',
      timeout: 10000
    });

    // Add auth interceptor
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Real-time data cache
    this.priceCache = new Map();
    this.lastUpdate = new Map();
    this.updateInterval = 5000; // 5 seconds
  }

  // Real-time Stock Price with Finnhub
  async getRealTimeQuote(symbol) {
    try {
      // Check cache first
      const cacheKey = `quote_${symbol}`;
      const lastUpdate = this.lastUpdate.get(cacheKey);
      const cached = this.priceCache.get(cacheKey);
      
      if (cached && lastUpdate && (Date.now() - lastUpdate < this.updateInterval)) {
        return cached;
      }

      const response = await this.finnhub.get('/quote', {
        params: {
          symbol: symbol,
          token: this.finnhubKey
        }
      });

      const quote = {
        symbol: symbol,
        price: response.data.c, // Current price
        change: response.data.d, // Change
        changePercent: response.data.dp, // Change percent
        high: response.data.h, // High price of the day
        low: response.data.l, // Low price of the day
        open: response.data.o, // Open price of the day
        previousClose: response.data.pc, // Previous close price
        timestamp: Date.now()
      };

      // Cache the result
      this.priceCache.set(cacheKey, quote);
      this.lastUpdate.set(cacheKey, Date.now());

      return quote;
    } catch (error) {
      console.error(`Error fetching real-time quote for ${symbol}:`, error);
      // Fallback to Alpha Vantage
      return this.getFallbackQuote(symbol);
    }
  }

  // Fallback to Alpha Vantage for quotes
  async getFallbackQuote(symbol) {
    try {
      const response = await this.alphaVantage.get('', {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: this.alphaVantageKey
        }
      });
      
      const quote = response.data['Global Quote'];
      if (!quote) throw new Error('Invalid symbol or API limit reached');
      
      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        open: parseFloat(quote['02. open']),
        previousClose: parseFloat(quote['08. previous close']),
        volume: parseInt(quote['06. volume']),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`Fallback quote failed for ${symbol}:`, error);
      throw error;
    }
  }

  // Enhanced Forex Data with Real-time Rates
  async getForexRealTime(fromCurrency, toCurrency) {
    try {
      const symbol = `${fromCurrency}${toCurrency}=X`;
      return await this.getRealTimeQuote(symbol);
    } catch (error) {
      console.error(`Error fetching forex rate ${fromCurrency}/${toCurrency}:`, error);
      // Fallback to Finnhub forex
      try {
        const response = await this.finnhub.get('/forex/rates', {
          params: {
            base: fromCurrency,
            token: this.finnhubKey
          }
        });
        return {
          fromCurrency,
          toCurrency,
          rate: response.data.quote[toCurrency],
          timestamp: Date.now()
        };
      } catch (fallbackError) {
        throw fallbackError;
      }
    }
  }

  // Real-time Market News with Enhanced Filtering
  async getRealTimeMarketNews(category = 'general', limit = 20) {
    try {
      const response = await this.finnhub.get('/news', {
        params: {
          category: category,
          token: this.finnhubKey
        }
      });

      return response.data.slice(0, limit).map(article => ({
        id: article.id,
        title: article.headline,
        summary: article.summary,
        url: article.url,
        source: article.source,
        publishedAt: new Date(article.datetime * 1000),
        image: article.image,
        category: article.category,
        impact: this.calculateNewsImpact(article.headline),
        sentiment: this.analyzeSentiment(article.headline + ' ' + article.summary)
      }));
    } catch (error) {
      console.error('Error fetching real-time news:', error);
      // Fallback to News API
      return this.getFallbackNews(category, limit);
    }
  }

  // Fallback News from NewsAPI
  async getFallbackNews(category, limit) {
    try {
      const response = await this.newsAPI.get('/top-headlines', {
        params: {
          category: 'business',
          country: 'us',
          pageSize: limit,
          apiKey: this.newsApiKey
        }
      });
      
      return response.data.articles.map(article => ({
        id: article.url,
        title: article.title,
        summary: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: new Date(article.publishedAt),
        image: article.urlToImage,
        impact: this.calculateNewsImpact(article.title)
      }));
    } catch (error) {
      console.error('Fallback news failed:', error);
      return [];
    }
  }

  // Enhanced Technical Indicators with Multiple Sources
  async getTechnicalIndicators(symbol, timeframe = '1D') {
    try {
      const indicators = await Promise.allSettled([
        this.getRSI(symbol, timeframe),
        this.getMACD(symbol, timeframe),
        this.getMovingAverages(symbol, timeframe),
        this.getBollingerBands(symbol, timeframe)
      ]);

      return {
        rsi: indicators[0].status === 'fulfilled' ? indicators[0].value : null,
        macd: indicators[1].status === 'fulfilled' ? indicators[1].value : null,
        movingAverages: indicators[2].status === 'fulfilled' ? indicators[2].value : null,
        bollingerBands: indicators[3].status === 'fulfilled' ? indicators[3].value : null,
        timestamp: Date.now(),
        symbol
      };
    } catch (error) {
      console.error(`Error fetching technical indicators for ${symbol}:`, error);
      throw error;
    }
  }

  async getRSI(symbol, timeframe, period = 14) {
    try {
      const response = await this.alphaVantage.get('', {
        params: {
          function: 'RSI',
          symbol: symbol,
          interval: timeframe.toLowerCase(),
          time_period: period,
          series_type: 'close',
          apikey: this.alphaVantageKey
        }
      });

      const rsiData = response.data['Technical Analysis: RSI'];
      if (!rsiData) throw new Error('RSI data not available');

      const latestDate = Object.keys(rsiData)[0];
      const rsiValue = parseFloat(rsiData[latestDate]['RSI']);

      return {
        value: rsiValue,
        signal: rsiValue > 70 ? 'overbought' : rsiValue < 30 ? 'oversold' : 'neutral',
        date: latestDate
      };
    } catch (error) {
      console.error(`Error fetching RSI for ${symbol}:`, error);
      throw error;
    }
  }

  // Global Market Indices with Real-time Data
  async getGlobalMarketIndices() {
    const indices = [
      { symbol: '^GSPC', name: 'S&P 500' },
      { symbol: '^DJI', name: 'Dow Jones' },
      { symbol: '^IXIC', name: 'NASDAQ' },
      { symbol: '^FTSE', name: 'FTSE 100' },
      { symbol: '^GDAXI', name: 'DAX' },
      { symbol: '^N225', name: 'Nikkei 225' },
      { symbol: '^HSI', name: 'Hang Seng' }
    ];

    try {
      const promises = indices.map(async (index) => {
        try {
          const quote = await this.getRealTimeQuote(index.symbol);
          return {
            ...index,
            ...quote
          };
        } catch (error) {
          console.error(`Failed to fetch ${index.name}:`, error);
          return {
            ...index,
            price: 0,
            change: 0,
            changePercent: 0,
            error: true
          };
        }
      });

      return await Promise.all(promises);
    } catch (error) {
      console.error('Error fetching global indices:', error);
      throw error;
    }
  }

  // Cryptocurrency Real-time Data
  async getCryptoRealTime(symbols = ['BTCUSD', 'ETHUSD', 'ADAUSD', 'DOTUSD']) {
    try {
      const promises = symbols.map(async (symbol) => {
        try {
          // Remove 'USD' suffix and add it back for Finnhub format
          const cryptoSymbol = symbol.replace('USD', '');
          const finnhubSymbol = `BINANCE:${cryptoSymbol}USDT`;
          
          const quote = await this.getRealTimeQuote(finnhubSymbol);
          return {
            symbol: symbol,
            name: this.getCryptoName(cryptoSymbol),
            ...quote
          };
        } catch (error) {
          return {
            symbol: symbol,
            name: symbol,
            price: 0,
            change: 0,
            changePercent: 0,
            error: true
          };
        }
      });

      return await Promise.all(promises);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      throw error;
    }
  }

  // Market Status with Multiple Exchanges
  async getEnhancedMarketStatus() {
    try {
      const now = new Date();
      const utcHour = now.getUTCHours();
      const utcDay = now.getUTCDay();

      const exchanges = {
        NYSE: {
          name: 'New York Stock Exchange',
          isOpen: this.isMarketOpen(utcHour, utcDay, 14.5, 21), // 9:30 AM - 4:00 PM EST
          openTime: '09:30 EST',
          closeTime: '16:00 EST',
          timezone: 'America/New_York',
          nextOpen: this.getNextMarketOpen('NYSE')
        },
        NASDAQ: {
          name: 'NASDAQ',
          isOpen: this.isMarketOpen(utcHour, utcDay, 14.5, 21),
          openTime: '09:30 EST',
          closeTime: '16:00 EST',
          timezone: 'America/New_York',
          nextOpen: this.getNextMarketOpen('NASDAQ')
        },
        LSE: {
          name: 'London Stock Exchange',
          isOpen: this.isMarketOpen(utcHour, utcDay, 8, 16.5),
          openTime: '08:00 GMT',
          closeTime: '16:30 GMT',
          timezone: 'Europe/London',
          nextOpen: this.getNextMarketOpen('LSE')
        },
        TSE: {
          name: 'Tokyo Stock Exchange',
          isOpen: this.isMarketOpen(utcHour, utcDay, 0, 6), // 9:00 AM - 3:00 PM JST
          openTime: '09:00 JST',
          closeTime: '15:00 JST',
          timezone: 'Asia/Tokyo',
          nextOpen: this.getNextMarketOpen('TSE')
        },
        FOREX: {
          name: 'Forex Market',
          isOpen: utcDay >= 1 && utcDay <= 5, // 24/5
          openTime: '24/5',
          closeTime: '24/5',
          timezone: 'Global',
          nextOpen: null
        },
        CRYPTO: {
          name: 'Cryptocurrency',
          isOpen: true, // 24/7
          openTime: '24/7',
          closeTime: '24/7',
          timezone: 'Global',
          nextOpen: null
        }
      };

      return exchanges;
    } catch (error) {
      console.error('Error fetching market status:', error);
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

  // New Helper Methods for Enhanced API Integration
  
  calculateNewsImpact(title) {
    const highImpactKeywords = ['fed', 'interest rate', 'inflation', 'gdp', 'unemployment', 'earnings', 'merger', 'acquisition', 'bankruptcy', 'ipo'];
    const mediumImpactKeywords = ['stock', 'market', 'trading', 'investment', 'profit', 'revenue', 'guidance', 'outlook'];
    
    const titleLower = title.toLowerCase();
    
    if (highImpactKeywords.some(keyword => titleLower.includes(keyword))) {
      return 'high';
    } else if (mediumImpactKeywords.some(keyword => titleLower.includes(keyword))) {
      return 'medium';
    }
    return 'low';
  }

  analyzeSentiment(text) {
    const positiveWords = ['up', 'rise', 'gain', 'bull', 'positive', 'growth', 'strong', 'beat', 'exceed'];
    const negativeWords = ['down', 'fall', 'drop', 'bear', 'negative', 'decline', 'weak', 'miss', 'below'];
    
    const words = text.toLowerCase().split(' ');
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });
    
    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  }

  getCryptoName(symbol) {
    const cryptoNames = {
      BTC: 'Bitcoin',
      ETH: 'Ethereum',
      ADA: 'Cardano',
      DOT: 'Polkadot',
      BNB: 'Binance Coin',
      XRP: 'Ripple',
      DOGE: 'Dogecoin',
      MATIC: 'Polygon',
      SOL: 'Solana',
      AVAX: 'Avalanche'
    };
    return cryptoNames[symbol] || symbol;
  }

  isMarketOpen(utcHour, utcDay, openHour, closeHour) {
    // Weekend check
    if (utcDay === 0 || utcDay === 6) return false;
    
    // Hour check
    return utcHour >= openHour && utcHour < closeHour;
  }

  getNextMarketOpen(exchange) {
    const now = new Date();
    const nextOpen = new Date(now);
    
    // If it's weekend, move to Monday
    if (now.getDay() === 6) { // Saturday
      nextOpen.setDate(now.getDate() + 2);
    } else if (now.getDay() === 0) { // Sunday
      nextOpen.setDate(now.getDate() + 1);
    }
    
    // Set opening time based on exchange
    switch (exchange) {
      case 'NYSE':
      case 'NASDAQ':
        nextOpen.setHours(9, 30, 0, 0); // 9:30 AM EST
        break;
      case 'LSE':
        nextOpen.setHours(8, 0, 0, 0); // 8:00 AM GMT
        break;
      case 'TSE':
        nextOpen.setHours(9, 0, 0, 0); // 9:00 AM JST
        break;
      default:
        return null;
    }
    
    return nextOpen.toISOString();
  }

  async getMACD(symbol, timeframe) {
    try {
      const response = await this.alphaVantage.get('', {
        params: {
          function: 'MACD',
          symbol: symbol,
          interval: timeframe.toLowerCase(),
          series_type: 'close',
          apikey: this.alphaVantageKey
        }
      });

      const macdData = response.data['Technical Analysis: MACD'];
      if (!macdData) throw new Error('MACD data not available');

      const latestDate = Object.keys(macdData)[0];
      const macd = macdData[latestDate];

      return {
        macd: parseFloat(macd['MACD']),
        signal: parseFloat(macd['MACD_Signal']),
        histogram: parseFloat(macd['MACD_Hist']),
        date: latestDate,
        trend: parseFloat(macd['MACD']) > parseFloat(macd['MACD_Signal']) ? 'bullish' : 'bearish'
      };
    } catch (error) {
      console.error(`Error fetching MACD for ${symbol}:`, error);
      throw error;
    }
  }

  async getMovingAverages(symbol, timeframe) {
    try {
      const [sma20, sma50, ema20] = await Promise.all([
        this.getSMA(symbol, timeframe, 20),
        this.getSMA(symbol, timeframe, 50),
        this.getEMA(symbol, timeframe, 20)
      ]);

      return {
        sma20,
        sma50,
        ema20,
        trend: sma20.value > sma50.value ? 'bullish' : 'bearish'
      };
    } catch (error) {
      console.error(`Error fetching moving averages for ${symbol}:`, error);
      throw error;
    }
  }

  async getSMA(symbol, timeframe, period) {
    const response = await this.alphaVantage.get('', {
      params: {
        function: 'SMA',
        symbol: symbol,
        interval: timeframe.toLowerCase(),
        time_period: period,
        series_type: 'close',
        apikey: this.alphaVantageKey
      }
    });

    const smaData = response.data['Technical Analysis: SMA'];
    const latestDate = Object.keys(smaData)[0];
    
    return {
      period,
      value: parseFloat(smaData[latestDate]['SMA']),
      date: latestDate
    };
  }

  async getEMA(symbol, timeframe, period) {
    const response = await this.alphaVantage.get('', {
      params: {
        function: 'EMA',
        symbol: symbol,
        interval: timeframe.toLowerCase(),
        time_period: period,
        series_type: 'close',
        apikey: this.alphaVantageKey
      }
    });

    const emaData = response.data['Technical Analysis: EMA'];
    const latestDate = Object.keys(emaData)[0];
    
    return {
      period,
      value: parseFloat(emaData[latestDate]['EMA']),
      date: latestDate
    };
  }

  async getBollingerBands(symbol, timeframe, period = 20, stdDev = 2) {
    const response = await this.alphaVantage.get('', {
      params: {
        function: 'BBANDS',
        symbol: symbol,
        interval: timeframe.toLowerCase(),
        time_period: period,
        series_type: 'close',
        nbdevup: stdDev,
        nbdevdn: stdDev,
        apikey: this.alphaVantageKey
      }
    });

    const bbandsData = response.data['Technical Analysis: BBANDS'];
    const latestDate = Object.keys(bbandsData)[0];
    const bands = bbandsData[latestDate];
    
    return {
      upperBand: parseFloat(bands['Real Upper Band']),
      middleBand: parseFloat(bands['Real Middle Band']),
      lowerBand: parseFloat(bands['Real Lower Band']),
      date: latestDate
    };
  }

  // WebSocket connection for real-time updates
  connectWebSocket(symbols, callback) {
    if (!window.WebSocket) {
      console.warn('WebSocket not supported, falling back to polling');
      return this.connectToRealTimeData(symbols, callback);
    }

    // Finnhub WebSocket for real-time data
    const ws = new WebSocket(`wss://ws.finnhub.io?token=${this.finnhubKey}`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      // Subscribe to symbols
      symbols.forEach(symbol => {
        ws.send(JSON.stringify({type: 'subscribe', symbol: symbol}));
      });
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'trade') {
        callback(data.data.map(trade => ({
          symbol: trade.s,
          price: trade.p,
          volume: trade.v,
          timestamp: trade.t
        })));
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      symbols.forEach(symbol => {
        ws.send(JSON.stringify({type: 'unsubscribe', symbol: symbol}));
      });
      ws.close();
    };
  }
}

// Export singleton instance
const tradingAPI = new TradingAPIService();
export default tradingAPI;
