
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiAITrader {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private capital: number = 1000000000; // $1B
  private position: number = 0; // Positive = long, negative = short
  private lastDecision: number = 0;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async makeMarketDecision(marketData: any) {
    if (Date.now() - this.lastDecision < 5000) return null; // Rate limit

    const prompt = `You are an AI Market Maker with $1B capital managing a high-frequency trading system.
    
    Current Market Data:
    - Price: $${marketData.price.toFixed(2)}
    - Volume: ${marketData.volume}
    - Change: ${marketData.changePercent.toFixed(2)}%
    - Market Sentiment: ${(marketData.marketSentiment * 100).toFixed(0)}/100
    - Volatility: ${(marketData.volatilityIndex * 100).toFixed(1)}%
    - Your Position: ${this.position} shares
    - Available Capital: $${this.capital.toLocaleString()}
    
    As a market maker, you can:
    1. Place large BUY orders (1000-50000 shares) if you see opportunity
    2. Place large SELL orders (1000-50000 shares) to take profits
    3. SHORT the market (negative position) if bearish
    4. COVER shorts if sentiment improves
    5. Stay neutral and provide liquidity
    
    Your orders WILL move the market significantly. Consider:
    - Market sentiment and volatility
    - Your current position
    - Risk management
    - Market making opportunities
    
    Respond with JSON only:
    {
      "action": "BUY|SELL|SHORT|COVER|HOLD",
      "quantity": number,
      "reasoning": "brief explanation",
      "confidence": 0.1-1.0
    }`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const decision = JSON.parse(jsonMatch[0]);
        this.lastDecision = Date.now();
        
        console.log('AI Trader Decision:', decision);
        return this.executeDecision(decision, marketData);
      }
    } catch (error) {
      console.error('AI Trading Error:', error);
    }
    
    return null;
  }

  private executeDecision(decision: any, marketData: any) {
    const { action, quantity, reasoning } = decision;
    
    if (action === 'HOLD' || quantity <= 0) return null;
    
    let orderType: 'buy' | 'sell' = 'buy';
    let finalQuantity = Math.min(quantity, 50000); // Cap at 50k shares
    
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
        // Can short even without position
        break;
      case 'COVER':
        orderType = 'buy';
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
      trader: 'gemini_ai',
      timestamp: Date.now(),
      reasoning,
      isAI: true
    };
  }

  getStatus() {
    return {
      capital: this.capital,
      position: this.position,
      positionValue: this.position * 100 // Approximate
    };
  }
}
