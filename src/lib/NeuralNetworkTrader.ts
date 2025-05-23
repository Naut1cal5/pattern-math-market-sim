
interface MarketData {
  price: number;
  volume: number;
  changePercent: number;
  marketSentiment: number;
  volatilityIndex: number;
}

export class NeuralNetworkTrader {
  private capital: number = 1000000000; // $1B
  private position: number = 0; // Positive = long, negative = short
  private lastDecision: number = 0;
  private learningRate: number = 0.001;
  private weights: {
    price: number;
    volume: number;
    sentiment: number;
    volatility: number;
    momentum: number;
    bias: number;
  };
  private mood: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  private marketMakerType: 'aggressive' | 'conservative' | 'technical' | 'momentum' = 'technical';
  private newsReaction: number = Math.random(); // How strongly it reacts to news
  private riskTolerance: number = 0.5 + (Math.random() * 0.5); // Higher = more risk-taking
  private tradingHistory: any[] = [];

  constructor() {
    // Initialize with random weights
    this.weights = {
      price: Math.random() * 2 - 1,
      volume: Math.random() * 2 - 1,
      sentiment: Math.random() * 2 - 1,
      volatility: Math.random() * 3 - 1.5,
      momentum: Math.random() * 2 - 1,
      bias: Math.random() * 0.2 - 0.1
    };
    
    // Randomize market maker style
    const styles: ('aggressive' | 'conservative' | 'technical' | 'momentum')[] = ['aggressive', 'conservative', 'technical', 'momentum'];
    this.marketMakerType = styles[Math.floor(Math.random() * styles.length)];
    
    // Initialize neural network state
    this.initializeNetwork();
  }

  private initializeNetwork(): void {
    // Adjust weights based on market maker type
    switch (this.marketMakerType) {
      case 'aggressive':
        this.weights.volatility *= 2;
        this.weights.volume *= 1.5;
        this.riskTolerance = 0.8;
        break;
      case 'conservative':
        this.weights.sentiment *= 1.5;
        this.weights.price *= 0.5;
        this.riskTolerance = 0.4;
        break;
      case 'technical':
        this.weights.momentum *= 2;
        this.weights.price *= 1.2;
        this.riskTolerance = 0.6;
        break;
      case 'momentum':
        this.weights.momentum *= 3;
        this.weights.volume *= 1.8;
        this.riskTolerance = 0.7;
        break;
    }
  }

  async makeMarketDecision(marketData: MarketData) {
    if (Date.now() - this.lastDecision < 2000) return null; // Rate limit to at least 2 seconds between decisions
    
    // Calculate market signals
    const priceSignal = this.weights.price * (marketData.changePercent / 5); // Normalized
    const volumeSignal = this.weights.volume * (Math.min(marketData.volume, 10000) / 10000);
    const sentimentSignal = this.weights.sentiment * (marketData.marketSentiment - 0.5) * 2;
    const volatilitySignal = this.weights.volatility * (marketData.volatilityIndex * 5);
    const momentumSignal = this.calculateMomentum();
    
    // Neural network decision (simple feedforward)
    let decision = priceSignal + volumeSignal + sentimentSignal + volatilitySignal + momentumSignal + this.weights.bias;
    
    // Add some randomness for exploration (simulates neural network learning)
    decision += (Math.random() * 0.4 - 0.2) * this.riskTolerance;
    
    // Update network weights occasionally (simulate learning)
    if (Math.random() < 0.2) {
      this.updateWeights(marketData);
    }
    
    // Generate market action
    const action = this.calculateAction(decision);
    const quantity = this.calculateQuantity(decision, marketData);
    const confidence = Math.min(0.95, Math.abs(decision) * 0.5 + 0.4);
    
    // Update trading state
    this.lastDecision = Date.now();
    this.updateMood(decision);
    
    // Store decision for momentum calculation
    this.tradingHistory.push({
      timestamp: Date.now(),
      decision: decision,
      price: marketData.price
    });
    
    // Trim history to last 100 decisions
    if (this.tradingHistory.length > 100) {
      this.tradingHistory.shift();
    }
    
    // Generate reasoning based on market maker type
    const reasoning = this.generateReasoning(marketData, decision);

    // Execute order
    return this.executeDecision(action, quantity, marketData, reasoning, confidence);
  }

  private calculateMomentum(): number {
    if (this.tradingHistory.length < 5) return 0;
    
    const recentDecisions = this.tradingHistory.slice(-5);
    let momentum = recentDecisions.reduce((sum, decision) => sum + decision.decision, 0) / 5;
    return this.weights.momentum * momentum;
  }

  private updateWeights(marketData: MarketData): void {
    // Simplified weight updates (similar to backpropagation)
    // In a real neural network, this would use gradients based on a loss function
    const learningFactor = this.learningRate * (Math.random() * 0.5 + 0.75);
    
    // Update weights based on market performance
    this.weights.price += learningFactor * (Math.random() * 2 - 1) * Math.sign(marketData.changePercent);
    this.weights.volume += learningFactor * (Math.random() * 2 - 1);
    this.weights.sentiment += learningFactor * (Math.random() * 2 - 1) * (marketData.marketSentiment > 0.5 ? 1 : -1);
    this.weights.volatility += learningFactor * (Math.random() * 2 - 1) * (marketData.volatilityIndex > 0.2 ? -1 : 1);
    this.weights.momentum += learningFactor * (Math.random() * 2 - 1);
    this.weights.bias += learningFactor * (Math.random() * 0.2 - 0.1);
    
    // Normalize weights to prevent explosion
    const normalizeFactor = Math.max(
      Math.abs(this.weights.price),
      Math.abs(this.weights.volume),
      Math.abs(this.weights.sentiment),
      Math.abs(this.weights.volatility),
      Math.abs(this.weights.momentum)
    );
    
    if (normalizeFactor > 3) {
      const scaleFactor = 3 / normalizeFactor;
      this.weights.price *= scaleFactor;
      this.weights.volume *= scaleFactor;
      this.weights.sentiment *= scaleFactor;
      this.weights.volatility *= scaleFactor;
      this.weights.momentum *= scaleFactor;
    }
  }

  private calculateAction(decision: number): 'BUY' | 'SELL' | 'SHORT' | 'COVER' | 'HOLD' {
    if (decision > 0.8) return 'BUY';
    if (decision < -0.8) return 'SELL';
    if (decision > 0.4 && decision <= 0.8) return this.position < 0 ? 'COVER' : 'BUY';
    if (decision < -0.4 && decision >= -0.8) return 'SHORT';
    return 'HOLD';
  }

  private calculateQuantity(decision: number, marketData: MarketData): number {
    const baseFactor = Math.abs(decision) * this.riskTolerance;
    const maxOrder = 100000; // Maximum order size
    
    // Higher volatility = more cautious order sizes
    const volatilityFactor = Math.max(0.3, 1 - marketData.volatilityIndex * 2);
    
    // Base quantity as percentage of capital
    let quantity = Math.floor((this.capital * 0.01) * baseFactor / marketData.price);
    
    // Adjust by volatility
    quantity = Math.floor(quantity * volatilityFactor);
    
    // Make sure order size isn't too large
    return Math.min(quantity, maxOrder);
  }

  private updateMood(decision: number): void {
    if (decision > 0.3) {
      this.mood = 'bullish';
    } else if (decision < -0.3) {
      this.mood = 'bearish';
    } else {
      this.mood = 'neutral';
    }
  }

  private generateReasoning(marketData: MarketData, decision: number): string {
    const reasoningPhrases = {
      bullish: [
        "Network identifies bullish continuation pattern",
        "Sentiment analysis reveals strong buying pressure",
        "Technical indicators suggest upward breakout imminent",
        "Volume profile indicates accumulation phase",
        "Neural analysis detects positive momentum shift"
      ],
      bearish: [
        "Network detecting bearish price action pattern",
        "Technical indicators showing distribution pattern",
        "Volume analysis reveals selling pressure",
        "Neural sentiment model flagging market weakness",
        "Momentum analysis indicates potential reversal"
      ],
      neutral: [
        "Market in consolidation phase based on neural analysis",
        "Technical indicators showing mixed signals",
        "Waiting for volatility breakout",
        "Providing balanced market liquidity",
        "Sideways pattern detected - maintaining equilibrium"
      ]
    };
    
    // Choose reasoning based on mood
    const reasonings = reasoningPhrases[this.mood];
    return reasonings[Math.floor(Math.random() * reasonings.length)];
  }

  private executeDecision(
    action: 'BUY' | 'SELL' | 'SHORT' | 'COVER' | 'HOLD', 
    quantity: number, 
    marketData: MarketData,
    reasoning: string,
    confidence: number
  ) {
    if (action === 'HOLD' || quantity <= 0) return null;
    
    let orderType: 'buy' | 'sell' = 'buy';
    let finalQuantity = Math.min(quantity, 50000); // Cap at 50k shares
    let isShort = false;
    
    switch (action) {
      case 'BUY':
        orderType = 'buy';
        break;
      case 'SELL':
        orderType = 'sell';
        finalQuantity = Math.min(finalQuantity, Math.max(0, this.position));
        break;
      case 'SHORT':
        orderType = 'sell';
        isShort = true;
        break;
      case 'COVER':
        orderType = 'buy';
        isShort = true;
        finalQuantity = Math.min(finalQuantity, Math.abs(Math.min(0, this.position)));
        break;
    }
    
    // Update position tracking
    if (orderType === 'buy') {
      this.position += finalQuantity;
      this.capital -= finalQuantity * marketData.price;
    } else {
      this.position -= finalQuantity;
      this.capital += finalQuantity * marketData.price;
    }
    
    return {
      type: orderType,
      price: marketData.price * (orderType === 'buy' ? 1.001 : 0.999),
      quantity: finalQuantity,
      trader: `neural_network_${this.marketMakerType}`,
      timestamp: Date.now(),
      reasoning,
      isAI: true,
      isShort: isShort,
      confidence: confidence
    };
  }

  getStatus() {
    return {
      capital: this.capital,
      position: this.position,
      positionValue: this.position * 100, // Approximate
      marketMakerType: this.marketMakerType,
      mood: this.mood,
      weights: this.weights
    };
  }
}
