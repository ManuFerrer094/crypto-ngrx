import { AsyncPipe, CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  MfAlertComponent,
  MfButtonComponent,
  MfCardComponent,
  MfDialogService,
  MfInputComponent,
  MfProgressBarComponent,
  MfSlideToggleComponent,
  MfSnackbarService,
} from 'ng-comps';
import { combineLatest, map, startWith } from 'rxjs';

import { type TickerVm } from '../../../../core/models/market.models';
import { slugFromSymbol } from '../../../../core/utils/market-symbol.utils';
import { MarketsActions } from '../../../../state/markets/markets.actions';
import { selectDashboardVm } from '../../../../state/markets/markets.selectors';
import { WatchlistActions } from '../../../../state/watchlist/watchlist.actions';
import { ConnectionStatusBadgeComponent } from '../../components/connection-status-badge/connection-status-badge.component';
import { MarketFeedInfoDialogComponent } from '../../components/market-feed-info-dialog/market-feed-info-dialog.component';
import { MarketListComponent } from '../../components/market-list/market-list.component';

@Component({
  selector: 'app-markets-page',
  imports: [
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    PercentPipe,
    ReactiveFormsModule,
    ConnectionStatusBadgeComponent,
    MfAlertComponent,
    MfButtonComponent,
    MfCardComponent,
    MfInputComponent,
    MfProgressBarComponent,
    MfSlideToggleComponent,
    MarketListComponent,
  ],
  templateUrl: './markets-page.component.html',
  styleUrl: './markets-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketsPageComponent {
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly dialog = inject(MfDialogService);
  private readonly snackbar = inject(MfSnackbarService);

  readonly filterForm = new FormGroup({
    query: new FormControl('', { nonNullable: true }),
    favoritesOnly: new FormControl(false, { nonNullable: true }),
  });

  private readonly dashboardVm$ = this.store.select(selectDashboardVm);
  private readonly dashboardVm = toSignal(this.dashboardVm$, { initialValue: null });

  readonly vm$ = combineLatest([
    this.dashboardVm$,
    this.filterForm.valueChanges.pipe(startWith(this.filterForm.getRawValue())),
  ]).pipe(
    map(([vm, filters]) => {
      const query = (filters.query ?? '').trim();
      const filteredMarkets = this.filterMarkets(vm.markets, query);
      const filteredFavoriteMarkets = this.filterMarkets(vm.favoriteMarkets, query);
      const favoritesOnly = filters.favoritesOnly ?? false;

      return {
        ...vm,
        filters: {
          query,
          favoritesOnly,
        },
        filteredFavoriteMarkets,
        primaryMarkets: favoritesOnly ? filteredFavoriteMarkets : filteredMarkets,
        primaryTitle: favoritesOnly ? 'Watchlist results' : 'All tracked markets',
        primarySubtitle: favoritesOnly
          ? 'Your watchlist filtered by the current search query.'
          : 'A wider Kraken basket with live price, spread, size and turnover data.',
      };
    }),
  );

  constructor() {
    this.store.dispatch(MarketsActions.selectSymbol({ symbol: null }));
  }

  openDetail(symbol: string): void {
    void this.router.navigate(['/markets', slugFromSymbol(symbol)]);
  }

  reloadSnapshot(): void {
    this.store.dispatch(MarketsActions.loadSnapshot());
    this.snackbar.info('Snapshot refresh requested.');
  }

  toggleWatchlist(symbol: string): void {
    const wasFavorite =
      this.dashboardVm()?.markets.find((market) => market.symbol === symbol)?.isFavorite ?? false;

    this.store.dispatch(WatchlistActions.toggleWatchlist({ symbol }));

    if (wasFavorite) {
      this.snackbar.info(`${symbol} removed from the watchlist.`);
      return;
    }

    this.snackbar.success(`${symbol} saved to the watchlist.`);
  }

  openFeedInfo(): void {
    this.dialog.open(MarketFeedInfoDialogComponent, {
      ariaLabel: 'About the live market feed',
      restoreFocus: true,
    });
  }

  private filterMarkets(markets: readonly TickerVm[], query: string): readonly TickerVm[] {
    if (!query) {
      return markets;
    }

    const normalizedQuery = query.toLowerCase();

    return markets.filter((market) =>
      [market.symbol, market.name, market.baseAsset, market.quoteAsset].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }
}
