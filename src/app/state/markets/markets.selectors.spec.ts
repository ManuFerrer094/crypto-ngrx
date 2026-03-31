import { describe, expect, it } from 'vitest';

import { rootStateFixture } from '../../testing/market-test-data';
import {
  selectDashboardVm,
  selectFavoriteTickerVmList,
  selectSelectedMarketVm,
  selectTickerVmList,
} from './markets.selectors';

describe('markets selectors', () => {
  it('returns the full market list in dashboard order', () => {
    const markets = selectTickerVmList(rootStateFixture);

    expect(markets.map((market) => market.symbol)).toEqual(['BTC/USD', 'ETH/USD', 'SOL/USD']);
  });

  it('marks favorites from the watchlist slice', () => {
    const favorites = selectFavoriteTickerVmList(rootStateFixture);

    expect(favorites).toHaveLength(1);
    expect(favorites[0]?.symbol).toBe('BTC/USD');
    expect(favorites[0]?.isFavorite).toBe(true);
  });

  it('builds a detail view model for the selected symbol', () => {
    const detail = selectSelectedMarketVm(rootStateFixture);

    expect(detail?.symbol).toBe('ETH/USD');
    expect(detail?.name).toBe('Ethereum');
    expect(detail?.changePctFraction).toBeCloseTo(-0.024);
    expect(detail?.statusLabel).toBe('Online');
    expect(detail?.volumeNotional).toBeGreaterThan(0);
  });

  it('exposes derived dashboard state for the page container', () => {
    const vm = selectDashboardVm(rootStateFixture);

    expect(vm.connectionStatus).toBe('connected');
    expect(vm.favoriteMarkets).toHaveLength(1);
    expect(vm.loading).toBe(false);
    expect(vm.leaderMarket?.symbol).toBe('SOL/USD');
    expect(vm.laggardMarket?.symbol).toBe('ETH/USD');
  });
});
