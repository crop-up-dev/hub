import { useBinanceTicker } from '@/hooks/useBinanceData';
import { formatNumber, formatUSD } from '@/lib/trading';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MarketHeader = () => {
  const { ticker, prevPrice } = useBinanceTicker();
  const isUp = ticker.priceChangePercent >= 0;
  const priceDirection = ticker.price > prevPrice ? 'up' : ticker.price < prevPrice ? 'down' : 'same';

  return (
    <div className="flex items-center gap-6 px-4 py-3 border-b border-border bg-card overflow-x-auto">
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-xs">₿</span>
          </div>
          <div>
            <span className="font-semibold text-foreground">BTC/USDT</span>
          </div>
        </div>
      </div>

      <div className="shrink-0">
        <span className={`font-mono text-2xl font-bold ${priceDirection === 'up' ? 'text-trading-green' : priceDirection === 'down' ? 'text-trading-red' : 'text-foreground'}`}>
          {formatUSD(ticker.price)}
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {isUp ? <TrendingUp className="w-4 h-4 text-trading-green" /> : <TrendingDown className="w-4 h-4 text-trading-red" />}
        <span className={`font-mono text-sm ${isUp ? 'text-trading-green' : 'text-trading-red'}`}>
          {isUp ? '+' : ''}{formatNumber(ticker.priceChangePercent)}%
        </span>
      </div>

      <div className="flex items-center gap-6 text-xs text-muted-foreground shrink-0">
        <div>
          <span className="block">24h High</span>
          <span className="font-mono text-foreground">{formatUSD(ticker.high)}</span>
        </div>
        <div>
          <span className="block">24h Low</span>
          <span className="font-mono text-foreground">{formatUSD(ticker.low)}</span>
        </div>
        <div>
          <span className="block">24h Vol (BTC)</span>
          <span className="font-mono text-foreground">{formatNumber(ticker.volume, 2)}</span>
        </div>
        <div>
          <span className="block">24h Vol (USDT)</span>
          <span className="font-mono text-foreground">{formatNumber(ticker.quoteVolume / 1e6, 2)}M</span>
        </div>
      </div>
    </div>
  );
};

export default MarketHeader;
