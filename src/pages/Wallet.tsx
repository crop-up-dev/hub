import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Portfolio, loadPortfolio, formatUSD, formatBTC, formatNumber } from '@/lib/trading';
import { useBinanceTicker } from '@/hooks/useBinanceData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Copy, ArrowUpRight, ArrowDownLeft, Check } from 'lucide-react';
import { toast } from 'sonner';

// Generate a deterministic fake wallet address
function generateWalletAddress(prefix: string, seed: string): string {
  const chars = '0123456789abcdef';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  let addr = prefix;
  for (let i = 0; i < 40; i++) {
    addr += chars[Math.abs((hash * (i + 1) * 7) % chars.length)];
  }
  return addr;
}

// Simple QR code SVG generator
function QRCodeSVG({ data, size = 160 }: { data: string; size?: number }) {
  const modules = 21;
  const cellSize = size / modules;
  let hash = 0;
  for (let i = 0; i < data.length; i++) hash = data.charCodeAt(i) + ((hash << 5) - hash);

  const cells: boolean[][] = [];
  for (let r = 0; r < modules; r++) {
    cells[r] = [];
    for (let c = 0; c < modules; c++) {
      const isFinderTL = r < 7 && c < 7;
      const isFinderTR = r < 7 && c >= modules - 7;
      const isFinderBL = r >= modules - 7 && c < 7;
      if (isFinderTL || isFinderTR || isFinderBL) {
        const lr = isFinderTL ? r : isFinderTR ? r : r - (modules - 7);
        const lc = isFinderTL ? c : isFinderTR ? c - (modules - 7) : c;
        cells[r][c] = (lr === 0 || lr === 6 || lc === 0 || lc === 6) ||
                      (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4);
      } else {
        const val = Math.abs((hash * (r * modules + c + 1) * 13) % 100);
        cells[r][c] = val < 45;
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg">
      <rect width={size} height={size} fill="white" rx="8" />
      {cells.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect key={`${r}-${c}`} x={c * cellSize} y={r * cellSize} width={cellSize} height={cellSize} fill="#0a0e17" rx={0.5} />
          ) : null
        )
      )}
    </svg>
  );
}

interface CryptoAsset {
  symbol: string;
  name: string;
  balance: number;
  displayBalance: string;
  value: string;
  icon: string;
  color: string;
  addressPrefix: string;
  addressSeed: string;
  network: string;
  confirmations: string;
  estFee: string;
}

const CRYPTO_ASSETS: Omit<CryptoAsset, 'balance' | 'displayBalance' | 'value'>[] = [
  { symbol: 'BTC', name: 'Bitcoin', icon: '₿', color: 'hsl(35, 95%, 55%)', addressPrefix: 'bc1q', addressSeed: 'btc-wallet-user-main', network: 'Bitcoin Mainnet', confirmations: '3 blocks', estFee: '~0.00005 BTC' },
  { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', color: 'hsl(225, 60%, 58%)', addressPrefix: '0x', addressSeed: 'eth-wallet-user-main', network: 'Ethereum Mainnet', confirmations: '12 blocks', estFee: '~0.002 ETH' },
  { symbol: 'SOL', name: 'Solana', icon: 'S', color: 'hsl(270, 80%, 60%)', addressPrefix: '', addressSeed: 'sol-wallet-user-main', network: 'Solana Mainnet', confirmations: '32 slots', estFee: '~0.00025 SOL' },
  { symbol: 'XRP', name: 'Ripple', icon: 'X', color: 'hsl(210, 10%, 50%)', addressPrefix: 'r', addressSeed: 'xrp-wallet-user-main', network: 'XRP Ledger', confirmations: '4 ledgers', estFee: '~0.00001 XRP' },
  { symbol: 'ADA', name: 'Cardano', icon: 'A', color: 'hsl(210, 70%, 55%)', addressPrefix: 'addr1', addressSeed: 'ada-wallet-user-main', network: 'Cardano Mainnet', confirmations: '15 blocks', estFee: '~0.17 ADA' },
  { symbol: 'USDT', name: 'Tether', icon: '₮', color: 'hsl(152, 69%, 46%)', addressPrefix: '0x', addressSeed: 'usdt-wallet-user-trc20', network: 'Ethereum (ERC-20)', confirmations: '12 blocks', estFee: '~$1.50 USDT' },
];

// Simulated prices for non-BTC assets
const SIMULATED_PRICES: Record<string, number> = {
  ETH: 3450.20,
  SOL: 178.50,
  XRP: 2.35,
  ADA: 0.72,
};

// Simulated balances for the new cryptos
const SIMULATED_BALANCES: Record<string, number> = {
  ETH: 1.245,
  SOL: 25.8,
  XRP: 1500,
  ADA: 3200,
};

const Wallet = () => {
  const navigate = useNavigate();
  const { ticker } = useBinanceTicker();
  const [portfolio] = useState<Portfolio>(loadPortfolio);
  const [activeTab, setActiveTab] = useState<'receive' | 'send'>('receive');
  const [sendAddress, setSendAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [copied, setCopied] = useState(false);

  const getBalance = (symbol: string) => {
    if (symbol === 'BTC') return portfolio.btcBalance;
    if (symbol === 'USDT') return portfolio.usdtBalance;
    return SIMULATED_BALANCES[symbol] || 0;
  };

  const getPrice = (symbol: string) => {
    if (symbol === 'BTC') return ticker.price;
    if (symbol === 'USDT') return 1;
    return SIMULATED_PRICES[symbol] || 0;
  };

  const assets: CryptoAsset[] = CRYPTO_ASSETS.map(a => {
    const balance = getBalance(a.symbol);
    const price = getPrice(a.symbol);
    const value = balance * price;
    return {
      ...a,
      balance,
      displayBalance: a.symbol === 'USDT' ? formatUSD(balance) : `${formatNumber(balance, a.symbol === 'BTC' ? 6 : 4)} ${a.symbol}`,
      value: formatUSD(value),
    };
  });

  const totalValue = assets.reduce((sum, a) => sum + a.balance * getPrice(a.symbol), 0);
  const selectedMeta = CRYPTO_ASSETS.find(a => a.symbol === selectedAsset)!;
  const currentAddress = generateWalletAddress(selectedMeta.addressPrefix, selectedMeta.addressSeed);
  const selectedBalance = getBalance(selectedAsset);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentAddress);
    setCopied(true);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    if (!sendAddress.trim()) return toast.error('Enter a wallet address');
    if (!sendAmount || parseFloat(sendAmount) <= 0) return toast.error('Enter a valid amount');
    const amt = parseFloat(sendAmount);
    if (amt > selectedBalance) return toast.error(`Insufficient ${selectedAsset} balance`);
    toast.success(`Sent ${formatNumber(amt, 6)} ${selectedAsset}`, {
      description: `To: ${sendAddress.slice(0, 12)}...${sendAddress.slice(-6)}`,
    });
    setSendAddress('');
    setSendAmount('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">Wallet</h1>
            <p className="text-xs text-muted-foreground">Manage your crypto assets</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Total Balance Card */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Balance</p>
            <div className="text-3xl font-bold font-mono text-foreground">{formatUSD(totalValue)}</div>
            <div className="flex items-center gap-3 mt-3">
              <Button size="sm" onClick={() => setActiveTab('receive')} className="bg-trading-green hover:bg-trading-green/90 text-primary-foreground gap-1.5">
                <ArrowDownLeft className="w-3.5 h-3.5" /> Receive
              </Button>
              <Button size="sm" onClick={() => setActiveTab('send')} className="bg-trading-red hover:bg-trading-red/90 text-primary-foreground gap-1.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> Send
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Assets List */}
          <div className="glass-panel rounded-2xl p-5">
            <h3 className="section-header mb-4">Assets</h3>
            <div className="space-y-1">
              {assets.map(asset => (
                <button
                  key={asset.symbol}
                  onClick={() => setSelectedAsset(asset.symbol)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                    selectedAsset === asset.symbol ? 'bg-accent/60 ring-1 ring-primary/20' : 'hover:bg-accent/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                      style={{ backgroundColor: asset.color + '18', color: asset.color }}
                    >
                      {asset.icon}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-foreground">{asset.symbol}</div>
                      <div className="text-xs text-muted-foreground">{asset.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono font-medium text-foreground">{asset.displayBalance}</div>
                    <div className="text-xs font-mono text-muted-foreground">≈ {asset.value}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Send/Receive Panel */}
          <div className="glass-panel rounded-2xl p-5">
            <div className="grid grid-cols-2 rounded-xl overflow-hidden mb-5 bg-secondary/50">
              <button
                onClick={() => setActiveTab('receive')}
                className={`py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'receive' ? 'bg-trading-green text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" /> Receive
              </button>
              <button
                onClick={() => setActiveTab('send')}
                className={`py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'send' ? 'bg-trading-red text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" /> Send
              </button>
            </div>

            {/* Asset selector pills */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {CRYPTO_ASSETS.map(a => (
                <button
                  key={a.symbol}
                  onClick={() => setSelectedAsset(a.symbol)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    selectedAsset === a.symbol
                      ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                      : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {a.symbol}
                </button>
              ))}
            </div>

            {activeTab === 'receive' ? (
              <div className="space-y-4">
                <div className="flex justify-center p-4 bg-white rounded-xl">
                  <QRCodeSVG data={currentAddress} size={180} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    {selectedAsset} Deposit Address
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-xs font-mono text-foreground/80 break-all leading-relaxed">
                      {currentAddress}
                    </div>
                    <Button size="icon" variant="outline" onClick={handleCopy} className="shrink-0 h-10 w-10">
                      {copied ? <Check className="w-4 h-4 text-trading-green" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <span className="text-primary font-medium">Note:</span> Only send {selectedAsset} to this address.
                    Sending other assets may result in permanent loss.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between text-xs bg-secondary/30 rounded-lg px-3 py-2.5">
                  <span className="text-muted-foreground">Available</span>
                  <span className="font-mono text-foreground font-medium">
                    {formatNumber(selectedBalance, selectedAsset === 'BTC' ? 6 : selectedAsset === 'USDT' ? 2 : 4)} {selectedAsset}
                  </span>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 block">Recipient Address</label>
                  <Input
                    placeholder={`${selectedMeta.addressPrefix}...`}
                    value={sendAddress}
                    onChange={e => setSendAddress(e.target.value)}
                    className="font-mono bg-secondary/50 border-border/50 h-10 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 block">Amount ({selectedAsset})</label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={sendAmount}
                      onChange={e => setSendAmount(e.target.value)}
                      className="font-mono bg-secondary/50 border-border/50 h-10 text-sm pr-16"
                    />
                    <button
                      onClick={() => setSendAmount(selectedBalance.toFixed(selectedAsset === 'BTC' ? 6 : selectedAsset === 'USDT' ? 2 : 4))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-primary hover:text-primary/80 transition-colors px-1.5 py-0.5 rounded bg-primary/10"
                    >
                      MAX
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0.25, 0.5, 0.75, 1].map(pct => (
                    <button
                      key={pct}
                      onClick={() => setSendAmount((selectedBalance * pct).toFixed(selectedAsset === 'BTC' ? 6 : selectedAsset === 'USDT' ? 2 : 4))}
                      className="py-1.5 text-[10px] font-medium rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                    >
                      {pct * 100}%
                    </button>
                  ))}
                </div>
                <Button onClick={handleSend} className="w-full bg-trading-red hover:bg-trading-red/90 text-primary-foreground font-semibold h-11 gap-2">
                  <ArrowUpRight className="w-4 h-4" /> Send {selectedAsset}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Network info */}
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="section-header mb-3">Network Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground">Network</span>
              <div className="font-medium text-foreground">{selectedMeta.network}</div>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Confirmations</span>
              <div className="font-medium text-foreground">{selectedMeta.confirmations}</div>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Est. Fee</span>
              <div className="font-medium text-foreground">{selectedMeta.estFee}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
