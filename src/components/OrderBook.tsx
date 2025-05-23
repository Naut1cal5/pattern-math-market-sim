
import { Card } from '@/components/ui/card';

export const OrderBook = ({ orders, currentPrice }) => {
  const sellOrders = orders.filter(o => o.type === 'sell').slice(0, 10);
  const buyOrders = orders.filter(o => o.type === 'buy').slice(0, 10);

  const formatPrice = (price) => price.toFixed(2);
  const formatQuantity = (qty) => qty.toLocaleString();

  return (
    <Card className="bg-gray-800 border-gray-700 p-4 h-fit">
      <h3 className="text-lg font-semibold text-white mb-4">Order Book</h3>
      
      {/* Sell Orders */}
      <div className="mb-4">
        <div className="text-sm text-red-400 font-medium mb-2">SELL ORDERS</div>
        <div className="space-y-1">
          {sellOrders.map((order, index) => (
            <div key={index} className="flex justify-between items-center bg-red-950/20 p-2 rounded text-sm">
              <span className="text-red-400">${formatPrice(order.price)}</span>
              <span className="text-gray-300">{formatQuantity(order.quantity)}</span>
              <div className="w-12 h-2 bg-red-900 rounded-full">
                <div 
                  className="h-full bg-red-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (order.quantity / 1000) * 100)}%` }}
                />
              </div>
            </div>
          ))}
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
        <div className="space-y-1">
          {buyOrders.map((order, index) => (
            <div key={index} className="flex justify-between items-center bg-green-950/20 p-2 rounded text-sm">
              <span className="text-green-400">${formatPrice(order.price)}</span>
              <span className="text-gray-300">{formatQuantity(order.quantity)}</span>
              <div className="w-12 h-2 bg-green-900 rounded-full">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (order.quantity / 1000) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Depth */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <div className="text-sm text-gray-400 mb-2">Market Depth</div>
        <div className="flex justify-between text-xs">
          <div className="text-green-400">
            Buy: {buyOrders.reduce((sum, o) => sum + o.quantity, 0).toLocaleString()}
          </div>
          <div className="text-red-400">
            Sell: {sellOrders.reduce((sum, o) => sum + o.quantity, 0).toLocaleString()}
          </div>
        </div>
      </div>
    </Card>
  );
};
