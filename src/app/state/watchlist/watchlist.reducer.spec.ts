import { describe, expect, it } from 'vitest';

import { WatchlistActions } from './watchlist.actions';
import { watchlistFeature } from './watchlist.reducer';

describe('watchlist reducer', () => {
  it('hydrates symbols from localStorage', () => {
    const state = watchlistFeature.reducer(
      undefined,
      WatchlistActions.hydrateWatchlist({ symbols: ['BTC/USD', 'ETH/USD'] }),
    );

    expect(state.symbols).toEqual(['BTC/USD', 'ETH/USD']);
  });

  it('toggles favorites in sorted order', () => {
    const hydratedState = watchlistFeature.reducer(
      undefined,
      WatchlistActions.hydrateWatchlist({ symbols: ['ETH/USD'] }),
    );

    const addedState = watchlistFeature.reducer(
      hydratedState,
      WatchlistActions.toggleWatchlist({ symbol: 'BTC/USD' }),
    );
    const removedState = watchlistFeature.reducer(
      addedState,
      WatchlistActions.toggleWatchlist({ symbol: 'ETH/USD' }),
    );

    expect(addedState.symbols).toEqual(['BTC/USD', 'ETH/USD']);
    expect(removedState.symbols).toEqual(['BTC/USD']);
  });
});
