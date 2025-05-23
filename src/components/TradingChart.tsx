
import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

export const TradingChart = ({ data, currentPrice }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, width, height);

    if (data.length < 2) return;

    const prices = data.map(d => d.price);
    const minPrice = Math.min(...prices) * 0.98;
    const maxPrice = Math.max(...prices) * 1.02;
    const priceRange = maxPrice - minPrice;

    // Draw grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      
      // Price labels
      const price = maxPrice - (priceRange / 5) * i;
      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px monospace';
      ctx.fillText(`$${price.toFixed(2)}`, 5, y - 5);
    }

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw price line
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((point.price - minPrice) / priceRange) * height;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();

    // Draw current price indicator
    if (data.length > 0) {
      const lastY = height - ((currentPrice - minPrice) / priceRange) * height;
      
      // Horizontal line
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, lastY);
      ctx.lineTo(width, lastY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price label
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(width - 80, lastY - 10, 75, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`$${currentPrice.toFixed(2)}`, width - 75, lastY + 3);
    }

    // Draw volume bars at bottom
    const volumeHeight = 40;
    const volumeY = height - volumeHeight;
    
    if (data.length > 0) {
      const maxVolume = Math.max(...data.map(d => d.volume || 0));
      
      data.forEach((point, index) => {
        const x = (index / (data.length - 1)) * width;
        const volume = point.volume || 0;
        const barHeight = (volume / maxVolume) * volumeHeight;
        
        ctx.fillStyle = point.change >= 0 ? '#10b981' : '#ef4444';
        ctx.globalAlpha = 0.3;
        ctx.fillRect(x - 2, volumeY + volumeHeight - barHeight, 4, barHeight);
        ctx.globalAlpha = 1;
      });
    }

  }, [data, currentPrice]);

  return (
    <Card className="bg-gray-800 border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Live Price Chart</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-400">Price Line</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-400">Current Price</span>
          </div>
        </div>
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-auto bg-gray-900 rounded border border-gray-600"
        />
      </div>
    </Card>
  );
};
