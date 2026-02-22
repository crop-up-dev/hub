import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Portfolio, executeTrade, formatNumber, formatUSD, formatBTC } from '@/lib/trading';
import { toast } from 'sonner';

interface TradePanelProps {
  portfolio: Portfolio;
  currentPrice: number;
  onTradeExecuted: (portfolio: Portfolio) => void;
}

const TradePanel = ({ portfolio, currentPrice, onTradeExecuted }: TradePanelProps) => {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');

  const effectivePrice = orderType === 'market' ? currentPrice : parseFloat(price) || 0;
  const amountNum = parseFloat(amount) || 0;
  const total = effectivePrice * amountNum;

  const maxBuy = effectivePrice > 0 ? portfolio.usdtBalance / effectivePrice : 0;
  const maxSell = portfolio.btcBalance;

  const handlePercentage = (pct: number) => {
    const max = side === 'buy' ? maxBuy : maxSell;
    setAmount((max * pct).toFixed(6));
  };

  const handleSubmit = () => {
    if (amountNum <= 0) return toast.error('Enter a valid amount');
    if (effectivePrice <= 0) return toast.error('Invalid price');

    try {
      const updated = executeTrade(portfolio, side, orderType, effectivePrice, amountNum);
      onTradeExecuted(updated);
      setAmount('');
      setPrice('');
      toast.success(
        `${side === 'buy' ? 'Bought' : 'Sold'} ${formatBTC(amountNum)} BTC @ ${formatUSD(effectivePrice)}`,
        { description: `Total: ${formatUSD(total)}` }
      );
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="flex flex-col bg-card rounded-lg border border-border">
      <div className="px-3 py-2 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Trade</h3>
      </div>

      {/* Buy/Sell tabs */}
      <div className="grid grid-cols-2 m-3 mb-0 rounded-md overflow-hidden border border-border">
        <button
          onClick={() => setSide('buy')}
          className={`py-2 text-sm font-semibold transition-colors ${
            side === 'buy' ? 'bg-trading-green text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-accent'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide('sell')}
          className={`py-2 text-sm font-semibold transition-colors ${
            side === 'sell' ? 'bg-trading-red text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-accent'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Order type */}
      <div className="flex gap-2 px-3 pt-3">
        {(['market', 'limit'] as const).map(t => (
          <button
            key={t}
            onClick={() => setOrderType(t)}
            className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
              orderType === t ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="p-3 space-y-3">
        {/* Available balance */}
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Available</span>
          <span className="font-mono text-foreground">
            {side === 'buy' ? formatUSD(portfolio.usdtBalance) : `${formatBTC(portfolio.btcBalance)} BTC`}
          </span>
        </div>

        {/* Price input */}
        {orderType === 'limit' ? (
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Price (USDT)</label>
            <Input
              type="number"
              placeholder="Limit price"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="font-mono bg-secondary border-border h-9 text-sm"
            />
          </div>
        ) : (
          <div className="flex justify-between text-xs py-1">
            <span className="text-muted-foreground">Market Price</span>
            <span className="font-mono text-foreground">{formatUSD(currentPrice)}</span>
          </div>
        )}

        {/* Amount input */}
        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block">Amount (BTC)</label>
          <Input
            type="number"
            placeholder="0.000000"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="font-mono bg-secondary border-border h-9 text-sm"
          />
        </div>

        {/* Percentage buttons */}
        <div className="grid grid-cols-4 gap-1.5">
          {[0.25, 0.5, 0.75, 1].map(pct => (
            <button
              key={pct}
              onClick={() => handlePercentage(pct)}
              className="py-1 text-[10px] font-medium rounded bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {pct * 100}%
            </button>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-between text-xs pt-1 border-t border-border">
          <span className="text-muted-foreground">Total</span>
          <span className="font-mono text-foreground">{formatUSD(total)}</span>
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          className={`w-full font-semibold ${
            side === 'buy' ? 'bg-trading-green hover:bg-trading-green/90' : 'bg-trading-red hover:bg-trading-red/90'
          } text-primary-foreground`}
        >
          {side === 'buy' ? 'Buy' : 'Sell'} BTC
        </Button>
      </div>
    </div>
  );
};

export default TradePanel;
