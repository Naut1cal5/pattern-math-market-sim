
export class MarketMakerSimulation {
  private marketMakerMode: boolean = false;
  private manipulationDirection: 'up' | 'down' | null = null;
  private manipulationDuration: number = 0;
  private manipulationCandles: number = 0;
  private tradeVolumeBuffer: Array<{volume: number, direction: 'buy' | 'sell', timestamp: number, isClosing?: boolean}> = [];
  private openPositions: Map<string, {volume: number, direction: 'buy' | 'sell', timestamp: number}> = new Map();
  private currentMarketCap: number = 20_000_000_000;

  // Market structure parameters
  private readonly INITIAL_MARKET_CAP = 20_000_000_000; // $20B initial market
  private readonly MARKET_MAKER_CAP = 15_000_000_000; // $15B market makers
  private readonly RETAIL_CAP = 5_000_000_000; // $5B retail traders
  private readonly MAX_PRICE = 10_000; // $10,000 max realistic price
  private readonly MIN_PRICE = 10; // $10 minimum price
  
  // EXTREMELY REDUCED volatility for realistic movement
  private readonly BASE_VOLATILITY = 0.0001; // 0.01% base volatility (extremely low)
  private readonly PRICE_STEP_LIMIT = 0.0005; // Max 0.05% price movement per candle (about $0.05-$5 depending on price)
  
  // Volume impact parameters - much more conservative for realistic movement
  private readonly VOLUME_IMPACT_MULTIPLIER = 0.05; // Very minimal impact
  private readonly VOLUME_DECAY_TIME = 300000; // 5 minutes for volume impact to decay (longer persistence)
  private readonly MASSIVE_TRADE_THRESHOLD = 0.01; // 1% of market cap is considered massive

  constructor() {
    console.log('🎯 Market Maker Simulation initialized with Ultra-Realistic Price Movement');
    console.log(`📊 Market Structure: $${(this.INITIAL_MARKET_CAP / 1_000_000_000).toFixed(0)}B initial market`);
    console.log(`🏦 Market Makers: $${(this.MARKET_MAKER_CAP / 1_000_000_000).toFixed(0)}B (${((this.MARKET_MAKER_CAP / this.INITIAL_MARKET_CAP) * 100).toFixed(0)}%)`);
    console.log(`👥 Retail Traders: $${(this.RETAIL_CAP / 1_000_000_000).toFixed(0)}B (${((this.RETAIL_CAP / this.INITIAL_MARKET_CAP) * 100).toFixed(0)}%)`);
    console.log(`💰 Price Range: $${this.MIN_PRICE} - $${this.MAX_PRICE.toLocaleString()}`);
    console.log(`🐌 Ultra-Low Volatility: ${this.VOLUME_IMPACT_MULTIPLIER}x multiplier, ${(this.PRICE_STEP_LIMIT * 100).toFixed(3)}% max movement per candle`);
    this.currentMarketCap = this.INITIAL_MARKET_CAP;
  }

  setMarketMakerMode(enabled: boolean) {
    this.marketMakerMode = enabled;
    console.log(`👑 Market Maker Mode ${enabled ? 'ENABLED' : 'DISABLED'}`);
    if (enabled) {
      console.log(`🚀 You now control the $${(this.currentMarketCap / 1_000_000_000).toFixed(0)}B market direction with volume-based impact!`);
    }
  }

  setMarketManipulation(direction: 'up' | 'down', duration: number) {
    if (this.marketMakerMode) {
      this.manipulationDirection = direction;
      this.manipulationDuration = duration;
      this.manipulationCandles = 0;
      console.log(`🚀 MARKET MANIPULATION STARTED: Forcing ${direction.toUpperCase()} trend for ${duration} candles`);
      console.log(`💪 Your capital overpowers the $${(this.MARKET_MAKER_CAP / 1_000_000_000).toFixed(0)}B market makers!`);
    } else {
      console.log(`⚠️ Market manipulation ignored - Market Maker Mode not enabled`);
    }
  }

  // Add trade volume with position tracking and market cap adjustment
  addTradeVolume(volume: number, direction: 'buy' | 'sell', positionId?: string, isClosing: boolean = false) {
    const timestamp = Date.now();
    
    // Adjust market cap based on money flow
    if (direction === 'buy') {
      this.currentMarketCap += volume * 0.1; // Money flowing in increases market cap
    } else if (direction === 'sell') {
      this.currentMarketCap -= volume * 0.1; // Money flowing out decreases market cap
    }
    
    // Ensure market cap doesn't go below a minimum threshold
    this.currentMarketCap = Math.max(this.currentMarketCap, this.INITIAL_MARKET_CAP * 0.5);
    
    if (isClosing && positionId && this.openPositions.has(positionId)) {
      // Handle position closure
      const originalPosition = this.openPositions.get(positionId)!;
      this.openPositions.delete(positionId);
      
      // When closing a position, the market impact is opposite to the original direction
      const closingDirection = originalPosition.direction === 'buy' ? 'sell' : 'buy';
      
      this.tradeVolumeBuffer.push({ volume, direction: closingDirection, timestamp, isClosing: true });
      
      console.log(`🔄 POSITION CLOSED: $${(volume / 1_000_000).toFixed(1)}M ${originalPosition.direction} position closed -> Market pressure: ${closingDirection.toUpperCase()}`);
      
      const volumePercent = (volume / this.currentMarketCap) * 100;
      if (volumePercent > this.MASSIVE_TRADE_THRESHOLD * 100) {
        console.log(`💥 LARGE POSITION CLOSURE: ${volumePercent.toFixed(1)}% of market cap released!`);
      }
    } else if (!isClosing) {
      // Handle new position opening
      if (positionId) {
        this.openPositions.set(positionId, { volume, direction, timestamp });
      }
      
      this.tradeVolumeBuffer.push({ volume, direction, timestamp, isClosing: false });
      
      const volumePercent = (volume / this.currentMarketCap) * 100;
      console.log(`💰 NEW POSITION: $${(volume / 1_000_000).toFixed(1)}M ${direction.toUpperCase()} (${volumePercent.toFixed(2)}% of market)`);
      
      if (volumePercent > this.MASSIVE_TRADE_THRESHOLD * 100) {
        console.log(`🔥 LARGE POSITION OPENED: ${volumePercent.toFixed(1)}% of total market cap!`);
      }
    }
    
    // Clean old volume entries
    this.tradeVolumeBuffer = this.tradeVolumeBuffer.filter(
      trade => timestamp - trade.timestamp < this.VOLUME_DECAY_TIME
    );
  }

  // Calculate current volume impact on price including position closures
  calculateVolumeImpact(): { direction: 'up' | 'down' | 'neutral', strength: number, description: string } {
    if (this.tradeVolumeBuffer.length === 0) {
      return { direction: 'neutral', strength: 0, description: 'No recent volume' };
    }

    const currentTime = Date.now();
    let buyVolume = 0;
    let sellVolume = 0;
    let closingVolume = 0;

    // Calculate weighted volume (recent trades have more impact)
    this.tradeVolumeBuffer.forEach(trade => {
      const age = currentTime - trade.timestamp;
      const weight = Math.max(0, 1 - (age / this.VOLUME_DECAY_TIME)); // Linear decay
      
      if (trade.isClosing) {
        closingVolume += trade.volume * weight;
      }
      
      if (trade.direction === 'buy') {
        buyVolume += trade.volume * weight;
      } else {
        sellVolume += trade.volume * weight;
      }
    });

    const netVolume = buyVolume - sellVolume;
    const totalVolume = buyVolume + sellVolume;
    const volumeAsPercentOfMarket = totalVolume / this.currentMarketCap;
    
    // Calculate impact strength - extremely conservative for realistic movement
    let strength = Math.abs(netVolume) / this.currentMarketCap * this.VOLUME_IMPACT_MULTIPLIER;
    
    // Amplify impact if there are significant position closures but minimally
    if (closingVolume > 0) {
      const closureMultiplier = 1 + (closingVolume / this.currentMarketCap) * 0.1; // Very small multiplier
      strength *= closureMultiplier;
    }
    
    strength = Math.min(strength, 0.002); // Cap at 0.2% price movement (very small)
    
    const direction = netVolume > 0 ? 'up' : netVolume < 0 ? 'down' : 'neutral';
    
    const description = `Buy: $${(buyVolume / 1_000_000).toFixed(1)}M, Sell: $${(sellVolume / 1_000_000).toFixed(1)}M, Closures: $${(closingVolume / 1_000_000).toFixed(1)}M, Net: ${direction} ${(strength * 100).toFixed(4)}%`;
    
    if (volumeAsPercentOfMarket > this.MASSIVE_TRADE_THRESHOLD) {
      console.log(`📊 VOLUME IMPACT: ${description}`);
    }

    return { direction, strength, description };
  }

  // Get largest open positions for order book display
  getLargestPositions(limit: number = 5): Array<{volume: number, direction: 'buy' | 'sell', age: number}> {
    const currentTime = Date.now();
    const positions = Array.from(this.openPositions.values())
      .map(pos => ({
        ...pos,
        age: currentTime - pos.timestamp
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, limit);
    
    return positions;
  }

  getMarketManipulation() {
    const volumeImpact = this.calculateVolumeImpact();
    
    if (this.manipulationDirection && this.manipulationCandles < this.manipulationDuration) {
      // Market maker mode manipulation - very reduced strength for realism
      const manipulation = {
        direction: this.manipulationDirection,
        strength: 0.3 + (Math.random() * 0.1), // 30-40% strength (much more realistic)
        isActive: true,
        candlesRemaining: this.manipulationDuration - this.manipulationCandles,
        maxPriceStep: this.PRICE_STEP_LIMIT * 1.5, // Allow 0.075% max movement when manipulating
        priceConstraints: {
          min: this.MIN_PRICE,
          max: this.MAX_PRICE
        },
        volumeImpact
      };
      console.log(`🎯 MARKET MANIPULATION ACTIVE: ${manipulation.direction.toUpperCase()} strength ${(manipulation.strength * 100).toFixed(1)}% (${manipulation.candlesRemaining} candles left)`);
      return manipulation;
    }
    
    // Pure volume-based impact when not in manipulation mode - extremely conservative
    if (volumeImpact.strength > 0.001) { // Only apply if impact is significant (>0.1%)
      return { 
        direction: volumeImpact.direction, 
        strength: volumeImpact.strength, 
        isActive: true, 
        candlesRemaining: 0,
        maxPriceStep: this.PRICE_STEP_LIMIT * (1 + volumeImpact.strength * 0.5), // Very reduced scale
        priceConstraints: {
          min: this.MIN_PRICE,
          max: this.MAX_PRICE
        },
        volumeImpact
      };
    }

    return { 
      direction: null, 
      strength: 0, 
      isActive: false, 
      candlesRemaining: 0,
      maxPriceStep: this.PRICE_STEP_LIMIT,
      priceConstraints: {
        min: this.MIN_PRICE,
        max: this.MAX_PRICE
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
      priceStepLimit: this.PRICE_STEP_LIMIT,
      volumeImpactMultiplier: this.VOLUME_IMPACT_MULTIPLIER,
      massiveTradeThreshold: this.MASSIVE_TRADE_THRESHOLD
    };
  }

  incrementManipulationCandle() {
    if (this.manipulationDirection && this.manipulationCandles < this.manipulationDuration) {
      this.manipulationCandles++;
      console.log(`📊 Market manipulation candle ${this.manipulationCandles}/${this.manipulationDuration} completed`);
      
      if (this.manipulationCandles >= this.manipulationDuration) {
        console.log(`✅ Market manipulation COMPLETED after ${this.manipulationCandles} candles`);
        console.log(`🏦 Market makers regain control of the $${(this.currentMarketCap / 1_000_000_000).toFixed(0)}B market`);
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
      active: this.manipulationDirection !== null || volumeImpact.strength > 0.001,
      direction: this.manipulationDirection || volumeImpact.direction,
      candlesRemaining: this.manipulationDuration - this.manipulationCandles,
      marketStructure: this.getMarketStructure(),
      volumeImpact,
      largestPositions,
      totalOpenPositions: this.openPositions.size
    };
  }

  // Clear old volume data periodically
  cleanupVolumeBuffer() {
    const currentTime = Date.now();
    this.tradeVolumeBuffer = this.tradeVolumeBuffer.filter(
      trade => currentTime - trade.timestamp < this.VOLUME_DECAY_TIME
    );
  }
}
