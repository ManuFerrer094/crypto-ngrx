import { createFeature, createReducer, on } from '@ngrx/store';

import { type WatchlistState } from '../../core/models/market.models';
import { WatchlistActions } from './watchlist.actions';

const initialState: WatchlistState = {
  symbols: [],
};

export const watchlistFeature = createFeature({
  name: 'watchlist',
  reducer: createReducer(
    initialState,
    on(WatchlistActions.hydrateWatchlist, (_state, { symbols }) => ({
      symbols,
    })),
    on(WatchlistActions.toggleWatchlist, (state, { symbol }) => ({
      symbols: state.symbols.includes(symbol)
        ? state.symbols.filter((entry) => entry !== symbol)
        : [...state.symbols, symbol].sort(),
    })),
  ),
});
