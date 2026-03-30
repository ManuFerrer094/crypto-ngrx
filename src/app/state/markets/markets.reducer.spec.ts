import { describe, expect, it } from 'vitest';

import { marketFixtures } from '../../testing/market-test-data';
import { MarketsActions } from './markets.actions';
import { marketsFeature } from './markets.reducer';

describe('markets reducer', () => {
  it('stores the REST snapshot in the entity map', () => {
    const state = marketsFeature.reducer(
      undefined,
      MarketsActions.loadSnapshotSuccess({ markets: marketFixtures }),
    );

    expect(state.loading).toBe(false);
    expect(state.order).toEqual(['BTC/USD', 'ETH/USD', 'SOL/USD']);
    expect(state.entities['BTC/USD']?.name).toBe('Bitcoin');
  });

  it('updates a single ticker without replacing the full collection', () => {
    const initialState = marketsFeature.reducer(
      undefined,
      MarketsActions.loadSnapshotSuccess({ markets: marketFixtures }),
    );

    const state = marketsFeature.reducer(
      initialState,
      MarketsActions.tickerMessageReceived({
        symbol: 'ETH/USD',
        quote: {
          ask: 2201,
          askQuantity: 4,
          bid: 2199,
          bidQuantity: 3,
          change: -45,
          changePct: -2,
          high: 2250,
          last: 2200,
          low: 2100,
          spread: 2,
          timestamp: '2026-03-30T12:15:00.000Z',
          volume: 5000,
          vwap: 2180,
        },
      }),
    );

    expect(state.entities['ETH/USD']?.quote?.last).toBe(2200);
    expect(state.entities['BTC/USD']?.quote?.last).toBe(68000);
    expect(state.lastUpdated).toBe('2026-03-30T12:15:00.000Z');
  });

  it('tracks connection and reconnection state transitions', () => {
    const connecting = marketsFeature.reducer(
      undefined,
      MarketsActions.connectTickerStream({ attempt: 0 }),
    );
    const reconnecting = marketsFeature.reducer(
      connecting,
      MarketsActions.streamReconnectScheduled({ attempt: 2, delayMs: 2000 }),
    );
    const connected = marketsFeature.reducer(
      reconnecting,
      MarketsActions.streamConnected(),
    );

    expect(connecting.connectionStatus).toBe('connecting');
    expect(reconnecting.connectionStatus).toBe('reconnecting');
    expect(reconnecting.reconnectInMs).toBe(2000);
    expect(connected.connectionStatus).toBe('connected');
    expect(connected.reconnectAttempt).toBe(0);
  });

  it('stores the selected symbol for detail routing', () => {
    const state = marketsFeature.reducer(
      undefined,
      MarketsActions.selectSymbol({ symbol: 'SOL/USD' }),
    );

    expect(state.selectedSymbol).toBe('SOL/USD');
  });
});
