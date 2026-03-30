import {
  TRACKED_MARKETS_BY_SLUG,
  TRACKED_MARKETS_BY_SYMBOL,
} from '../constants/tracked-markets';

export function symbolFromSlug(slug: string): string | null {
  return TRACKED_MARKETS_BY_SLUG[slug]?.symbol ?? null;
}

export function slugFromSymbol(symbol: string): string {
  return TRACKED_MARKETS_BY_SYMBOL[symbol]?.slug ?? symbol.toLowerCase();
}
