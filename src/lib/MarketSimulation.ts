
import { GeminiAITrader } from './GeminiAITrader';

interface TraderType {
  type: string;
  lastAction: number;
  cash: number;
  shares: number;
  shortPosition?: number; // New: short positions
  strategy: number;
  aiPersonality?: string;
}

interface OrderType {
  type: 'buy' | 'sell';  // Explicitly define as union type
  price: number;
  quantity: number;
  trader: string;
  timestamp: number;
  isShort?: boolean;
  reasoning?: string;
  isAI?: boolean;
}

export class MarketSimulation {
  private onPriceUpdate: (data: any) => void;
  private onOrderBookUpdate: (orders: OrderType[]) => void;
  private onPortfolioUpdate: (portfolio: any) => void;
  
  private isRunning: boolean = false;
  private currentPrice: number = 100;
  private previousPrice: number = 100;
  private volume: number = 0;
  private time: number = 0;
  
  private orderBook: {
    buys: OrderType[];
    sells: OrderType[];
  };
  
  private portfolio: {
    cash: number;
    shares: number;
    shortPosition: number; // New: track short positions
    totalValue: number;
    pnl: number;
    pnlPercent: number;
  };
  
  private traders: TraderType[] = [];
  private aiTraders: TraderType[] = [];
  private geminiAI: GeminiAITrader | null = null;
  private marketEvents: string[] = [];
  private candlestickData: any[] = [];
  private currentCandle: any = null;
  private candleStartTime: number = 0;
  private marketSentiment: number = 0.5;
  private volatilityIndex: number = 0.1;
  private crashProbability: number = 0.001;

  constructor({ onPriceUpdate, onOrderBookUpdate, onPortfolioUpdate }: {
    onPriceUpdate: (data: any) => void;
    onOrderBookUpdate: (orders: OrderType[]) => void;
    onPortfolioUpdate: (portfolio: any) => void;
  }) {
    this.onPriceUpdate = onPriceUpdate;
    this.onOrderBookUpdate = onOrderBookUpdate;
    this.onPortfolioUpdate = onPortfolioUpdate;
    
    this.orderBook = { buys: [], sells: [] };
    
    this.portfolio = {
      cash: 10000000,
      shares: 0,
      shortPosition: 0,
      totalValue: 10000000,
      pnl: 0,
      pnlPercent: 0
    };
    
    // Initialize Gemini AI
    try {
      this.geminiAI = new GeminiAITrader('AIzaSyCqqSiJgP5slH0MgD_eEY4nkpONg-kDy8M');
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error);
    }
    
    this.initializeTraders();
    this.initializeAITraders();
    this.initializeCandlestick();
    this.updateCallbacks();
  }

  private initializeTraders() {
    // Retail traders with psychology
    for (let i = 0; i < 2000; i++) {
      this.traders.push({
        type: this.getRandomTraderType(),
        lastAction: 0,
        cash: Math.random() * 200000 + 10000,
        shares: Math.floor(Math.random() * 500),
        shortPosition: 0,
        strategy: Math.random()
      });
    }
    
    // Institutional players
    for (let i = 0; i < 50; i++) {
      this.traders.push({
        type: 'institution',
        lastAction: 0,
        cash: Math.random() * 10000000 + 1000000,
        shares: Math.floor(Math.random() * 10000),
        shortPosition: 0,
        strategy: Math.random()
      });
    }
    
    // Day traders
    for (let i = 0; i < 300; i++) {
      this.traders.push({
        type: 'daytrader',
        lastAction: 0,
        cash: Math.random() * 500000 + 50000,
        shares: Math.floor(Math.random() * 2000),
        shortPosition: 0,
        strategy: Math.random()
      });
    }
  }

  private getRandomTraderType() {
    const types = ['fearful', 'greedy', 'fomo', 'panic_seller', 'contrarian', 'momentum', 'diamond_hands'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private initializeAITraders() {
    // Multiple AI hedge funds
    const personalities = ['aggressive', 'conservative', 'momentum', 'contrarian', 'arbitrage', 'volatility_trader'];
    
    for (let i = 0; i < 15; i++) {
      this.aiTraders.push({
        type: 'ai_hedge_fund',
        lastAction: 0,
        cash: Math.random() * 1000000000 + 100000000,
        shares: Math.floor(Math.random() * 50000),
        shortPosition: 0,
        strategy: Math.random(),
        aiPersonality: personalities[Math.floor(Math.random() * personalities.length)]
      });
    }
    
    // High-frequency trading AIs
    for (let i = 0; i < 5; i++) {
      this.aiTraders.push({
        type: 'ai_hft',
        lastAction: 0,
        cash: Math.random() * 500000000 + 50000000,
        shares: Math.floor(Math.random() * 20000),
        shortPosition: 0,
        strategy: Math.random(),
        aiPersonality: 'high_frequency'
      });
    }
  }

  private initializeCandlestick() {
    this.candleStartTime = Date.now();
    this.currentCandle = {
      open: this.currentPrice,
      high: this.currentPrice,
      low: this.currentPrice,
      close: this.currentPrice,
      volume: 0,
      timestamp: this.candleStartTime
    };
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
      shortPosition: 0,
      totalValue: 10000000,
      pnl: 0,
      pnlPercent: 0
    };
    this.traders = [];
    this.aiTraders = [];
    this.marketEvents = [];
    this.candlestickData = [];
    this.currentCandle = null;
    this.candleStartTime = 0;
    this.marketSentiment = 0.5;
    this.volatilityIndex = 0.1;
    this.geminiAI = null;
    
    try {
      this.geminiAI = new GeminiAITrader('AIzaSyCqqSiJgP5slH0MgD_eEY4nkpONg-kDy8M');
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error);
    }
    
    this.initializeTraders();
    this.initializeAITraders();
    this.initializeCandlestick();
    this.updateCallbacks();
  }

  private async simulate() {
    if (!this.isRunning) return;

    this.time++;
    
    this.updateMarketConditions();
    this.generateMarketEvents();
    this.generateOrders();
    this.generateAIOrders();
    
    // Gemini AI decisions
    if (this.geminiAI && this.time % 100 === 0) { // Every 5 seconds
      try {
        const aiOrder = await this.geminiAI.makeMarketDecision({
          price: this.currentPrice,
          volume: this.volume,
          changePercent: ((this.currentPrice - this.previousPrice) / this.previousPrice) * 100,
          marketSentiment: this.marketSentiment,
          volatilityIndex: this.volatilityIndex
        });
        
        if (aiOrder) {
          this.addOrder(aiOrder);
          this.marketEvents.push(`AI Market Maker: ${aiOrder.reasoning}`);
        }
      } catch (error) {
        console.error('Gemini AI Error:', error);
      }
    }
    
    this.executeTrades();
    this.updateCandlestick();
    this.cleanOrderBook();
    this.updateMarketData();
    this.updateCallbacks();
    
    setTimeout(() => this.simulate(), 100);
  }

  private updateMarketConditions() {
    // Random market sentiment shifts
    this.marketSentiment += (Math.random() - 0.5) * 0.02;
    this.marketSentiment = Math.max(0, Math.min(1, this.marketSentiment));
    
    // Volatility clustering
    this.volatilityIndex += (Math.random() - 0.5) * 0.005;
    this.volatilityIndex = Math.max(0.01, Math.min(0.8, this.volatilityIndex));
    
    // Increase crash probability during high volatility
    this.crashProbability = 0.0001 + (this.volatilityIndex * 0.01);
  }

  private generateMarketEvents() {
    // Market crashes and rallies
    if (Math.random() < this.crashProbability) {
      const eventTypes = ['flash_crash', 'margin_call_cascade', 'whale_dump', 'news_shock', 'circuit_breaker'];
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      this.applyMarketCrash(eventType);
      this.marketEvents.push(`MARKET EVENT: ${eventType.replace('_', ' ').toUpperCase()}`);
    }
    
    // Positive events
    if (Math.random() < 0.0005) {
      const positiveEvents = ['institutional_buying', 'short_squeeze', 'breakout', 'earnings_beat'];
      const eventType = positiveEvents[Math.floor(Math.random() * positiveEvents.length)];
      
      this.applyPositiveEvent(eventType);
      this.marketEvents.push(`BULLISH EVENT: ${eventType.replace('_', ' ').toUpperCase()}`);
    }
  }

  private applyMarketCrash(eventType: string) {
    switch (eventType) {
      case 'flash_crash':
        this.currentPrice *= (0.85 + Math.random() * 0.1); // 5-15% drop
        this.volatilityIndex *= 5;
        this.marketSentiment *= 0.2;
        break;
      case 'margin_call_cascade':
        this.currentPrice *= (0.8 + Math.random() * 0.15); // 5-20% drop
        this.volatilityIndex *= 3;
        break;
      case 'whale_dump':
        this.currentPrice *= (0.9 + Math.random() * 0.05); // 5-10% drop
        this.volume *= 10;
        break;
    }
  }

  private applyPositiveEvent(eventType: string) {
    switch (eventType) {
      case 'short_squeeze':
        this.currentPrice *= (1.05 + Math.random() * 0.2); // 5-25% pump
        this.volatilityIndex *= 2;
        break;
      case 'institutional_buying':
        this.currentPrice *= (1.02 + Math.random() * 0.08); // 2-10% rise
        this.volume *= 5;
        break;
    }
  }

  private generateOrders() {
    this.traders.forEach(trader => {
      if (this.time - trader.lastAction < this.getActionDelay(trader.type)) return;
      
      if (Math.random() < this.getActionProbability(trader.type)) {
        const order = this.generateHumanOrder(trader);
        if (order) {
          this.addOrder(order);
          trader.lastAction = this.time;
        }
      }
    });
  }

  private generateAIOrders() {
    this.aiTraders.forEach(trader => {
      if (this.time - trader.lastAction < this.getAIActionDelay(trader.type)) return;
      
      if (Math.random() < this.getAIActionProbability(trader.type)) {
        const order = this.generateAIOrder(trader);
        if (order) {
          this.addOrder(order);
          trader.lastAction = this.time;
        }
      }
    });
  }

  private generateHumanOrder(trader: TraderType): OrderType | null {
    const baseVariation = this.volatilityIndex;
    let price = this.currentPrice * (1 + (Math.random() - 0.5) * baseVariation);
    let quantity = this.getQuantity(trader);
    let isBuy = Math.random() > 0.5;
    let isShort = false;
    
    // Enhanced human psychology
    switch (trader.type) {
      case 'fearful':
        if (this.currentPrice < this.previousPrice || this.marketSentiment < 0.3) {
          isBuy = Math.random() < 0.1; // Panic selling
          if (!isBuy && trader.shares <= 0 && Math.random() < 0.3) {
            isShort = true; // Fear-driven shorting
          }
        }
        break;
        
      case 'greedy':
      case 'fomo':
        if (this.currentPrice > this.previousPrice || this.marketSentiment > 0.7) {
          isBuy = Math.random() < 0.9; // FOMO buying
          quantity *= 1.5; // Larger positions when greedy
        }
        break;
        
      case 'panic_seller':
        if (this.volatilityIndex > 0.2) {
          isBuy = Math.random() < 0.05; // Almost always sell in volatility
        }
        break;
        
      case 'diamond_hands':
        if (this.currentPrice < this.previousPrice) {
          isBuy = Math.random() < 0.8; // Buy the dip
        }
        isBuy = Math.random() < 0.1; // Rarely sell
        break;
        
      case 'contrarian':
        isBuy = this.marketSentiment < 0.3; // Buy fear, sell greed
        break;
    }
    
    // Handle short selling
    if (isShort || (!isBuy && trader.shares <= 0 && Math.random() < 0.2)) {
      isShort = true;
      isBuy = false;
    }
    
    // Validate order
    if (isBuy && trader.cash < price * quantity) {
      quantity = Math.floor(trader.cash / price);
    } else if (!isBuy && !isShort && trader.shares < quantity) {
      quantity = trader.shares;
    }
    
    if (quantity <= 0) return null;
    
    return {
      type: isBuy ? 'buy' : 'sell',
      price: price,
      quantity: quantity,
      trader: trader.type,
      timestamp: this.time,
      isShort: isShort
    };
  }

  private generateAIOrder(trader: TraderType): OrderType | null {
    const baseVariation = this.volatilityIndex;
    let price = this.currentPrice * (1 + (Math.random() - 0.5) * baseVariation);
    let quantity = this.getAIQuantity(trader);
    let isBuy = Math.random() > 0.5;
    let isShort = false;
    
    // AI trading strategies
    switch (trader.aiPersonality) {
      case 'aggressive':
        if (this.volatilityIndex > 0.3) {
          isBuy = Math.random() < 0.7; // High risk, high reward
          quantity *= 2;
        }
        break;
        
      case 'conservative':
        if (this.marketSentiment > 0.6) {
          isBuy = Math.random() < 0.6; // Cautious buying
        } else {
          isBuy = Math.random() < 0.2; // Conservative selling
        }
        quantity *= 0.5;
        break;
        
      case 'momentum':
        if (this.currentPrice > this.previousPrice) {
          isBuy = Math.random() < 0.8; // Follow the trend
          quantity *= 1.2;
        } else {
          isBuy = Math.random() < 0.2; // Fade the trend
        }
        break;
        
      case 'contrarian':
        isBuy = this.marketSentiment < 0.4; // Buy fear, sell greed
        quantity *= 1.3;
        break;
        
      case 'arbitrage':
        // Placeholder for arbitrage logic
        break;
        
      case 'volatility_trader':
        if (this.volatilityIndex > 0.5) {
          isBuy = Math.random() < 0.5; // Play both sides of volatility
          quantity *= 1.5;
        }
        break;
        
      case 'high_frequency':
        price = isBuy ? this.currentPrice * 0.9995 : this.currentPrice * 1.0005;
        quantity = Math.floor(Math.random() * 500) + 100;
        break;
    }
    
    // Handle short selling
    if (isShort || (!isBuy && trader.shares <= 0 && Math.random() < 0.2)) {
      isShort = true;
      isBuy = false;
    }
    
    // Validate order
    if (isBuy && trader.cash < price * quantity) {
      quantity = Math.floor(trader.cash / price);
    } else if (!isBuy && !isShort && trader.shares < quantity) {
      quantity = trader.shares;
    }
    
    if (quantity <= 0) return null;
    
    return {
      type: isBuy ? 'buy' : 'sell',
      price: price,
      quantity: quantity,
      trader: trader.type,
      timestamp: this.time,
      isShort: isShort
    };
  }

  private getActionDelay(type: string) {
    switch (type) {
      case 'daytrader': return 3;
      case 'institution': return 20;
      case 'fearful': return 2;
      case 'greedy': return 2;
      case 'fomo': return 1;
      case 'panic_seller': return 1;
      case 'contrarian': return 5;
      case 'momentum': return 3;
      case 'diamond_hands': return 30;
      default: return 5;
    }
  }

  private getAIActionDelay(type: string) {
    switch (type) {
      case 'ai_hft': return 1;
      case 'ai_hedge_fund': return 5;
      default: return 5;
    }
  }

  private getActionProbability(type: string) {
    switch (type) {
      case 'daytrader': return 0.4;
      case 'institution': return 0.05;
      case 'fearful': return 0.6;
      case 'greedy': return 0.7;
      case 'fomo': return 0.8;
      case 'panic_seller': return 0.9;
      case 'contrarian': return 0.3;
      case 'momentum': return 0.5;
      case 'diamond_hands': return 0.05;
      default: return 0.1;
    }
  }

  private getAIActionProbability(type: string) {
    switch (type) {
      case 'ai_hft': return 0.9;
      case 'ai_hedge_fund': return 0.4;
      default: return 0.1;
    }
  }

  private getQuantity(trader: TraderType) {
    switch (trader.type) {
      case 'daytrader': return Math.floor(Math.random() * 500) + 50;
      case 'institution': return Math.floor(Math.random() * 5000) + 500;
      case 'fearful': return Math.floor(Math.random() * 200) + 10;
      case 'greedy': return Math.floor(Math.random() * 300) + 20;
      case 'fomo': return Math.floor(Math.random() * 400) + 30;
      case 'panic_seller': return Math.floor(Math.random() * 250) + 15;
      case 'contrarian': return Math.floor(Math.random() * 350) + 25;
      case 'momentum': return Math.floor(Math.random() * 450) + 35;
      case 'diamond_hands': return Math.floor(Math.random() * 100) + 5;
      default: return Math.floor(Math.random() * 100) + 1;
    }
  }

  private getAIQuantity(trader: TraderType) {
    switch (trader.type) {
      case 'ai_hft': return Math.floor(Math.random() * 500) + 100;
      case 'ai_hedge_fund': return Math.floor(Math.random() * 2000) + 500;
      default: return Math.floor(Math.random() * 100) + 1;
    }
  }

  private addOrder(order: OrderType) {
    if (order.type === 'buy') {
      this.orderBook.buys.push(order);
      this.orderBook.buys.sort((a, b) => b.price - a.price);
    } else {
      this.orderBook.sells.push(order);
      this.orderBook.sells.sort((a, b) => a.price - b.price);
    }
  }

  private executeTrades() {
    let tradesExecuted = 0;
    this.volume = 0;
    
    while (this.orderBook.buys.length > 0 && this.orderBook.sells.length > 0) {
      const highestBuy = this.orderBook.buys[0];
      const lowestSell = this.orderBook.sells[0];
      
      if (highestBuy.price >= lowestSell.price) {
        const quantity = Math.min(highestBuy.quantity, lowestSell.quantity);
        const tradePrice = (highestBuy.price + lowestSell.price) / 2;
        
        this.previousPrice = this.currentPrice;
        this.currentPrice = tradePrice;
        this.volume += quantity;
        
        highestBuy.quantity -= quantity;
        lowestSell.quantity -= quantity;
        
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
    
    if (tradesExecuted === 0) {
      this.previousPrice = this.currentPrice;
      this.currentPrice *= (1 + (Math.random() - 0.5) * 0.001);
    }
  }

  executeTrade(type: 'buy' | 'sell', quantity: number, price: number, isShort: boolean = false) {
    const totalCost = quantity * price;
    
    if (type === 'buy') {
      if (isShort) {
        // Covering short position
        const coverAmount = Math.min(quantity, this.portfolio.shortPosition);
        this.portfolio.cash -= coverAmount * price;
        this.portfolio.shortPosition -= coverAmount;
        
        if (quantity > coverAmount) {
          // Buying additional shares
          const buyAmount = quantity - coverAmount;
          this.portfolio.cash -= buyAmount * price;
          this.portfolio.shares += buyAmount;
        }
      } else {
        // Regular buy
        if (this.portfolio.cash >= totalCost) {
          this.portfolio.cash -= totalCost;
          this.portfolio.shares += quantity;
        }
      }
      
      this.addOrder({
        type: 'buy',
        price: price * 1.002,
        quantity: quantity,
        trader: 'player',
        timestamp: this.time
      });
      
    } else {
      if (isShort) {
        // Short selling
        this.portfolio.cash += totalCost;
        this.portfolio.shortPosition += quantity;
      } else {
        // Regular sell
        if (this.portfolio.shares >= quantity) {
          this.portfolio.cash += totalCost;
          this.portfolio.shares -= quantity;
        }
      }
      
      this.addOrder({
        type: 'sell',
        price: price * 0.998,
        quantity: quantity,
        trader: 'player',
        timestamp: this.time,
        isShort: isShort
      });
    }
    
    // Market impact from player trades
    const marketImpact = quantity / 10000; // Larger trades have more impact
    if (type === 'buy') {
      this.currentPrice *= (1 + marketImpact * 0.01);
      this.volume += quantity;
    } else {
      this.currentPrice *= (1 - marketImpact * 0.01);
      this.volume += quantity;
    }
    
    this.updatePortfolio();
  }

  private cleanOrderBook() {
    const maxAge = 100;
    this.orderBook.buys = this.orderBook.buys.filter(order => 
      this.time - order.timestamp < maxAge
    );
    this.orderBook.sells = this.orderBook.sells.filter(order => 
      this.time - order.timestamp < maxAge
    );
    
    this.orderBook.buys = this.orderBook.buys.slice(0, 20);
    this.orderBook.sells = this.orderBook.sells.slice(0, 20);
  }

  private updateCandlestick() {
    if (Date.now() - this.candleStartTime >= 60000) {
      // Save current candle
      if (this.currentCandle) {
        this.candlestickData.push(this.currentCandle);
        this.candlestickData = this.candlestickData.slice(-200);
      }
      
      // Start new candle
      this.candleStartTime = Date.now();
      this.currentCandle = {
        open: this.currentPrice,
        high: this.currentPrice,
        low: this.currentPrice,
        close: this.currentPrice,
        volume: 0,
        timestamp: this.candleStartTime
      };
    } else {
      // Update current candle
      if (this.currentCandle) {
        this.currentCandle.high = Math.max(this.currentCandle.high, this.currentPrice);
        this.currentCandle.low = Math.min(this.currentCandle.low, this.currentPrice);
        this.currentCandle.close = this.currentPrice;
        this.currentCandle.volume += this.volume;
      }
    }
  }

  private updatePortfolio() {
    const longValue = this.portfolio.shares * this.currentPrice;
    const shortValue = this.portfolio.shortPosition * this.currentPrice;
    this.portfolio.totalValue = this.portfolio.cash + longValue - shortValue;
    this.portfolio.pnl = this.portfolio.totalValue - 10000000;
    this.portfolio.pnlPercent = (this.portfolio.pnl / 10000000) * 100;
    
    this.onPortfolioUpdate(this.portfolio);
  }

  private updateCallbacks() {
    this.updatePortfolio();
    
    // Fix the type issue by explicitly typing the mapped objects
    const orders: OrderType[] = [
      ...this.orderBook.buys.map(order => ({ ...order, type: 'buy' as const })),
      ...this.orderBook.sells.map(order => ({ ...order, type: 'sell' as const }))
    ];
    
    this.onOrderBookUpdate(orders);
  }

  private updateMarketData() {
    const change = this.currentPrice - this.previousPrice;
    const changePercent = (change / this.previousPrice) * 100;
    
    this.onPriceUpdate({
      price: this.currentPrice,
      volume: this.volume,
      change: change,
      changePercent: changePercent,
      timestamp: this.time,
      marketSentiment: this.marketSentiment,
      volatilityIndex: this.volatilityIndex,
      candlestickData: this.candlestickData,
      currentCandle: this.currentCandle,
      marketEvents: this.marketEvents.slice(-10),
      geminiAIStatus: this.geminiAI?.getStatus()
    });
  }
}
