import { Trade, formatNumber, formatUSD, formatBTC } from '@/lib/trading';

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
    <div className="flex flex-col bg-card rounded-lg border border-border">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Trade History</h3>
        {trades.length > 0 && (
          <button onClick={exportCSV} className="text-[10px] text-primary hover:underline">
            Export CSV
          </button>
        )}
      </div>

      <div className="overflow-y-auto max-h-[300px] scrollbar-thin">
        {trades.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm">
            No trades yet. Place your first order!
          </div>
        ) : (
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 bg-card">
              <tr className="text-muted-foreground border-b border-border">
                <th className="text-left px-3 py-1.5 font-medium">Time</th>
                <th className="text-left px-3 py-1.5 font-medium">Side</th>
                <th className="text-right px-3 py-1.5 font-medium">Price</th>
                <th className="text-right px-3 py-1.5 font-medium">Amount</th>
                <th className="text-right px-3 py-1.5 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {trades.map(trade => (
                <tr key={trade.id} className="border-b border-border/50 hover:bg-accent/30">
                  <td className="px-3 py-1.5 font-mono text-muted-foreground">
                    {new Date(trade.timestamp).toLocaleTimeString()}
                  </td>
                  <td className={`px-3 py-1.5 font-semibold ${trade.side === 'buy' ? 'text-trading-green' : 'text-trading-red'}`}>
                    {trade.side.toUpperCase()}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono">{formatUSD(trade.price)}</td>
                  <td className="px-3 py-1.5 text-right font-mono">{formatBTC(trade.amount)}</td>
                  <td className="px-3 py-1.5 text-right font-mono">{formatUSD(trade.total)}</td>
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
