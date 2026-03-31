import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MfButtonComponent, MfDialogComponent } from 'ng-comps';

@Component({
  selector: 'app-market-feed-info-dialog',
  imports: [MfButtonComponent, MfDialogComponent],
  templateUrl: './market-feed-info-dialog.component.html',
  styleUrl: './market-feed-info-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketFeedInfoDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<MarketFeedInfoDialogComponent>);

  close(): void {
    this.dialogRef.close();
  }
}
