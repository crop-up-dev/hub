import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, loadProfile, saveProfile, getInitials, getAvatarColor } from '@/lib/profile';
import { Portfolio, loadPortfolio, formatUSD, formatBTC, formatNumber, getAverageEntryPrice } from '@/lib/trading';
import { useBinanceTicker } from '@/hooks/useBinanceData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Edit3, TrendingUp, TrendingDown, BarChart3, Clock, Wallet, Target } from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  const navigate = useNavigate();
  const { ticker } = useBinanceTicker();
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [portfolio] = useState<Portfolio>(loadPortfolio);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(profile.displayName);

  const btcValue = portfolio.btcBalance * ticker.price;
  const totalValue = portfolio.usdtBalance + btcValue;
  const pnl = totalValue - 10000;
  const pnlPercent = (pnl / 10000) * 100;
  const avgEntry = getAverageEntryPrice(portfolio.trades);
  const totalTrades = portfolio.trades.length;
  const buyTrades = portfolio.trades.filter(t => t.side === 'buy').length;
  const sellTrades = portfolio.trades.filter(t => t.side === 'sell').length;
  const totalVolume = portfolio.trades.reduce((sum, t) => sum + t.total, 0);

  const initials = getInitials(profile.displayName);
  const avatarColor = getAvatarColor(profile.displayName);

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    const updated = { ...profile, displayName: nameInput.trim() };
    saveProfile(updated);
    setProfile(updated);
    setEditing(false);
    toast.success('Profile updated');
  };

  const stats = [
    { label: 'Total Value', value: formatUSD(totalValue), icon: Wallet, color: 'text-primary' },
    { label: 'P&L', value: `${pnl >= 0 ? '+' : ''}${formatUSD(pnl)}`, icon: pnl >= 0 ? TrendingUp : TrendingDown, color: pnl >= 0 ? 'text-trading-green' : 'text-trading-red' },
    { label: 'P&L %', value: `${pnl >= 0 ? '+' : ''}${formatNumber(pnlPercent)}%`, icon: BarChart3, color: pnl >= 0 ? 'text-trading-green' : 'text-trading-red' },
    { label: 'Total Trades', value: totalTrades.toString(), icon: Clock, color: 'text-foreground' },
    { label: 'Volume Traded', value: formatUSD(totalVolume), icon: Target, color: 'text-foreground' },
    { label: 'Avg Entry', value: avgEntry > 0 ? formatUSD(avgEntry) : '—', icon: Target, color: 'text-foreground' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Profile card */}
        <div className="glass-panel rounded-xl p-6">
          <div className="flex items-start gap-5">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0"
              style={{ backgroundColor: avatarColor + '22', color: avatarColor, border: `2px solid ${avatarColor}44` }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                    className="bg-secondary border-border h-9 text-sm max-w-[200px]"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSaveName}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setNameInput(profile.displayName); }}>Cancel</Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">{profile.displayName}</h2>
                  <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-1">Paper Trading Account</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Joined {new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {stats.map((stat, i) => (
            <div key={i} className="glass-panel rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              </div>
              <div className={`text-lg font-bold font-mono ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Holdings */}
        <div className="glass-panel rounded-xl p-6">
          <h3 className="section-header mb-4">Holdings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold text-xs">₮</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">USDT</div>
                  <div className="text-xs text-muted-foreground">Tether</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono font-medium text-foreground">{formatUSD(portfolio.usdtBalance)}</div>
              </div>
            </div>
            <div className="border-t border-border" />
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold text-xs">₿</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">BTC</div>
                  <div className="text-xs text-muted-foreground">Bitcoin</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono font-medium text-foreground">{formatBTC(portfolio.btcBalance)} BTC</div>
                <div className="text-xs font-mono text-muted-foreground">{formatUSD(btcValue)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent trades summary */}
        <div className="glass-panel rounded-xl p-6">
          <h3 className="section-header mb-4">Trade Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold font-mono text-foreground">{totalTrades}</div>
              <div className="text-xs text-muted-foreground mt-1">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-trading-green">{buyTrades}</div>
              <div className="text-xs text-muted-foreground mt-1">Buys</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-trading-red">{sellTrades}</div>
              <div className="text-xs text-muted-foreground mt-1">Sells</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
