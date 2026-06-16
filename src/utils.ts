import type { EarningRate, BenefitTemplate, UserSettings } from './types';
import type { PointsProgram } from './types';

export const SPEND_CATS = [
  { id: 'groceries',     label: 'Groceries',         icon: '🛒', keywords: ['grocer', 'supermarket', 'food store', 'loblaws', 'sobeys', 'metro', 'costco'] },
  { id: 'dining',        label: 'Dining & Bars',      icon: '🍽️', keywords: ['dining', 'restaurant', 'bar', 'coffee', 'food delivery', 'instacart', 'doordash', 'drink'] },
  { id: 'gas',           label: 'Gas & EV',           icon: '⛽', keywords: ['gas', 'fuel', 'petro', 'ev charging', 'esso', 'station'] },
  { id: 'transit',       label: 'Transit & Rideshare',icon: '🚇', keywords: ['transit', 'rideshare', 'uber', 'lyft', 'ttc', 'presto', 'bus', 'subway', 'train'] },
  { id: 'travel',        label: 'Travel',             icon: '✈️', keywords: ['travel', 'flight', 'hotel', 'airline', 'airbnb', 'airport', 'vacation', 'porter', 'westjet', 'air canada', 'british airways'] },
  { id: 'entertainment', label: 'Entertainment',      icon: '🎬', keywords: ['entertainment', 'movie', 'cineplex', 'sport', 'theatre', 'scene', 'gaming'] },
  { id: 'streaming',     label: 'Streaming & Subs',   icon: '📺', keywords: ['streaming', 'subscription', 'recurring', 'bill', 'digital media', 'digital'] },
  { id: 'drugstore',     label: 'Drug & Pharmacy',    icon: '💊', keywords: ['drug', 'pharmacy', 'shoppers', 'rexall'] },
  { id: 'other',         label: 'Everything Else',    icon: '🛍️', keywords: [] },
] as const;

export type SpendCatId = typeof SPEND_CATS[number]['id'];

const FALLBACK_KW = ['everything', 'all purchases', 'all eligible', 'everywhere', 'elsewhere', 'all other'];

/** Convert an EarningRate to dollars-per-dollar spent (e.g. 0.02 = 2¢/$) */
export function rateToCpd(rate: EarningRate, programs: PointsProgram[]): number {
  if (rate.unit === 'percent') return rate.multiplier;
  const prog = programs.find(p => p.id === rate.programId);
  const cpp = prog?.defaultCpp ?? 1;
  return (rate.multiplier * cpp) / 100;
}

/** Find the best EarningRate for a spend category's keywords */
export function bestRateForCat(
  rates: EarningRate[],
  keywords: readonly string[],
  programs: PointsProgram[]
): { rate: EarningRate | null; cpd: number } {
  let bestMatch: EarningRate | null = null;
  let bestCpd = 0;
  let fallback: EarningRate | null = null;
  let fallbackCpd = 0;

  for (const rate of rates) {
    const catL = rate.category.toLowerCase();
    const cpd = rateToCpd(rate, programs);
    const isFallback = FALLBACK_KW.some(k => catL.includes(k));

    if (isFallback) {
      if (cpd > fallbackCpd) { fallback = rate; fallbackCpd = cpd; }
      continue;
    }

    if (keywords.length > 0 && keywords.some(k => catL.includes(k))) {
      if (cpd > bestCpd) { bestMatch = rate; bestCpd = cpd; }
    }
  }

  if (keywords.length === 0) return { rate: fallback, cpd: fallbackCpd };
  return bestMatch ? { rate: bestMatch, cpd: bestCpd } : { rate: fallback, cpd: fallbackCpd };
}

/** Format a rate for display, e.g. "5× MR (≈7.5¢/$)" or "4% cash back" */
export function formatRate(rate: EarningRate, cpd: number): string {
  if (rate.unit === 'percent') {
    const pct = rate.multiplier * 100;
    return `${pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(1)}% back`;
  }
  const cpdPct = cpd * 100;
  const cpdStr = cpdPct % 1 === 0 ? cpdPct.toFixed(0) : cpdPct.toFixed(1);
  return `${rate.multiplier}× (≈${cpdStr}¢/$)`;
}

/** Effective benefit value — auto-calculates FX savings when annualFxSpend is set */
export function effectiveBenefitValue(benefit: BenefitTemplate, settings: UserSettings): number {
  if (benefit.category === 'fx-savings' && benefit.value === 0 && settings.annualFxSpend) {
    return Math.round(settings.annualFxSpend * 0.025);
  }
  return benefit.value;
}

/** Human-readable card age from openedDate to today (or closedDate) */
export function cardAge(openedDate: string, closedDate?: string): string {
  const start = new Date(openedDate + 'T12:00:00');
  const end = closedDate ? new Date(closedDate + 'T12:00:00') : new Date();
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (months < 1) return '< 1 mo';
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${rem}mo`;
  if (rem === 0) return `${years}yr`;
  return `${years}yr ${rem}mo`;
}

/** Next calendar-year reset date (Jan 1 of next year) */
export function nextCalendarReset(): string {
  return `${new Date().getFullYear() + 1}-01-01`;
}

/** Next cardmember-year reset date (next anniversary of openedDate) */
export function nextCardmemberReset(openedDate: string): string {
  const opened = new Date(openedDate + 'T12:00:00');
  const today = new Date(); today.setHours(12, 0, 0, 0);
  let next = new Date(today.getFullYear(), opened.getMonth(), opened.getDate());
  if (next <= today) next = new Date(today.getFullYear() + 1, opened.getMonth(), opened.getDate());
  return next.toISOString().split('T')[0];
}
