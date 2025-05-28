
export class MarketMakerSimulation {
  private marketMakerMode: boolean = false;
  private manipulationDirection: 'up' | 'down' | null = null;
  private manipulationDuration: number = 0;
  private manipulationCandles: number = 0;

  constructor() {
    console.log('🎯 Market Maker Simulation initialized');
  }

  setMarketMakerMode(enabled: boolean) {
    this.marketMakerMode = enabled;
    console.log(`👑 Market Maker Mode ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  setMarketManipulation(direction: 'up' | 'down', duration: number) {
    if (this.marketMakerMode) {
      this.manipulationDirection = direction;
      this.manipulationDuration = duration;
      this.manipulationCandles = 0;
      console.log(`🚀 MARKET MANIPULATION STARTED: Forcing ${direction.toUpperCase()} trend for ${duration} candles`);
    } else {
      console.log(`⚠️ Market manipulation ignored - Market Maker Mode not enabled`);
    }
  }

  getMarketManipulation() {
    if (this.manipulationDirection && this.manipulationCandles < this.manipulationDuration) {
      const manipulation = {
        direction: this.manipulationDirection,
        strength: 0.9 + (Math.random() * 0.1), // 90-100% strength for guaranteed effect
        isActive: true,
        candlesRemaining: this.manipulationDuration - this.manipulationCandles
      };
      console.log(`🎯 MARKET MANIPULATION ACTIVE: ${manipulation.direction.toUpperCase()} strength ${(manipulation.strength * 100).toFixed(1)}% (${manipulation.candlesRemaining} candles left)`);
      return manipulation;
    }
    return { direction: null, strength: 0, isActive: false, candlesRemaining: 0 };
  }

  incrementManipulationCandle() {
    if (this.manipulationDirection && this.manipulationCandles < this.manipulationDuration) {
      this.manipulationCandles++;
      console.log(`📊 Market manipulation candle ${this.manipulationCandles}/${this.manipulationDuration} completed`);
      
      if (this.manipulationCandles >= this.manipulationDuration) {
        console.log(`✅ Market manipulation COMPLETED after ${this.manipulationCandles} candles`);
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
    return {
      enabled: this.marketMakerMode,
      active: this.manipulationDirection !== null,
      direction: this.manipulationDirection,
      candlesRemaining: this.manipulationDuration - this.manipulationCandles
    };
  }
}
