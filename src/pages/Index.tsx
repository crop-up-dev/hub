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
  const { ticker } = useBinanceTicker();

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
      />

      {/* Main trading grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_280px_280px] gap-px bg-border/40">
        {/* Left column: Chart on top, Trade History below */}
        <div className="flex flex-col gap-px bg-border/40">
          <div className="bg-card h-[520px]">
            <PriceChart />
          </div>
          <div className="bg-card flex-1 min-h-[180px]">
            <TradeHistory trades={portfolio.trades} />
          </div>
        </div>

        {/* Middle column: Order Book on top, Market Trades below */}
        <div className="flex flex-col gap-px bg-border/40">
          <div className="bg-card flex-1 min-h-0">
            <OrderBook />
          </div>
          <div className="bg-card min-h-[280px]">
            <RecentTrades />
          </div>
        </div>

        {/* Right column: Trade Panel on top, Portfolio below */}
        <div className="flex flex-col gap-px bg-border/40">
          <div className="bg-card">
            <TradePanel
              portfolio={portfolio}
              currentPrice={ticker.price}
              onTradeExecuted={setPortfolio}
            />
          </div>
          <div className="bg-card flex-1">
            <PortfolioSummary portfolio={portfolio} currentPrice={ticker.price} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
