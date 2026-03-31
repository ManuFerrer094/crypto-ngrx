import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { ReplaySubject, throwError, of, firstValueFrom, take, toArray } from 'rxjs';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { TRACKED_MARKET_WS_SYMBOLS } from '../../core/constants/tracked-markets';
import { KrakenRestService } from '../../core/services/kraken-rest.service';
import { KrakenWebsocketService } from '../../core/services/kraken-websocket.service';
import { marketFixtures, rootStateFixture } from '../../testing/market-test-data';
import { AppActions } from '../app.actions';
import { MarketsActions } from './markets.actions';
import { MarketsEffects } from './markets.effects';

describe('MarketsEffects', () => {
  let actions$: ReplaySubject<object>;
  let effects: MarketsEffects;
  let restService: { getMarketSnapshot: ReturnType<typeof vi.fn> };
  let websocketService: { connect: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    actions$ = new ReplaySubject(1);
    restService = {
      getMarketSnapshot: vi.fn(),
    };
    websocketService = {
      connect: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        MarketsEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState: rootStateFixture }),
        {
          provide: KrakenRestService,
          useValue: restService,
        },
        {
          provide: KrakenWebsocketService,
          useValue: websocketService,
        },
      ],
    });

    effects = TestBed.inject(MarketsEffects);
  });

  it('boots the app by requesting the snapshot and resetting the selection', async () => {
    const resultPromise = firstValueFrom(effects.initializeApp$.pipe(take(2), toArray()));

    actions$.next(AppActions.appEntered());

    await expect(resultPromise).resolves.toEqual([
      MarketsActions.loadSnapshot(),
      MarketsActions.selectSymbol({ symbol: null }),
    ]);
  });

  it('maps a REST snapshot to loadSnapshotSuccess', async () => {
    restService.getMarketSnapshot.mockReturnValue(of(marketFixtures));
    const resultPromise = firstValueFrom(effects.loadSnapshot$);

    actions$.next(MarketsActions.loadSnapshot());

    await expect(resultPromise).resolves.toEqual(
      MarketsActions.loadSnapshotSuccess({ markets: marketFixtures }),
    );
  });

  it('maps REST failures to loadSnapshotFailure', async () => {
    restService.getMarketSnapshot.mockReturnValue(throwError(() => new Error('boom')));
    const resultPromise = firstValueFrom(effects.loadSnapshot$);

    actions$.next(MarketsActions.loadSnapshot());

    await expect(resultPromise).resolves.toEqual(
      MarketsActions.loadSnapshotFailure({
        error: 'Could not load the Kraken REST snapshot. Check your connection and try again.',
      }),
    );
  });

  it('schedules reconnect attempts with a visible delay', async () => {
    const resultPromise = firstValueFrom(effects.scheduleReconnect$);

    actions$.next(
      MarketsActions.streamError({
        error: 'socket offline',
      }),
    );

    await expect(resultPromise).resolves.toEqual(
      MarketsActions.streamReconnectScheduled({
        attempt: 1,
        delayMs: 1000,
      }),
    );
  });

  it('subscribes the websocket stream with the full tracked market basket', async () => {
    websocketService.connect.mockReturnValue(of({ type: 'connected' }));
    const resultPromise = firstValueFrom(effects.connectTickerStream$);

    actions$.next(MarketsActions.connectTickerStream({ attempt: 0 }));

    await expect(resultPromise).resolves.toEqual(MarketsActions.streamConnected());
    expect(websocketService.connect).toHaveBeenCalledWith(TRACKED_MARKET_WS_SYMBOLS);
  });
});
