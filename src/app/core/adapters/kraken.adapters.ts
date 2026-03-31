import { TRACKED_MARKETS, type TrackedMarketConfig } from '../constants/tracked-markets';
import { type MarketPair, type TickerQuote } from '../models/market.models';

interface KrakenAssetPairPayload {
  altname: string;
  wsname?: string;
  pair_decimals: number;
  status: string;
}

interface KrakenTickerPayload {
  a: [string, string, string];
  b: [string, string, string];
  c: [string, string];
  v: [string, string];
  p: [string, string];
  l: [string, string];
  h: [string, string];
  o: string;
}

export interface KrakenAssetPairsResponse {
  error: string[];
  result: Record<string, KrakenAssetPairPayload>;
}

export interface KrakenTickerResponse {
  error: string[];
  result: Record<string, KrakenTickerPayload>;
}

export interface KrakenWsTickerPayload {
  symbol: string;
  ask: number;
  ask_qty: number;
  bid: number;
  bid_qty: number;
  change: number;
  change_pct: number;
  high: number;
  last: number;
  low: number;
  timestamp: string;
  volume: number;
  vwap: number;
}

export interface KrakenWsTickerMessage {
  channel?: string;
  data?: KrakenWsTickerPayload[];
  type?: string;
}

function buildTickerQuote({
  ask,
  askQuantity,
  bid,
  bidQuantity,
  change,
  changePct,
  high,
  last,
  low,
  open,
  timestamp,
  volume,
  vwap,
}: {
  ask: number;
  askQuantity: number;
  bid: number;
  bidQuantity: number;
  change: number;
  changePct: number;
  high: number;
  last: number;
  low: number;
  open: number;
  timestamp: string;
  volume: number;
  vwap: number;
}): TickerQuote {
  return {
    ask,
    askQuantity,
    bid,
    bidQuantity,
    change,
    changePct,
    high,
    last,
    low,
    open,
    spread: ask - bid,
    timestamp,
    volume,
    vwap,
  };
}

function findAssetEntry(
  config: TrackedMarketConfig,
  assetPairs: Record<string, KrakenAssetPairPayload>,
): [string, KrakenAssetPairPayload] | undefined {
  return Object.entries(assetPairs).find(([, pair]) => {
    return pair.altname === config.restSymbol || pair.wsname === config.restWsSymbol;
  });
}

export function adaptMarketSnapshot(
  assetPairs: KrakenAssetPairsResponse,
  tickers: KrakenTickerResponse,
): MarketPair[] {
  return TRACKED_MARKETS.map((config) => {
    const assetEntry = findAssetEntry(config, assetPairs.result);
    const tickerEntry = assetEntry ? tickers.result[assetEntry[0]] : undefined;
    const quote = tickerEntry
      ? (() => {
          const last = Number(tickerEntry.c[0]);
          const open = Number(tickerEntry.o);

          return buildTickerQuote({
            ask: Number(tickerEntry.a[0]),
            askQuantity: Number(tickerEntry.a[1]),
            bid: Number(tickerEntry.b[0]),
            bidQuantity: Number(tickerEntry.b[1]),
            change: last - open,
            changePct: open === 0 ? 0 : ((last - open) / open) * 100,
            high: Number(tickerEntry.h[1]),
            last,
            low: Number(tickerEntry.l[1]),
            open,
            timestamp: new Date().toISOString(),
            volume: Number(tickerEntry.v[1]),
            vwap: Number(tickerEntry.p[1]),
          });
        })()
      : null;

    return {
      symbol: config.symbol,
      slug: config.slug,
      name: config.name,
      baseAsset: config.baseAsset,
      quoteAsset: config.quoteAsset,
      restSymbol: config.restSymbol,
      restWsSymbol: config.restWsSymbol,
      wsSymbol: config.wsSymbol,
      pairDecimals: assetEntry?.[1].pair_decimals ?? 2,
      status: assetEntry?.[1].status ?? 'unknown',
      quote,
    };
  });
}

export function adaptWsTickerMessage(
  message: KrakenWsTickerMessage,
): (TickerQuote & { symbol: string }) | null {
  if (message.channel !== 'ticker' || !message.data?.length) {
    return null;
  }

  const [ticker] = message.data;
  return {
    symbol: ticker.symbol,
    ...buildTickerQuote({
      ask: ticker.ask,
      askQuantity: ticker.ask_qty,
      bid: ticker.bid,
      bidQuantity: ticker.bid_qty,
      change: ticker.change,
      changePct: ticker.change_pct,
      high: ticker.high,
      last: ticker.last,
      low: ticker.low,
      open: ticker.last - ticker.change,
      timestamp: ticker.timestamp,
      volume: ticker.volume,
      vwap: ticker.vwap,
    }),
  };
}
