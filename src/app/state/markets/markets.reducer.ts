import { createFeature, createReducer, on } from '@ngrx/store';

import { type MarketsState } from '../../core/models/market.models';
import { MarketsActions } from './markets.actions';

const initialState: MarketsState = {
  order: [],
  entities: {},
  selectedSymbol: null,
  loading: false,
  error: null,
  connectionStatus: 'idle',
  reconnectAttempt: 0,
  reconnectInMs: null,
  lastUpdated: null,
};

export const marketsFeature = createFeature({
  name: 'markets',
  reducer: createReducer(
    initialState,
    on(MarketsActions.loadSnapshot, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(MarketsActions.loadSnapshotSuccess, (state, { markets }) => ({
      ...state,
      loading: false,
      error: null,
      order: markets.map((market) => market.symbol),
      entities: Object.fromEntries(
        markets.map((market) => [market.symbol, market]),
      ),
      lastUpdated: new Date().toISOString(),
    })),
    on(MarketsActions.loadSnapshotFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
      connectionStatus:
        state.connectionStatus === 'connected'
          ? state.connectionStatus
          : 'disconnected',
    })),
    on(MarketsActions.connectTickerStream, (state, { attempt }) => ({
      ...state,
      connectionStatus: attempt > 0 ? 'reconnecting' : 'connecting',
      reconnectAttempt: attempt,
      reconnectInMs: null,
    })),
    on(MarketsActions.streamConnected, (state) => ({
      ...state,
      connectionStatus: 'connected',
      reconnectAttempt: 0,
      reconnectInMs: null,
      error: null,
    })),
    on(MarketsActions.streamDisconnected, (state, { reason }) => ({
      ...state,
      connectionStatus: 'disconnected',
      error: reason,
    })),
    on(MarketsActions.streamReconnectScheduled, (state, { attempt, delayMs }) => ({
      ...state,
      connectionStatus: 'reconnecting',
      reconnectAttempt: attempt,
      reconnectInMs: delayMs,
    })),
    on(MarketsActions.streamError, (state, { error }) => ({
      ...state,
      connectionStatus: 'error',
      error,
    })),
    on(MarketsActions.tickerMessageReceived, (state, { symbol, quote }) => {
      const market = state.entities[symbol];

      if (!market) {
        return state;
      }

      return {
        ...state,
        entities: {
          ...state.entities,
          [symbol]: {
            ...market,
            quote,
          },
        },
        lastUpdated: quote.timestamp,
      };
    }),
    on(MarketsActions.selectSymbol, (state, { symbol }) => ({
      ...state,
      selectedSymbol: symbol,
    })),
  ),
});
