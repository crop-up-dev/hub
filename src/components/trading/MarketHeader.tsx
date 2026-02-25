import { useBinanceTicker, SUPPORTED_ASSETS } from '@/hooks/useBinanceData';
import { formatNumber, formatUSD } from '@/lib/trading';
import { UserProfile } from '@/lib/profile';
import { Portfolio } from '@/lib/trading';
import { TrendingUp, TrendingDown, Activity, ChevronDown } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface MarketHeaderProps {
  profile: UserProfile;
  portfolio: Portfolio;
  onProfileUpdate: (profile: UserProfile) => void;
  onResetAccount: () => void;
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
}

const MarketHeader = ({ profile, portfolio, onProfileUpdate, onResetAccount, selectedSymbol, onSymbolChange }: MarketHeaderProps) => {
  const { ticker, prevPrice } = useBinanceTicker(selectedSymbol);
  const isUp = ticker.priceChangePercent >= 0;
  const priceDirection = ticker.price > prevPrice ? 'up' : ticker.price < prevPrice ? 'down' : 'same';
  const currentAsset = SUPPORTED_ASSETS.find(a => a.symbol === selectedSymbol) || SUPPORTED_ASSETS[0];

  return (
    <header className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-50">
      {/* Left: Logo + Pair */}
      <div className="flex items-center gap-5 overflow-x-auto">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center glow-primary">
            <span className="text-primary font-bold text-sm tracking-tight">H</span>
          </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-primary text-sm tracking-wide">HUB</span>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 text-muted-foreground text-[11px] hover:text-foreground transition-colors cursor-pointer">
                    {currentAsset.base}/USDT <ChevronDown className="w-3 h-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[140px]">
                    {SUPPORTED_ASSETS.map(asset => (
                      <DropdownMenuItem
                        key={asset.symbol}
                        onClick={() => onSymbolChange(asset.symbol)}
                        className={`font-mono text-xs ${selectedSymbol === asset.symbol ? 'bg-accent' : ''}`}
                      >
                        {asset.base}/USDT
                        <span className="ml-auto text-muted-foreground text-[10px]">{asset.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
        </div>

        {/* Price */}
        <div className="shrink-0">
          <span className={`font-mono text-xl font-bold tracking-tight ${priceDirection === 'up' ? 'text-trading-green' : priceDirection === 'down' ? 'text-trading-red' : 'text-foreground'}`}>
            {formatUSD(ticker.price)}
          </span>
        </div>

        {/* Change */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-medium ${isUp ? 'bg-trading-green/10 text-trading-green' : 'bg-trading-red/10 text-trading-red'}`}>
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isUp ? '+' : ''}{formatNumber(ticker.priceChangePercent)}%
          </div>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-5 text-[11px] text-muted-foreground shrink-0 ml-2">
          <div className="space-y-0.5">
            <span className="block uppercase tracking-wider text-[9px]">24h High</span>
            <span className="font-mono text-foreground text-xs">{formatUSD(ticker.high)}</span>
          </div>
          <div className="space-y-0.5">
            <span className="block uppercase tracking-wider text-[9px]">24h Low</span>
            <span className="font-mono text-foreground text-xs">{formatUSD(ticker.low)}</span>
          </div>
          <div className="space-y-0.5">
            <span className="block uppercase tracking-wider text-[9px]">24h Vol</span>
            <span className="font-mono text-foreground text-xs">{formatNumber(ticker.volume, 2)} {currentAsset.base}</span>
          </div>
          <div className="flex items-center gap-1 text-trading-green">
            <Activity className="w-3 h-3" />
            <span className="text-[10px] font-medium">Live</span>
          </div>
        </div>
      </div>

      {/* Right: Profile */}
      <ProfileDropdown
        profile={profile}
        portfolio={portfolio}
        currentPrice={ticker.price}
        onProfileUpdate={onProfileUpdate}
        onResetAccount={onResetAccount}
      />
    </header>
  );
};

export default MarketHeader;
