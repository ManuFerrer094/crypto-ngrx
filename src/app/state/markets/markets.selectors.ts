import { createSelector } from '@ngrx/store';

import { type MarketPair, type TickerVm } from '../../core/models/market.models';
import { watchlistFeature } from '../watchlist/watchlist.reducer';
import { marketsFeature } from './markets.reducer';

function formatMarketStatus(status: string): string {
  return status
    .split('_')
    .filter(Boolean)
    .map((chunk) => chunk[0]?.toUpperCase() + chunk.slice(1))
    .join(' ');
}

function toTickerVm(market: MarketPair, favoriteSymbols: string[]): TickerVm {
  const quote = market.quote;
  const spread = quote?.spread ?? null;
  const last = quote?.last ?? null;
  const midPrice = quote !== null ? (quote.ask + quote.bid) / 2 : null;
  const volumeNotional = quote !== null ? quote.volume * quote.vwap : null;

  return {
    symbol: market.symbol,
    slug: market.slug,
    name: market.name,
    baseAsset: market.baseAsset,
    quoteAsset: market.quoteAsset,
    last,
    change: quote?.change ?? null,
    changePct: quote?.changePct ?? null,
    changePctFraction: quote?.changePct !== undefined ? quote.changePct / 100 : null,
    high: quote?.high ?? null,
    low: quote?.low ?? null,
    bid: quote?.bid ?? null,
    ask: quote?.ask ?? null,
    bidQuantity: quote?.bidQuantity ?? null,
    askQuantity: quote?.askQuantity ?? null,
    spread,
    spreadPct: spread !== null && last ? (spread / last) * 100 : null,
    volume: quote?.volume ?? null,
    volumeNotional,
    vwap: quote?.vwap ?? null,
    open: quote?.open ?? null,
    midPrice,
    updatedAt: quote?.timestamp ?? null,
    isFavorite: favoriteSymbols.includes(market.symbol),
    pairDecimals: market.pairDecimals,
    status: market.status,
    statusLabel: formatMarketStatus(market.status),
  };
}

function pickMarketBy<T extends keyof TickerVm>(
  markets: readonly TickerVm[],
  metric: T,
  direction: 'max' | 'min',
): TickerVm | null {
  const candidates = markets.filter((market) => typeof market[metric] === 'number');

  if (!candidates.length) {
    return null;
  }

  return candidates.reduce((best, market) => {
    const bestValue = best[metric] as number;
    const marketValue = market[metric] as number;

    return direction === 'max'
      ? marketValue > bestValue
        ? market
        : best
      : marketValue < bestValue
        ? market
        : best;
  });
}

export const selectMarketsState = marketsFeature.selectMarketsState;
export const selectMarketsEntities = marketsFeature.selectEntities;
export const selectMarketsOrder = marketsFeature.selectOrder;
export const selectMarketsLoading = marketsFeature.selectLoading;
export const selectMarketsError = marketsFeature.selectError;
export const selectConnectionStatus = marketsFeature.selectConnectionStatus;
export const selectReconnectAttempt = marketsFeature.selectReconnectAttempt;
export const selectReconnectInMs = marketsFeature.selectReconnectInMs;
export const selectLastUpdated = marketsFeature.selectLastUpdated;
export const selectSelectedSymbol = marketsFeature.selectSelectedSymbol;

export const selectFavoriteSymbols = watchlistFeature.selectSymbols;

export const selectAllMarkets = createSelector(
  selectMarketsEntities,
  selectMarketsOrder,
  (entities, order) =>
    order
      .map((symbol) => entities[symbol])
      .filter((market): market is MarketPair => market !== undefined),
);

export const selectTickerVmList = createSelector(
  selectAllMarkets,
  selectFavoriteSymbols,
  (markets, favoriteSymbols) => markets.map((market) => toTickerVm(market, favoriteSymbols)),
);

export const selectFavoriteTickerVmList = createSelector(selectTickerVmList, (markets) =>
  markets.filter((market) => market.isFavorite),
);

export const selectSelectedMarket = createSelector(
  selectMarketsEntities,
  selectSelectedSymbol,
  (entities, symbol) => (symbol ? (entities[symbol] ?? null) : null),
);

export const selectSelectedMarketVm = createSelector(
  selectSelectedMarket,
  selectFavoriteSymbols,
  (market, favoriteSymbols) => (market ? toTickerVm(market, favoriteSymbols) : null),
);

export const selectDashboardVm = createSelector(
  selectTickerVmList,
  selectFavoriteTickerVmList,
  selectMarketsLoading,
  selectMarketsError,
  selectConnectionStatus,
  selectReconnectInMs,
  selectLastUpdated,
  (markets, favoriteMarkets, loading, error, connectionStatus, reconnectInMs, lastUpdated) => ({
    markets,
    favoriteMarkets,
    leaderMarket: pickMarketBy(markets, 'changePct', 'max'),
    laggardMarket: pickMarketBy(markets, 'changePct', 'min'),
    mostActiveMarket: pickMarketBy(markets, 'volumeNotional', 'max'),
    loading,
    error,
    connectionStatus,
    reconnectInMs,
    lastUpdated,
  }),
);

export const selectDetailVm = createSelector(
  selectSelectedMarketVm,
  selectConnectionStatus,
  selectReconnectInMs,
  selectMarketsError,
  (market, connectionStatus, reconnectInMs, error) => ({
    market,
    connectionStatus,
    reconnectInMs,
    error,
  }),
);
