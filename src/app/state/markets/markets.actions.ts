import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { type MarketPair, type TickerQuote } from '../../core/models/market.models';

export const MarketsActions = createActionGroup({
  source: 'Markets',
  events: {
    'Load Snapshot': emptyProps(),
    'Load Snapshot Success': props<{ markets: MarketPair[] }>(),
    'Load Snapshot Failure': props<{ error: string }>(),
    'Connect Ticker Stream': props<{ attempt: number }>(),
    'Stream Connected': emptyProps(),
    'Stream Disconnected': props<{ reason: string }>(),
    'Stream Reconnect Scheduled': props<{ attempt: number; delayMs: number }>(),
    'Stream Error': props<{ error: string }>(),
    'Ticker Message Received': props<{ symbol: string; quote: TickerQuote }>(),
    'Select Symbol': props<{ symbol: string | null }>(),
  },
});
