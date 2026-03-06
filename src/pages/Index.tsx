import { useState } from 'react';
import { loadPortfolio, Portfolio, savePortfolio } from '@/lib/trading';
import { loadProfile, saveProfile, UserProfile } from '@/lib/profile';
import { useBinanceTicker } from '@/hooks/useBinanceData';
import MarketHeader from '@/components/trading/MarketHeader';
import PriceChart from '@/components/trading/PriceChart';
import OrderBook from '@/components/trading/OrderBook';
import TradePanel from '@/components/trading/TradePanel';
import TradeHistory from '@/components/trading/TradeHistory';
import AssetListSidebar from '@/components/trading/AssetListSidebar';
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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr_240px] gap-0 overflow-hidden" style={{ height: 'calc(100vh - 52px)' }}>
        {/* Left column: Asset list sidebar */}
        <div className="hidden lg:flex flex-col bg-card border-r border-border/40 min-h-0 overflow-hidden">
          <AssetListSidebar
            selectedSymbol={selectedSymbol}
            onSymbolChange={setSelectedSymbol}
          />
        </div>

        {/* Middle column: Chart + Trade History + Order Book */}
        <div className="flex flex-col min-h-0 overflow-hidden">
          <div className="bg-card" style={{ height: '360px', minHeight: '280px' }}>
            <PriceChart symbol={selectedSymbol} />
          </div>
          <div className="bg-card border-t border-border/40" style={{ height: '140px' }}>
            <TradeHistory trades={portfolio.trades} />
          </div>
          <div className="bg-card border-t border-border/40 flex-1 min-h-0 overflow-hidden">
            <OrderBook symbol={selectedSymbol} />
          </div>
        </div>

        {/* Right column: Trade Panel only */}
        <div className="flex flex-col border-l border-border/40 min-h-0 overflow-auto">
          <div className="bg-card flex-1">
            <TradePanel
              portfolio={portfolio}
              currentPrice={ticker.price}
              onTradeExecuted={setPortfolio}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
