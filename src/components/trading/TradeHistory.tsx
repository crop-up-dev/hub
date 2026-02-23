import { Trade, formatNumber, formatUSD, formatBTC } from '@/lib/trading';
import { Download } from 'lucide-react';

interface TradeHistoryProps {
  trades: Trade[];
}

const TradeHistory = ({ trades }: TradeHistoryProps) => {
  const exportCSV = () => {
    const headers = 'Date,Pair,Side,Price,Amount,Total\n';
    const rows = trades.map(t =>
      `${new Date(t.timestamp).toISOString()},${t.pair},${t.side},${t.price},${t.amount},${t.total}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trade-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
        <span className="section-header">Trade History</span>
        {trades.length > 0 && (
          <button onClick={exportCSV} className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors">
            <Download className="w-3 h-3" />
            CSV
          </button>
        )}
      </div>

      <div className="overflow-y-auto flex-1 scrollbar-thin">
        {trades.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-muted-foreground text-sm">No trades yet</div>
            <div className="text-muted-foreground/60 text-xs mt-1">Place your first order to get started</div>
          </div>
        ) : (
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 bg-card/90 backdrop-blur-sm">
              <tr className="text-muted-foreground border-b border-border/30">
                <th className="text-left px-3 py-1.5 font-medium text-[9px] uppercase tracking-wider">Time</th>
                <th className="text-left px-3 py-1.5 font-medium text-[9px] uppercase tracking-wider">Side</th>
                <th className="text-right px-3 py-1.5 font-medium text-[9px] uppercase tracking-wider">Price</th>
                <th className="text-right px-3 py-1.5 font-medium text-[9px] uppercase tracking-wider">Amount</th>
                <th className="text-right px-3 py-1.5 font-medium text-[9px] uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody>
              {trades.map(trade => (
                <tr key={trade.id} className="border-b border-border/20 hover:bg-accent/20 transition-colors">
                  <td className="px-3 py-1.5 font-mono text-muted-foreground">
                    {new Date(trade.timestamp).toLocaleTimeString()}
                  </td>
                  <td className={`px-3 py-1.5 font-semibold ${trade.side === 'buy' ? 'text-trading-green' : 'text-trading-red'}`}>
                    {trade.side.toUpperCase()}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono text-foreground/80">{formatUSD(trade.price)}</td>
                  <td className="px-3 py-1.5 text-right font-mono text-foreground/80">{formatBTC(trade.amount)}</td>
                  <td className="px-3 py-1.5 text-right font-mono text-foreground">{formatUSD(trade.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TradeHistory;
