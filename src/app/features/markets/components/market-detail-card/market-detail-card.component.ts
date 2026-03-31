import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { MfButtonComponent } from 'ng-comps';

import { type TickerVm } from '../../../../core/models/market.models';

@Component({
  selector: 'app-market-detail-card',
  imports: [CurrencyPipe, DatePipe, DecimalPipe, PercentPipe, MfButtonComponent],
  templateUrl: './market-detail-card.component.html',
  styleUrl: './market-detail-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketDetailCardComponent {
  @Input({ required: true }) market!: TickerVm;

  @Output() readonly toggleFavorite = new EventEmitter<string>();
}
