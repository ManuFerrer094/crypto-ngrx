import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState, provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { MarketsEffects } from './state/markets/markets.effects';
import { marketsFeature } from './state/markets/markets.reducer';
import { WatchlistEffects } from './state/watchlist/watchlist.effects';
import { watchlistFeature } from './state/watchlist/watchlist.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimations(),
    provideHttpClient(),
    provideRouter(routes),
    provideStore(),
    provideState(marketsFeature),
    provideState(watchlistFeature),
    provideEffects(MarketsEffects, WatchlistEffects),
    ...(isDevMode()
      ? [
          provideStoreDevtools({
            maxAge: 50,
            logOnly: false,
            connectInZone: true,
          }),
        ]
      : []),
  ],
};
