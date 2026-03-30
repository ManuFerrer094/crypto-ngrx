import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ReplaySubject, firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { WATCHLIST_STORAGE_KEY } from '../../core/constants/tracked-markets';
import { rootStateFixture } from '../../testing/market-test-data';
import { AppActions } from '../app.actions';
import { WatchlistActions } from './watchlist.actions';
import { WatchlistEffects } from './watchlist.effects';

describe('WatchlistEffects', () => {
  let actions$: ReplaySubject<object>;
  let effects: WatchlistEffects;
  let store: MockStore;

  beforeEach(() => {
    localStorage.clear();
    actions$ = new ReplaySubject(1);

    TestBed.configureTestingModule({
      providers: [
        WatchlistEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState: rootStateFixture }),
      ],
    });

    effects = TestBed.inject(WatchlistEffects);
    store = TestBed.inject(MockStore);
  });

  it('hydrates the watchlist from localStorage on app start', async () => {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(['SOL/USD']));
    const resultPromise = firstValueFrom(effects.hydrateWatchlist$);

    actions$.next(AppActions.appEntered());

    await expect(resultPromise).resolves.toEqual(
      WatchlistActions.hydrateWatchlist({ symbols: ['SOL/USD'] }),
    );
  });

  it('creates a persist action with the latest store snapshot', async () => {
    store.setState({
      ...rootStateFixture,
      watchlist: {
        symbols: ['BTC/USD', 'SOL/USD'],
      },
    });
    const resultPromise = firstValueFrom(effects.persistWatchlist$);

    actions$.next(WatchlistActions.toggleWatchlist({ symbol: 'SOL/USD' }));

    await expect(resultPromise).resolves.toEqual(
      WatchlistActions.persistWatchlist({ symbols: ['BTC/USD', 'SOL/USD'] }),
    );
  });

  it('writes the persisted watchlist to localStorage', () => {
    effects.writeWatchlistToStorage$.subscribe();

    actions$.next(
      WatchlistActions.persistWatchlist({ symbols: ['BTC/USD', 'ETH/USD'] }),
    );

    expect(localStorage.getItem(WATCHLIST_STORAGE_KEY)).toBe(
      JSON.stringify(['BTC/USD', 'ETH/USD']),
    );
  });
});
