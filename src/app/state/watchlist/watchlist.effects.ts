import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, tap, withLatestFrom } from 'rxjs';

import { WATCHLIST_STORAGE_KEY } from '../../core/constants/tracked-markets';
import { AppActions } from '../app.actions';
import { WatchlistActions } from './watchlist.actions';
import { selectWatchlistSymbols } from './watchlist.selectors';

function readWatchlistFromStorage(): string[] {
  try {
    const rawValue = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue) as unknown;
    return Array.isArray(parsedValue)
      ? parsedValue.filter((value): value is string => typeof value === 'string')
      : [];
  } catch {
    return [];
  }
}

@Injectable()
export class WatchlistEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);

  hydrateWatchlist$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.appEntered),
      map(() =>
        WatchlistActions.hydrateWatchlist({
          symbols: readWatchlistFromStorage(),
        }),
      ),
    ),
  );

  persistWatchlist$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WatchlistActions.toggleWatchlist),
      withLatestFrom(this.store.select(selectWatchlistSymbols)),
      map(([, symbols]) => WatchlistActions.persistWatchlist({ symbols })),
    ),
  );

  writeWatchlistToStorage$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(WatchlistActions.persistWatchlist),
        tap(({ symbols }) => {
          localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(symbols));
        }),
      ),
    { dispatch: false },
  );
}
