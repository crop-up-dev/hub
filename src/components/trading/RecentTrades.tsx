import { useRecentTrades } from '@/hooks/useBinanceData';
import { formatNumber } from '@/lib/trading';

const RecentTrades = () => {
  const trades = useRecentTrades();

  return (
    <div className="flex flex-col bg-card rounded-lg border border-border">
      <div className="px-3 py-2 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Market Trades</h3>
      </div>
      <div className="grid grid-cols-3 px-3 py-1.5 text-[10px] text-muted-foreground font-medium border-b border-border">
        <span>Price (USDT)</span>
        <span className="text-right">Amount (BTC)</span>
        <span className="text-right">Time</span>
      </div>
      <div className="overflow-y-auto max-h-[300px] scrollbar-thin">
        {trades.map((trade, i) => (
          <div key={i} className="grid grid-cols-3 px-3 py-[2px] text-[11px] font-mono hover:bg-accent/30">
            <span className={trade.isBuyerMaker ? 'text-trading-red' : 'text-trading-green'}>
              {formatNumber(trade.price, 2)}
            </span>
            <span className="text-right text-foreground">{formatNumber(trade.qty, 5)}</span>
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
