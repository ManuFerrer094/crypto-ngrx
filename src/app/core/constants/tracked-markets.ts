export interface TrackedMarketConfig {
  symbol: string;
  slug: string;
  name: string;
  baseAsset: string;
  quoteAsset: string;
  restSymbol: string;
  restWsSymbol: string;
  wsSymbol: string;
}

export const TRACKED_MARKETS: readonly TrackedMarketConfig[] = [
  {
    symbol: 'BTC/USD',
    slug: 'btc-usd',
    name: 'Bitcoin',
    baseAsset: 'BTC',
    quoteAsset: 'USD',
    restSymbol: 'XBTUSD',
    restWsSymbol: 'XBT/USD',
    wsSymbol: 'BTC/USD',
  },
  {
    symbol: 'ETH/USD',
    slug: 'eth-usd',
    name: 'Ethereum',
    baseAsset: 'ETH',
    quoteAsset: 'USD',
    restSymbol: 'ETHUSD',
    restWsSymbol: 'ETH/USD',
    wsSymbol: 'ETH/USD',
  },
  {
    symbol: 'SOL/USD',
    slug: 'sol-usd',
    name: 'Solana',
    baseAsset: 'SOL',
    quoteAsset: 'USD',
    restSymbol: 'SOLUSD',
    restWsSymbol: 'SOL/USD',
    wsSymbol: 'SOL/USD',
  },
  {
    symbol: 'XRP/USD',
    slug: 'xrp-usd',
    name: 'XRP',
    baseAsset: 'XRP',
    quoteAsset: 'USD',
    restSymbol: 'XRPUSD',
    restWsSymbol: 'XRP/USD',
    wsSymbol: 'XRP/USD',
  },
  {
    symbol: 'ADA/USD',
    slug: 'ada-usd',
    name: 'Cardano',
    baseAsset: 'ADA',
    quoteAsset: 'USD',
    restSymbol: 'ADAUSD',
    restWsSymbol: 'ADA/USD',
    wsSymbol: 'ADA/USD',
  },
  {
    symbol: 'DOGE/USD',
    slug: 'doge-usd',
    name: 'Dogecoin',
    baseAsset: 'DOGE',
    quoteAsset: 'USD',
    restSymbol: 'DOGEUSD',
    restWsSymbol: 'DOGE/USD',
    wsSymbol: 'DOGE/USD',
  },
  {
    symbol: 'AVAX/USD',
    slug: 'avax-usd',
    name: 'Avalanche',
    baseAsset: 'AVAX',
    quoteAsset: 'USD',
    restSymbol: 'AVAXUSD',
    restWsSymbol: 'AVAX/USD',
    wsSymbol: 'AVAX/USD',
  },
  {
    symbol: 'LINK/USD',
    slug: 'link-usd',
    name: 'Chainlink',
    baseAsset: 'LINK',
    quoteAsset: 'USD',
    restSymbol: 'LINKUSD',
    restWsSymbol: 'LINK/USD',
    wsSymbol: 'LINK/USD',
  },
] as const;

export const TRACKED_MARKETS_BY_SYMBOL = Object.fromEntries(
  TRACKED_MARKETS.map((market) => [market.symbol, market]),
) as Record<string, TrackedMarketConfig>;

export const TRACKED_MARKETS_BY_SLUG = Object.fromEntries(
  TRACKED_MARKETS.map((market) => [market.slug, market]),
) as Record<string, TrackedMarketConfig>;

export const TRACKED_MARKET_WS_SYMBOLS = TRACKED_MARKETS.map((market) => market.wsSymbol);

export const TRACKED_MARKET_REST_SYMBOLS = TRACKED_MARKETS.map((market) => market.restSymbol);

export const WATCHLIST_STORAGE_KEY = 'ngrx-demo.watchlist';
