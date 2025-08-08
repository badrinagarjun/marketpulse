/**
 * 🆓 FREE Alpaca Paper Trading API Service
 * Features: Real-time data, Paper trading, Portfolio management
 */

import axios from 'axios';

class AlpacaService {
  constructor() {
    // Alpaca Paper Trading URLs (FREE)
    this.paperBaseURL = 'https://paper-api.alpaca.markets/v2';
    this.dataBaseURL = 'https://data.alpaca.markets/v2';
    
    // API credentials (you'll need to get these FREE from alpaca.markets)
    this.apiKey = import.meta.env.VITE_ALPACA_API_KEY || 'demo';
    this.apiSecret = import.meta.env.VITE_ALPACA_SECRET_KEY || 'demo';
    
    // Demo mode for testing
    this.demoMode = this.apiKey === 'demo';
    
    // Configure axios instances
    this.paperAPI = axios.create({
      baseURL: this.paperBaseURL,
      headers: {
        'APCA-API-KEY-ID': this.apiKey,
        'APCA-API-SECRET-KEY': this.apiSecret
      }
    });
    
    this.dataAPI = axios.create({
      baseURL: this.dataBaseURL,
      headers: {
        'APCA-API-KEY-ID': this.apiKey,
        'APCA-API-SECRET-KEY': this.apiSecret
      }
    });
  }

  // 💰 Get Paper Trading Account
  async getAccount() {
    if (this.demoMode) {
      return {
        id: 'demo-account',
        account_number: 'PA12345678',
        status: 'ACTIVE',
        currency: 'USD',
        cash: '95247.88',
        portfolio_value: '103420.15',
        buying_power: '190495.76',
        equity: '103420.15',
        last_equity: '101532.45',
        multiplier: '2',
        day_trade_count: 0,
        daytrade_buying_power: '0',
        regt_buying_power: '95247.88',
        initial_margin: '8172.27',
        maintenance_margin: '4086.14',
        long_market_value: '16344.54',
        short_market_value: '0',
        position_market_value: '16344.54'
      };
    }

    try {
      const response = await this.paperAPI.get('/account');
      return response.data;
    } catch (error) {
      console.error('Error fetching account:', error);
      throw error;
    }
  }

  // 📊 Get Portfolio Positions
  async getPositions() {
    if (this.demoMode) {
      return [
        {
          asset_id: '904837e3-3b76-47ec-b432-046db621571b',
          symbol: 'AAPL',
          exchange: 'NASDAQ',
          asset_class: 'us_equity',
          qty: '10',
          avg_entry_price: '150.25',
          side: 'long',
          market_value: '1547.50',
          cost_basis: '1502.50',
          unrealized_pl: '45.00',
          unrealized_plpc: '0.0299',
          current_price: '154.75'
        },
        {
          asset_id: '8ccae427-5dd0-45b3-b5fe-7ba5e422c766',
          symbol: 'TSLA',
          exchange: 'NASDAQ',
          asset_class: 'us_equity',
          qty: '5',
          avg_entry_price: '242.80',
          side: 'long',
          market_value: '1235.75',
          cost_basis: '1214.00',
          unrealized_pl: '21.75',
          unrealized_plpc: '0.0179',
          current_price: '247.15'
        }
      ];
    }

    try {
      const response = await this.paperAPI.get('/positions');
      return response.data;
    } catch (error) {
      console.error('Error fetching positions:', error);
      return [];
    }
  }

  // 📈 Get Real-time Stock Quote
  async getQuote(symbol) {
    if (this.demoMode) {
      const mockQuotes = {
        'AAPL': { price: 154.75, change: 2.15, changePercent: 1.41 },
        'TSLA': { price: 247.15, change: -3.22, changePercent: -1.29 },
        'NVDA': { price: 428.90, change: 8.45, changePercent: 2.01 },
        'MSFT': { price: 365.20, change: 1.85, changePercent: 0.51 }
      };
      return mockQuotes[symbol] || { price: 100.00, change: 0.00, changePercent: 0.00 };
    }

    try {
      const response = await this.dataAPI.get(`/stocks/${symbol}/quotes/latest`);
      return {
        price: response.data.quote.ap, // Ask price
        bidPrice: response.data.quote.bp,
        askPrice: response.data.quote.ap,
        timestamp: response.data.quote.t
      };
    } catch (error) {
      console.error('Error fetching quote:', error);
      throw error;
    }
  }

  // 🛒 Place Paper Trading Order
  async placeOrder(orderData) {
    const {
      symbol,
      qty,
      side, // 'buy' or 'sell'
      type = 'market', // 'market', 'limit', 'stop'
      time_in_force = 'day', // 'day', 'gtc', 'ioc', 'fok'
      limit_price = null
    } = orderData;

    if (this.demoMode) {
      return {
        id: `demo-order-${Date.now()}`,
        client_order_id: `demo-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
        filled_at: new Date().toISOString(),
        expired_at: null,
        canceled_at: null,
        failed_at: null,
        replaced_at: null,
        replaced_by: null,
        replaces: null,
        asset_id: '904837e3-3b76-47ec-b432-046db621571b',
        symbol: symbol,
        asset_class: 'us_equity',
        notional: null,
        qty: qty,
        filled_qty: qty,
        filled_avg_price: type === 'market' ? '154.75' : limit_price,
        order_class: '',
        order_type: type,
        type: type,
        side: side,
        time_in_force: time_in_force,
        limit_price: limit_price,
        stop_price: null,
        status: 'filled',
        extended_hours: false,
        legs: null,
        trail_percent: null,
        trail_price: null,
        hwm: null
      };
    }

    try {
      const response = await this.paperAPI.post('/orders', {
        symbol,
        qty,
        side,
        type,
        time_in_force,
        ...(limit_price && { limit_price })
      });
      return response.data;
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  }

  // 📋 Get Order History
  async getOrders(status = 'all', limit = 50) {
    if (this.demoMode) {
      return [
        {
          id: 'demo-order-1',
          symbol: 'AAPL',
          qty: '10',
          side: 'buy',
          order_type: 'market',
          filled_avg_price: '150.25',
          status: 'filled',
          created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
          id: 'demo-order-2',
          symbol: 'TSLA',
          qty: '5',
          side: 'buy',
          order_type: 'limit',
          filled_avg_price: '242.80',
          status: 'filled',
          created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
        }
      ];
    }

    try {
      const response = await this.paperAPI.get('/orders', {
        params: { status, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  // 💹 Get Portfolio Performance
  async getPortfolioHistory(period = '1D', timeframe = '1Min') {
    if (this.demoMode) {
      // Generate demo portfolio history
      const now = new Date();
      const history = [];
      const startValue = 100000;
      
      for (let i = 0; i < 100; i++) {
        const time = new Date(now.getTime() - (100 - i) * 60000); // 1 minute intervals
        const variance = Math.sin(i * 0.1) * 2000 + Math.random() * 1000;
        history.push({
          timestamp: time.toISOString(),
          equity: startValue + variance + (i * 50), // Gradual upward trend
          profit_loss: variance + (i * 50),
          profit_loss_pct: ((variance + (i * 50)) / startValue * 100).toFixed(2)
        });
      }
      
      return {
        timestamp: history.map(h => h.timestamp),
        equity: history.map(h => h.equity),
        profit_loss: history.map(h => h.profit_loss),
        profit_loss_pct: history.map(h => h.profit_loss_pct),
        base_value: startValue
      };
    }

    try {
      const response = await this.paperAPI.get('/account/portfolio/history', {
        params: { period, timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching portfolio history:', error);
      throw error;
    }
  }

  // 🔍 Search for Assets
  async searchAssets(query) {
    if (this.demoMode) {
      const mockResults = [
        { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
        { symbol: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' }
      ];
      
      return mockResults.filter(asset => 
        asset.symbol.toLowerCase().includes(query.toLowerCase()) ||
        asset.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    try {
      const response = await this.paperAPI.get('/assets', {
        params: { 
          search: query,
          status: 'active',
          asset_class: 'us_equity'
        }
      });
      return response.data.slice(0, 10); // Limit results
    } catch (error) {
      console.error('Error searching assets:', error);
      return [];
    }
  }

  // 📊 Get Market Calendar
  async getMarketCalendar() {
    if (this.demoMode) {
      const today = new Date();
      return [{
        date: today.toISOString().split('T')[0],
        open: '09:30',
        close: '16:00',
        settlement_date: today.toISOString().split('T')[0]
      }];
    }

    try {
      const response = await this.paperAPI.get('/calendar');
      return response.data;
    } catch (error) {
      console.error('Error fetching market calendar:', error);
      return [];
    }
  }

  // ⚡ WebSocket Connection (for real-time updates)
  connectWebSocket(symbols, onMessage) {
    if (this.demoMode) {
      // Demo WebSocket simulation
      const interval = setInterval(() => {
        symbols.forEach(symbol => {
          const mockData = {
            T: 'q', // Quote
            S: symbol,
            ap: (Math.random() * 200 + 100).toFixed(2), // Ask price
            bp: (Math.random() * 200 + 100).toFixed(2), // Bid price
            t: new Date().toISOString()
          };
          onMessage(mockData);
        });
      }, 2000); // Update every 2 seconds

      return {
        close: () => clearInterval(interval)
      };
    }

    // Real WebSocket implementation would go here
    // For now, return demo simulation
    return this.connectWebSocket(symbols, onMessage);
  }
}

export default new AlpacaService();
