import { Portfolio, formatUSD, formatBTC, formatNumber, getAverageEntryPrice } from '@/lib/trading';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface PortfolioSummaryProps {
  portfolio: Portfolio;
  currentPrice: number;
}

const PortfolioSummary = ({ portfolio, currentPrice }: PortfolioSummaryProps) => {
  const btcValue = portfolio.btcBalance * currentPrice;
  // Simulated other crypto values
  const ethValue = 1.245 * 3450.20;
  const solValue = 25.8 * 178.50;
  const xrpValue = 1500 * 2.35;
  const adaValue = 3200 * 0.72;
  const totalValue = portfolio.usdtBalance + btcValue + ethValue + solValue + xrpValue + adaValue;
  const pnl = totalValue - 10000;
  const pnlPercent = (pnl / 10000) * 100;
  const avgEntry = getAverageEntryPrice(portfolio.trades);
  const unrealizedPnl = portfolio.btcBalance > 0 && avgEntry > 0
    ? (currentPrice - avgEntry) * portfolio.btcBalance
    : 0;

  const pieData = [
    { name: 'USDT', value: portfolio.usdtBalance },
    { name: 'BTC', value: btcValue },
    { name: 'ETH', value: ethValue },
    { name: 'SOL', value: solValue },
    { name: 'XRP', value: xrpValue },
    { name: 'ADA', value: adaValue },
  ].filter(d => d.value > 0);

  const COLORS = ['hsl(47, 100%, 50%)', 'hsl(35, 95%, 55%)', 'hsl(225, 60%, 58%)', 'hsl(270, 80%, 60%)', 'hsl(210, 10%, 50%)', 'hsl(210, 70%, 55%)'];

  return (
    <div className="p-4 space-y-4">
      <span className="section-header">Portfolio</span>

      <div className="flex items-center gap-4 mt-3">
        <div className="w-[72px] h-[72px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={22} outerRadius={32} dataKey="value" strokeWidth={0}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div className="text-lg font-bold font-mono text-foreground">{formatUSD(totalValue)}</div>
          <div className={`flex items-center gap-1.5 mt-0.5`}>
            <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${pnl >= 0 ? 'bg-trading-green/10 text-trading-green' : 'bg-trading-red/10 text-trading-red'}`}>
              {pnl >= 0 ? '+' : ''}{formatUSD(pnl)}
            </span>
            <span className={`text-[10px] font-mono ${pnl >= 0 ? 'text-trading-green' : 'text-trading-red'}`}>
              ({formatNumber(pnlPercent)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 text-xs pt-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">USDT</span>
          <span className="font-mono text-foreground">{formatUSD(portfolio.usdtBalance)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">BTC</span>
          <span className="font-mono text-foreground">{formatBTC(portfolio.btcBalance)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">BTC Value</span>
          <span className="font-mono text-foreground">{formatUSD(btcValue)}</span>
        </div>
        {avgEntry > 0 && (
          <>
            <div className="border-t border-border/30 pt-2 flex justify-between">
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
