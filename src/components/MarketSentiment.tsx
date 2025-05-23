
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface MarketSentimentProps {
  sentiment: number;
  volatility: number;
  marketEvents: string[];
}

export const MarketSentiment = ({ sentiment, volatility, marketEvents }: MarketSentimentProps) => {
  const getSentimentLabel = (value: number) => {
    if (value < 0.2) return 'Extreme Fear';
    if (value < 0.4) return 'Fear';
    if (value < 0.6) return 'Neutral';
    if (value < 0.8) return 'Greed';
    return 'Extreme Greed';
  };

  const getSentimentColor = (value: number) => {
    if (value < 0.2) return 'text-red-500';
    if (value < 0.4) return 'text-orange-500';
    if (value < 0.6) return 'text-yellow-500';
    if (value < 0.8) return 'text-green-500';
    return 'text-emerald-500';
  };

  const getVolatilityLabel = (value: number) => {
    if (value < 0.1) return 'Low';
    if (value < 0.2) return 'Normal';
    if (value < 0.3) return 'High';
    return 'Extreme';
  };

  return (
    <Card className="bg-gray-800 border-gray-700 p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Market Sentiment & AI Activity</h3>
      
      <div className="space-y-4">
        {/* Fear & Greed Index */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Fear & Greed Index</span>
            <span className={`font-bold ${getSentimentColor(sentiment)}`}>
              {getSentimentLabel(sentiment)}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                sentiment < 0.5 ? 'bg-gradient-to-r from-red-500 to-yellow-500' : 'bg-gradient-to-r from-yellow-500 to-green-500'
              }`}
              style={{ width: `${sentiment * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">{Math.round(sentiment * 100)}/100</div>
        </div>

        {/* Volatility Index */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Volatility Index</span>
            </div>
            <span className="font-bold text-blue-400">
              {getVolatilityLabel(volatility)}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${Math.min(100, volatility * 500)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">{(volatility * 100).toFixed(1)}%</div>
        </div>

        {/* Recent Market Events */}
        {marketEvents.length > 0 && (
          <div className="pt-3 border-t border-gray-600">
            <div className="text-sm text-gray-400 mb-2">Recent Market Events</div>
            <div className="space-y-1">
              {marketEvents.slice(-3).map((event, index) => (
                <div key={index} className="text-xs text-yellow-400 bg-yellow-900/20 p-1 rounded">
                  {event}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
