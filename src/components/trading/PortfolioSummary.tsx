import { Portfolio, formatUSD, formatBTC, formatNumber, getAverageEntryPrice } from '@/lib/trading';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface PortfolioSummaryProps {
  portfolio: Portfolio;
  currentPrice: number;
}

const PortfolioSummary = ({ portfolio, currentPrice }: PortfolioSummaryProps) => {
  const btcValue = portfolio.btcBalance * currentPrice;
  const totalValue = portfolio.usdtBalance + btcValue;
  const pnl = totalValue - 10000;
  const pnlPercent = (pnl / 10000) * 100;
  const avgEntry = getAverageEntryPrice(portfolio.trades);
  const unrealizedPnl = portfolio.btcBalance > 0 && avgEntry > 0
    ? (currentPrice - avgEntry) * portfolio.btcBalance
    : 0;

  const pieData = [
    { name: 'USDT', value: portfolio.usdtBalance },
    { name: 'BTC', value: btcValue },
  ].filter(d => d.value > 0);

  const COLORS = ['hsl(45, 100%, 51%)', 'hsl(25, 95%, 53%)'];

  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Portfolio</h3>

      <div className="flex items-center gap-4">
        <div className="w-20 h-20">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={22} outerRadius={35} dataKey="value" strokeWidth={0}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div className="text-lg font-bold font-mono text-foreground">{formatUSD(totalValue)}</div>
          <div className={`text-xs font-mono ${pnl >= 0 ? 'text-trading-green' : 'text-trading-red'}`}>
            {pnl >= 0 ? '+' : ''}{formatUSD(pnl)} ({formatNumber(pnlPercent)}%)
          </div>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">USDT Balance</span>
          <span className="font-mono text-foreground">{formatUSD(portfolio.usdtBalance)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">BTC Balance</span>
          <span className="font-mono text-foreground">{formatBTC(portfolio.btcBalance)} BTC</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">BTC Value</span>
          <span className="font-mono text-foreground">{formatUSD(btcValue)}</span>
        </div>
        {avgEntry > 0 && (
          <>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="text-muted-foreground">Avg Entry</span>
              <span className="font-mono text-foreground">{formatUSD(avgEntry)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Unrealized P&L</span>
              <span className={`font-mono ${unrealizedPnl >= 0 ? 'text-trading-green' : 'text-trading-red'}`}>
                {unrealizedPnl >= 0 ? '+' : ''}{formatUSD(unrealizedPnl)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PortfolioSummary;
