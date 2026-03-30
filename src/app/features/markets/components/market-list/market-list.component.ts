import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe, PercentPipe } from '@angular/common';

import { type TickerVm } from '../../../../core/models/market.models';

@Component({
  selector: 'app-market-list',
  imports: [CurrencyPipe, DatePipe, DecimalPipe, PercentPipe],
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
}
