
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Zap, Target, Brain } from 'lucide-react';

export const TradingInterface = ({ onTrade, currentPrice, cash, shares, shortPosition = 0, onNeuralNetworkTrade }: {
  onTrade: (type: 'buy' | 'sell', quantity: number, price: number, isShort?: boolean) => void;
  currentPrice: number;
  cash: number;
  shares: number;
  shortPosition?: number;
  onNeuralNetworkTrade?: () => Promise<void>;
}) => {
  const [quantity, setQuantity] = useState(100);
  const [price, setPrice] = useState(currentPrice);
  const [orderType, setOrderType] = useState('market');
  const [strategy, setStrategy] = useState('manual');

  const maxBuyQuantity = Math.floor(cash / currentPrice);
  const maxSellQuantity = shares;
  const maxShortQuantity = Math.floor(cash / currentPrice); // Can short based on cash as collateral

  const handleBuy = () => {
    if (quantity > 0 && quantity <= maxBuyQuantity) {
      onTrade('buy', quantity, orderType === 'market' ? currentPrice : price, false);
      setQuantity(100);
    }
  };

  const handleSell = () => {
    if (quantity > 0 && quantity <= maxSellQuantity) {
      onTrade('sell', quantity, orderType === 'market' ? currentPrice : price, false);
      setQuantity(100);
    }
  };

  const handleShort = () => {
    if (quantity > 0 && quantity <= maxShortQuantity) {
      onTrade('sell', quantity, orderType === 'market' ? currentPrice : price, true);
      setQuantity(100);
    }
  };

  const handleCover = () => {
    const coverQuantity = Math.min(quantity, shortPosition);
    if (coverQuantity > 0) {
      onTrade('buy', coverQuantity, orderType === 'market' ? currentPrice : price, true);
      setQuantity(100);
    }
  };

  const executeStrategy = () => {
    // Implement strategy execution based on selected strategy
    switch (strategy) {
      case 'whale':
        // Whale order - use 10% of capital
        const whaleQuantity = Math.floor((cash * 0.1) / currentPrice);
        onTrade('buy', whaleQuantity, currentPrice, false);
        break;
      case 'scalping':
        // Scalping - small quick trades
        const scalpQuantity = Math.min(100, maxBuyQuantity);
        onTrade('buy', scalpQuantity, currentPrice * 0.998, false);
        setTimeout(() => {
          onTrade('sell', scalpQuantity, currentPrice * 1.002, false);
        }, 1000);
        break;
      case 'momentum':
        // Momentum trading - medium sized position
        const momentumQuantity = Math.min(500, maxBuyQuantity);
        onTrade('buy', momentumQuantity, currentPrice, false);
        break;
      case 'neural_network':
        // Use Neural Network AI for market making
        if (onNeuralNetworkTrade) {
          onNeuralNetworkTrade();
        }
        break;
      default:
        break;
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Advanced Trading Interface</h3>
      
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-700">
          <TabsTrigger value="manual" className="text-white">Manual Trading</TabsTrigger>
          <TabsTrigger value="strategy" className="text-white">Strategy Trading</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Order Type</Label>
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="market">Market Order</SelectItem>
                  <SelectItem value="limit">Limit Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-gray-300">Quantity</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="bg-gray-700 border-gray-600 text-white"
                min="1"
              />
            </div>
          </div>

          {orderType === 'limit' && (
            <div>
              <Label className="text-gray-300">Limit Price</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                step="0.01"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          )}

          {/* Long Positions */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={handleBuy}
              disabled={quantity > maxBuyQuantity || quantity <= 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              BUY ${(quantity * (orderType === 'market' ? currentPrice : price)).toLocaleString()}
            </Button>
            
            <Button 
              onClick={handleSell}
              disabled={quantity > maxSellQuantity || quantity <= 0}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              SELL {quantity.toLocaleString()} shares
            </Button>
          </div>

          {/* Short Positions */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={handleShort}
              disabled={quantity > maxShortQuantity || quantity <= 0}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              SHORT {quantity.toLocaleString()} shares
            </Button>
            
            <Button 
              onClick={handleCover}
              disabled={quantity > shortPosition || quantity <= 0 || shortPosition <= 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              COVER {Math.min(quantity, shortPosition).toLocaleString()} shorts
            </Button>
          </div>

          <div className="text-xs text-gray-400 space-y-1 p-3 bg-gray-700 rounded">
            <div>Max Buy: {maxBuyQuantity.toLocaleString()} shares</div>
            <div>Max Sell: {maxSellQuantity.toLocaleString()} shares</div>
            <div>Max Short: {maxShortQuantity.toLocaleString()} shares</div>
            <div className="text-orange-400">Short Position: {shortPosition.toLocaleString()} shares</div>
            <div className="text-yellow-400">Short P&L: ${((shortPosition * currentPrice) - (shortPosition * currentPrice)).toLocaleString()}</div>
          </div>
        </TabsContent>
        
        <TabsContent value="strategy" className="space-y-4">
          <div>
            <Label className="text-gray-300">Trading Strategy</Label>
            <Select value={strategy} onValueChange={setStrategy}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="whale">🐋 Whale Orders (10% of capital)</SelectItem>
                <SelectItem value="scalping">⚡ Scalping (Quick profits)</SelectItem>
                <SelectItem value="momentum">📈 Momentum Trading</SelectItem>
                <SelectItem value="neural_network">🧠 Neural Network Market Maker</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={executeStrategy}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Zap className="w-4 h-4 mr-2" />
            Execute Strategy
          </Button>

          <div className="text-sm text-gray-400 space-y-2">
            <div className="p-3 bg-gray-700 rounded">
              <div className="font-medium text-white mb-1">Strategy Info:</div>
              {strategy === 'whale' && "Place large orders that can move the market significantly"}
              {strategy === 'scalping' && "Quick buy/sell pairs for small profits"}
              {strategy === 'momentum' && "Follow market trends with medium-sized orders"}
              {strategy === 'neural_network' && "Neural network market maker making decisions based on technical analysis and sentiment"}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
