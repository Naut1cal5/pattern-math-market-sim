
export class MarketMakerSimulation {
  private marketMakerMode: boolean = false;
  private manipulationDirection: 'up' | 'down' | null = null;
  private manipulationDuration: number = 0;
  private manipulationCandles: number = 0;
  private tradeVolumeBuffer: Array<{volume: number, direction: 'buy' | 'sell', timestamp: number, isClosing?: boolean}> = [];
  private openPositions: Map<string, {volume: number, direction: 'buy' | 'sell', timestamp: number}> = new Map();
  private currentMarketCap: number = 20_000_000_000;
  private lastPrice: number = 100; // Track last price to enforce constraints

  // ULTRA-CONSERVATIVE market parameters for realistic movement
  private readonly INITIAL_MARKET_CAP = 20_000_000_000;
  private readonly MARKET_MAKER_CAP = 15_000_000_000;
  private readonly RETAIL_CAP = 5_000_000_000;
  private readonly MAX_PRICE = 10_000;
  private readonly MIN_PRICE = 10;
  
  // ABSOLUTE MAXIMUM MOVEMENT CONSTRAINTS - NO EXCEPTIONS
  private readonly ABSOLUTE_MAX_PRICE_CHANGE = 0.25; // Maximum $0.25 per candle - NEVER MORE
  private readonly ABSOLUTE_MAX_PERCENTAGE_CHANGE = 0.0025; // Maximum 0.25% per candle - NEVER MORE
  private readonly BASE_VOLATILITY = 0.0001; // Microscopic base volatility
  private readonly VOLUME_IMPACT_MULTIPLIER = 0.000001; // Nearly zero impact
  private readonly VOLUME_DECAY_TIME = 1200000;
  private readonly MASSIVE_TRADE_THRESHOLD = 0.1;

  constructor() {
    console.log('🎯 Market Maker Simulation initialized with ABSOLUTE PRICE CONSTRAINTS');
    console.log(`📊 MAXIMUM movement per candle: $${this.ABSOLUTE_MAX_PRICE_CHANGE} OR ${(this.ABSOLUTE_MAX_PERCENTAGE_CHANGE * 100).toFixed(3)}%`);
    console.log(`🔒 ABSOLUTE price range: $${this.MIN_PRICE} - $${this.MAX_PRICE}`);
    this.currentMarketCap = this.INITIAL_MARKET_CAP;
  }

  setMarketMakerMode(enabled: boolean) {
    this.marketMakerMode = enabled;
    console.log(`👑 Market Maker Mode ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  setMarketManipulation(direction: 'up' | 'down', duration: number) {
    if (this.marketMakerMode) {
      this.manipulationDirection = direction;
      this.manipulationDuration = Math.min(duration, 10); // Cap at 10 candles max
      this.manipulationCandles = 0;
      console.log(`🚀 MARKET MANIPULATION: ${direction.toUpperCase()} for ${this.manipulationDuration} candles (CAPPED)`);
    }
  }

  addTradeVolume(volume: number, direction: 'buy' | 'sell', positionId?: string, isClosing: boolean = false) {
    const timestamp = Date.now();
    
    // Microscopic market cap adjustment - virtually no impact
    if (direction === 'buy') {
      this.currentMarketCap += volume * 0.00001;
    } else {
      this.currentMarketCap -= volume * 0.00001;
    }
    
    this.currentMarketCap = Math.max(this.currentMarketCap, this.INITIAL_MARKET_CAP * 0.99);
    
    if (isClosing && positionId && this.openPositions.has(positionId)) {
      const originalPosition = this.openPositions.get(positionId)!;
      this.openPositions.delete(positionId);
      const closingDirection = originalPosition.direction === 'buy' ? 'sell' : 'buy';
      this.tradeVolumeBuffer.push({ volume, direction: closingDirection, timestamp, isClosing: true });
    } else if (!isClosing) {
      if (positionId) {
        this.openPositions.set(positionId, { volume, direction, timestamp });
      }
      this.tradeVolumeBuffer.push({ volume, direction, timestamp, isClosing: false });
    }
    
    // Clean old entries
    this.tradeVolumeBuffer = this.tradeVolumeBuffer.filter(
      trade => timestamp - trade.timestamp < this.VOLUME_DECAY_TIME
    );
  }

  // ENFORCE ABSOLUTE PRICE CONSTRAINTS - this is the key method
  enforceRealisticPriceMovement(proposedPrice: number, currentPrice: number): number {
    this.lastPrice = currentPrice;
    
    // Calculate proposed change
    const priceChange = proposedPrice - currentPrice;
    const percentageChange = Math.abs(priceChange) / currentPrice;
    
    // ABSOLUTE CONSTRAINTS - NO EXCEPTIONS
    let constrainedPrice = proposedPrice;
    
    // 1. Enforce absolute dollar limit
    if (Math.abs(priceChange) > this.ABSOLUTE_MAX_PRICE_CHANGE) {
      const direction = priceChange > 0 ? 1 : -1;
      constrainedPrice = currentPrice + (direction * this.ABSOLUTE_MAX_PRICE_CHANGE);
      console.log(`🚫 PRICE MOVEMENT CAPPED: $${priceChange.toFixed(4)} -> $${(constrainedPrice - currentPrice).toFixed(4)}`);
    }
    
    // 2. Enforce percentage limit
    if (percentageChange > this.ABSOLUTE_MAX_PERCENTAGE_CHANGE) {
      const direction = priceChange > 0 ? 1 : -1;
      constrainedPrice = currentPrice + (currentPrice * this.ABSOLUTE_MAX_PERCENTAGE_CHANGE * direction);
      console.log(`🚫 PERCENTAGE MOVEMENT CAPPED: ${(percentageChange * 100).toFixed(4)}% -> ${(this.ABSOLUTE_MAX_PERCENTAGE_CHANGE * 100).toFixed(3)}%`);
    }
    
    // 3. Enforce absolute price range
    constrainedPrice = Math.max(this.MIN_PRICE, Math.min(this.MAX_PRICE, constrainedPrice));
    
    // 4. Additional safety check - if movement is still too large, limit it further
    const finalChange = Math.abs(constrainedPrice - currentPrice);
    if (finalChange > this.ABSOLUTE_MAX_PRICE_CHANGE) {
      const direction = (constrainedPrice - currentPrice) > 0 ? 1 : -1;
      constrainedPrice = currentPrice + (direction * this.ABSOLUTE_MAX_PRICE_CHANGE);
      console.log(`🔒 EMERGENCY PRICE CONSTRAINT: Final movement limited to $${this.ABSOLUTE_MAX_PRICE_CHANGE}`);
    }
    
    return constrainedPrice;
  }

  calculateVolumeImpact(): { direction: 'up' | 'down' | 'neutral', strength: number, description: string } {
    if (this.tradeVolumeBuffer.length === 0) {
      return { direction: 'neutral', strength: 0, description: 'No recent volume' };
    }

    const currentTime = Date.now();
    let buyVolume = 0;
    let sellVolume = 0;

    this.tradeVolumeBuffer.forEach(trade => {
      const age = currentTime - trade.timestamp;
      const weight = Math.max(0, 1 - (age / this.VOLUME_DECAY_TIME));
      
      if (trade.direction === 'buy') {
        buyVolume += trade.volume * weight;
      } else {
        sellVolume += trade.volume * weight;
      }
    });

    const netVolume = buyVolume - sellVolume;
    
    // EXTREMELY limited impact - maximum 0.001% price movement from volume
    let strength = Math.abs(netVolume) / this.currentMarketCap * this.VOLUME_IMPACT_MULTIPLIER;
    strength = Math.min(strength, 0.00001); // Cap at 0.001%
    
    const direction = netVolume > 0 ? 'up' : netVolume < 0 ? 'down' : 'neutral';
    const description = `Buy: $${(buyVolume / 1_000_000).toFixed(1)}M, Sell: $${(sellVolume / 1_000_000).toFixed(1)}M, Impact: ${(strength * 100).toFixed(6)}%`;

    return { direction, strength, description };
  }

  getLargestPositions(limit: number = 5): Array<{volume: number, direction: 'buy' | 'sell', age: number}> {
    const currentTime = Date.now();
    return Array.from(this.openPositions.values())
      .map(pos => ({ ...pos, age: currentTime - pos.timestamp }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, limit);
  }

  getMarketManipulation() {
    const volumeImpact = this.calculateVolumeImpact();
    
    if (this.manipulationDirection && this.manipulationCandles < this.manipulationDuration) {
      // ULTRA-CONSERVATIVE manipulation strength
      const baseStrength = 0.00005 + (Math.random() * 0.00005); // 0.005-0.01% max
      
      return {
        direction: this.manipulationDirection,
        strength: baseStrength,
        isActive: true,
        candlesRemaining: this.manipulationDuration - this.manipulationCandles,
        // CRITICAL: Ensure maximum movement constraints
        maxPriceStep: this.ABSOLUTE_MAX_PRICE_CHANGE,
        maxPercentageStep: this.ABSOLUTE_MAX_PERCENTAGE_CHANGE,
        priceConstraints: {
          min: this.MIN_PRICE,
          max: this.MAX_PRICE,
          maxAbsoluteMovement: this.ABSOLUTE_MAX_PRICE_CHANGE,
          maxPercentageMovement: this.ABSOLUTE_MAX_PERCENTAGE_CHANGE
        },
        volumeImpact
      };
    }
    
    // Volume-based impact - even more conservative
    if (volumeImpact.strength > 0.000001) {
      const constrainedStrength = Math.min(volumeImpact.strength, 0.00001); // Max 0.001%
      return { 
        direction: volumeImpact.direction, 
        strength: constrainedStrength, 
        isActive: true, 
        candlesRemaining: 0,
        maxPriceStep: this.ABSOLUTE_MAX_PRICE_CHANGE,
        maxPercentageStep: this.ABSOLUTE_MAX_PERCENTAGE_CHANGE,
        priceConstraints: {
          min: this.MIN_PRICE,
          max: this.MAX_PRICE,
          maxAbsoluteMovement: this.ABSOLUTE_MAX_PRICE_CHANGE,
          maxPercentageMovement: this.ABSOLUTE_MAX_PERCENTAGE_CHANGE
        },
        volumeImpact
      };
    }

    return { 
      direction: null, 
      strength: 0, 
      isActive: false, 
      candlesRemaining: 0,
      maxPriceStep: this.ABSOLUTE_MAX_PRICE_CHANGE,
      maxPercentageStep: this.ABSOLUTE_MAX_PERCENTAGE_CHANGE,
      priceConstraints: {
        min: this.MIN_PRICE,
        max: this.MAX_PRICE,
        maxAbsoluteMovement: this.ABSOLUTE_MAX_PRICE_CHANGE,
        maxPercentageMovement: this.ABSOLUTE_MAX_PERCENTAGE_CHANGE
      },
      volumeImpact
    };
  }

  getCurrentMarketCap() {
    return this.currentMarketCap;
  }

  getMarketStructure() {
    return {
      totalMarketCap: this.currentMarketCap,
      initialMarketCap: this.INITIAL_MARKET_CAP,
      marketMakerCap: this.MARKET_MAKER_CAP,
      retailCap: this.RETAIL_CAP,
      maxPrice: this.MAX_PRICE,
      minPrice: this.MIN_PRICE,
      baseVolatility: this.BASE_VOLATILITY,
      absoluteMaxPriceChange: this.ABSOLUTE_MAX_PRICE_CHANGE,
      absoluteMaxPercentageChange: this.ABSOLUTE_MAX_PERCENTAGE_CHANGE,
      volumeImpactMultiplier: this.VOLUME_IMPACT_MULTIPLIER,
      massiveTradeThreshold: this.MASSIVE_TRADE_THRESHOLD
    };
  }

  incrementManipulationCandle() {
    if (this.manipulationDirection && this.manipulationCandles < this.manipulationDuration) {
      this.manipulationCandles++;
      console.log(`📊 Manipulation candle ${this.manipulationCandles}/${this.manipulationDuration}`);
      
      if (this.manipulationCandles >= this.manipulationDuration) {
        console.log(`✅ Manipulation COMPLETED`);
        this.manipulationDirection = null;
        this.manipulationDuration = 0;
        this.manipulationCandles = 0;
      }
    }
  }

  isMarketMakerMode() {
    return this.marketMakerMode;
  }

  getStatus() {
    const volumeImpact = this.calculateVolumeImpact();
    const largestPositions = this.getLargestPositions();
    
    return {
      enabled: this.marketMakerMode,
      active: this.manipulationDirection !== null || volumeImpact.strength > 0.000001,
      direction: this.manipulationDirection || volumeImpact.direction,
      candlesRemaining: this.manipulationDuration - this.manipulationCandles,
      marketStructure: this.getMarketStructure(),
      volumeImpact,
      largestPositions,
      totalOpenPositions: this.openPositions.size
    };
  }

  cleanupVolumeBuffer() {
    const currentTime = Date.now();
    this.tradeVolumeBuffer = this.tradeVolumeBuffer.filter(
      trade => currentTime - trade.timestamp < this.VOLUME_DECAY_TIME
    );
  }
}
