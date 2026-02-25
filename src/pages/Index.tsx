import { useState } from 'react';
import { loadPortfolio, Portfolio, savePortfolio } from '@/lib/trading';
import { loadProfile, saveProfile, UserProfile } from '@/lib/profile';
import { useBinanceTicker } from '@/hooks/useBinanceData';
import MarketHeader from '@/components/trading/MarketHeader';
import PriceChart from '@/components/trading/PriceChart';
import OrderBook from '@/components/trading/OrderBook';
import TradePanel from '@/components/trading/TradePanel';
import TradeHistory from '@/components/trading/TradeHistory';
import PortfolioSummary from '@/components/trading/PortfolioSummary';
import RecentTrades from '@/components/trading/RecentTrades';
import { toast } from 'sonner';

const Index = () => {
  const [portfolio, setPortfolio] = useState<Portfolio>(loadPortfolio);
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [selectedSymbol, setSelectedSymbol] = useState('btcusdt');
  const { ticker } = useBinanceTicker(selectedSymbol);

  const handleProfileUpdate = (updated: UserProfile) => {
    saveProfile(updated);
    setProfile(updated);
  };

  const handleResetAccount = () => {
    const fresh: Portfolio = { usdtBalance: 10000, btcBalance: 0, trades: [], balanceHistory: [{ timestamp: Date.now(), balance: 10000 }] };
    savePortfolio(fresh);
    setPortfolio(fresh);
    toast.success('Account reset to $10,000 USDT');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MarketHeader
        profile={profile}
        portfolio={portfolio}
        onProfileUpdate={handleProfileUpdate}
        onResetAccount={handleResetAccount}
        selectedSymbol={selectedSymbol}
        onSymbolChange={setSelectedSymbol}
      />

      {/* Main trading grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_280px_280px] gap-[1px] bg-border/50 overflow-hidden">
        {/* Left column: Chart + Trade History + Order Book */}
        <div className="flex flex-col gap-[1px] bg-border/50">
          <div className="bg-card h-[480px]">
            <PriceChart symbol={selectedSymbol} />
          </div>
          <div className="bg-card min-h-[160px] max-h-[220px]">
            <TradeHistory trades={portfolio.trades} />
          </div>
          <div className="bg-card flex-1 min-h-[240px]">
            <OrderBook symbol={selectedSymbol} />
          </div>
        </div>

        {/* Middle column: Market Trades (full height) */}
        <div className="flex flex-col gap-[1px] bg-border/50">
          <div className="bg-card flex-1 min-h-0">
            <RecentTrades symbol={selectedSymbol} />
          </div>
        </div>

        {/* Right column: Trade Panel + Portfolio */}
        <div className="flex flex-col gap-[1px] bg-border/50">
          <div className="bg-card">
            <TradePanel
              portfolio={portfolio}
              currentPrice={ticker.price}
              onTradeExecuted={setPortfolio}
            />
          </div>
          <div className="bg-card flex-1 min-h-0">
            <PortfolioSummary portfolio={portfolio} currentPrice={ticker.price} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
