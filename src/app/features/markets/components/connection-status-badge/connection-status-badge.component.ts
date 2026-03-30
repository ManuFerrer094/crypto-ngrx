import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { type ConnectionStatus } from '../../../../core/models/market.models';

@Component({
  selector: 'app-connection-status-badge',
  templateUrl: './connection-status-badge.component.html',
  styleUrl: './connection-status-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectionStatusBadgeComponent {
  @Input({ required: true }) status!: ConnectionStatus;
  @Input() reconnectInMs: number | null = null;

  get tone(): string {
    switch (this.status) {
      case 'connected':
        return 'success';
      case 'reconnecting':
      case 'connecting':
        return 'warning';
      case 'error':
      case 'disconnected':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  get label(): string {
    switch (this.status) {
      case 'connected':
        return 'Live stream connected';
      case 'connecting':
        return 'Connecting to Kraken';
      case 'reconnecting':
        return this.reconnectInMs
          ? `Reconnecting in ${Math.ceil(this.reconnectInMs / 1000)}s`
          : 'Reconnecting';
      case 'error':
        return 'Stream error';
      case 'disconnected':
        return 'Stream disconnected';
      default:
        return 'Waiting to connect';
    }
  }
}
