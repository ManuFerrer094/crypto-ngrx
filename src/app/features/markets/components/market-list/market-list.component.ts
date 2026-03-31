import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MfTableComponent } from 'ng-comps';

import { type TickerVm } from '../../../../core/models/market.models';

type MarketTableCellType = 'text' | 'number' | 'date' | 'badge';
type MarketTableAlign = 'start' | 'center' | 'end';
type MarketTableBadgeTone = 'brand' | 'success' | 'warning' | 'error' | 'neutral';
type MarketTableActionTone = 'primary' | 'neutral' | 'danger';

interface MarketTableColumn {
  key: string;
  header: string;
  sortable?: boolean;
  type?: MarketTableCellType;
  align?: MarketTableAlign;
  width?: string;
  hidden?: boolean;
  truncate?: boolean;
  searchable?: boolean;
  emptyValue?: string;
  formatter?: (value: unknown, row: Record<string, unknown>) => string;
  sortAccessor?: (row: Record<string, unknown>) => unknown;
  searchAccessor?: (row: Record<string, unknown>) => string;
  badgeTone?:
    | MarketTableBadgeTone
    | ((value: unknown, row: Record<string, unknown>) => MarketTableBadgeTone);
  badgeTones?: Record<string, MarketTableBadgeTone>;
}

interface MarketTableRowAction {
  key: string;
  label: string;
  icon?: string;
  tone?: MarketTableActionTone;
  disabled?: boolean | ((row: Record<string, unknown>) => boolean);
  ariaLabel?: (row: Record<string, unknown>) => string;
}

@Component({
  selector: 'app-market-list',
  imports: [MfTableComponent],
  templateUrl: './market-list.component.html',
  styleUrl: './market-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketListComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle = '';
  @Input() emptyMessage = 'No markets to show.';
  @Input({ required: true }) markets: readonly TickerVm[] = [];

  @Output() readonly openDetail = new EventEmitter<string>();
  @Output() readonly toggleFavorite = new EventEmitter<string>();

  protected readonly columns: MarketTableColumn[] = [
    {
      key: 'symbol',
      header: 'Symbol',
      sortable: true,
      width: '9rem',
      formatter: (_value: unknown, row: Record<string, unknown>) => this.asMarket(row).symbol,
      searchAccessor: (row: Record<string, unknown>) =>
        this.searchableMarketText(this.asMarket(row)),
    },
    {
      key: 'name',
      header: 'Pair',
      sortable: true,
      formatter: (_value: unknown, row: Record<string, unknown>) => {
        const market = this.asMarket(row);
        return `${market.name} (${market.baseAsset}/${market.quoteAsset})`;
      },
      searchAccessor: (row: Record<string, unknown>) =>
        this.searchableMarketText(this.asMarket(row)),
    },
    {
      key: 'statusLabel',
      header: 'Status',
      type: 'badge',
      sortable: true,
      badgeTone: (_value: unknown, row: Record<string, unknown>) =>
        this.statusTone(this.asMarket(row)),
    },
    {
      key: 'last',
      header: 'Last',
      type: 'number',
      align: 'end',
      sortable: true,
      formatter: (value: unknown, row: Record<string, unknown>) =>
        this.formatCurrency(value as number | null, this.asMarket(row).quoteAsset),
      sortAccessor: (row: Record<string, unknown>) =>
        this.asMarket(row).last ?? Number.NEGATIVE_INFINITY,
    },
    {
      key: 'changePctFraction',
      header: '24h change',
      type: 'number',
      align: 'end',
      sortable: true,
      formatter: (value: unknown) => this.formatPercent(value as number | null),
      sortAccessor: (row: Record<string, unknown>) =>
        this.asMarket(row).changePctFraction ?? Number.NEGATIVE_INFINITY,
    },
    {
      key: 'spread',
      header: 'Spread',
      type: 'number',
      align: 'end',
      sortable: true,
      formatter: (value: unknown, row: Record<string, unknown>) =>
        this.formatCurrency(value as number | null, this.asMarket(row).quoteAsset),
      sortAccessor: (row: Record<string, unknown>) =>
        this.asMarket(row).spread ?? Number.POSITIVE_INFINITY,
    },
    {
      key: 'volumeNotional',
      header: '24h turnover',
      type: 'number',
      align: 'end',
      sortable: true,
      formatter: (value: unknown, row: Record<string, unknown>) =>
        this.formatCurrency(value as number | null, this.asMarket(row).quoteAsset, 0),
      sortAccessor: (row: Record<string, unknown>) =>
        this.asMarket(row).volumeNotional ?? Number.NEGATIVE_INFINITY,
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      type: 'date',
      sortable: true,
      formatter: (value: unknown) => this.formatTimestamp(value as string | null),
      sortAccessor: (row: Record<string, unknown>) =>
        this.asMarket(row).updatedAt ? new Date(this.asMarket(row).updatedAt!).getTime() : 0,
    },
  ];

  protected readonly rowActions: MarketTableRowAction[] = [
    {
      key: 'open-detail',
      label: 'Open detail',
      icon: 'open_in_new',
      tone: 'primary',
      ariaLabel: (row: Record<string, unknown>) =>
        `Open detail for ${this.asMarket(row).symbol} (${this.asMarket(row).name})`,
    },
    {
      key: 'toggle-watchlist',
      label: 'Watchlist',
      icon: 'bookmark',
      tone: 'neutral',
      ariaLabel: (row: Record<string, unknown>) => {
        const market = this.asMarket(row);
        return market.isFavorite
          ? `Remove ${market.symbol} from the watchlist`
          : `Save ${market.symbol} to the watchlist`;
      },
    },
  ];

  protected handleAction(event: { action: { key: string }; row: Record<string, unknown> }): void {
    const market = this.asMarket(event.row);

    if (event.action.key === 'open-detail') {
      this.openDetail.emit(market.symbol);
      return;
    }

    if (event.action.key === 'toggle-watchlist') {
      this.toggleFavorite.emit(market.symbol);
    }
  }

  protected get tableData(): Record<string, unknown>[] {
    return this.markets.map((market) => market as unknown as Record<string, unknown>);
  }

  private asMarket(row: Record<string, unknown>): TickerVm {
    return row as unknown as TickerVm;
  }

  private searchableMarketText(market: TickerVm): string {
    return [
      market.symbol,
      market.name,
      market.baseAsset,
      market.quoteAsset,
      market.statusLabel,
    ].join(' ');
  }

  private formatCurrency(value: number | null, currencyCode: string, fractionDigits = 2): string {
    if (value === null) {
      return 'Waiting';
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: Math.max(fractionDigits, 4),
    }).format(value);
  }

  private formatPercent(value: number | null): string {
    if (value === null) {
      return 'Waiting';
    }

    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  private formatTimestamp(value: string | null): string {
    if (!value) {
      return 'Waiting';
    }

    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(value));
  }

  private statusTone(market: TickerVm): 'success' | 'warning' | 'error' | 'neutral' {
    switch (market.status) {
      case 'online':
        return 'success';
      case 'cancel_only':
      case 'post_only':
        return 'warning';
      case 'disabled':
        return 'error';
      default:
        return 'neutral';
    }
  }
}
