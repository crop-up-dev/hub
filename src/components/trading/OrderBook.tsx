import { useBinanceOrderBook } from '@/hooks/useBinanceData';
import { formatNumber } from '@/lib/trading';

const OrderBook = () => {
  const { bids, asks } = useBinanceOrderBook(15);

  const maxTotal = Math.max(
    bids.length > 0 ? bids[bids.length - 1]?.total || 0 : 0,
    asks.length > 0 ? asks[asks.length - 1]?.total || 0 : 0
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border/50">
        <span className="section-header">Order Book</span>
      </div>
      <div className="grid grid-cols-3 px-3 py-1.5 text-[9px] uppercase tracking-wider text-muted-foreground font-medium border-b border-border/30">
        <span>Price</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Total</span>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Asks */}
        <div className="flex-1 overflow-y-auto scrollbar-thin flex flex-col justify-end">
          {asks.map((entry, i) => (
            <div key={`ask-${i}`} className="relative grid grid-cols-3 px-3 py-[2px] text-[11px] font-mono hover:bg-accent/30 transition-colors">
              <div
                className="absolute inset-0 bg-trading-red\/10 opacity-40"
                style={{ width: `${(entry.total / maxTotal) * 100}%`, right: 0, left: 'auto' }}
              />
              <span className="relative text-trading-red">{formatNumber(entry.price, 2)}</span>
              <span className="relative text-right text-foreground/70">{formatNumber(entry.quantity, 5)}</span>
              <span className="relative text-right text-muted-foreground">{formatNumber(entry.total, 4)}</span>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className="px-3 py-2 border-y border-border/30 text-center">
          {asks.length > 0 && bids.length > 0 && (
            <span className="text-[10px] text-muted-foreground font-mono">
              Spread: {formatNumber(asks[asks.length - 1].price - bids[0].price, 2)} ({formatNumber(((asks[asks.length - 1].price - bids[0].price) / asks[asks.length - 1].price) * 100, 3)}%)
            </span>
          )}
        </div>

        {/* Bids */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {bids.map((entry, i) => (
            <div key={`bid-${i}`} className="relative grid grid-cols-3 px-3 py-[2px] text-[11px] font-mono hover:bg-accent/30 transition-colors">
              <div
                className="absolute inset-0 bg-trading-green\/10 opacity-40"
                style={{ width: `${(entry.total / maxTotal) * 100}%`, right: 0, left: 'auto' }}
              />
              <span className="relative text-trading-green">{formatNumber(entry.price, 2)}</span>
              <span className="relative text-right text-foreground/70">{formatNumber(entry.quantity, 5)}</span>
              <span className="relative text-right text-muted-foreground">{formatNumber(entry.total, 4)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
