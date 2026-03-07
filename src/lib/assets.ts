// Asset definitions for all supported classes

export type AssetClass = 'crypto' | 'commodities' | 'forex' | 'stocks' | 'nft';

export interface AssetDefinition {
  symbol: string;
  binanceSymbol?: string; // if available on Binance
  name: string;
  class: AssetClass;
  icon: string;
  color: string;
  decimals: number;
  unit: string;
}

export const CRYPTO_ASSETS: AssetDefinition[] = [
  { symbol: 'BTC', binanceSymbol: 'btcusdt', name: 'Bitcoin', class: 'crypto', icon: '₿', color: 'hsl(35, 95%, 55%)', decimals: 6, unit: 'BTC' },
  { symbol: 'ETH', binanceSymbol: 'ethusdt', name: 'Ethereum', class: 'crypto', icon: 'Ξ', color: 'hsl(225, 60%, 58%)', decimals: 4, unit: 'ETH' },
  { symbol: 'BNB', binanceSymbol: 'bnbusdt', name: 'BNB', class: 'crypto', icon: 'B', color: 'hsl(45, 90%, 50%)', decimals: 4, unit: 'BNB' },
  { symbol: 'SOL', binanceSymbol: 'solusdt', name: 'Solana', class: 'crypto', icon: 'S', color: 'hsl(270, 80%, 60%)', decimals: 4, unit: 'SOL' },
  { symbol: 'XRP', binanceSymbol: 'xrpusdt', name: 'XRP', class: 'crypto', icon: 'X', color: 'hsl(210, 10%, 50%)', decimals: 4, unit: 'XRP' },
  { symbol: 'ADA', binanceSymbol: 'adausdt', name: 'Cardano', class: 'crypto', icon: 'A', color: 'hsl(210, 70%, 55%)', decimals: 4, unit: 'ADA' },
  { symbol: 'DOGE', binanceSymbol: 'dogeusdt', name: 'Dogecoin', class: 'crypto', icon: 'D', color: 'hsl(40, 80%, 55%)', decimals: 4, unit: 'DOGE' },
  { symbol: 'DOT', binanceSymbol: 'dotusdt', name: 'Polkadot', class: 'crypto', icon: 'D', color: 'hsl(330, 70%, 55%)', decimals: 4, unit: 'DOT' },
  { symbol: 'AVAX', binanceSymbol: 'avaxusdt', name: 'Avalanche', class: 'crypto', icon: 'A', color: 'hsl(0, 70%, 55%)', decimals: 4, unit: 'AVAX' },
  { symbol: 'LINK', binanceSymbol: 'linkusdt', name: 'Chainlink', class: 'crypto', icon: 'L', color: 'hsl(220, 70%, 55%)', decimals: 4, unit: 'LINK' },
  { symbol: 'MATIC', binanceSymbol: 'maticusdt', name: 'Polygon', class: 'crypto', icon: 'M', color: 'hsl(270, 60%, 55%)', decimals: 4, unit: 'MATIC' },
  { symbol: 'LTC', binanceSymbol: 'ltcusdt', name: 'Litecoin', class: 'crypto', icon: 'L', color: 'hsl(210, 10%, 55%)', decimals: 4, unit: 'LTC' },
];

export const COMMODITY_ASSETS: AssetDefinition[] = [
  { symbol: 'GOLD', binanceSymbol: 'xauusdt', name: 'Gold', class: 'commodities', icon: '🥇', color: 'hsl(45, 90%, 50%)', decimals: 2, unit: 'oz' },
  { symbol: 'SILVER', name: 'Silver', class: 'commodities', icon: '🥈', color: 'hsl(210, 10%, 65%)', decimals: 2, unit: 'oz' },
];

export const FOREX_ASSETS: AssetDefinition[] = [
  { symbol: 'EURUSD', binanceSymbol: 'eurusdt', name: 'EUR/USD', class: 'forex', icon: '€', color: 'hsl(220, 70%, 55%)', decimals: 5, unit: '' },
  { symbol: 'GBPUSD', binanceSymbol: 'gbpusdt', name: 'GBP/USD', class: 'forex', icon: '£', color: 'hsl(350, 60%, 50%)', decimals: 5, unit: '' },
  { symbol: 'USDJPY', name: 'USD/JPY', class: 'forex', icon: '¥', color: 'hsl(0, 70%, 50%)', decimals: 3, unit: '' },
  { symbol: 'AUDUSD', name: 'AUD/USD', class: 'forex', icon: 'A$', color: 'hsl(120, 50%, 45%)', decimals: 5, unit: '' },
  { symbol: 'USDCAD', name: 'USD/CAD', class: 'forex', icon: 'C$', color: 'hsl(0, 70%, 50%)', decimals: 5, unit: '' },
  { symbol: 'USDCHF', name: 'USD/CHF', class: 'forex', icon: 'Fr', color: 'hsl(0, 70%, 45%)', decimals: 5, unit: '' },
  { symbol: 'NZDUSD', name: 'NZD/USD', class: 'forex', icon: 'NZ$', color: 'hsl(200, 60%, 45%)', decimals: 5, unit: '' },
  { symbol: 'EURGBP', name: 'EUR/GBP', class: 'forex', icon: '€£', color: 'hsl(230, 50%, 50%)', decimals: 5, unit: '' },
];

export const STOCK_ASSETS: AssetDefinition[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', class: 'stocks', icon: '', color: 'hsl(0, 0%, 60%)', decimals: 2, unit: '' },
  { symbol: 'TSLA', name: 'Tesla Inc.', class: 'stocks', icon: 'T', color: 'hsl(0, 70%, 55%)', decimals: 2, unit: '' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', class: 'stocks', icon: 'G', color: 'hsl(130, 60%, 45%)', decimals: 2, unit: '' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', class: 'stocks', icon: 'M', color: 'hsl(200, 80%, 45%)', decimals: 2, unit: '' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', class: 'stocks', icon: 'A', color: 'hsl(30, 90%, 50%)', decimals: 2, unit: '' },
  { symbol: 'META', name: 'Meta Platforms', class: 'stocks', icon: 'M', color: 'hsl(210, 80%, 55%)', decimals: 2, unit: '' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', class: 'stocks', icon: 'N', color: 'hsl(100, 70%, 40%)', decimals: 2, unit: '' },
  { symbol: 'JPM', name: 'JPMorgan Chase', class: 'stocks', icon: 'J', color: 'hsl(210, 50%, 40%)', decimals: 2, unit: '' },
  { symbol: 'V', name: 'Visa Inc.', class: 'stocks', icon: 'V', color: 'hsl(230, 70%, 50%)', decimals: 2, unit: '' },
  { symbol: 'WMT', name: 'Walmart Inc.', class: 'stocks', icon: 'W', color: 'hsl(210, 80%, 50%)', decimals: 2, unit: '' },
  { symbol: 'DIS', name: 'Walt Disney Co.', class: 'stocks', icon: 'D', color: 'hsl(220, 60%, 50%)', decimals: 2, unit: '' },
  { symbol: 'NFLX', name: 'Netflix Inc.', class: 'stocks', icon: 'N', color: 'hsl(0, 80%, 50%)', decimals: 2, unit: '' },
];

export const NFT_ASSETS: AssetDefinition[] = [
  { symbol: 'BLUR', binanceSymbol: 'blurusdt', name: 'Blur', class: 'nft', icon: '🟣', color: 'hsl(270, 80%, 55%)', decimals: 4, unit: 'BLUR' },
  { symbol: 'APE', binanceSymbol: 'apeusdt', name: 'ApeCoin', class: 'nft', icon: '🦍', color: 'hsl(45, 80%, 50%)', decimals: 4, unit: 'APE' },
  { symbol: 'MANA', binanceSymbol: 'manausdt', name: 'Decentraland', class: 'nft', icon: '🌐', color: 'hsl(350, 70%, 55%)', decimals: 4, unit: 'MANA' },
  { symbol: 'SAND', binanceSymbol: 'sandusdt', name: 'The Sandbox', class: 'nft', icon: '🏖️', color: 'hsl(195, 80%, 50%)', decimals: 4, unit: 'SAND' },
];

export const ALL_ASSETS = [...CRYPTO_ASSETS, ...COMMODITY_ASSETS, ...FOREX_ASSETS, ...STOCK_ASSETS, ...NFT_ASSETS];

// Simulated base prices for non-Binance assets
export const SIMULATED_BASE_PRICES: Record<string, number> = {
  SILVER: 31.25,
  USDJPY: 149.85,
  AUDUSD: 0.6542,
  USDCAD: 1.3685,
  USDCHF: 0.8792,
  NZDUSD: 0.6125,
  EURGBP: 0.8545,
  AAPL: 227.50,
  TSLA: 248.30,
  GOOGL: 175.60,
  MSFT: 415.80,
  AMZN: 198.40,
  META: 585.20,
  NVDA: 875.50,
  JPM: 198.75,
  V: 285.40,
  WMT: 172.30,
  DIS: 112.80,
  NFLX: 685.90,
};

// Generate a realistic fluctuating price
export function getSimulatedPrice(symbol: string, basePrice?: number): number {
  const base = basePrice || SIMULATED_BASE_PRICES[symbol] || 100;
  const now = Date.now();
  const fluctuation = Math.sin(now / 5000) * 0.002 + Math.sin(now / 13000) * 0.001 + (Math.random() - 0.5) * 0.001;
  return base * (1 + fluctuation);
}
