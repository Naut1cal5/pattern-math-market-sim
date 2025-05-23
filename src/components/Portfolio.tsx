
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';

export const Portfolio = ({ portfolio, marketData }) => {
  const { cash, shares, totalValue, pnl, pnlPercent } = portfolio;
  const positionValue = shares * marketData.price;
  
  return (
    <Card className="bg-gray-800 border-gray-700 p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Portfolio Summary</h3>
      
      <div className="space-y-4">
        {/* Total Portfolio Value */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <span className="text-gray-300">Total Value</span>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-white">
                ${totalValue.toLocaleString()}
              </div>
              <div className={`text-sm ${pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* P&L */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {pnl >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
              <span className="text-gray-300">Unrealized P&L</span>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {pnl >= 0 ? '+' : ''}${pnl.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Cash Position */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Available Cash</span>
            <span className="text-white font-mono">${cash.toLocaleString()}</span>
          </div>
        </div>

        {/* Stock Position */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300">Shares Owned</span>
            <span className="text-white font-mono">{shares.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Position Value</span>
            <span className="text-gray-300 text-sm">${positionValue.toLocaleString()}</span>
          </div>
        </div>

        {/* Portfolio Allocation */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="text-gray-300 mb-3">Portfolio Allocation</div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Cash</span>
              <span className="text-white">{((cash / totalValue) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Stocks</span>
              <span className="text-white">{((positionValue / totalValue) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(positionValue / totalValue) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Trading Stats */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="text-gray-300 mb-3">Quick Stats</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Avg. Cost Basis</span>
              <span className="text-white">
                ${shares > 0 ? ((10000000 - cash) / shares).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Current Price</span>
              <span className="text-white">${marketData.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Buying Power</span>
              <span className="text-white">{Math.floor(cash / marketData.price).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
