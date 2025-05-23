
import { useState, useEffect, useRef } from 'react';
import { TradingChart } from '@/components/TradingChart';
import { OrderBook } from '@/components/OrderBook';
import { TradingInterface } from '@/components/TradingInterface';
import { Portfolio } from '@/components/Portfolio';
import { MarketSimulation } from '@/lib/MarketSimulation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, RotateCcw } from 'lucide-react';

const Index = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [marketData, setMarketData] = useState({
    price: 100,
    volume: 0,
    change: 0,
    changePercent: 0
  });
  const [portfolio, setPortfolio] = useState({
    cash: 10000000,
    shares: 0,
    totalValue: 10000000,
    pnl: 0,
    pnlPercent: 0
  });
  const [orders, setOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const simulationRef = useRef(null);

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
  }, []);

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
    setMarketData({ price: 100, volume: 0, change: 0, changePercent: 0 });
    setPortfolio({ cash: 10000000, shares: 0, totalValue: 10000000, pnl: 0, pnlPercent: 0 });
    setOrders([]);
    setChartData([]);
  };

  const handleTrade = (type, quantity, price) => {
    simulationRef.current?.executeTrade(type, quantity, price);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Market Simulation
            </h1>
            <p className="text-gray-400 mt-1">
              Advanced trading simulation with $10M starting capital
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={handleStartStop}
              className={`${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
            >
              {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isRunning ? 'Pause' : 'Start'} Market
            </Button>
            <Button onClick={handleReset} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-800 border-gray-700 p-4">
            <div className="text-sm text-gray-400">Current Price</div>
            <div className="text-2xl font-bold text-white">${marketData.price.toFixed(2)}</div>
            <div className={`text-sm ${marketData.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {marketData.changePercent >= 0 ? '+' : ''}{marketData.changePercent.toFixed(2)}%
            </div>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700 p-4">
            <div className="text-sm text-gray-400">Portfolio Value</div>
            <div className="text-2xl font-bold text-white">${portfolio.totalValue.toLocaleString()}</div>
            <div className={`text-sm ${portfolio.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {portfolio.pnlPercent >= 0 ? '+' : ''}{portfolio.pnlPercent.toFixed(2)}%
            </div>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700 p-4">
            <div className="text-sm text-gray-400">Cash Available</div>
            <div className="text-2xl font-bold text-white">${portfolio.cash.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Ready to deploy</div>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700 p-4">
            <div className="text-sm text-gray-400">Shares Owned</div>
            <div className="text-2xl font-bold text-white">{portfolio.shares.toLocaleString()}</div>
            <div className="text-sm text-gray-400">
              Worth ${(portfolio.shares * marketData.price).toLocaleString()}
            </div>
          </Card>
        </div>

        {/* Main Trading Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2">
            <TradingChart data={chartData} currentPrice={marketData.price} />
          </div>
          
          {/* Order Book */}
          <div>
            <OrderBook orders={orders} currentPrice={marketData.price} />
          </div>
        </div>

        {/* Trading Controls and Portfolio */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TradingInterface 
            onTrade={handleTrade}
            currentPrice={marketData.price}
            cash={portfolio.cash}
            shares={portfolio.shares}
          />
          <Portfolio portfolio={portfolio} marketData={marketData} />
        </div>
      </div>
    </div>
  );
};

export default Index;
