// Demo Broker API Integration Service
// This simulates broker functionality with paper trading capabilities

class DemoBrokerService {
  constructor() {
    this.name = 'MarketPulse Demo Broker';
    this.accountBalance = 100000; // $100k paper money
    this.positions = new Map();
    this.orders = [];
    this.tradeHistory = [];
    this.isConnected = false;
    
    // Simulated market data
    this.marketData = new Map();
    this.subscriptions = new Set();
    
    // Initialize with some popular stocks
    this.initializeMarketData();
  }

  // Initialize with demo market data
  initializeMarketData() {
    const demoStocks = [
      { symbol: 'AAPL', price: 175.50, change: 2.30, volume: 12500000 },
      { symbol: 'MSFT', price: 332.89, change: -1.20, volume: 8900000 },
      { symbol: 'GOOGL', price: 2750.40, change: 15.80, volume: 2100000 },
      { symbol: 'AMZN', price: 3180.25, change: -8.45, volume: 5400000 },
      { symbol: 'TSLA', price: 245.60, change: 12.85, volume: 18200000 },
      { symbol: 'NVDA', price: 418.90, change: 8.50, volume: 15600000 },
      { symbol: 'META', price: 298.75, change: -3.25, volume: 9800000 },
      { symbol: 'NFLX', price: 445.30, change: 5.60, volume: 4200000 }
    ];

    demoStocks.forEach(stock => {
      this.marketData.set(stock.symbol, {
        ...stock,
        bid: stock.price - 0.01,
        ask: stock.price + 0.01,
        lastUpdate: new Date(),
        dayHigh: stock.price + (Math.random() * 10),
        dayLow: stock.price - (Math.random() * 8),
        openPrice: stock.price - stock.change
      });
    });

    // Start price simulation
    this.startPriceSimulation();
  }

  // Simulate real-time price movements
  startPriceSimulation() {
    setInterval(() => {
      this.marketData.forEach((data, symbol) => {
        // Random price movement (-0.5% to +0.5%)
        const changePercent = (Math.random() - 0.5) * 0.01;
        const priceChange = data.price * changePercent;
        
        const newPrice = Math.max(0.01, data.price + priceChange);
        const newChange = newPrice - data.openPrice;
        
        this.marketData.set(symbol, {
          ...data,
          price: newPrice,
          change: newChange,
          bid: newPrice - 0.01,
          ask: newPrice + 0.01,
          lastUpdate: new Date(),
          volume: data.volume + Math.floor(Math.random() * 10000)
        });

        // Notify subscribers
        if (this.subscriptions.has(symbol)) {
          this.notifyPriceUpdate(symbol, this.marketData.get(symbol));
        }
      });
    }, 5000); // Update every 5 seconds
  }

  // Connect to demo broker
  async connect() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true;
        console.log('🔗 Connected to MarketPulse Demo Broker');
        resolve({
          status: 'connected',
          account: {
            accountId: 'DEMO-' + Date.now(),
            balance: this.accountBalance,
            buyingPower: this.accountBalance,
            dayTradingBuyingPower: this.accountBalance * 4,
            portfolioValue: this.calculatePortfolioValue()
          }
        });
      }, 1000);
    });
  }

  // Disconnect from broker
  disconnect() {
    this.isConnected = false;
    this.subscriptions.clear();
    console.log('❌ Disconnected from Demo Broker');
  }

  // Get account information
  getAccountInfo() {
    return {
      accountId: 'DEMO-ACCOUNT',
      balance: this.accountBalance,
      buyingPower: this.accountBalance,
      dayTradingBuyingPower: this.accountBalance * 4,
      portfolioValue: this.calculatePortfolioValue(),
      positions: Array.from(this.positions.values()),
      pendingOrders: this.orders.filter(order => order.status === 'pending'),
      isConnected: this.isConnected
    };
  }

  // Calculate total portfolio value
  calculatePortfolioValue() {
    let totalValue = this.accountBalance;
    
    this.positions.forEach(position => {
      const marketData = this.marketData.get(position.symbol);
      if (marketData) {
        totalValue += position.quantity * marketData.price;
      }
    });
    
    return totalValue;
  }

  // Place a market order
  async placeMarketOrder(symbol, quantity, side) {
    if (!this.isConnected) {
      throw new Error('Not connected to broker');
    }

    const marketData = this.marketData.get(symbol);
    if (!marketData) {
      throw new Error(`No market data available for ${symbol}`);
    }

    const price = side === 'buy' ? marketData.ask : marketData.bid;
    const orderValue = Math.abs(quantity) * price;

    // Create order
    const order = {
      id: 'ORD-' + Date.now(),
      symbol,
      quantity: Math.abs(quantity),
      side,
      type: 'market',
      price,
      status: 'pending',
      timestamp: new Date(),
      filled: 0,
      remaining: Math.abs(quantity)
    };

    this.orders.push(order);

    // Simulate order execution
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          if (side === 'buy') {
            // Check buying power
            if (this.accountBalance < orderValue) {
              order.status = 'rejected';
              order.rejectReason = 'Insufficient buying power';
              reject(new Error('Insufficient buying power'));
              return;
            }

            // Execute buy order
            this.accountBalance -= orderValue;
            this.addPosition(symbol, quantity, price);
            
          } else if (side === 'sell') {
            // Check if we have enough shares
            const position = this.positions.get(symbol);
            if (!position || position.quantity < quantity) {
              order.status = 'rejected';
              order.rejectReason = 'Insufficient shares';
              reject(new Error('Insufficient shares to sell'));
              return;
            }

            // Execute sell order
            this.accountBalance += orderValue;
            this.reducePosition(symbol, quantity);
          }

          // Mark order as filled
          order.status = 'filled';
          order.filled = quantity;
          order.remaining = 0;
          order.fillPrice = price;
          order.fillTime = new Date();

          // Add to trade history
          this.tradeHistory.push({
            ...order,
            pnl: this.calculateTradePnL(symbol, quantity, price, side)
          });

          console.log(`✅ Order executed: ${side.toUpperCase()} ${quantity} ${symbol} @ $${price.toFixed(2)}`);
          resolve(order);

        } catch (error) {
          order.status = 'rejected';
          order.rejectReason = error.message;
          reject(error);
        }
      }, 500); // Simulate execution delay
    });
  }

  // Place a limit order
  async placeLimitOrder(symbol, quantity, side, limitPrice) {
    if (!this.isConnected) {
      throw new Error('Not connected to broker');
    }

    const order = {
      id: 'ORD-' + Date.now(),
      symbol,
      quantity: Math.abs(quantity),
      side,
      type: 'limit',
      limitPrice,
      status: 'pending',
      timestamp: new Date(),
      filled: 0,
      remaining: Math.abs(quantity)
    };

    this.orders.push(order);

    // Monitor for limit price trigger (simplified)
    this.monitorLimitOrder(order);

    return order;
  }

  // Monitor limit orders
  monitorLimitOrder(order) {
    const checkPrice = () => {
      const marketData = this.marketData.get(order.symbol);
      if (!marketData) return;

      const currentPrice = marketData.price;
      let shouldExecute = false;

      if (order.side === 'buy' && currentPrice <= order.limitPrice) {
        shouldExecute = true;
      } else if (order.side === 'sell' && currentPrice >= order.limitPrice) {
        shouldExecute = true;
      }

      if (shouldExecute && order.status === 'pending') {
        this.executeLimitOrder(order, currentPrice);
      }
    };

    // Check every 2 seconds
    const interval = setInterval(checkPrice, 2000);

    // Clean up after 24 hours (simulate day order expiry)
    setTimeout(() => {
      if (order.status === 'pending') {
        order.status = 'expired';
        clearInterval(interval);
        console.log(`⏰ Limit order expired: ${order.symbol} ${order.side} ${order.quantity} @ $${order.limitPrice}`);
      }
    }, 24 * 60 * 60 * 1000);
  }

  // Execute limit order
  executeLimitOrder(order, fillPrice) {
    try {
      const orderValue = order.quantity * fillPrice;

      if (order.side === 'buy') {
        if (this.accountBalance < orderValue) {
          order.status = 'rejected';
          order.rejectReason = 'Insufficient buying power';
          return;
        }
        this.accountBalance -= orderValue;
        this.addPosition(order.symbol, order.quantity, fillPrice);
      } else {
        const position = this.positions.get(order.symbol);
        if (!position || position.quantity < order.quantity) {
          order.status = 'rejected';
          order.rejectReason = 'Insufficient shares';
          return;
        }
        this.accountBalance += orderValue;
        this.reducePosition(order.symbol, order.quantity);
      }

      order.status = 'filled';
      order.filled = order.quantity;
      order.remaining = 0;
      order.fillPrice = fillPrice;
      order.fillTime = new Date();

      this.tradeHistory.push({
        ...order,
        pnl: this.calculateTradePnL(order.symbol, order.quantity, fillPrice, order.side)
      });

      console.log(`✅ Limit order filled: ${order.side.toUpperCase()} ${order.quantity} ${order.symbol} @ $${fillPrice.toFixed(2)}`);
    } catch (error) {
      order.status = 'rejected';
      order.rejectReason = error.message;
    }
  }

  // Add to position
  addPosition(symbol, quantity, price) {
    if (this.positions.has(symbol)) {
      const position = this.positions.get(symbol);
      const totalQuantity = position.quantity + quantity;
      const totalCost = (position.quantity * position.avgPrice) + (quantity * price);
      position.quantity = totalQuantity;
      position.avgPrice = totalCost / totalQuantity;
    } else {
      this.positions.set(symbol, {
        symbol,
        quantity,
        avgPrice: price,
        openDate: new Date()
      });
    }
  }

  // Reduce position
  reducePosition(symbol, quantity) {
    const position = this.positions.get(symbol);
    if (!position) return;

    if (position.quantity <= quantity) {
      this.positions.delete(symbol);
    } else {
      position.quantity -= quantity;
    }
  }

  // Calculate P&L for a trade
  calculateTradePnL(symbol, quantity, price, side) {
    const position = this.positions.get(symbol);
    if (!position || side === 'buy') return 0;

    // Simple P&L calculation for sells
    return (price - position.avgPrice) * quantity;
  }

  // Get real-time quote
  getQuote(symbol) {
    const data = this.marketData.get(symbol);
    if (!data) {
      throw new Error(`No data available for ${symbol}`);
    }

    return {
      symbol,
      price: data.price,
      bid: data.bid,
      ask: data.ask,
      change: data.change,
      changePercent: (data.change / data.openPrice) * 100,
      volume: data.volume,
      dayHigh: data.dayHigh,
      dayLow: data.dayLow,
      lastUpdate: data.lastUpdate
    };
  }

  // Subscribe to real-time price updates
  subscribeToPrice(symbol, callback) {
    this.subscriptions.add(symbol);
    this.priceCallback = callback;

    // Return unsubscribe function
    return () => {
      this.subscriptions.delete(symbol);
    };
  }

  // Notify price update
  notifyPriceUpdate(symbol, data) {
    if (this.priceCallback) {
      this.priceCallback({
        symbol,
        price: data.price,
        change: data.change,
        timestamp: data.lastUpdate
      });
    }
  }

  // Cancel pending order
  cancelOrder(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (order && order.status === 'pending') {
      order.status = 'cancelled';
      order.cancelTime = new Date();
      console.log(`❌ Order cancelled: ${orderId}`);
      return true;
    }
    return false;
  }

  // Get order history
  getOrderHistory(limit = 50) {
    return this.orders
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // Get trade history
  getTradeHistory(limit = 50) {
    return this.tradeHistory
      .sort((a, b) => b.fillTime - a.fillTime)
      .slice(0, limit);
  }

  // Get current positions
  getPositions() {
    return Array.from(this.positions.values()).map(position => {
      const marketData = this.marketData.get(position.symbol);
      const currentPrice = marketData ? marketData.price : position.avgPrice;
      const marketValue = position.quantity * currentPrice;
      const unrealizedPnL = (currentPrice - position.avgPrice) * position.quantity;
      const unrealizedPnLPercent = (unrealizedPnL / (position.avgPrice * position.quantity)) * 100;

      return {
        ...position,
        currentPrice,
        marketValue,
        unrealizedPnL,
        unrealizedPnLPercent
      };
    });
  }

  // Get portfolio summary
  getPortfolioSummary() {
    const positions = this.getPositions();
    const totalMarketValue = positions.reduce((sum, pos) => sum + pos.marketValue, 0);
    const totalUnrealizedPnL = positions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0);
    const totalPortfolioValue = this.accountBalance + totalMarketValue;

    return {
      cashBalance: this.accountBalance,
      totalMarketValue,
      totalPortfolioValue,
      totalUnrealizedPnL,
      totalUnrealizedPnLPercent: totalMarketValue > 0 ? (totalUnrealizedPnL / (totalMarketValue - totalUnrealizedPnL)) * 100 : 0,
      positions: positions.length,
      buyingPower: this.accountBalance
    };
  }

  // Paper trading rules validation
  validateTrade(symbol, quantity, side) {
    const errors = [];

    // Check if market is open (simplified)
    const now = new Date();
    const hour = now.getHours();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    const isMarketHours = hour >= 9 && hour <= 16;

    if (isWeekend || !isMarketHours) {
      errors.push('Market is currently closed');
    }

    // Check minimum quantity
    if (quantity < 1) {
      errors.push('Minimum quantity is 1 share');
    }

    // Check for sufficient buying power or shares
    if (side === 'buy') {
      const marketData = this.marketData.get(symbol);
      if (marketData) {
        const estimatedCost = quantity * marketData.ask;
        if (estimatedCost > this.accountBalance) {
          errors.push('Insufficient buying power');
        }
      }
    } else if (side === 'sell') {
      const position = this.positions.get(symbol);
      if (!position || position.quantity < quantity) {
        errors.push('Insufficient shares to sell');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
const demoBroker = new DemoBrokerService();
export default demoBroker;
