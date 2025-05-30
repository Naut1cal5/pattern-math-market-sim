
import { Card } from '@/components/ui/card';

export const OrderBook = ({ orders, currentPrice, largestPositions = [] }) => {
  // Filter and adjust orders to be more realistic and smaller
  const adjustedOrders = orders.map(order => ({
    ...order,
    // Reduce order quantities to be more realistic (1-100 shares typically)
    quantity: Math.max(1, Math.floor(order.quantity / 10000)) // Much smaller orders
  })).filter(order => order.quantity > 0);

  // Separate and sort orders by size
  const allSellOrders = adjustedOrders.filter(o => o.type === 'sell').sort((a, b) => b.quantity - a.quantity);
  const allBuyOrders = adjustedOrders.filter(o => o.type === 'buy').sort((a, b) => b.quantity - a.quantity);
  
  // Get largest orders (top 5 of each type for better persistence)
  const largeSellOrders = allSellOrders.slice(0, 5);
  const largeBuyOrders = allBuyOrders.slice(0, 5);
  
  // Get remaining smaller orders
  const smallSellOrders = allSellOrders.slice(5, 12);
  const smallBuyOrders = allBuyOrders.slice(5, 12);

  const formatPrice = (price) => price.toFixed(2);
  const formatQuantity = (qty) => qty.toLocaleString();
  const formatVolume = (volume) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(0)}K`;
    }
    return `$${volume.toLocaleString()}`;
  };

  const getOrderSize = (quantity) => {
    const volume = quantity * currentPrice;
    if (volume >= 500000) return 'large'; // $500K+
    if (volume >= 100000) return 'medium'; // $100K+
    if (volume >= 50000) return 'small-large'; // $50K+
    return 'small';
  };

  const getOrderSizeColor = (size) => {
    switch (size) {
      case 'large': return 'text-yellow-300 bg-yellow-900/40 border-yellow-600';
      case 'medium': return 'text-orange-300 bg-orange-900/40 border-orange-600';
      case 'small-large': return 'text-blue-300 bg-blue-900/40 border-blue-600';
      default: return 'text-gray-300 bg-gray-900/40 border-gray-600';
    }
  };

  const renderOrder = (order, index, type) => {
    const size = getOrderSize(order.quantity);
    const volume = order.quantity * order.price;
    const isNotable = size === 'large' || size === 'medium';
    const colorClass = type === 'sell' ? 'text-red-400' : 'text-green-400';
    const bgClass = type === 'sell' ? 'bg-red-950/20' : 'bg-green-950/20';
    const barClass = type === 'sell' ? 'bg-red-500' : 'bg-green-500';

    // Calculate bar width based on relative size within visible orders
    const maxQuantity = Math.max(...adjustedOrders.map(o => o.quantity));
    const barWidth = Math.max(10, (order.quantity / maxQuantity) * 100);

    return (
      <div 
        key={index} 
        className={`flex justify-between items-center ${bgClass} p-2 rounded text-sm ${isNotable ? 'border-l-4 ' + getOrderSizeColor(size).split(' ')[2] : ''}`}
      >
        <div className="flex flex-col min-w-0 flex-1">
          <span className={colorClass}>${formatPrice(order.price)}</span>
          {isNotable && <span className="text-xs text-yellow-400">💰 {formatVolume(volume)}</span>}
        </div>
        <span className="text-gray-300 mx-2">{formatQuantity(order.quantity)}</span>
        <div className="w-16 h-2 bg-gray-900 rounded-full">
          <div 
            className={`h-full ${barClass} rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(100, barWidth)}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-gray-800 border-gray-700 p-4 h-fit">
      <h3 className="text-lg font-semibold text-white mb-4">Order Book</h3>
      
      {/* Largest Positions from Market Maker */}
      {largestPositions && largestPositions.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-600 rounded">
          <div className="text-sm text-yellow-400 font-medium mb-2">🐋 WHALE POSITIONS</div>
          <div className="space-y-1">
            {largestPositions.slice(0, 3).map((position, index) => (
              <div key={index} className="text-xs text-yellow-300 flex justify-between">
                <span>{position.direction.toUpperCase()}</span>
                <span>{formatVolume(position.volume)}</span>
                <span>{Math.floor(position.age / 1000)}s ago</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Sell Orders */}
      <div className="mb-4">
        <div className="text-sm text-red-400 font-medium mb-2">SELL ORDERS</div>
        
        {/* Large Sell Orders */}
        {largeSellOrders.length > 0 && (
          <div className="space-y-1 mb-2">
            <div className="text-xs text-red-300 font-bold">📊 LARGE ORDERS</div>
            {largeSellOrders.map((order, index) => renderOrder(order, index, 'sell'))}
          </div>
        )}
        
        {/* Regular Sell Orders */}
        <div className="space-y-1">
          {smallSellOrders.map((order, index) => renderOrder(order, index + largeSellOrders.length, 'sell'))}
        </div>
      </div>

      {/* Current Price */}
      <div className="border-t border-b border-gray-600 py-3 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-white">${formatPrice(currentPrice)}</div>
          <div className="text-xs text-gray-400">Current Market Price</div>
        </div>
      </div>

      {/* Buy Orders */}
      <div>
        <div className="text-sm text-green-400 font-medium mb-2">BUY ORDERS</div>
        
        {/* Large Buy Orders */}
        {largeBuyOrders.length > 0 && (
          <div className="space-y-1 mb-2">
            <div className="text-xs text-green-300 font-bold">📊 LARGE ORDERS</div>
            {largeBuyOrders.map((order, index) => renderOrder(order, index, 'buy'))}
          </div>
        )}
        
        {/* Regular Buy Orders */}
        <div className="space-y-1">
          {smallBuyOrders.map((order, index) => renderOrder(order, index + largeBuyOrders.length, 'buy'))}
        </div>
      </div>

      {/* Market Depth */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <div className="text-sm text-gray-400 mb-2">Market Depth</div>
        <div className="flex justify-between text-xs">
          <div className="text-green-400">
            Buy: {allBuyOrders.reduce((sum, o) => sum + o.quantity, 0).toLocaleString()} shares
          </div>
          <div className="text-red-400">
            Sell: {allSellOrders.reduce((sum, o) => sum + o.quantity, 0).toLocaleString()} shares
          </div>
        </div>
        <div className="text-xs text-yellow-400 mt-1">
          Large Orders: {largeBuyOrders.length + largeSellOrders.length} | 
          Whale Positions: {largestPositions?.length || 0}
        </div>
      </div>
    </Card>
  );
};
