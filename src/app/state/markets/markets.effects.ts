import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, filter, map, of, switchMap, timer, withLatestFrom } from 'rxjs';

import { TRACKED_MARKET_WS_SYMBOLS } from '../../core/constants/tracked-markets';
import { KrakenRestService } from '../../core/services/kraken-rest.service';
import { KrakenWebsocketService } from '../../core/services/kraken-websocket.service';
import { AppActions } from '../app.actions';
import { MarketsActions } from './markets.actions';
import { selectReconnectAttempt } from './markets.selectors';

function reconnectDelay(attempt: number): number {
  return Math.min(1_000 * 2 ** Math.max(attempt - 1, 0), 8_000);
}

@Injectable()
export class MarketsEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly krakenRestService = inject(KrakenRestService);
  private readonly krakenWebsocketService = inject(KrakenWebsocketService);

  initializeApp$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.appEntered),
      switchMap(() =>
        of(MarketsActions.loadSnapshot(), MarketsActions.selectSymbol({ symbol: null })),
      ),
    ),
  );

  loadSnapshot$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MarketsActions.loadSnapshot),
      switchMap(() =>
        this.krakenRestService.getMarketSnapshot().pipe(
          map((markets) => MarketsActions.loadSnapshotSuccess({ markets })),
          catchError(() =>
            of(
              MarketsActions.loadSnapshotFailure({
                error:
                  'Could not load the Kraken REST snapshot. Check your connection and try again.',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  connectAfterSnapshot$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MarketsActions.loadSnapshotSuccess),
      map(() => MarketsActions.connectTickerStream({ attempt: 0 })),
    ),
  );

  connectTickerStream$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MarketsActions.connectTickerStream),
      switchMap(({ attempt }) =>
        this.krakenWebsocketService.connect(TRACKED_MARKET_WS_SYMBOLS).pipe(
          map((event) => {
            switch (event.type) {
              case 'connected':
                return MarketsActions.streamConnected();
              case 'disconnected':
                return MarketsActions.streamDisconnected({
                  reason: event.reason,
                });
              case 'error':
                return MarketsActions.streamError({
                  error: event.error,
                });
              case 'ticker':
                return MarketsActions.tickerMessageReceived({
                  symbol: event.symbol,
                  quote: event.quote,
                });
            }
          }),
          catchError(() =>
            of(
              MarketsActions.streamError({
                error:
                  attempt > 0
                    ? 'The live stream failed again while reconnecting.'
                    : 'The live stream could not be established.',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  scheduleReconnect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MarketsActions.streamDisconnected, MarketsActions.streamError),
      withLatestFrom(this.store.select(selectReconnectAttempt)),
      filter(([, currentAttempt]) => currentAttempt < 5),
      map(([, currentAttempt]) => {
        const attempt = currentAttempt + 1;
        return MarketsActions.streamReconnectScheduled({
          attempt,
          delayMs: reconnectDelay(attempt),
        });
      }),
    ),
  );

  reconnectTickerStream$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MarketsActions.streamReconnectScheduled),
      switchMap(({ attempt, delayMs }) =>
        timer(delayMs).pipe(map(() => MarketsActions.connectTickerStream({ attempt }))),
      ),
    ),
  );
}
