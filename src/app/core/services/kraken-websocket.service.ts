import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  adaptWsTickerMessage,
  type KrakenWsTickerMessage,
} from '../adapters/kraken.adapters';
import { type TickerQuote } from '../models/market.models';

const KRAKEN_SOCKET_URL = 'wss://ws.kraken.com/v2';
const SOCKET_PING_INTERVAL_MS = 30_000;

type SocketEvent =
  | { type: 'connected' }
  | { type: 'disconnected'; reason: string }
  | { type: 'error'; error: string }
  | { type: 'ticker'; symbol: string; quote: TickerQuote };

@Injectable({ providedIn: 'root' })
export class KrakenWebsocketService {
  connect(symbols: readonly string[]): Observable<SocketEvent> {
    return new Observable<SocketEvent>((observer) => {
      const socket = new WebSocket(KRAKEN_SOCKET_URL);
      let pingTimer: number | undefined;
      let manuallyClosed = false;
      let errorEmitted = false;

      const clearPingTimer = () => {
        if (pingTimer !== undefined) {
          window.clearInterval(pingTimer);
        }
      };

      socket.addEventListener('open', () => {
        observer.next({ type: 'connected' });
        socket.send(
          JSON.stringify({
            method: 'subscribe',
            params: {
              channel: 'ticker',
              symbol: symbols,
              snapshot: true,
            },
          }),
        );

        pingTimer = window.setInterval(() => {
          socket.send(JSON.stringify({ method: 'ping' }));
        }, SOCKET_PING_INTERVAL_MS);
      });

      socket.addEventListener('message', (event) => {
        try {
          const payload = JSON.parse(String(event.data)) as KrakenWsTickerMessage & {
            success?: boolean;
            error?: string;
            method?: string;
          };

          if (payload.method === 'subscribe' && payload.success === false) {
            errorEmitted = true;
            observer.next({
              type: 'error',
              error: payload.error ?? 'Kraken rejected the ticker subscription.',
            });
            socket.close();
            return;
          }

          if (payload.channel === 'heartbeat' || payload.channel === 'status') {
            return;
          }

          const message = adaptWsTickerMessage(payload);
          if (!message) {
            return;
          }

          observer.next({
            type: 'ticker',
            symbol: message.symbol,
            quote: message,
          });
        } catch {
          errorEmitted = true;
          observer.next({
            type: 'error',
            error: 'Kraken returned a ticker payload that could not be parsed.',
          });
          socket.close();
        }
      });

      socket.addEventListener('error', () => {
        if (manuallyClosed || errorEmitted) {
          return;
        }

        errorEmitted = true;
        observer.next({
          type: 'error',
          error: 'The Kraken WebSocket connection failed.',
        });
      });

      socket.addEventListener('close', (event) => {
        clearPingTimer();

        if (manuallyClosed) {
          observer.complete();
          return;
        }

        if (!errorEmitted) {
          observer.next({
            type: 'disconnected',
            reason: event.reason || 'The ticker stream closed unexpectedly.',
          });
        }

        observer.complete();
      });

      return () => {
        manuallyClosed = true;
        clearPingTimer();
        if (socket.readyState === WebSocket.OPEN) {
          socket.close(1000, 'Disposed by Angular');
        } else if (socket.readyState === WebSocket.CONNECTING) {
          socket.close();
        }
      };
    });
  }
}
