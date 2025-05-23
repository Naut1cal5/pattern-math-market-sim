export class MarketSimulation {
  constructor({ onPriceUpdate, onOrderBookUpdate, onPortfolioUpdate }) {
    this.onPriceUpdate = onPriceUpdate;
    this.onOrderBookUpdate = onOrderBookUpdate;
    this.onPortfolioUpdate = onPortfolioUpdate;
    
    this.isRunning = false;
    this.currentPrice = 100;
    this.previousPrice = 100;
    this.volume = 0;
    this.time = 0;
    
    this.orderBook = {
      buys: [],
      sells: []
    };
    
    this.portfolio = {
      cash: 10000000,
      shares: 0,
      totalValue: 10000000,
      pnl: 0,
      pnlPercent: 0
    };
    
    this.traders = [];
    this.initializeTraders();
    this.updateCallbacks();
  }

  initializeTraders() {
    // Create different types of traders
    for (let i = 0; i < 500; i++) {
      this.traders.push({
        type: 'random',
        lastAction: 0,
        cash: Math.random() * 50000 + 10000,
        shares: Math.floor(Math.random() * 100),
        strategy: Math.random()
      });
    }
    
    // Add some algorithmic traders
    for (let i = 0; i < 50; i++) {
      this.traders.push({
        type: 'trend',
        lastAction: 0,
        cash: Math.random() * 100000 + 50000,
        shares: Math.floor(Math.random() * 200),
        strategy: Math.random()
      });
    }
    
    // Add high frequency traders
    for (let i = 0; i < 30; i++) {
      this.traders.push({
        type: 'hft',
        lastAction: 0,
        cash: Math.random() * 200000 + 100000,
        shares: Math.floor(Math.random() * 50),
        strategy: Math.random()
      });
    }
    
    // Add whale traders
    for (let i = 0; i < 5; i++) {
      this.traders.push({
        type: 'whale',
        lastAction: 0,
        cash: Math.random() * 1000000 + 500000,
        shares: Math.floor(Math.random() * 1000),
        strategy: Math.random()
      });
    }
  }

  start() {
    this.isRunning = true;
    this.simulate();
  }

  pause() {
    this.isRunning = false;
  }

  reset() {
    this.isRunning = false;
    this.currentPrice = 100;
    this.previousPrice = 100;
    this.volume = 0;
    this.time = 0;
    this.orderBook = { buys: [], sells: [] };
    this.portfolio = {
      cash: 10000000,
      shares: 0,
      totalValue: 10000000,
      pnl: 0,
      pnlPercent: 0
    };
    this.traders = [];
    this.initializeTraders();
    this.updateCallbacks();
  }

  simulate() {
    if (!this.isRunning) return;

    this.time++;
    
    // Generate orders from traders
    this.generateOrders();
    
    // Execute trades
    this.executeTrades();
    
    // Clean old orders
    this.cleanOrderBook();
    
    // Update market data
    this.updateMarketData();
    
    // Update callbacks
    this.updateCallbacks();
    
    // Continue simulation
    setTimeout(() => this.simulate(), 100);
  }

  generateOrders() {
    this.traders.forEach(trader => {
      // Skip if trader acted recently
      if (this.time - trader.lastAction < this.getActionDelay(trader.type)) return;
      
      if (Math.random() < this.getActionProbability(trader.type)) {
        const order = this.generateOrder(trader);
        if (order) {
          this.addOrder(order);
          trader.lastAction = this.time;
        }
      }
    });
  }

  getActionDelay(type) {
    switch (type) {
      case 'hft': return 1;
      case 'random': return 5;
      case 'trend': return 3;
      case 'whale': return 20;
      default: return 5;
    }
  }

  getActionProbability(type) {
    switch (type) {
      case 'hft': return 0.8;
      case 'random': return 0.1;
      case 'trend': return 0.3;
      case 'whale': return 0.05;
      default: return 0.1;
    }
  }

  generateOrder(trader) {
    const priceVariation = this.getPriceVariation(trader.type);
    let price = this.currentPrice * (1 + (Math.random() - 0.5) * priceVariation);
    let quantity = this.getQuantity(trader);
    
    // Determine buy or sell based on trader type
    let isBuy = Math.random() > 0.5;
    
    if (trader.type === 'trend') {
      // Trend followers buy when price is rising, sell when falling
      const trend = this.currentPrice > this.previousPrice;
      isBuy = trend;
    } else if (trader.type === 'hft') {
      // HFT traders provide liquidity
      isBuy = Math.random() > 0.5;
      price = isBuy ? this.currentPrice * 0.999 : this.currentPrice * 1.001;
    }
    
    if (isBuy && trader.cash < price * quantity) {
      quantity = Math.floor(trader.cash / price);
    } else if (!isBuy && trader.shares < quantity) {
      quantity = trader.shares;
    }
    
    if (quantity <= 0) return null;
    
    return {
      type: isBuy ? 'buy' : 'sell',
      price: price,
      quantity: quantity,
      trader: trader.type,
      timestamp: this.time
    };
  }

  getPriceVariation(type) {
    switch (type) {
      case 'hft': return 0.001;
      case 'random': return 0.02;
      case 'trend': return 0.01;
      case 'whale': return 0.005;
      default: return 0.01;
    }
  }

  getQuantity(trader) {
    switch (trader.type) {
      case 'hft': return Math.floor(Math.random() * 50) + 10;
      case 'random': return Math.floor(Math.random() * 100) + 1;
      case 'trend': return Math.floor(Math.random() * 200) + 50;
      case 'whale': return Math.floor(Math.random() * 2000) + 500;
      default: return Math.floor(Math.random() * 100) + 1;
    }
  }

  addOrder(order) {
    if (order.type === 'buy') {
      this.orderBook.buys.push(order);
      this.orderBook.buys.sort((a, b) => b.price - a.price); // Highest price first
    } else {
      this.orderBook.sells.push(order);
      this.orderBook.sells.sort((a, b) => a.price - b.price); // Lowest price first
    }
  }

  executeTrades() {
    let tradesExecuted = 0;
    this.volume = 0;
    
    while (this.orderBook.buys.length > 0 && this.orderBook.sells.length > 0) {
      const highestBuy = this.orderBook.buys[0];
      const lowestSell = this.orderBook.sells[0];
      
      if (highestBuy.price >= lowestSell.price) {
        // Execute trade
        const quantity = Math.min(highestBuy.quantity, lowestSell.quantity);
        const tradePrice = (highestBuy.price + lowestSell.price) / 2;
        
        this.previousPrice = this.currentPrice;
        this.currentPrice = tradePrice;
        this.volume += quantity;
        
        // Update order quantities
        highestBuy.quantity -= quantity;
        lowestSell.quantity -= quantity;
        
        // Remove completed orders
        if (highestBuy.quantity <= 0) {
          this.orderBook.buys.shift();
        }
        if (lowestSell.quantity <= 0) {
          this.orderBook.sells.shift();
        }
        
        tradesExecuted++;
      } else {
        break;
      }
    }
    
    // Add some random price movement if no trades
    if (tradesExecuted === 0) {
      this.previousPrice = this.currentPrice;
      this.currentPrice *= (1 + (Math.random() - 0.5) * 0.001);
    }
  }

  cleanOrderBook() {
    // Remove old orders
    const maxAge = 100;
    this.orderBook.buys = this.orderBook.buys.filter(order => 
      this.time - order.timestamp < maxAge
    );
    this.orderBook.sells = this.orderBook.sells.filter(order => 
      this.time - order.timestamp < maxAge
    );
    
    // Keep only top orders for performance
    this.orderBook.buys = this.orderBook.buys.slice(0, 20);
    this.orderBook.sells = this.orderBook.sells.slice(0, 20);
  }

  executeTrade(type, quantity, price) {
    const totalCost = quantity * price;
    
    if (type === 'buy') {
      if (this.portfolio.cash >= totalCost) {
        this.portfolio.cash -= totalCost;
        this.portfolio.shares += quantity;
        
        // Add large order to order book to show market impact
        this.addOrder({
          type: 'buy',
          price: price * 1.002, // Slightly above market to ensure execution
          quantity: quantity,
          trader: 'player',
          timestamp: this.time
        });
      }
    } else if (type === 'sell') {
      if (this.portfolio.shares >= quantity) {
        this.portfolio.cash += totalCost;
        this.portfolio.shares -= quantity;
        
        // Add large order to order book
        this.addOrder({
          type: 'sell',
          price: price * 0.998, // Slightly below market to ensure execution
          quantity: quantity,
          trader: 'player',
          timestamp: this.time
        });
      }
    }
    
    this.updatePortfolio();
  }

  updateMarketData() {
    const change = this.currentPrice - this.previousPrice;
    const changePercent = (change / this.previousPrice) * 100;
    
    this.onPriceUpdate({
      price: this.currentPrice,
      volume: this.volume,
      change: change,
      changePercent: changePercent,
      timestamp: this.time
    });
  }

  updatePortfolio() {
    const positionValue = this.portfolio.shares * this.currentPrice;
    this.portfolio.totalValue = this.portfolio.cash + positionValue;
    this.portfolio.pnl = this.portfolio.totalValue - 10000000;
    this.portfolio.pnlPercent = (this.portfolio.pnl / 10000000) * 100;
    
    this.onPortfolioUpdate(this.portfolio);
  }

  updateCallbacks() {
    this.updatePortfolio();
    
    // Combine and format order book
    const orders = [
      ...this.orderBook.buys.map(order => ({ ...order, type: 'buy' })),
      ...this.orderBook.sells.map(order => ({ ...order, type: 'sell' }))
    ];
    
    this.onOrderBookUpdate(orders);
  }
}
