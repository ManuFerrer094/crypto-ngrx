import {
  type MarketPair,
  type MarketsState,
  type WatchlistState,
} from '../core/models/market.models';

function buildMarketPair({
  symbol,
  slug,
  name,
  baseAsset,
  restSymbol,
  restWsSymbol,
  wsSymbol,
  last,
  change,
  changePct,
}: {
  symbol: string;
  slug: string;
  name: string;
  baseAsset: string;
  restSymbol: string;
  restWsSymbol: string;
  wsSymbol: string;
  last: number;
  change: number;
  changePct: number;
}): MarketPair {
  return {
    symbol,
    slug,
    name,
    baseAsset,
    quoteAsset: 'USD',
    restSymbol,
    restWsSymbol,
    wsSymbol,
    pairDecimals: 2,
    status: 'online',
    quote: {
      ask: last + 0.2,
      askQuantity: 5,
      bid: last - 0.2,
      bidQuantity: 6,
      change,
      changePct,
      high: last + 100,
      last,
      low: last - 100,
      spread: 0.4,
      timestamp: '2026-03-30T12:00:00.000Z',
      volume: 123456,
      vwap: last - 25,
    },
  };
}

export const marketFixtures: MarketPair[] = [
  buildMarketPair({
    symbol: 'BTC/USD',
    slug: 'btc-usd',
    name: 'Bitcoin',
    baseAsset: 'BTC',
    restSymbol: 'XBTUSD',
    restWsSymbol: 'XBT/USD',
    wsSymbol: 'BTC/USD',
    last: 68000,
    change: 1200,
    changePct: 1.8,
  }),
  buildMarketPair({
    symbol: 'ETH/USD',
    slug: 'eth-usd',
    name: 'Ethereum',
    baseAsset: 'ETH',
    restSymbol: 'ETHUSD',
    restWsSymbol: 'ETH/USD',
    wsSymbol: 'ETH/USD',
    last: 2200,
    change: -55,
    changePct: -2.4,
  }),
  buildMarketPair({
    symbol: 'SOL/USD',
    slug: 'sol-usd',
    name: 'Solana',
    baseAsset: 'SOL',
    restSymbol: 'SOLUSD',
    restWsSymbol: 'SOL/USD',
    wsSymbol: 'SOL/USD',
    last: 140,
    change: 4,
    changePct: 2.9,
  }),
];

export const marketsStateFixture: MarketsState = {
  order: marketFixtures.map((market) => market.symbol),
  entities: Object.fromEntries(
    marketFixtures.map((market) => [market.symbol, market]),
  ),
  selectedSymbol: 'ETH/USD',
  loading: false,
  error: null,
  connectionStatus: 'connected',
  reconnectAttempt: 0,
  reconnectInMs: null,
  lastUpdated: '2026-03-30T12:00:00.000Z',
};

export const watchlistStateFixture: WatchlistState = {
  symbols: ['BTC/USD'],
};

export const rootStateFixture = {
  markets: marketsStateFixture,
  watchlist: watchlistStateFixture,
};
