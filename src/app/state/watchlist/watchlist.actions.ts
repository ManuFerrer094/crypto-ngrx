import { createActionGroup, props } from '@ngrx/store';

export const WatchlistActions = createActionGroup({
  source: 'Watchlist',
  events: {
    'Hydrate Watchlist': props<{ symbols: string[] }>(),
    'Toggle Watchlist': props<{ symbol: string }>(),
    'Persist Watchlist': props<{ symbols: string[] }>(),
  },
});
