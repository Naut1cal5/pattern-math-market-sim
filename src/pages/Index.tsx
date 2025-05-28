import { useState, useEffect, useRef } from 'react';
import { TradingChart } from '@/components/TradingChart';
import { CandlestickChart } from '@/components/CandlestickChart';
import { OrderBook } from '@/components/OrderBook';
import { TradingInterface } from '@/components/TradingInterface';
import { Portfolio } from '@/components/Portfolio';
import { MarketSentiment } from '@/components/MarketSentiment';
import { MarketSimulation } from '@/lib/MarketSimulation';
import { MarketMakerSimulation } from '@/lib/MarketMakerSimulation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw, Activity, TrendingUp, TrendingDown, Moon, Sun, Brain, DollarSign, Crown } from 'lucide-react';

const Index = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [startingCapital, setStartingCapital] = useState(3000000000000); // $3T default
  const [showCapitalInput, setShowCapitalInput] = useState(false);
  const [marketMakerMode, setMarketMakerMode] = useState(false);
  
  const [marketData, setMarketData] = useState({
    price: 100,
    volume: 0,
    change: 0,
    changePercent: 0,
    marketSentiment: 0.5,
    volatilityIndex: 0.1,
    candlestickData: [],
    currentCandle: null,
    marketEvents: [],
    neuralNetworkStatus: null,
    businessCycle: null,
    marketTrend: 0,
    trendStrength: 0,
    activePolicies: []
  });
  const [portfolio, setPortfolio] = useState({
    cash: 3000000000000,
    shares: 0,
    shortPosition: 0,
    totalValue: 3000000000000,
    pnl: 0,
    pnlPercent: 0
  });
  const [orders, setOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const simulationRef = useRef(null);
  const marketMakerRef = useRef(null);

  useEffect(() => {
    if (!simulationRef.current) {
      simulationRef.current = new MarketSimulation({
        onPriceUpdate: (data) => {
          setMarketData(data);
          setChartData(prev => [...prev.slice(-99), data]);
        },
        onOrderBookUpdate: setOrders,
        onPortfolioUpdate: setPortfolio
      });
    }
    if (!marketMakerRef.current) {
      marketMakerRef.current = new MarketMakerSimulation();
    }
  }, []);

  // Hotkey event listener
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Only trigger if not typing in an input field
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
      
      switch (event.key.toLowerCase()) {
        case 'b': // Buy Max
          event.preventDefault();
          simulationRef.current?.executeBuyMax();
          break;
        case 's': // Sell Max
          event.preventDefault();
          simulationRef.current?.executeSellMax();
          break;
        case 'h': // Short Max
          event.preventDefault();
          simulationRef.current?.executeShortMax();
          break;
        case 'c': // Cover Max
          event.preventDefault();
          simulationRef.current?.executeCoverMax();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const formatLargeNumber = (num: number) => {
    if (num >= 1000000000000) {
      return `$${(num / 1000000000000).toFixed(2)}T`;
    } else if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else {
      return `$${num.toLocaleString()}`;
    }
  };

  const handleStartStop = () => {
    if (isRunning) {
      simulationRef.current?.pause();
    } else {
      simulationRef.current?.start();
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    simulationRef.current?.reset();
    setIsRunning(false);
    setMarketData({ 
      price: 100, 
      volume: 0, 
      change: 0, 
      changePercent: 0, 
      marketSentiment: 0.5, 
      volatilityIndex: 0.1, 
      candlestickData: [], 
      currentCandle: null, 
      marketEvents: [], 
      neuralNetworkStatus: null,
      businessCycle: null,
      marketTrend: 0,
      trendStrength: 0,
      activePolicies: []
    });
    setPortfolio({ cash: startingCapital, shares: 0, shortPosition: 0, totalValue: startingCapital, pnl: 0, pnlPercent: 0 });
    setOrders([]);
    setChartData([]);
  };

  const handleCapitalChange = () => {
    if (simulationRef.current) {
      simulationRef.current.setStartingCapital(startingCapital);
      setPortfolio(prev => ({
        ...prev,
        cash: startingCapital,
        totalValue: startingCapital,
        pnl: 0,
        pnlPercent: 0
      }));
    }
    setShowCapitalInput(false);
  };

  const handleTrade = (type: 'buy' | 'sell', quantity: number, price: number, isShort: boolean = false) => {
    if (marketMakerMode && marketMakerRef.current) {
      // Fixed logic: When user buys (long), market should go UP. When user sells (short), market should go DOWN.
      let direction: 'up' | 'down';
      
      if (type === 'buy' && !isShort) {
        // User is buying shares (going long) - market should go UP
        direction = 'up';
      } else if (type === 'sell' && !isShort) {
        // User is selling shares (closing long) - market should go DOWN
        direction = 'down';
      } else if (type === 'sell' && isShort) {
        // User is short selling - market should go DOWN
        direction = 'down';
      } else if (type === 'buy' && isShort) {
        // User is covering shorts - market should go UP
        direction = 'up';
      } else {
        direction = 'up'; // default
      }
      
      console.log(`🎯 MARKET MAKER: User action ${type} ${isShort ? '(short)' : '(long)'} -> Forcing market ${direction.toUpperCase()}`);
      marketMakerRef.current.setMarketManipulation(direction, 10 + Math.floor(Math.random() * 11)); // 10-20 candles
    }
    simulationRef.current?.executeTrade(type, quantity, price, isShort);
  };

  const handleNeuralNetworkTrade = async () => {
    if (simulationRef.current?.makeNeuralNetworkMarketDecision) {
      await simulationRef.current.makeNeuralNetworkMarketDecision();
    }
  };

  const handleMarketMakerToggle = (enabled: boolean) => {
    setMarketMakerMode(enabled);
    if (marketMakerRef.current) {
      marketMakerRef.current.setMarketMakerMode(enabled);
    }
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment < 0.2) return 'text-red-500';
    if (sentiment < 0.4) return 'text-orange-500';
    if (sentiment < 0.6) return 'text-yellow-500';
    if (sentiment < 0.8) return 'text-green-500';
    return 'text-emerald-500';
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment < 0.2) return 'Extreme Fear';
    if (sentiment < 0.4) return 'Fear';
    if (sentiment < 0.6) return 'Neutral';
    if (sentiment < 0.8) return 'Greed';
    return 'Extreme Greed';
  };

  const getBusinessCycleIcon = (phase: string) => {
    switch (phase) {
      case 'expansion': return '📈';
      case 'peak': return '🏔️';
      case 'contraction': return '📉';
      case 'trough': return '🕳️';
      default: return '📊';
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0.3) return '🚀';
    if (trend > 0) return '📈';
    if (trend < -0.3) return '💥';
    if (trend < 0) return '📉';
    return '➡️';
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} p-4`}>
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Trillion Dollar Market Simulation
              {marketMakerMode && <Crown className="inline w-6 h-6 ml-2 text-yellow-400" />}
            </h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Real-time trading with {formatLargeNumber(startingCapital)} Capital • 500 Market Makers • $7T Daily Volume • Neural Network AI • Business Cycles
              {marketMakerMode && <span className="text-yellow-400 font-bold"> • MARKET MAKER MODE ACTIVE</span>}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowCapitalInput(!showCapitalInput)}
              variant="outline"
              className={`border-gray-600 ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-200'}`}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Set Capital
            </Button>
            <Button
              onClick={() => setIsDarkMode(!isDarkMode)}
              variant="outline"
              className={`border-gray-600 ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-200'}`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              onClick={handleStartStop}
              className={`${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
            >
              {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isRunning ? 'Pause' : 'Start'} Market
            </Button>
            <Button 
              onClick={handleReset} 
              variant="outline" 
              className={`border-gray-600 ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-200'}`}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Market Maker Mode Alert */}
        {marketMakerMode && (
          <Card className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border border-yellow-600 p-4">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-yellow-400" />
              <div>
                <h3 className="text-lg font-bold text-yellow-400">Market Maker Mode Active</h3>
                <p className="text-yellow-200 text-sm">
                  You now control the market! Your trades will force price movement in that direction for 10-20 candles, 
                  overriding all market sentiment, news events, and business cycles.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Starting Capital Input */}
        {showCapitalInput && (
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Starting Capital</Label>
                <Input
                  type="number"
                  value={startingCapital}
                  onChange={(e) => setStartingCapital(Number(e.target.value))}
                  className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="Enter starting capital"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setStartingCapital(1000000000)} variant="outline" size="sm">$1B</Button>
                <Button onClick={() => setStartingCapital(100000000000)} variant="outline" size="sm">$100B</Button>
                <Button onClick={() => setStartingCapital(1000000000000)} variant="outline" size="sm">$1T</Button>
                <Button onClick={() => setStartingCapital(3000000000000)} variant="outline" size="sm">$3T</Button>
                <Button onClick={() => setStartingCapital(10000000000000)} variant="outline" size="sm">$10T</Button>
              </div>
              <Button onClick={handleCapitalChange} className="bg-green-600 hover:bg-green-700">
                Apply
              </Button>
            </div>
          </Card>
        )}

        {/* Business Cycle & Market Trend Info */}
        {marketData.businessCycle && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className={`${isDarkMode ? 'bg-blue-900/50 border-blue-700' : 'bg-blue-100 border-blue-300'} p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>Business Cycle</div>
                  <div className="text-xl font-bold text-white flex items-center gap-2">
                    {getBusinessCycleIcon(marketData.businessCycle?.phase)}
                    {marketData.businessCycle?.phase?.toUpperCase()}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                    GDP: {(marketData.businessCycle?.gdpGrowth * 100 || 0).toFixed(1)}% | 
                    Inflation: {(marketData.businessCycle?.inflation * 100 || 0).toFixed(1)}% | 
                    Unemployment: {(marketData.businessCycle?.unemployment * 100 || 0).toFixed(1)}%
                  </div>
                </div>
              </div>
            </Card>

            <Card className={`${isDarkMode ? 'bg-purple-900/50 border-purple-700' : 'bg-purple-100 border-purple-300'} p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>Market Trend</div>
                  <div className="text-xl font-bold text-white flex items-center gap-2">
                    {getTrendIcon(marketData.marketTrend)}
                    {marketData.marketTrend > 0 ? 'BULLISH' : marketData.marketTrend < 0 ? 'BEARISH' : 'NEUTRAL'}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`}>
                    Strength: {(marketData.trendStrength * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </Card>

            <Card className={`${isDarkMode ? 'bg-orange-900/50 border-orange-700' : 'bg-orange-100 border-orange-300'} p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-sm ${isDarkMode ? 'text-orange-300' : 'text-orange-600'}`}>Active Policies</div>
                  <div className="text-xl font-bold text-white">
                    {marketData.activePolicies?.length || 0}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`}>
                    Government Interventions
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Hotkeys Info */}
        <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-3`}>
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">B</kbd>
              <span className="text-green-400">Buy Max</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">S</kbd>
              <span className="text-red-400">Sell Max</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">H</kbd>
              <span className="text-orange-400">Short Max</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">C</kbd>
              <span className="text-blue-400">Cover Max</span>
            </div>
          </div>
        </Card>

        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current Price</div>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${marketData.price.toFixed(2)}</div>
            <div className={`text-sm ${marketData.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {marketData.changePercent >= 0 ? '+' : ''}{marketData.changePercent.toFixed(2)}%
            </div>
          </Card>
          
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Portfolio Value</div>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatLargeNumber(portfolio.totalValue)}</div>
            <div className={`text-sm ${portfolio.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {portfolio.pnlPercent >= 0 ? '+' : ''}{portfolio.pnlPercent.toFixed(2)}%
            </div>
          </Card>
          
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Market Sentiment</div>
            <div className={`text-lg font-bold ${getSentimentColor(marketData.marketSentiment)}`}>
              {getSentimentLabel(marketData.marketSentiment)}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{(marketData.marketSentiment * 100).toFixed(0)}/100</div>
          </Card>
          
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Volatility</div>
            <div className="text-lg font-bold text-blue-400">
              {(marketData.volatilityIndex * 100).toFixed(1)}%
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <Activity className="w-3 h-3 inline mr-1" />
              {marketData.volatilityIndex > 0.3 ? 'Extreme' : marketData.volatilityIndex > 0.2 ? 'High' : 'Normal'}
            </div>
          </Card>

          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Short Position</div>
            <div className="text-lg font-bold text-orange-400">{portfolio.shortPosition.toLocaleString()}</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Worth {formatLargeNumber(portfolio.shortPosition * marketData.price)}
            </div>
          </Card>
        </div>

        {/* Neural Network Status */}
        {marketData.neuralNetworkStatus && (
          <Card className="bg-gradient-to-r from-indigo-900/50 to-blue-900/50 border-indigo-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Neural Network Market Maker Status</h3>
                <div className="text-sm text-gray-300">
                  Capital: {formatLargeNumber(marketData.neuralNetworkStatus.capital || 0)} • 
                  Position: {marketData.neuralNetworkStatus.position?.toLocaleString()} shares • 
                  Type: {marketData.neuralNetworkStatus.marketMakerType}
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <Brain className="text-indigo-400 w-5 h-5" />
                <div className="text-indigo-400 font-bold">{marketData.neuralNetworkStatus.mood?.toUpperCase()}</div>
              </div>
            </div>
          </Card>
        )}

        {/* Active Government Policies */}
        {marketData.activePolicies && marketData.activePolicies.length > 0 && (
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Active Government Policies</h3>
            <div className="space-y-2">
              {marketData.activePolicies.slice(0, 3).map((policy, index) => (
                <div key={index} className="text-sm p-2 bg-blue-900/20 text-blue-300 rounded border-l-4 border-blue-500">
                  🏛️ {policy.description} (Duration: {policy.duration} units)
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CandlestickChart 
              data={marketData.candlestickData} 
              currentCandle={marketData.currentCandle}
              currentPrice={marketData.price} 
            />
          </div>
          
          <div>
            <OrderBook orders={orders} currentPrice={marketData.price} />
          </div>
        </div>

        {/* Trading and Portfolio */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TradingInterface 
            onTrade={handleTrade}
            onNeuralNetworkTrade={handleNeuralNetworkTrade}
            currentPrice={marketData.price}
            cash={portfolio.cash}
            shares={portfolio.shares}
            shortPosition={portfolio.shortPosition}
            marketMakerMode={marketMakerMode}
            onMarketMakerToggle={handleMarketMakerToggle}
          />
          <Portfolio portfolio={portfolio} marketData={marketData} />
        </div>

        {/* Market Events */}
        {marketData.marketEvents && marketData.marketEvents.length > 0 && (
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Live Market Events</h3>
            <div className="space-y-2">
              {marketData.marketEvents.slice(-5).reverse().map((event, index) => (
                <div key={index} className="text-sm p-2 bg-yellow-900/20 text-yellow-300 rounded border-l-4 border-yellow-500">
                  {event}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
