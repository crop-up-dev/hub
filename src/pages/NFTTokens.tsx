import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { NFT_ASSETS, AssetDefinition } from '@/lib/assets';
import { useAssetPrice } from '@/hooks/useMarketData';
import { formatNumber } from '@/lib/trading';

const NFTAssetRow = ({ asset }: { asset: AssetDefinition }) => {
  const { price, changePercent } = useAssetPrice(asset.symbol, asset.binanceSymbol);
  const isUp = changePercent >= 0;

  return (
    <div className="flex items-center justify-between p-4 rounded-xl hover:bg-accent/30 transition-all">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ backgroundColor: asset.color + '18' }}
        >
          {asset.icon}
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">{asset.symbol}</div>
          <div className="text-xs text-muted-foreground">{asset.name}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-mono font-medium text-foreground">
          ${formatNumber(price, asset.decimals)}
        </div>
        <div className={`flex items-center gap-1 text-xs font-mono justify-end ${isUp ? 'text-trading-green' : 'text-trading-red'}`}>
          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isUp ? '+' : ''}{formatNumber(changePercent, 2)}%
        </div>
      </div>
    </div>
  );
};

const NFTTokens = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">NFT Tokens</h1>
            <p className="text-xs text-muted-foreground">Trade NFT ecosystem tokens</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="section-header mb-4">NFT Tokens</h3>
          <div className="space-y-1">
            {NFT_ASSETS.map(asset => (
              <NFTAssetRow key={asset.symbol} asset={asset} />
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <h3 className="section-header mb-4">About NFT Tokens</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            NFT tokens represent governance and utility tokens from major NFT ecosystems. 
            Trade BLUR, APE, MANA, and SAND with real-time prices from Binance.
          </p>
          <Button onClick={() => navigate('/')} className="mt-3 bg-primary text-primary-foreground hover:bg-primary/90">
            Go to Trading Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NFTTokens;
