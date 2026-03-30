import { createSelector } from '@ngrx/store';

import { type MarketPair, type TickerVm } from '../../core/models/market.models';
import { watchlistFeature } from '../watchlist/watchlist.reducer';
import { marketsFeature } from './markets.reducer';

function toTickerVm(
  market: MarketPair,
  favoriteSymbols: string[],
): TickerVm {
  return {
    symbol: market.symbol,
    slug: market.slug,
    name: market.name,
    baseAsset: market.baseAsset,
    quoteAsset: market.quoteAsset,
    last: market.quote?.last ?? null,
    change: market.quote?.change ?? null,
    changePct: market.quote?.changePct ?? null,
    changePctFraction:
      market.quote?.changePct !== undefined ? market.quote.changePct / 100 : null,
    high: market.quote?.high ?? null,
    low: market.quote?.low ?? null,
    bid: market.quote?.bid ?? null,
    ask: market.quote?.ask ?? null,
    spread: market.quote?.spread ?? null,
    volume: market.quote?.volume ?? null,
    vwap: market.quote?.vwap ?? null,
    updatedAt: market.quote?.timestamp ?? null,
    isFavorite: favoriteSymbols.includes(market.symbol),
    status: market.status,
  };
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
  (markets, favoriteSymbols) =>
    markets.map((market) => toTickerVm(market, favoriteSymbols)),
);

export const selectFavoriteTickerVmList = createSelector(
  selectTickerVmList,
  (markets) => markets.filter((market) => market.isFavorite),
);

export const selectSelectedMarket = createSelector(
  selectMarketsEntities,
  selectSelectedSymbol,
  (entities, symbol) => (symbol ? entities[symbol] ?? null : null),
);

export const selectSelectedMarketVm = createSelector(
  selectSelectedMarket,
  selectFavoriteSymbols,
  (market, favoriteSymbols) =>
    market ? toTickerVm(market, favoriteSymbols) : null,
);

export const selectDashboardVm = createSelector(
  selectTickerVmList,
  selectFavoriteTickerVmList,
  selectMarketsLoading,
  selectMarketsError,
  selectConnectionStatus,
  selectReconnectInMs,
  selectLastUpdated,
  (
    markets,
    favoriteMarkets,
    loading,
    error,
    connectionStatus,
    reconnectInMs,
    lastUpdated,
  ) => ({
    markets,
    favoriteMarkets,
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
