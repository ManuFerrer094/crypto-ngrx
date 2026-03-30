import { createSelector } from '@ngrx/store';

import { watchlistFeature } from './watchlist.reducer';

export const selectWatchlistState = watchlistFeature.selectWatchlistState;
export const selectWatchlistSymbols = watchlistFeature.selectSymbols;
export const selectWatchlistCount = createSelector(
  selectWatchlistSymbols,
  (symbols) => symbols.length,
);
