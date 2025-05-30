
export class MarketMakerSimulation {
  private marketMakerMode: boolean = false;
  private manipulationDirection: 'up' | 'down' | null = null;
  private manipulationDuration: number = 0;
  private manipulationCandles: number = 0;
  private tradeVolumeBuffer: Array<{volume: number, direction: 'buy' | 'sell', timestamp: number, isClosing?: boolean}> = [];
  private openPositions: Map<string, {volume: number, direction: 'buy' | 'sell', timestamp: number}> = new Map();

  // Dynamic Market structure parameters
  private currentMarketCap: number = 20_000_000_000; // Start with $20B
  private readonly INITIAL_MARKET_CAP = 20_000_000_000; // $20B initial market
  private readonly MARKET_MAKER_PERCENTAGE = 0.75; // 75% market makers
  private readonly RETAIL_PERCENTAGE = 0.25; // 25% retail traders
  private readonly MAX_PRICE = 10_000; // $10,000 max realistic price
  private readonly MIN_PRICE = 10; // $10 minimum price
  private readonly BASE_VOLATILITY = 0.002; // 0.2% base volatility (very low)
  private readonly PRICE_STEP_LIMIT = 0.001; // Max 0.1% price movement per candle normally
  
  // Volume impact parameters - much more conservative
  private readonly VOLUME_IMPACT_MULTIPLIER = 0.5; // Reduced impact
  private readonly VOLUME_DECAY_TIME = 60000; // 60 seconds for volume impact to decay
  private readonly MASSIVE_TRADE_THRESHOLD = 0.05; // 5% of market cap is considered massive

  constructor() {
    console.log('🎯 Market Maker Simulation initialized with Dynamic Market Cap');
    console.log(`📊 Initial Market Structure: $${(this.currentMarketCap / 1_000_000_000).toFixed(0)}B total market`);
    console.log(`🏦 Market Makers: ${(this.MARKET_MAKER_PERCENTAGE * 100).toFixed(0)}%`);
    console.log(`👥 Retail Traders: ${(this.RETAIL_PERCENTAGE * 100).toFixed(0)}%`);
    console.log(`💰 Price Range: $${this.MIN_PRICE} - $${this.MAX_PRICE.toLocaleString()}`);
    console.log(`📈 Reduced Volatility: ${this.VOLUME_IMPACT_MULTIPLIER}x multiplier`);
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
      console.log(`💪 Your capital overpowers the $${(this.getMarketMakerCap() / 1_000_000_000).toFixed(0)}B market makers!`);
    } else {
      console.log(`⚠️ Market manipulation ignored - Market Maker Mode not enabled`);
    }
  }

  // Add trade volume with position tracking and market cap adjustment
  addTradeVolume(volume: number, direction: 'buy' | 'sell', positionId?: string, isClosing: boolean = false) {
    const timestamp = Date.now();
    
    // Adjust market cap based on money flow
    if (direction === 'buy' && !isClosing) {
      // New money entering the market
      this.currentMarketCap += volume;
      console.log(`💰 NEW MONEY IN: +$${(volume / 1_000_000).toFixed(1)}M added to market (Market Cap: $${(this.currentMarketCap / 1_000_000_000).toFixed(2)}B)`);
    } else if (direction === 'sell' && !isClosing) {
      // Money leaving the market
      this.currentMarketCap = Math.max(this.INITIAL_MARKET_CAP * 0.1, this.currentMarketCap - volume); // Don't let it go below 10% of initial
      console.log(`💸 MONEY OUT: -$${(volume / 1_000_000).toFixed(1)}M removed from market (Market Cap: $${(this.currentMarketCap / 1_000_000_000).toFixed(2)}B)`);
    }
    
    if (isClosing && positionId && this.openPositions.has(positionId)) {
      // Handle position closure - this affects liquidity but not total market cap
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
    
    // Calculate impact strength - much more conservative but scales with market cap
    let strength = Math.abs(netVolume) / this.currentMarketCap * this.VOLUME_IMPACT_MULTIPLIER;
    
    // Amplify impact if there are significant position closures but less dramatically
    if (closingVolume > 0) {
      const closureMultiplier = 1 + (closingVolume / this.currentMarketCap) * 0.5; // Reduced multiplier
      strength *= closureMultiplier;
    }
    
    strength = Math.min(strength, 0.05); // Cap at 5% price movement
    
    const direction = netVolume > 0 ? 'up' : netVolume < 0 ? 'down' : 'neutral';
    
    const description = `Buy: $${(buyVolume / 1_000_000).toFixed(1)}M, Sell: $${(sellVolume / 1_000_000).toFixed(1)}M, Closures: $${(closingVolume / 1_000_000).toFixed(1)}M, Net: ${direction} ${(strength * 100).toFixed(2)}%`;
    
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

  // Get current market cap values
  getCurrentMarketCap(): number {
    return this.currentMarketCap;
  }

  getMarketMakerCap(): number {
    return this.currentMarketCap * this.MARKET_MAKER_PERCENTAGE;
  }

  getRetailCap(): number {
    return this.currentMarketCap * this.RETAIL_PERCENTAGE;
  }

  getMarketManipulation() {
    const volumeImpact = this.calculateVolumeImpact();
    
    if (this.manipulationDirection && this.manipulationCandles < this.manipulationDuration) {
      // Market maker mode manipulation - reduced strength
      const manipulation = {
        direction: this.manipulationDirection,
        strength: 0.7 + (Math.random() * 0.2), // 70-90% strength (reduced)
        isActive: true,
        candlesRemaining: this.manipulationDuration - this.manipulationCandles,
        maxPriceStep: this.PRICE_STEP_LIMIT * 2, // Allow 0.2% max movement when manipulating
        priceConstraints: {
          min: this.MIN_PRICE,
          max: this.MAX_PRICE
        },
        volumeImpact
      };
      console.log(`🎯 MARKET MANIPULATION ACTIVE: ${manipulation.direction.toUpperCase()} strength ${(manipulation.strength * 100).toFixed(1)}% (${manipulation.candlesRemaining} candles left)`);
      return manipulation;
    }
    
    // Pure volume-based impact when not in manipulation mode - more conservative
    if (volumeImpact.strength > 0.005) { // Only apply if impact is significant (>0.5%)
      return { 
        direction: volumeImpact.direction, 
        strength: volumeImpact.strength, 
        isActive: true, 
        candlesRemaining: 0,
        maxPriceStep: this.PRICE_STEP_LIMIT * (1 + volumeImpact.strength * 2), // Reduced scale
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

  getMarketStructure() {
    return {
      currentMarketCap: this.currentMarketCap,
      initialMarketCap: this.INITIAL_MARKET_CAP,
      marketMakerCap: this.getMarketMakerCap(),
      retailCap: this.getRetailCap(),
      marketMakerPercentage: this.MARKET_MAKER_PERCENTAGE,
      retailPercentage: this.RETAIL_PERCENTAGE,
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
        console.log(`🏦 Market makers regain control of the $${(this.getCurrentMarketCap() / 1_000_000_000).toFixed(0)}B market`);
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
      active: this.manipulationDirection !== null || volumeImpact.strength > 0.005,
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
