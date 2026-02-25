import { useRecentTrades } from '@/hooks/useBinanceData';
import { formatNumber } from '@/lib/trading';

const RecentTrades = ({ symbol = 'btcusdt' }: { symbol?: string }) => {
  const trades = useRecentTrades(symbol);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border/50">
        <span className="section-header">Market Trades</span>
      </div>
      <div className="grid grid-cols-3 px-3 py-1.5 text-[9px] uppercase tracking-wider text-muted-foreground font-medium border-b border-border/30">
        <span>Price</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Time</span>
      </div>
      <div className="overflow-y-auto flex-1 scrollbar-thin">
        {trades.map((trade, i) => (
          <div key={i} className="grid grid-cols-3 px-3 py-[2px] text-[11px] font-mono hover:bg-accent/20 transition-colors">
            <span className={trade.isBuyerMaker ? 'text-trading-red' : 'text-trading-green'}>
              {formatNumber(trade.price, 2)}
            </span>
            <span className="text-right text-foreground/70">{formatNumber(trade.qty, 5)}</span>
            <span className="text-right text-muted-foreground">
              {new Date(trade.time).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTrades;
