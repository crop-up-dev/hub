import { useBinanceTicker, SUPPORTED_ASSETS } from '@/hooks/useBinanceData';
import { UserProfile } from '@/lib/profile';
import { Portfolio } from '@/lib/trading';
import ProfileDropdown from './ProfileDropdown';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import hubLogo from '@/assets/hub-logo.png';

interface MarketHeaderProps {
  profile: UserProfile;
  portfolio: Portfolio;
  onProfileUpdate: (profile: UserProfile) => void;
  onResetAccount: () => void;
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
}

const MarketHeader = ({ profile, portfolio, onProfileUpdate, onResetAccount, selectedSymbol, onSymbolChange }: MarketHeaderProps) => {
  const navigate = useNavigate();
  const { ticker } = useBinanceTicker(selectedSymbol);

  return (
    <header className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-2.5 shrink-0">
        <img src={hubLogo} alt="HUB" className="w-8 h-8 rounded-lg" />
        <span className="font-bold text-primary text-sm tracking-wide">HUB</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={() => navigate('/payments')}
          size="sm"
          className="bg-trading-green hover:bg-trading-green/90 text-primary-foreground gap-1.5 h-8 text-xs font-semibold"
        >
          Deposit
        </Button>
        <ProfileDropdown
          profile={profile}
          portfolio={portfolio}
          currentPrice={ticker.price}
          onProfileUpdate={onProfileUpdate}
          onResetAccount={onResetAccount}
        />
      </div>
    </header>
  );
};

export default MarketHeader;
