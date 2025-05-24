
import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

interface CandlestickData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

interface CandlestickChartProps {
  data: CandlestickData[];
  currentCandle: CandlestickData | null;
  currentPrice: number;
}

export const CandlestickChart = ({ data, currentCandle, currentPrice }: CandlestickChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height - 80;
    const volumeHeight = 60;

    // Clear canvas
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const displayData = currentCandle ? [...data, currentCandle] : data;
    if (displayData.length === 0) return;

    const allPrices = displayData.flatMap(d => [d.open, d.high, d.low, d.close]);
    const minPrice = Math.min(...allPrices) * 0.98;
    const maxPrice = Math.max(...allPrices) * 1.02;
    const priceRange = maxPrice - minPrice;
    const maxVolume = Math.max(...displayData.map(d => d.volume));

    // Draw grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 8; i++) {
      const y = (height / 8) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      
      const price = maxPrice - (priceRange / 8) * i;
      ctx.fillStyle = '#9ca3af';
      ctx.font = '11px monospace';
      ctx.fillText(`$${price.toFixed(2)}`, 5, y - 5);
    }

    const candleWidth = Math.max(3, width / displayData.length - 2);
    const spacing = width / displayData.length;

    // Draw candlesticks with BOTH green and red candles filled
    displayData.forEach((candle, index) => {
      const x = index * spacing + spacing / 2;
      const openY = height - ((candle.open - minPrice) / priceRange) * height;
      const closeY = height - ((candle.close - minPrice) / priceRange) * height;
      const highY = height - ((candle.high - minPrice) / priceRange) * height;
      const lowY = height - ((candle.low - minPrice) / priceRange) * height;

      const isGreen = candle.close >= candle.open;
      const bodyTop = Math.min(openY, closeY);
      const bodyBottom = Math.max(openY, closeY);
      const bodyHeight = Math.max(1, bodyBottom - bodyTop);

      // Draw wick
      ctx.strokeStyle = isGreen ? '#10b981' : '#ef4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw body - BOTH GREEN AND RED CANDLES ARE NOW FILLED
      ctx.fillStyle = isGreen ? '#10b981' : '#ef4444';
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

      // Draw volume
      const volumeBarHeight = (candle.volume / maxVolume) * volumeHeight;
      const volumeY = height + 10;
      
      ctx.fillStyle = isGreen ? '#10b98140' : '#ef444440';
      ctx.fillRect(x - candleWidth / 2, volumeY + volumeHeight - volumeBarHeight, candleWidth, volumeBarHeight);
    });

    // Current price line
    const currentY = height - ((currentPrice - minPrice) / priceRange) * height;
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, currentY);
    ctx.lineTo(width, currentY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price label
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(width - 80, currentY - 10, 75, 20);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`$${currentPrice.toFixed(2)}`, width - 75, currentY + 3);

  }, [data, currentCandle, currentPrice]);

  return (
    <Card className="bg-gray-800 border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">2-Second Candlestick Chart - $7T Daily Volume</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            <span className="text-gray-400">Bullish (Filled)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
            <span className="text-gray-400">Bearish (Filled)</span>
          </div>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={480}
        className="w-full h-auto bg-gray-900 rounded border border-gray-600"
      />
    </Card>
  );
};
