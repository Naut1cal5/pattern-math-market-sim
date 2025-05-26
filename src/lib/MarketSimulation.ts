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

interface BusinessCycle {
  phase: 'expansion' | 'peak' | 'contraction' | 'trough';
  duration: number;
  currentTime: number;
  gdpGrowth: number;
  inflation: number;
  unemployment: number;
}

interface GovernmentPolicy {
  type: 'monetary' | 'fiscal' | 'regulatory' | 'trade';
  impact: number;
  duration: number;
  description: string;
}

interface MarketMakerCollective {
  currentDirection: 'bullish' | 'bearish' | 'accumulation' | 'distribution';
  trendStrength: number;
  coordinatedAction: 'buy_pressure' | 'sell_pressure' | 'volatility_creation' | 'trend_continuation';
  profitTarget: number;
  currentProfits: number;
  trendDuration: number;
  nextTrendChange: number;
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
  private crashProbability: number = 0.02;
  private majorEventProbability: number = 0.01;
  private dailyVolumeTarget: number = 7000000000000;
  private currentDailyVolume: number = 0;
  private dayStartTime: number = Date.now();
  private startingCapital: number = 3000000000000;

  private businessCycle: BusinessCycle = {
    phase: 'expansion',
    duration: 2000,
    currentTime: 0,
    gdpGrowth: 0.025,
    inflation: 0.02,
    unemployment: 0.05
  };
  
  private activePolicies: GovernmentPolicy[] = [];
  private marketTrend: number = 0;
  private trendStrength: number = 0;

  // New market maker collective properties
  private marketMakerCollective: MarketMakerCollective = {
    currentDirection: 'bullish',
    trendStrength: 0.7,
    coordinatedAction: 'buy_pressure',
    profitTarget: 50000000000, // $50B profit target
    currentProfits: 0,
    trendDuration: 0,
    nextTrendChange: Math.floor(Math.random() * 800) + 400 // 400-1200 time units
  };

  private priceHistory: number[] = [];
  private trendMomentum: number = 0;

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
      cash: this.startingCapital,
      shares: 0,
      shortPosition: 0,
      totalValue: this.startingCapital,
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

  public setStartingCapital(amount: number) {
    this.startingCapital = amount;
    this.portfolio.cash = amount;
    this.portfolio.totalValue = amount;
    this.portfolio.pnl = 0;
    this.portfolio.pnlPercent = 0;
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
    for (let i = 0; i < 8000; i++) {
      this.traders.push({
        type: this.getRandomTraderType(),
        lastAction: 0,
        cash: Math.random() * 50000000 + 5000000,
        shares: Math.floor(Math.random() * 100000),
        shortPosition: 0,
        strategy: Math.random()
      });
    }
    
    for (let i = 0; i < 300; i++) {
      this.traders.push({
        type: 'mega_institution',
        lastAction: 0,
        cash: Math.random() * 100000000000 + 20000000000,
        shares: Math.floor(Math.random() * 1000000),
        shortPosition: 0,
        strategy: Math.random()
      });
    }
    
    for (let i = 0; i < 3000; i++) {
      this.traders.push({
        type: 'pro_daytrader',
        lastAction: 0,
        cash: Math.random() * 500000000 + 100000000,
        shares: Math.floor(Math.random() * 200000),
        shortPosition: 0,
        strategy: Math.random()
      });
    }
  }

  private initializeInstitutionalMarketMakers() {
    for (let i = 0; i < 500; i++) {
      this.institutionalMarketMakers.push({
        type: 'institutional_market_maker',
        lastAction: 0,
        cash: 10000000000,
        shares: Math.floor(Math.random() * 2000000),
        shortPosition: 0,
        strategy: Math.random(),
        aiPersonality: this.getMarketMakerPersonality()
      });
    }
  }

  private initializeAITraders() {
    const personalities = ['aggressive', 'conservative', 'momentum', 'contrarian', 'arbitrage', 'volatility_trader'];
    
    for (let i = 0; i < 25; i++) {
      this.aiTraders.push({
        type: 'ai_mega_fund',
        lastAction: 0,
        cash: Math.random() * 500000000000 + 100000000000,
        shares: Math.floor(Math.random() * 5000000),
        shortPosition: 0,
        strategy: Math.random(),
        aiPersonality: personalities[Math.floor(Math.random() * personalities.length)]
      });
    }
    
    for (let i = 0; i < 15; i++) {
      this.aiTraders.push({
        type: 'ai_hft_titan',
        lastAction: 0,
        cash: Math.random() * 200000000000 + 50000000000,
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
      cash: this.startingCapital,
      shares: 0,
      shortPosition: 0,
      totalValue: this.startingCapital,
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
    this.businessCycle = {
      phase: 'expansion',
      duration: 2000,
      currentTime: 0,
      gdpGrowth: 0.025,
      inflation: 0.02,
      unemployment: 0.05
    };
    this.activePolicies = [];
    this.marketTrend = 0;
    this.trendStrength = 0;
    
    // Reset market maker collective
    this.marketMakerCollective = {
      currentDirection: 'bullish',
      trendStrength: 0.7,
      coordinatedAction: 'buy_pressure',
      profitTarget: 50000000000,
      currentProfits: 0,
      trendDuration: 0,
      nextTrendChange: Math.floor(Math.random() * 800) + 400
    };
    
    this.priceHistory = [];
    this.trendMomentum = 0;
    
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
    
    if (this.time % 1440 === 0) {
      this.currentDailyVolume = 0;
      this.dayStartTime = Date.now();
    }
    
    // Update price history for trend analysis
    this.priceHistory.push(this.currentPrice);
    if (this.priceHistory.length > 100) {
      this.priceHistory.shift();
    }
    
    this.updateMarketMakerCollective();
    this.updateBusinessCycle();
    this.updateMarketTrends();
    this.generateGovernmentPolicyEvents();
    this.updateMarketConditions();
    this.generateHugeMarketEvents();
    this.generateOrders();
    this.generateAIOrders();
    this.generateCoordinatedMarketMakerOrders();
    
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
    
    this.executeRealisticTrades();
    this.updateCandlestick();
    this.cleanOrderBook();
    this.updateMarketData();
    this.updateCallbacks();
    
    setTimeout(() => this.simulate(), 100);
  }

  private updateMarketMakerCollective() {
    this.marketMakerCollective.trendDuration++;
    
    // Check if it's time to change trend direction
    if (this.marketMakerCollective.trendDuration >= this.marketMakerCollective.nextTrendChange) {
      this.changeTrendDirection();
    }
    
    // Update trend momentum based on collective action
    switch (this.marketMakerCollective.coordinatedAction) {
      case 'buy_pressure':
        this.trendMomentum += 0.02 * this.marketMakerCollective.trendStrength;
        break;
      case 'sell_pressure':
        this.trendMomentum -= 0.02 * this.marketMakerCollective.trendStrength;
        break;
      case 'volatility_creation':
        this.trendMomentum += (Math.random() - 0.5) * 0.04 * this.marketMakerCollective.trendStrength;
        break;
      case 'trend_continuation':
        this.trendMomentum += this.trendMomentum > 0 ? 0.01 : -0.01;
        break;
    }
    
    // Cap trend momentum
    this.trendMomentum = Math.max(-0.5, Math.min(0.5, this.trendMomentum));
    
    // Apply trend momentum to price
    this.currentPrice *= (1 + this.trendMomentum * 0.1);
    
    // Calculate profits for market makers
    const priceChange = this.currentPrice - (this.priceHistory[0] || this.currentPrice);
    const profitFromTrend = Math.abs(priceChange) * 1000000; // Profit calculation
    this.marketMakerCollective.currentProfits += profitFromTrend;
  }

  private changeTrendDirection() {
    const directions: ('bullish' | 'bearish' | 'accumulation' | 'distribution')[] = ['bullish', 'bearish', 'accumulation', 'distribution'];
    const actions: ('buy_pressure' | 'sell_pressure' | 'volatility_creation' | 'trend_continuation')[] = ['buy_pressure', 'sell_pressure', 'volatility_creation', 'trend_continuation'];
    
    // Choose new direction (avoid same direction)
    let newDirection = directions[Math.floor(Math.random() * directions.length)];
    while (newDirection === this.marketMakerCollective.currentDirection && Math.random() < 0.7) {
      newDirection = directions[Math.floor(Math.random() * directions.length)];
    }
    
    this.marketMakerCollective.currentDirection = newDirection;
    this.marketMakerCollective.trendStrength = 0.6 + Math.random() * 0.4; // 60-100% strength
    this.marketMakerCollective.trendDuration = 0;
    this.marketMakerCollective.nextTrendChange = Math.floor(Math.random() * 1000) + 500; // 500-1500 time units
    
    // Set coordinated action based on direction
    switch (newDirection) {
      case 'bullish':
        this.marketMakerCollective.coordinatedAction = 'buy_pressure';
        this.trendMomentum = 0.1;
        break;
      case 'bearish':
        this.marketMakerCollective.coordinatedAction = 'sell_pressure';
        this.trendMomentum = -0.1;
        break;
      case 'accumulation':
        this.marketMakerCollective.coordinatedAction = 'buy_pressure';
        this.trendMomentum = 0.05;
        break;
      case 'distribution':
        this.marketMakerCollective.coordinatedAction = 'sell_pressure';
        this.trendMomentum = -0.05;
        break;
    }
    
    const trendMessages = {
      bullish: '🚀 MARKET MAKERS: Coordinated bullish campaign initiated - massive buying pressure',
      bearish: '🐻 MARKET MAKERS: Bear raid underway - coordinated selling pressure',
      accumulation: '📈 MARKET MAKERS: Accumulation phase - smart money buying dips',
      distribution: '📉 MARKET MAKERS: Distribution phase - taking profits at highs'
    };
    
    this.marketEvents.push(trendMessages[newDirection]);
  }

  private generateCoordinatedMarketMakerOrders() {
    // Market makers coordinate their actions based on collective strategy
    const coordinationStrength = this.marketMakerCollective.trendStrength;
    
    this.institutionalMarketMakers.forEach((marketMaker, index) => {
      if (this.time - marketMaker.lastAction < 3) return; // Faster execution
      
      if (Math.random() < 0.9) { // Very high activity rate
        const order = this.generateCoordinatedMarketMakerOrder(marketMaker, index);
        if (order) {
          this.addOrder(order);
          marketMaker.lastAction = this.time;
        }
      }
    });
  }

  private generateCoordinatedMarketMakerOrder(marketMaker: TraderType, index: number): OrderType | null {
    const collective = this.marketMakerCollective;
    const baseVariation = Math.min(0.02, this.volatilityIndex * 0.5); // Tighter spreads
    let price = this.currentPrice * (1 + (Math.random() - 0.5) * baseVariation);
    
    // Large position sizes - market makers have deep pockets
    const minPositionValue = 15000000000; // $15B minimum
    let quantity = Math.floor(minPositionValue / price) + Math.floor(Math.random() * (minPositionValue) / price);
    
    let isBuy = Math.random() > 0.5;
    let isShort = false;
    
    // Coordinate based on collective direction
    const coordinationFactor = Math.random() < collective.trendStrength ? 1 : 0;
    
    if (coordinationFactor) {
      switch (collective.coordinatedAction) {
        case 'buy_pressure':
          isBuy = Math.random() < 0.85; // Strong buy bias
          quantity *= 1.5; // Larger orders
          break;
        case 'sell_pressure':
          isBuy = Math.random() < 0.15; // Strong sell bias
          quantity *= 1.5;
          break;
        case 'volatility_creation':
          // Create volatility with alternating large orders
          isBuy = (index + this.time) % 2 === 0;
          quantity *= 2;
          break;
        case 'trend_continuation':
          // Follow the existing momentum
          if (this.trendMomentum > 0) {
            isBuy = Math.random() < 0.75;
          } else {
            isBuy = Math.random() < 0.25;
          }
          break;
      }
    }
    
    // Market maker personalities still matter but less so during coordination
    const personalityWeight = 1 - (collective.trendStrength * 0.7);
    
    switch (marketMaker.aiPersonality) {
      case 'aggressive_whale':
        quantity *= 2.5;
        if (Math.random() < personalityWeight) {
          isBuy = this.volatilityIndex > 0.3 ? Math.random() < 0.8 : isBuy;
        }
        break;
        
      case 'momentum_hunter':
        quantity *= 2;
        if (Math.random() < personalityWeight) {
          if (this.currentPrice > this.previousPrice) {
            isBuy = Math.random() < 0.85;
          } else {
            isBuy = Math.random() < 0.15;
          }
        }
        break;
        
      case 'contrarian_titan':
        quantity *= 2;
        if (Math.random() < personalityWeight) {
          // Only contrarian during low coordination
          isBuy = collective.coordinatedAction === 'sell_pressure' && Math.random() < 0.3;
        }
        break;
        
      case 'volatility_master':
        if (this.volatilityIndex > 0.2) {
          quantity *= 3;
        }
        break;
    }
    
    // Ensure market makers always have enough capital
    if (isBuy && marketMaker.cash < price * quantity) {
      marketMaker.cash += 10000000000; // Add more capital
      quantity = Math.floor(marketMaker.cash * 0.8 / price); // Use 80% of capital
    } else if (!isBuy && !isShort && marketMaker.shares < quantity) {
      if (Math.random() < 0.6) {
        isShort = true; // Market makers can short
      } else {
        quantity = marketMaker.shares;
      }
    }
    
    if (quantity <= 0) return null;
    
    // Update market maker's position
    if (isBuy) {
      marketMaker.cash -= quantity * price;
      marketMaker.shares += quantity;
    } else {
      if (isShort) {
        marketMaker.cash += quantity * price;
        marketMaker.shortPosition = (marketMaker.shortPosition || 0) + quantity;
      } else {
        marketMaker.cash += quantity * price;
        marketMaker.shares -= quantity;
      }
    }
    
    return {
      type: isBuy ? 'buy' : 'sell',
      price: price,
      quantity: quantity,
      trader: `coordinated_mm_${marketMaker.aiPersonality}`,
      timestamp: this.time,
      isShort: isShort,
      isAI: true
    };
  }

  private updateBusinessCycle() {
    this.businessCycle.currentTime++;
    
    if (this.businessCycle.currentTime >= this.businessCycle.duration) {
      this.transitionBusinessCycle();
    }
    
    this.applyBusinessCycleEffects();
  }

  private transitionBusinessCycle() {
    this.businessCycle.currentTime = 0;
    
    switch (this.businessCycle.phase) {
      case 'expansion':
        this.businessCycle.phase = 'peak';
        this.businessCycle.gdpGrowth = 0.04;
        this.businessCycle.inflation = 0.035;
        this.businessCycle.unemployment = 0.03;
        this.marketEvents.push(`📈 BUSINESS CYCLE: Economy reaches PEAK - GDP growth at 4%, inflation rising`);
        break;
        
      case 'peak':
        this.businessCycle.phase = 'contraction';
        this.businessCycle.gdpGrowth = -0.02;
        this.businessCycle.inflation = 0.015;
        this.businessCycle.unemployment = 0.08;
        this.marketEvents.push(`📉 BUSINESS CYCLE: Economy enters CONTRACTION - GDP falling, unemployment rising`);
        break;
        
      case 'contraction':
        this.businessCycle.phase = 'trough';
        this.businessCycle.gdpGrowth = -0.03;
        this.businessCycle.inflation = 0.005;
        this.businessCycle.unemployment = 0.12;
        this.marketEvents.push(`🕳️ BUSINESS CYCLE: Economy hits TROUGH - Maximum unemployment, deflation risk`);
        break;
        
      case 'trough':
        this.businessCycle.phase = 'expansion';
        this.businessCycle.gdpGrowth = 0.025;
        this.businessCycle.inflation = 0.02;
        this.businessCycle.unemployment = 0.05;
        this.marketEvents.push(`🚀 BUSINESS CYCLE: Economy begins EXPANSION - Recovery underway, growth resuming`);
        break;
    }
  }

  private applyBusinessCycleEffects() {
    let cycleMultiplier = 1;
    let sentimentImpact = 0;
    
    switch (this.businessCycle.phase) {
      case 'expansion':
        cycleMultiplier = 1 + (this.businessCycle.gdpGrowth * 0.5);
        sentimentImpact = 0.001;
        break;
      case 'peak':
        cycleMultiplier = 1 + (this.businessCycle.gdpGrowth * 0.3);
        sentimentImpact = -0.0005;
        break;
      case 'contraction':
        cycleMultiplier = 1 + (this.businessCycle.gdpGrowth * 0.8);
        sentimentImpact = -0.002;
        break;
      case 'trough':
        cycleMultiplier = 1 + (this.businessCycle.gdpGrowth * 0.6);
        sentimentImpact = -0.001;
        break;
    }
    
    this.currentPrice *= cycleMultiplier;
    this.marketSentiment = Math.max(0, Math.min(1, this.marketSentiment + sentimentImpact));
  }

  private updateMarketTrends() {
    if (Math.random() < 0.005) {
      this.marketTrend = (Math.random() - 0.5) * 2;
      this.trendStrength = Math.random();
      
      const trendDirection = this.marketTrend > 0 ? 'BULLISH' : 'BEARISH';
      const strength = this.trendStrength > 0.7 ? 'STRONG' : this.trendStrength > 0.4 ? 'MODERATE' : 'WEAK';
      this.marketEvents.push(`📊 TREND SHIFT: ${strength} ${trendDirection} trend emerging`);
    }
    
    if (this.trendStrength > 0.1) {
      const trendImpact = this.marketTrend * this.trendStrength * 0.0001;
      this.currentPrice *= (1 + trendImpact);
    }
  }

  private generateGovernmentPolicyEvents() {
    if (Math.random() < 0.003) {
      const policyEvent = this.generateRandomPolicy();
      this.activePolicies.push(policyEvent);
      this.applyPolicyImpact(policyEvent);
    }
    
    this.activePolicies = this.activePolicies.filter(policy => {
      policy.duration--;
      return policy.duration > 0;
    });
  }

  private generateRandomPolicy(): GovernmentPolicy {
    const policyTypes = ['monetary', 'fiscal', 'regulatory', 'trade'];
    const type = policyTypes[Math.floor(Math.random() * policyTypes.length)] as any;
    
    let impact = (Math.random() - 0.5) * 0.3;
    let duration = Math.floor(Math.random() * 200) + 100;
    let description = '';
    
    switch (type) {
      case 'monetary':
        if (impact > 0) {
          description = `FED CUTS RATES: ${Math.abs(impact * 100).toFixed(1)}% stimulus - Markets rally`;
        } else {
          description = `FED RAISES RATES: ${Math.abs(impact * 100).toFixed(1)}% hike - Tightening cycle begins`;
        }
        break;
        
      case 'fiscal':
        if (impact > 0) {
          description = `FISCAL STIMULUS: $${Math.abs(impact * 10).toFixed(1)}T spending package approved`;
        } else {
          description = `AUSTERITY MEASURES: Government cuts spending by $${Math.abs(impact * 5).toFixed(1)}T`;
        }
        break;
        
      case 'regulatory':
        if (impact > 0) {
          description = `DEREGULATION: Major industry regulations relaxed - Business optimism soars`;
        } else {
          description = `NEW REGULATIONS: Strict compliance requirements imposed - Costs rising`;
        }
        break;
        
      case 'trade':
        if (impact > 0) {
          description = `TRADE DEAL: Major international agreement signed - Global commerce boosted`;
        } else {
          description = `TRADE WAR: New tariffs imposed - International tensions escalate`;
        }
        break;
    }
    
    return { type, impact, duration, description };
  }

  private applyPolicyImpact(policy: GovernmentPolicy) {
    this.currentPrice *= (1 + policy.impact);
    this.marketSentiment = Math.max(0, Math.min(1, this.marketSentiment + (policy.impact * 0.5)));
    this.volatilityIndex = Math.max(0.01, Math.min(0.8, this.volatilityIndex + Math.abs(policy.impact * 0.3)));
    this.volume *= (1 + Math.abs(policy.impact) * 5);
    this.marketEvents.push(`🏛️ POLICY: ${policy.description}`);
  }

  private generateHugeMarketEvents() {
    if (Math.random() < this.majorEventProbability) {
      const majorEvents = [
        'central_bank_announcement', 'geopolitical_crisis', 'tech_breakthrough', 
        'economic_data_shock', 'currency_devaluation', 'trade_war_escalation',
        'pandemic_news', 'climate_disaster', 'cyber_attack', 'regulatory_bombshell'
      ];
      const eventType = majorEvents[Math.floor(Math.random() * majorEvents.length)];
      this.applyMajorMarketEvent(eventType);
    }

    if (Math.random() < this.crashProbability) {
      const extremeEvents = ['market_crash', 'flash_rally', 'liquidity_crisis', 'margin_call_tsunami'];
      const eventType = extremeEvents[Math.floor(Math.random() * extremeEvents.length)];
      this.applyExtremeMarketEvent(eventType);
    }
  }

  private applyMajorMarketEvent(eventType: string) {
    const isPositive = Math.random() > 0.5;
    let priceMultiplier = 1;
    let volumeMultiplier = 1;
    let sentimentChange = 0;
    let volatilityChange = 0;

    switch (eventType) {
      case 'central_bank_announcement':
        priceMultiplier = isPositive ? 1.15 + Math.random() * 0.2 : 0.75 - Math.random() * 0.15;
        volumeMultiplier = 8;
        sentimentChange = isPositive ? 0.3 : -0.4;
        volatilityChange = 0.5;
        this.marketEvents.push(`🏦 CENTRAL BANK: ${isPositive ? 'Rate cuts & stimulus announced' : 'Emergency rate hikes declared'}`);
        break;
        
      case 'geopolitical_crisis':
        priceMultiplier = 0.8 - Math.random() * 0.25;
        volumeMultiplier = 12;
        sentimentChange = -0.6;
        volatilityChange = 0.7;
        this.marketEvents.push(`⚔️ GEOPOLITICAL: Major conflict escalates - markets in panic`);
        break;
        
      case 'tech_breakthrough':
        priceMultiplier = 1.2 + Math.random() * 0.3;
        volumeMultiplier = 10;
        sentimentChange = 0.5;
        volatilityChange = 0.4;
        this.marketEvents.push(`🚀 TECH BREAKTHROUGH: Revolutionary AI/quantum computing announced`);
        break;
        
      case 'economic_data_shock':
        priceMultiplier = isPositive ? 1.12 + Math.random() * 0.18 : 0.82 - Math.random() * 0.18;
        volumeMultiplier = 6;
        sentimentChange = isPositive ? 0.25 : -0.35;
        volatilityChange = 0.3;
        this.marketEvents.push(`📊 ECONOMIC SHOCK: ${isPositive ? 'GDP/Employment beats by massive margin' : 'GDP/Employment misses catastrophically'}`);
        break;
        
      case 'currency_devaluation':
        priceMultiplier = 0.85 - Math.random() * 0.2;
        volumeMultiplier = 7;
        sentimentChange = -0.4;
        volatilityChange = 0.5;
        this.marketEvents.push(`💸 CURRENCY CRISIS: Major currency collapses - flight to safety`);
        break;
    }

    this.currentPrice *= priceMultiplier;
    this.volume *= volumeMultiplier;
    this.marketSentiment = Math.max(0, Math.min(1, this.marketSentiment + sentimentChange));
    this.volatilityIndex = Math.max(0.01, Math.min(0.9, this.volatilityIndex + volatilityChange));
    
    this.triggerInstitutionalReactions(priceMultiplier, eventType);
  }

  private applyExtremeMarketEvent(eventType: string) {
    switch (eventType) {
      case 'market_crash':
        this.currentPrice *= (0.5 + Math.random() * 0.3);
        this.volatilityIndex = 0.9;
        this.marketSentiment = 0.05;
        this.volume *= 20;
        this.marketEvents.push(`💥 MARKET CRASH: Black swan event triggers massive sell-off`);
        break;
        
      case 'flash_rally':
        this.currentPrice *= (1.3 + Math.random() * 0.5);
        this.volatilityIndex = 0.8;
        this.marketSentiment = 0.95;
        this.volume *= 15;
        this.marketEvents.push(`🚀 FLASH RALLY: Short squeeze triggers explosive upward move`);
        break;
        
      case 'liquidity_crisis':
        this.currentPrice *= (0.6 + Math.random() * 0.2);
        this.volatilityIndex = 0.95;
        this.marketSentiment = 0.1;
        this.volume *= 25;
        this.marketEvents.push(`🌊 LIQUIDITY CRISIS: Major firms unable to meet margin calls`);
        break;
    }
  }

  private triggerInstitutionalReactions(priceMultiplier: number, eventType: string) {
    this.institutionalMarketMakers.forEach(mm => {
      if (Math.random() < 0.8) {
        const reactionOrder = this.generateEventReactionOrder(mm, priceMultiplier, eventType);
        if (reactionOrder) {
          this.addOrder(reactionOrder);
        }
      }
    });
  }

  private generateEventReactionOrder(marketMaker: TraderType, priceMultiplier: number, eventType: string): OrderType | null {
    const isMarketDown = priceMultiplier < 1;
    let quantity = Math.floor(7000000000 / this.currentPrice);
    let isBuy = false;
    
    switch (marketMaker.aiPersonality) {
      case 'contrarian_titan':
        isBuy = isMarketDown;
        quantity *= 2;
        break;
      case 'momentum_hunter':
        isBuy = !isMarketDown;
        quantity *= 1.5;
        break;
      case 'volatility_master':
        isBuy = Math.random() > 0.5;
        quantity *= 3;
        break;
      default:
        isBuy = Math.random() > 0.5;
        break;
    }

    if (quantity <= 0) return null;

    return {
      type: isBuy ? 'buy' : 'sell',
      price: this.currentPrice * (1 + (Math.random() - 0.5) * 0.02),
      quantity: quantity,
      trader: `event_reaction_${marketMaker.aiPersonality}`,
      timestamp: this.time,
      isAI: true
    };
  }

  private executeRealisticTrades() {
    let tradesExecuted = 0;
    this.volume = 0;
    
    this.orderBook.buys.sort((a, b) => b.price - a.price);
    this.orderBook.sells.sort((a, b) => a.price - b.price);
    
    while (this.orderBook.buys.length > 0 && this.orderBook.sells.length > 0) {
      const highestBuy = this.orderBook.buys[0];
      const lowestSell = this.orderBook.sells[0];
      
      if (highestBuy.price >= lowestSell.price) {
        const quantity = Math.min(highestBuy.quantity, lowestSell.quantity);
        const tradePrice = lowestSell.timestamp < highestBuy.timestamp ? lowestSell.price : highestBuy.price;
        
        this.previousPrice = this.currentPrice;
        this.currentPrice = tradePrice;
        this.volume += quantity;
        this.currentDailyVolume += quantity * tradePrice;
        
        const marketImpact = Math.min(0.1, (quantity * tradePrice) / 10000000000);
        if (highestBuy.trader === 'mega_player') {
          this.currentPrice *= (1 + marketImpact);
        }
        
        highestBuy.quantity -= quantity;
        lowestSell.quantity -= quantity;
        
        if (highestBuy.quantity <= 0) {
          this.orderBook.buys.shift();
        }
        if (lowestSell.quantity <= 0) {
          this.orderBook.sells.shift();
        }
        
        tradesExecuted++;
        
        if (tradesExecuted > 100) break;
      } else {
        break;
      }
    }
    
    if (tradesExecuted === 0) {
      this.previousPrice = this.currentPrice;
      this.currentPrice *= (1 + (Math.random() - 0.5) * 0.0005);
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
    }
    
    const orderChunks = Math.min(10, Math.max(1, Math.floor(totalCost / 1000000000)));
    const chunkSize = Math.floor(quantity / orderChunks);
    
    for (let i = 0; i < orderChunks; i++) {
      const currentChunk = i === orderChunks - 1 ? quantity - (chunkSize * i) : chunkSize;
      const chunkPrice = price * (1 + (Math.random() - 0.5) * 0.001);
      
      this.addOrder({
        type: type,
        price: chunkPrice,
        quantity: currentChunk,
        trader: 'mega_player',
        timestamp: this.time + i,
        isShort: isShort
      });
    }
    
    const marketImpact = Math.min(0.2, (totalCost) / 1000000000000);
    if (type === 'buy') {
      this.currentPrice *= (1 + marketImpact * 0.5);
    } else {
      this.currentPrice *= (1 - marketImpact * 0.5);
    }
    
    if (totalCost > 50000000000) {
      this.marketEvents.push(`🐋 MEGA WHALE: $${(totalCost / 1000000000).toFixed(1)}B ${type.toUpperCase()} moves market ${((this.currentPrice - this.previousPrice) / this.previousPrice * 100).toFixed(2)}%`);
    }
    
    this.updatePortfolio();
  }

  public executeBuyMax() {
    const maxQuantity = Math.floor(this.portfolio.cash / this.currentPrice);
    if (maxQuantity > 0) {
      this.executeTrade('buy', maxQuantity, this.currentPrice);
    }
  }

  public executeSellMax() {
    if (this.portfolio.shares > 0) {
      this.executeTrade('sell', this.portfolio.shares, this.currentPrice);
    }
  }

  public executeShortMax() {
    const maxQuantity = Math.floor(this.portfolio.cash / this.currentPrice);
    if (maxQuantity > 0) {
      this.executeTrade('sell', maxQuantity, this.currentPrice, true);
    }
  }

  public executeCoverMax() {
    if (this.portfolio.shortPosition > 0) {
      this.executeTrade('buy', this.portfolio.shortPosition, this.currentPrice, true);
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
    
    switch (trader.type) {
      case 'fearful':
        if (this.currentPrice < this.previousPrice || this.marketSentiment < 0.3) {
          isBuy = Math.random() < 0.1;
          if (!isBuy && trader.shares <= 0 && Math.random() < 0.3) {
            isShort = true;
          }
        }
        break;
        
      case 'greedy':
      case 'fomo':
        if (this.currentPrice > this.previousPrice || this.marketSentiment > 0.7) {
          isBuy = Math.random() < 0.9;
          quantity *= 1.5;
        }
        break;
        
      case 'panic_seller':
        if (this.volatilityIndex > 0.2) {
          isBuy = Math.random() < 0.05;
        }
        break;
        
      case 'diamond_hands':
        if (this.currentPrice < this.previousPrice) {
          isBuy = Math.random() < 0.8;
        }
        isBuy = Math.random() < 0.1;
        break;
        
      case 'contrarian':
        isBuy = this.marketSentiment < 0.3;
        break;
    }
    
    if (isShort || (!isBuy && trader.shares <= 0 && Math.random() < 0.2)) {
      isShort = true;
      isBuy = false;
    }
    
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
    
    switch (trader.aiPersonality) {
      case 'aggressive':
        if (this.volatilityIndex > 0.3) {
          isBuy = Math.random() < 0.7;
          quantity *= 2;
        }
        break;
        
      case 'conservative':
        if (this.marketSentiment > 0.6) {
          isBuy = Math.random() < 0.6;
        } else {
          isBuy = Math.random() < 0.2;
        }
        quantity *= 0.5;
        break;
        
      case 'momentum':
        if (this.currentPrice > this.previousPrice) {
          isBuy = Math.random() < 0.8;
          quantity *= 1.2;
        } else {
          isBuy = Math.random() < 0.2;
        }
        break;
        
      case 'contrarian':
        isBuy = this.marketSentiment < 0.4;
        quantity *= 1.3;
        break;
        
      case 'arbitrage':
        break;
        
      case 'volatility_trader':
        if (this.volatilityIndex > 0.5) {
          isBuy = Math.random() < 0.5;
          quantity *= 1.5;
        }
        break;
        
      case 'high_frequency':
        price = isBuy ? this.currentPrice * 0.9995 : this.currentPrice * 1.0005;
        quantity = Math.floor(Math.random() * 500) + 100;
        break;
    }
    
    if (isShort || (!isBuy && trader.shares <= 0 && Math.random() < 0.2)) {
      isShort = true;
      isBuy = false;
    }
    
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
    if (Date.now() - this.candleStartTime >= 2000) {
      if (this.currentCandle) {
        this.candlestickData.push(this.currentCandle);
        this.candlestickData = this.candlestickData.slice(-200);
      }
      
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
    this.portfolio.pnl = this.portfolio.totalValue - this.startingCapital;
    this.portfolio.pnlPercent = (this.portfolio.pnl / this.startingCapital) * 100;
    
    this.onPortfolioUpdate(this.portfolio);
  }

  private updateCallbacks() {
    this.updatePortfolio();
    
    const orders: OrderType[] = [
      ...this.orderBook.buys.map(order => ({ ...order, type: 'buy' as const })),
      ...this.orderBook.sells.map(order => ({ ...order, type: 'sell' as const }))
    ];
    
    this.onOrderBookUpdate(orders);
  }

  private updateMarketConditions() {
    this.marketSentiment += (Math.random() - 0.5) * 0.02;
    this.marketSentiment = Math.max(0, Math.min(1, this.marketSentiment));
    
    this.volatilityIndex += (Math.random() - 0.5) * 0.005;
    this.volatilityIndex = Math.max(0.01, Math.min(0.8, this.volatilityIndex));
    
    this.crashProbability = 0.0001 + (this.volatilityIndex * 0.01);
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
      neuralNetworkStatus: this.neuralNetworkTrader?.getStatus(),
      businessCycle: this.businessCycle,
      marketTrend: this.marketTrend,
      trendStrength: this.trendStrength,
      activePolicies: this.activePolicies,
      marketMakerCollective: this.marketMakerCollective
    });
  }

  async makeNeuralNetworkMarketDecision() {
    if (this.neuralNetworkTrader) {
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
          this.marketEvents.push(`Neural Network Decision: ${aiOrder.reasoning} (${Math.round(aiOrder.confidence! * 100)}% confidence)`);
        }
      } catch (error) {
        console.error('Neural Network Market Decision Error:', error);
      }
    }
  }
}
