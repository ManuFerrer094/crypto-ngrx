import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';

import {
  adaptMarketSnapshot,
  type KrakenAssetPairsResponse,
  type KrakenTickerResponse,
} from '../adapters/kraken.adapters';
import { TRACKED_MARKET_REST_SYMBOLS } from '../constants/tracked-markets';
import { type MarketPair } from '../models/market.models';

const REST_API_URL = 'https://api.kraken.com/0/public';
const REST_SYMBOLS = TRACKED_MARKET_REST_SYMBOLS.join(',');

@Injectable({ providedIn: 'root' })
export class KrakenRestService {
  private readonly http = inject(HttpClient);

  getMarketSnapshot(): Observable<MarketPair[]> {
    return forkJoin({
      assetPairs: this.http.get<KrakenAssetPairsResponse>(
        `${REST_API_URL}/AssetPairs?pair=${REST_SYMBOLS}`,
      ),
      tickers: this.http.get<KrakenTickerResponse>(
        `${REST_API_URL}/Ticker?pair=${REST_SYMBOLS}`,
      ),
    }).pipe(
      map(({ assetPairs, tickers }) => adaptMarketSnapshot(assetPairs, tickers)),
    );
  }
}
