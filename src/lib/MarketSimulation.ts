import { NeuralNetworkTrader } from './NeuralNetworkTrader';

interface TraderType {
  type: string;
  lastAction: number;
  cash: number;
  shares: number;
  shortPosition?: number;
  strategy: number;
  aiPersonality?: string;
}

interface OrderType {
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  trader: string;
  timestamp: number;
  isShort?: boolean;
  reasoning?: string;
  isAI?: boolean;
  confidence?: number;
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
    shortPosition: number;
    totalValue: number;
    pnl: number;
    pnlPercent: number;
  };
  
  private traders: TraderType[] = [];
  private aiTraders: TraderType[] = [];
  private institutionalMarketMakers: TraderType[] = [];
  private neuralNetworkTrader: NeuralNetworkTrader | null = null;
  private marketEvents: string[] = [];
  private candlestickData: any[] = [];
  private currentCandle: any = null;
  private candleStartTime: number = 0;
  private marketSentiment: number = 0.5;
  private volatilityIndex: number = 0.1;
  private crashProbability: number = 0.001;
  private dailyVolumeTarget: number = 7000000000000; // $7 trillion daily target
  private currentDailyVolume: number = 0;
  private dayStartTime: number = Date.now();

  constructor({ onPriceUpdate, onOrderBookUpdate, onPortfolioUpdate }: {
    onPriceUpdate: (data: any) => void;
    onOrderBookUpdate: (orders: OrderType[]) => void;
    onPortfolioUpdate: (portfolio: any) => void;
  }) {
    this.onPriceUpdate = onPriceUpdate;
    this.onOrderBookUpdate = onOrderBookUpdate;
    this.onPortfolioUpdate = onPortfolioUpdate;
    
    this.orderBook = { buys: [], sells: [] };
    
    // Player starts with $3 trillion
    this.portfolio = {
      cash: 3000000000000,
      shares: 0,
      shortPosition: 0,
      totalValue: 3000000000000,
      pnl: 0,
      pnlPercent: 0
    };
    
    try {
      this.neuralNetworkTrader = new NeuralNetworkTrader();
    } catch (error) {
      console.error('Failed to initialize Neural Network Trader:', error);
    }
    
    this.initializeTraders();
    this.initializeAITraders();
    this.initializeInstitutionalMarketMakers();
    this.initializeCandlestick();
    this.updateCallbacks();
  }

  private getRandomTraderType() {
    const types = ['fearful', 'greedy', 'fomo', 'panic_seller', 'contrarian', 'momentum', 'diamond_hands'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private getMarketMakerPersonality() {
    const personalities = ['aggressive_whale', 'conservative_institutional', 'momentum_hunter', 'contrarian_titan', 'volatility_master', 'arbitrage_king'];
    return personalities[Math.floor(Math.random() * personalities.length)];
  }

  private initializeTraders() {
    // Enhanced retail traders with more capital
    for (let i = 0; i < 8000; i++) {
      this.traders.push({
        type: this.getRandomTraderType(),
        lastAction: 0,
        cash: Math.random() * 50000000 + 5000000, // $5M to $55M
        shares: Math.floor(Math.random() * 100000),
        shortPosition: 0,
        strategy: Math.random()
      });
    }
    
    // Mega institutional players
    for (let i = 0; i < 300; i++) {
      this.traders.push({
        type: 'mega_institution',
        lastAction: 0,
        cash: Math.random() * 100000000000 + 20000000000, // $20B to $120B
        shares: Math.floor(Math.random() * 1000000),
        shortPosition: 0,
        strategy: Math.random()
      });
    }
    
    // Professional day traders
    for (let i = 0; i < 3000; i++) {
      this.traders.push({
        type: 'pro_daytrader',
        lastAction: 0,
        cash: Math.random() * 500000000 + 100000000, // $100M to $600M
        shares: Math.floor(Math.random() * 200000),
        shortPosition: 0,
        strategy: Math.random()
      });
    }
  }

  private initializeInstitutionalMarketMakers() {
    // 500 institutional market makers with exactly $10B each
    for (let i = 0; i < 500; i++) {
      this.institutionalMarketMakers.push({
        type: 'institutional_market_maker',
        lastAction: 0,
        cash: 10000000000, // Exactly $10B each
        shares: Math.floor(Math.random() * 2000000),
        shortPosition: 0,
        strategy: Math.random(),
        aiPersonality: this.getMarketMakerPersonality()
      });
    }
  }

  private initializeAITraders() {
    // Enhanced AI hedge funds with massive capital
    const personalities = ['aggressive', 'conservative', 'momentum', 'contrarian', 'arbitrage', 'volatility_trader'];
    
    for (let i = 0; i < 25; i++) {
      this.aiTraders.push({
        type: 'ai_mega_fund',
        lastAction: 0,
        cash: Math.random() * 500000000000 + 100000000000, // $100B to $600B
        shares: Math.floor(Math.random() * 5000000),
        shortPosition: 0,
        strategy: Math.random(),
        aiPersonality: personalities[Math.floor(Math.random() * personalities.length)]
      });
    }
    
    // High-frequency trading AIs with substantial capital
    for (let i = 0; i < 15; i++) {
      this.aiTraders.push({
        type: 'ai_hft_titan',
        lastAction: 0,
        cash: Math.random() * 200000000000 + 50000000000, // $50B to $250B
        shares: Math.floor(Math.random() * 1000000),
        shortPosition: 0,
        strategy: Math.random(),
        aiPersonality: 'high_frequency_titan'
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
      cash: 3000000000000, // Reset to $3 trillion
      shares: 0,
      shortPosition: 0,
      totalValue: 3000000000000,
      pnl: 0,
      pnlPercent: 0
    };
    this.traders = [];
    this.aiTraders = [];
    this.institutionalMarketMakers = [];
    this.marketEvents = [];
    this.candlestickData = [];
    this.currentCandle = null;
    this.candleStartTime = 0;
    this.marketSentiment = 0.5;
    this.volatilityIndex = 0.1;
    this.neuralNetworkTrader = null;
    this.currentDailyVolume = 0;
    this.dayStartTime = Date.now();
    
    try {
      this.neuralNetworkTrader = new NeuralNetworkTrader();
    } catch (error) {
      console.error('Failed to initialize Neural Network Trader:', error);
    }
    
    this.initializeTraders();
    this.initializeAITraders();
    this.initializeInstitutionalMarketMakers();
    this.initializeCandlestick();
    this.updateCallbacks();
  }

  private async simulate() {
    if (!this.isRunning) return;

    this.time++;
    
    // Reset daily volume every 24 hours (simulated as 1440 time units)
    if (this.time % 1440 === 0) {
      this.currentDailyVolume = 0;
      this.dayStartTime = Date.now();
    }
    
    this.updateMarketConditions();
    this.generateMarketEvents();
    this.generateOrders();
    this.generateAIOrders();
    this.generateInstitutionalMarketMakerOrders();
    
    // Neural Network Trader decisions - more frequent for market impact
    if (this.neuralNetworkTrader && this.time % 15 === 0) {
      try {
        const aiOrder = await this.neuralNetworkTrader.makeMarketDecision({
          price: this.currentPrice,
          volume: this.volume,
          changePercent: ((this.currentPrice - this.previousPrice) / this.previousPrice) * 100,
          marketSentiment: this.marketSentiment,
          volatilityIndex: this.volatilityIndex
        });
        
        if (aiOrder) {
          this.addOrder(aiOrder);
          this.marketEvents.push(`Neural Network: ${aiOrder.reasoning} (${Math.round(aiOrder.confidence! * 100)}% confidence)`);
        }
      } catch (error) {
        console.error('Neural Network Trader Error:', error);
      }
    }
    
    this.executeTrades();
    this.updateCandlestick();
    this.cleanOrderBook();
    this.updateMarketData();
    this.updateCallbacks();
    
    setTimeout(() => this.simulate(), 100);
  }

  private generateInstitutionalMarketMakerOrders() {
    this.institutionalMarketMakers.forEach(marketMaker => {
      if (this.time - marketMaker.lastAction < 8) return; // More frequent trading
      
      if (Math.random() < 0.7) { // High probability of action
        const order = this.generateMarketMakerOrder(marketMaker);
        if (order) {
          this.addOrder(order);
          marketMaker.lastAction = this.time;
          
          // Log major market maker moves
          if (order.quantity * order.price > 1000000000) { // $1B+ orders
            this.marketEvents.push(`INSTITUTIONAL MM: ${marketMaker.aiPersonality} places $${(order.quantity * order.price / 1000000000).toFixed(1)}B ${order.type.toUpperCase()} order`);
          }
        }
      }
    });
  }

  private generateMarketMakerOrder(marketMaker: TraderType): OrderType | null {
    const baseVariation = this.volatilityIndex;
    let price = this.currentPrice * (1 + (Math.random() - 0.5) * baseVariation);
    
    // Minimum $5B position size
    const minPositionValue = 5000000000;
    let quantity = Math.floor(minPositionValue / price) + Math.floor(Math.random() * (minPositionValue * 2) / price);
    
    let isBuy = Math.random() > 0.5;
    let isShort = false;
    
    // Market maker personality-based trading
    switch (marketMaker.aiPersonality) {
      case 'aggressive_whale':
        quantity *= 3; // Massive positions
        if (this.volatilityIndex > 0.3) {
          isBuy = Math.random() < 0.8; // Aggressive buying in volatility
        }
        break;
        
      case 'conservative_institutional':
        quantity *= 1.2; // Still large but more conservative
        if (this.marketSentiment > 0.7) {
          isBuy = Math.random() < 0.7;
        } else if (this.marketSentiment < 0.3) {
          isBuy = Math.random() < 0.2;
        }
        break;
        
      case 'momentum_hunter':
        quantity *= 2;
        if (this.currentPrice > this.previousPrice) {
          isBuy = Math.random() < 0.85; // Follow momentum
        } else {
          isBuy = Math.random() < 0.15;
        }
        break;
        
      case 'contrarian_titan':
        quantity *= 2.5;
        isBuy = this.marketSentiment < 0.3; // Buy fear, sell greed
        break;
        
      case 'volatility_master':
        if (this.volatilityIndex > 0.4) {
          quantity *= 4; // Massive positions during volatility
          isBuy = Math.random() < 0.5; // Play both sides
        }
        break;
        
      case 'arbitrage_king':
        quantity *= 1.5;
        // More complex arbitrage logic would go here
        break;
    }
    
    // Handle short selling for market makers
    if (!isBuy && marketMaker.shares <= quantity * 0.5 && Math.random() < 0.4) {
      isShort = true;
    }
    
    // Validate order size
    const totalCost = quantity * price;
    if (isBuy && marketMaker.cash < totalCost) {
      quantity = Math.floor(marketMaker.cash / price);
    } else if (!isBuy && !isShort && marketMaker.shares < quantity) {
      quantity = marketMaker.shares;
    }
    
    if (quantity <= 0 || totalCost < minPositionValue) return null;
    
    return {
      type: isBuy ? 'buy' : 'sell',
      price: price,
      quantity: quantity,
      trader: `mm_${marketMaker.aiPersonality}`,
      timestamp: this.time,
      isShort: isShort,
      isAI: true
    };
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
      case 'pro_daytrader': return Math.floor(Math.random() * 50000) + 10000;
      case 'mega_institution': return Math.floor(Math.random() * 500000) + 100000;
      case 'fearful': return Math.floor(Math.random() * 20000) + 5000;
      case 'greedy': return Math.floor(Math.random() * 30000) + 8000;
      case 'fomo': return Math.floor(Math.random() * 40000) + 10000;
      case 'panic_seller': return Math.floor(Math.random() * 25000) + 7000;
      case 'contrarian': return Math.floor(Math.random() * 35000) + 9000;
      case 'momentum': return Math.floor(Math.random() * 45000) + 12000;
      case 'diamond_hands': return Math.floor(Math.random() * 15000) + 3000;
      default: return Math.floor(Math.random() * 10000) + 1000;
    }
  }

  private getAIQuantity(trader: TraderType) {
    switch (trader.type) {
      case 'ai_hft_titan': return Math.floor(Math.random() * 100000) + 50000;
      case 'ai_mega_fund': return Math.floor(Math.random() * 1000000) + 200000;
      default: return Math.floor(Math.random() * 50000) + 10000;
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
        const coverAmount = Math.min(quantity, this.portfolio.shortPosition);
        this.portfolio.cash -= coverAmount * price;
        this.portfolio.shortPosition -= coverAmount;
        
        if (quantity > coverAmount) {
          const buyAmount = quantity - coverAmount;
          this.portfolio.cash -= buyAmount * price;
          this.portfolio.shares += buyAmount;
        }
      } else {
        if (this.portfolio.cash >= totalCost) {
          this.portfolio.cash -= totalCost;
          this.portfolio.shares += quantity;
        }
      }
      
      this.addOrder({
        type: 'buy',
        price: price * 1.002,
        quantity: quantity,
        trader: 'mega_player',
        timestamp: this.time
      });
      
    } else {
      if (isShort) {
        this.portfolio.cash += totalCost;
        this.portfolio.shortPosition += quantity;
      } else {
        if (this.portfolio.shares >= quantity) {
          this.portfolio.cash += totalCost;
          this.portfolio.shares -= quantity;
        }
      }
      
      this.addOrder({
        type: 'sell',
        price: price * 0.998,
        quantity: quantity,
        trader: 'mega_player',
        timestamp: this.time,
        isShort: isShort
      });
    }
    
    // Massive market impact from trillion-dollar player trades
    const marketImpact = (quantity * price) / 1000000000000; // Impact based on trade size in trillions
    if (type === 'buy') {
      this.currentPrice *= (1 + marketImpact * 0.1);
      this.volume += quantity;
      this.currentDailyVolume += quantity * price;
    } else {
      this.currentPrice *= (1 - marketImpact * 0.1);
      this.volume += quantity;
      this.currentDailyVolume += quantity * price;
    }
    
    // Log massive trades
    if (totalCost > 10000000000) { // $10B+ trades
      this.marketEvents.push(`MEGA PLAYER: $${(totalCost / 1000000000).toFixed(1)}B ${type.toUpperCase()} order moves market ${((this.currentPrice - this.previousPrice) / this.previousPrice * 100).toFixed(2)}%`);
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
    this.portfolio.pnl = this.portfolio.totalValue - 3000000000000; // Starting capital
    this.portfolio.pnlPercent = (this.portfolio.pnl / 3000000000000) * 100;
    
    this.onPortfolioUpdate(this.portfolio);
  }

  private updateCallbacks() {
    this.updatePortfolio();
    
    // Fix the type issue by explicitly typing the mapped objects to OrderType
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
      neuralNetworkStatus: this.neuralNetworkTrader?.getStatus()
    });
  }
}
