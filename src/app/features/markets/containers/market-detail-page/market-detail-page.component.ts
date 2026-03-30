import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, map, tap } from 'rxjs';

import { symbolFromSlug } from '../../../../core/utils/market-symbol.utils';
import { MarketsActions } from '../../../../state/markets/markets.actions';
import { selectDetailVm } from '../../../../state/markets/markets.selectors';
import { WatchlistActions } from '../../../../state/watchlist/watchlist.actions';
import { ConnectionStatusBadgeComponent } from '../../components/connection-status-badge/connection-status-badge.component';
import { MarketDetailCardComponent } from '../../components/market-detail-card/market-detail-card.component';

@Component({
  selector: 'app-market-detail-page',
  imports: [
    AsyncPipe,
    ConnectionStatusBadgeComponent,
    MarketDetailCardComponent,
  ],
  templateUrl: './market-detail-page.component.html',
  styleUrl: './market-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketDetailPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(Store);

  readonly vm$ = this.store.select(selectDetailVm);

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => params.get('slug')),
        distinctUntilChanged(),
        tap((slug) => {
          const symbol = slug ? symbolFromSlug(slug) : null;

          if (!symbol) {
            this.store.dispatch(MarketsActions.selectSymbol({ symbol: null }));
            void this.router.navigate(['/markets']);
            return;
          }

          this.store.dispatch(MarketsActions.selectSymbol({ symbol }));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  goBack(): void {
    this.store.dispatch(MarketsActions.selectSymbol({ symbol: null }));
    void this.router.navigate(['/markets']);
  }

  toggleWatchlist(symbol: string): void {
    this.store.dispatch(WatchlistActions.toggleWatchlist({ symbol }));
  }
}
