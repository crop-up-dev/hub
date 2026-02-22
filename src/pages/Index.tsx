import { useState, useEffect } from 'react';
import { loadPortfolio, Portfolio } from '@/lib/trading';
import { useBinanceTicker } from '@/hooks/useBinanceData';
import MarketHeader from '@/components/trading/MarketHeader';
import PriceChart from '@/components/trading/PriceChart';
import OrderBook from '@/components/trading/OrderBook';
import TradePanel from '@/components/trading/TradePanel';
import TradeHistory from '@/components/trading/TradeHistory';
import PortfolioSummary from '@/components/trading/PortfolioSummary';
import RecentTrades from '@/components/trading/RecentTrades';

const Index = () => {
  const [portfolio, setPortfolio] = useState<Portfolio>(loadPortfolio);
  const { ticker } = useBinanceTicker();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top market header */}
      <MarketHeader />

      {/* Main content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_280px_280px] gap-px bg-border">
        {/* Left: Chart + Trade History */}
        <div className="flex flex-col gap-px bg-border">
          <div className="bg-background h-[450px]">
            <PriceChart />
          </div>
          <div className="bg-background flex-1">
            <TradeHistory trades={portfolio.trades} />
          </div>
        </div>

        {/* Middle: Order Book + Recent Trades */}
        <div className="flex flex-col gap-px bg-border">
          <div className="bg-background flex-1">
            <OrderBook />
          </div>
          <div className="bg-background">
            <RecentTrades />
          </div>
        </div>

        {/* Right: Trade Panel + Portfolio */}
        <div className="flex flex-col gap-px bg-border">
          <div className="bg-background">
            <TradePanel
              portfolio={portfolio}
              currentPrice={ticker.price}
              onTradeExecuted={setPortfolio}
            />
          </div>
          <div className="bg-background flex-1">
            <PortfolioSummary portfolio={portfolio} currentPrice={ticker.price} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
