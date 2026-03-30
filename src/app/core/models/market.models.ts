export type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error'
  | 'disconnected';

export interface TickerQuote {
  ask: number;
  askQuantity: number;
  bid: number;
  bidQuantity: number;
  change: number;
  changePct: number;
  high: number;
  last: number;
  low: number;
  spread: number;
  timestamp: string;
  volume: number;
  vwap: number;
}

export interface MarketPair {
  symbol: string;
  slug: string;
  name: string;
  baseAsset: string;
  quoteAsset: string;
  restSymbol: string;
  restWsSymbol: string;
  wsSymbol: string;
  pairDecimals: number;
  status: string;
  quote: TickerQuote | null;
}

export interface TickerVm {
  symbol: string;
  slug: string;
  name: string;
  baseAsset: string;
  quoteAsset: string;
  last: number | null;
  change: number | null;
  changePct: number | null;
  changePctFraction: number | null;
  high: number | null;
  low: number | null;
  bid: number | null;
  ask: number | null;
  spread: number | null;
  volume: number | null;
  vwap: number | null;
  updatedAt: string | null;
  isFavorite: boolean;
  status: string;
}

export interface MarketsState {
  order: string[];
  entities: Record<string, MarketPair>;
  selectedSymbol: string | null;
  loading: boolean;
  error: string | null;
  connectionStatus: ConnectionStatus;
  reconnectAttempt: number;
  reconnectInMs: number | null;
  lastUpdated: string | null;
}

export interface WatchlistState {
  symbols: string[];
}
