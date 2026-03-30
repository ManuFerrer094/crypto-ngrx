import { Routes } from '@angular/router';

import { MarketDetailPageComponent } from './features/markets/containers/market-detail-page/market-detail-page.component';
import { MarketsPageComponent } from './features/markets/containers/markets-page/markets-page.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'markets',
  },
  {
    path: 'markets',
    children: [
      {
        path: '',
        component: MarketsPageComponent,
      },
      {
        path: ':slug',
        component: MarketDetailPageComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'markets',
  },
];
