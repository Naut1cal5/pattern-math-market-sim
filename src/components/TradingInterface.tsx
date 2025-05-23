
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Zap, Target } from 'lucide-react';

export const TradingInterface = ({ onTrade, currentPrice, cash, shares }) => {
  const [quantity, setQuantity] = useState(100);
  const [price, setPrice] = useState(currentPrice);
  const [orderType, setOrderType] = useState('market');
  const [strategy, setStrategy] = useState('manual');

  const maxBuyQuantity = Math.floor(cash / currentPrice);
  const maxSellQuantity = shares;

  const handleBuy = () => {
    if (quantity > 0 && quantity <= maxBuyQuantity) {
      onTrade('buy', quantity, orderType === 'market' ? currentPrice : price);
      setQuantity(100);
    }
  };

  const handleSell = () => {
    if (quantity > 0 && quantity <= maxSellQuantity) {
      onTrade('sell', quantity, orderType === 'market' ? currentPrice : price);
      setQuantity(100);
    }
  };

  const executeStrategy = () => {
    let strategyQuantity;
    
    switch (strategy) {
      case 'whale':
        strategyQuantity = Math.floor(maxBuyQuantity * 0.1); // 10% of buying power
        onTrade('buy', strategyQuantity, currentPrice);
        break;
      case 'scalping':
        strategyQuantity = Math.floor(maxBuyQuantity * 0.01); // 1% for quick trades
        onTrade('buy', strategyQuantity, currentPrice * 0.999);
        setTimeout(() => {
          onTrade('sell', strategyQuantity, currentPrice * 1.001);
        }, 2000);
        break;
      case 'momentum':
        strategyQuantity = Math.floor(maxBuyQuantity * 0.05); // 5% following trend
        onTrade('buy', strategyQuantity, currentPrice * 1.001);
        break;
      default:
        break;
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Trading Interface</h3>
      
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

          <div className="flex gap-2">
            <Button 
              onClick={handleBuy}
              disabled={quantity > maxBuyQuantity || quantity <= 0}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              BUY ${(quantity * (orderType === 'market' ? currentPrice : price)).toLocaleString()}
            </Button>
            
            <Button 
              onClick={handleSell}
              disabled={quantity > maxSellQuantity || quantity <= 0}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              SELL {quantity.toLocaleString()} shares
            </Button>
          </div>

          <div className="text-xs text-gray-400 space-y-1">
            <div>Max Buy: {maxBuyQuantity.toLocaleString()} shares</div>
            <div>Max Sell: {maxSellQuantity.toLocaleString()} shares</div>
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
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
