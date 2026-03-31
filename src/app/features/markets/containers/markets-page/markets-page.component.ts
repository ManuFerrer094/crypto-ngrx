import { AsyncPipe, CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { slugFromSymbol } from '../../../../core/utils/market-symbol.utils';
import { MarketsActions } from '../../../../state/markets/markets.actions';
import { selectDashboardVm } from '../../../../state/markets/markets.selectors';
import { WatchlistActions } from '../../../../state/watchlist/watchlist.actions';
import { ConnectionStatusBadgeComponent } from '../../components/connection-status-badge/connection-status-badge.component';
import { MarketListComponent } from '../../components/market-list/market-list.component';

@Component({
  selector: 'app-markets-page',
  imports: [
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    PercentPipe,
    ConnectionStatusBadgeComponent,
    MarketListComponent,
  ],
  templateUrl: './markets-page.component.html',
  styleUrl: './markets-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketsPageComponent {
  private readonly router = inject(Router);
  private readonly store = inject(Store);

  readonly vm$ = this.store.select(selectDashboardVm);

  constructor() {
    this.store.dispatch(MarketsActions.selectSymbol({ symbol: null }));
  }

  openDetail(symbol: string): void {
    void this.router.navigate(['/markets', slugFromSymbol(symbol)]);
  }

  reloadSnapshot(): void {
    this.store.dispatch(MarketsActions.loadSnapshot());
  }

  toggleWatchlist(symbol: string): void {
    this.store.dispatch(WatchlistActions.toggleWatchlist({ symbol }));
  }
}
