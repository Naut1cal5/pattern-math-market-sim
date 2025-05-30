
export class MarketMakerSimulation {
  private marketMakerMode: boolean = false;
  private manipulationDirection: 'up' | 'down' | null = null;
  private manipulationDuration: number = 0;
  private manipulationCandles: number = 0;
  private tradeVolumeBuffer: Array<{volume: number, direction: 'buy' | 'sell', timestamp: number}> = [];

  // Market structure parameters
  private readonly TOTAL_MARKET_CAP = 20_000_000_000; // $20B total market
  private readonly MARKET_MAKER_CAP = 15_000_000_000; // $15B market makers
  private readonly RETAIL_CAP = 5_000_000_000; // $5B retail traders
  private readonly MAX_PRICE = 10_000; // $10,000 max realistic price
  private readonly MIN_PRICE = 10; // $10 minimum price
  private readonly BASE_VOLATILITY = 0.01; // 1% base volatility (very low)
  private readonly PRICE_STEP_LIMIT = 0.003; // Max 0.3% price movement per candle normally
  
  // Volume impact parameters
  private readonly VOLUME_IMPACT_MULTIPLIER = 2.0; // How much volume affects price
  private readonly VOLUME_DECAY_TIME = 30000; // 30 seconds for volume impact to decay
  private readonly MASSIVE_TRADE_THRESHOLD = 0.1; // 10% of market cap is considered massive

  constructor() {
    console.log('🎯 Market Maker Simulation initialized with Volume Impact');
    console.log(`📊 Market Structure: $${(this.TOTAL_MARKET_CAP / 1_000_000_000).toFixed(0)}B total market`);
    console.log(`🏦 Market Makers: $${(this.MARKET_MAKER_CAP / 1_000_000_000).toFixed(0)}B (${((this.MARKET_MAKER_CAP / this.TOTAL_MARKET_CAP) * 100).toFixed(0)}%)`);
    console.log(`👥 Retail Traders: $${(this.RETAIL_CAP / 1_000_000_000).toFixed(0)}B (${((this.RETAIL_CAP / this.TOTAL_MARKET_CAP) * 100).toFixed(0)}%)`);
    console.log(`💰 Price Range: $${this.MIN_PRICE} - $${this.MAX_PRICE.toLocaleString()}`);
    console.log(`📈 Volume Impact: ${this.VOLUME_IMPACT_MULTIPLIER}x multiplier`);
  }

  setMarketMakerMode(enabled: boolean) {
    this.marketMakerMode = enabled;
    console.log(`👑 Market Maker Mode ${enabled ? 'ENABLED' : 'DISABLED'}`);
    if (enabled) {
      console.log(`🚀 You now control the $${(this.TOTAL_MARKET_CAP / 1_000_000_000).toFixed(0)}B market direction with volume-based impact!`);
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

  // Add trade volume to impact calculation
  addTradeVolume(volume: number, direction: 'buy' | 'sell') {
    const timestamp = Date.now();
    this.tradeVolumeBuffer.push({ volume, direction, timestamp });
    
    // Clean old volume entries
    this.tradeVolumeBuffer = this.tradeVolumeBuffer.filter(
      trade => timestamp - trade.timestamp < this.VOLUME_DECAY_TIME
    );

    const volumePercent = (volume / this.TOTAL_MARKET_CAP) * 100;
    console.log(`💰 Trade Volume Added: $${(volume / 1_000_000_000).toFixed(2)}B (${volumePercent.toFixed(2)}% of market)`);
    
    if (volumePercent > this.MASSIVE_TRADE_THRESHOLD * 100) {
      console.log(`🔥 MASSIVE TRADE DETECTED: ${volumePercent.toFixed(1)}% of total market cap!`);
    }
  }

  // Calculate current volume impact on price
  calculateVolumeImpact(): { direction: 'up' | 'down' | 'neutral', strength: number, description: string } {
    if (this.tradeVolumeBuffer.length === 0) {
      return { direction: 'neutral', strength: 0, description: 'No recent volume' };
    }

    const currentTime = Date.now();
    let buyVolume = 0;
    let sellVolume = 0;

    // Calculate weighted volume (recent trades have more impact)
    this.tradeVolumeBuffer.forEach(trade => {
      const age = currentTime - trade.timestamp;
      const weight = Math.max(0, 1 - (age / this.VOLUME_DECAY_TIME)); // Linear decay
      
      if (trade.direction === 'buy') {
        buyVolume += trade.volume * weight;
      } else {
        sellVolume += trade.volume * weight;
      }
    });

    const netVolume = buyVolume - sellVolume;
    const totalVolume = buyVolume + sellVolume;
    const volumeAsPercentOfMarket = totalVolume / this.TOTAL_MARKET_CAP;
    
    // Calculate impact strength
    let strength = Math.abs(netVolume) / this.TOTAL_MARKET_CAP * this.VOLUME_IMPACT_MULTIPLIER;
    strength = Math.min(strength, 0.5); // Cap at 50% price movement
    
    const direction = netVolume > 0 ? 'up' : netVolume < 0 ? 'down' : 'neutral';
    
    const description = `Buy: $${(buyVolume / 1_000_000_000).toFixed(1)}B, Sell: $${(sellVolume / 1_000_000_000).toFixed(1)}B, Net: ${direction} ${(strength * 100).toFixed(1)}%`;
    
    if (volumeAsPercentOfMarket > this.MASSIVE_TRADE_THRESHOLD) {
      console.log(`🚀 VOLUME DOMINANCE: ${description}`);
    }

    return { direction, strength, description };
  }

  getMarketManipulation() {
    const volumeImpact = this.calculateVolumeImpact();
    
    if (this.manipulationDirection && this.manipulationCandles < this.manipulationDuration) {
      // Market maker mode manipulation
      const manipulation = {
        direction: this.manipulationDirection,
        strength: 0.95 + (Math.random() * 0.05), // 95-100% strength
        isActive: true,
        candlesRemaining: this.manipulationDuration - this.manipulationCandles,
        maxPriceStep: this.PRICE_STEP_LIMIT * 3, // Allow 0.9% max movement when manipulating
        priceConstraints: {
          min: this.MIN_PRICE,
          max: this.MAX_PRICE
        },
        volumeImpact
      };
      console.log(`🎯 MARKET MANIPULATION ACTIVE: ${manipulation.direction.toUpperCase()} strength ${(manipulation.strength * 100).toFixed(1)}% (${manipulation.candlesRemaining} candles left)`);
      console.log(`📊 Volume Impact: ${volumeImpact.description}`);
      return manipulation;
    }
    
    // Pure volume-based impact when not in manipulation mode
    if (volumeImpact.strength > 0.01) { // Only apply if impact is significant (>1%)
      return { 
        direction: volumeImpact.direction, 
        strength: volumeImpact.strength, 
        isActive: true, 
        candlesRemaining: 0,
        maxPriceStep: this.PRICE_STEP_LIMIT * (1 + volumeImpact.strength * 5), // Scale movement with volume
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
      totalMarketCap: this.TOTAL_MARKET_CAP,
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
        console.log(`🏦 Market makers regain control of the $${(this.TOTAL_MARKET_CAP / 1_000_000_000).toFixed(0)}B market`);
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
    return {
      enabled: this.marketMakerMode,
      active: this.manipulationDirection !== null || volumeImpact.strength > 0.01,
      direction: this.manipulationDirection || volumeImpact.direction,
      candlesRemaining: this.manipulationDuration - this.manipulationCandles,
      marketStructure: this.getMarketStructure(),
      volumeImpact
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
