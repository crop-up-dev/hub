import { useState } from 'react';
import { TrendingUp, TrendingDown, Search, Star } from 'lucide-react';
import { CRYPTO_ASSETS, COMMODITY_ASSETS, FOREX_ASSETS, STOCK_ASSETS, NFT_ASSETS, AssetDefinition } from '@/lib/assets';
import { useAssetPrice } from '@/hooks/useMarketData';
import { formatNumber } from '@/lib/trading';
import { Input } from '@/components/ui/input';

const AssetRow = ({ asset, isSelected, onSelect }: { asset: AssetDefinition; isSelected?: boolean; onSelect?: (symbol: string) => void }) => {
  const { price, changePercent } = useAssetPrice(asset.symbol, asset.binanceSymbol);
  const isUp = changePercent >= 0;

  return (
    <button
      onClick={() => onSelect?.(asset.binanceSymbol || asset.symbol)}
      className={`w-full flex items-center justify-between px-3 py-2 hover:bg-accent/30 transition-all text-left ${
        isSelected ? 'bg-accent/40' : ''
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
          style={{ backgroundColor: asset.color + '18', color: asset.color }}
        >
          {asset.icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-foreground truncate">{asset.symbol}</div>
          <div className="text-[10px] text-muted-foreground truncate">{asset.name}</div>
        </div>
      </div>
      <div className="text-right shrink-0 ml-2">
        <div className="text-xs font-mono font-medium text-foreground">
          {price > 0 ? formatNumber(price, asset.decimals > 4 ? 2 : asset.decimals) : '—'}
        </div>
        <div className={`text-[10px] font-mono ${isUp ? 'text-trading-green' : 'text-trading-red'}`}>
          {isUp ? '+' : ''}{formatNumber(changePercent, 2)}%
        </div>
      </div>
    </button>
  );
};

const categories = [
  { key: 'currencies' as const, label: 'Currencies', assets: CRYPTO_ASSETS },
  { key: 'crypto' as const, label: 'Cryptocurrencies', assets: [...CRYPTO_ASSETS, ...NFT_ASSETS] },
  { key: 'commodities' as const, label: 'Commodities', assets: COMMODITY_ASSETS },
  { key: 'forex' as const, label: 'Forex', assets: FOREX_ASSETS },
  { key: 'stocks' as const, label: 'Stocks', assets: STOCK_ASSETS },
  { key: 'nft' as const, label: 'NFT', assets: NFT_ASSETS },
];

interface AssetListSidebarProps {
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
}

const AssetListSidebar = ({ selectedSymbol, onSymbolChange }: AssetListSidebarProps) => {
  const [activeCategory, setActiveCategory] = useState('crypto');
  const [searchQuery, setSearchQuery] = useState('');

  const currentCategory = categories.find(c => c.key === activeCategory)!;
  const filteredAssets = searchQuery
    ? currentCategory.assets.filter(a =>
        a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentCategory.assets;

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Search */}
      <div className="p-2 border-b border-border/50">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search asset"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-secondary/50 border-border/50"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-0.5 px-2 py-1.5 border-b border-border/50 overflow-x-auto scrollbar-thin">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => { setActiveCategory(cat.key); setSearchQuery(''); }}
            className={`px-2.5 py-1 text-[10px] font-medium rounded-md whitespace-nowrap transition-all ${
              activeCategory === cat.key
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 text-[9px] uppercase tracking-wider text-muted-foreground border-b border-border/30">
        <span>Asset Name</span>
        <div className="flex gap-4">
          <span>Price</span>
          <span>Change</span>
        </div>
      </div>

      {/* Asset list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filteredAssets.map(asset => (
          <AssetRow
            key={asset.symbol}
            asset={asset}
            isSelected={selectedSymbol === (asset.binanceSymbol || asset.symbol)}
            onSelect={onSymbolChange}
          />
        ))}
        {filteredAssets.length === 0 && (
          <div className="text-center py-8 text-xs text-muted-foreground">No assets found</div>
        )}
      </div>
    </div>
  );
};

export default AssetListSidebar;
