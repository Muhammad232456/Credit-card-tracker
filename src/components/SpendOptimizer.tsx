import { useState } from 'react';
import { CARD_TEMPLATES, getCardById, getApplyUrl } from '../data/cards';
import { POINTS_PROGRAMS } from '../data/programs';
import type { UserData, MonthlySpendProfile } from '../types';
import { SPEND_CATS, bestRateForCat, formatRate } from '../utils';

interface Props {
  data: UserData;
  update: (updater: (prev: UserData) => UserData) => void;
  onNavigate: (tab: string) => void;
}

const DEFAULT_SPEND: MonthlySpendProfile = {
  groceries: 0, dining: 0, gas: 0, transit: 0, travel: 0,
  entertainment: 0, streaming: 0, drugstore: 0, other: 0,
};

const ISSUER_COLORS: Record<string, string> = {
  Amex: 'bg-blue-900', TD: 'bg-green-700', CIBC: 'bg-red-700', RBC: 'bg-blue-700',
  Scotiabank: 'bg-red-600', BMO: 'bg-blue-600', 'National Bank': 'bg-red-800',
  HSBC: 'bg-red-900', Neo: 'bg-purple-700', MBNA: 'bg-gray-700',
  'Canadian Tire': 'bg-red-500', 'PC Financial': 'bg-orange-600', Rogers: 'bg-red-600',
  Tangerine: 'bg-orange-500', Brim: 'bg-indigo-600', Desjardins: 'bg-green-800',
  'Home Trust': 'bg-teal-700', Meridian: 'bg-cyan-700', 'Capital One': 'bg-red-700',
  Walmart: 'bg-blue-800', Simplii: 'bg-pink-700', ATB: 'bg-amber-700',
};

interface BestOption {
  card: string;
  issuer: string;
  rate: string;
  cpd: number;
}

interface Recommendation {
  cardId: string;
  name: string;
  issuer: string;
  annualFee: number;
  firstYearFree: boolean;
  incremental: number;
  netValue: number;
  topCat: string;
  topCatRate: string;
  applyUrl: string | undefined;
}

export default function SpendOptimizer({ data, update, onNavigate }: Props) {
  const saved = data.settings.monthlySpend ?? {};
  const [spend, setSpend] = useState<MonthlySpendProfile>({ ...DEFAULT_SPEND, ...saved });

  const activeCards = data.cards.filter(c => (c.status ?? 'active') === 'active');

  function setAmount(catId: string, val: string) {
    const num = Math.max(0, Number(val) || 0);
    const next = { ...spend, [catId]: num };
    setSpend(next);
    update(prev => ({
      ...prev,
      settings: { ...prev.settings, monthlySpend: next },
    }));
  }

  const totalMonthly = Object.values(spend).reduce((s, v) => s + v, 0);
  const hasSpend = totalMonthly > 0;
  const hasCards = activeCards.length > 0;

  // ── Best points & cash per category ───────────────────────────────────────
  const results = SPEND_CATS.map(cat => {
    let bestPoints: BestOption | null = null;
    let bestCash: BestOption | null = null;

    for (const uc of activeCards) {
      const t = getCardById(uc.cardId);
      if (!t?.earningRates?.length) continue;

      const pointsRates = t.earningRates.filter(r => r.unit === 'points');
      if (pointsRates.length) {
        const { rate, cpd } = bestRateForCat(pointsRates, cat.keywords, POINTS_PROGRAMS);
        if (rate && cpd > (bestPoints?.cpd ?? 0)) {
          bestPoints = { card: t.name, issuer: t.issuer, rate: formatRate(rate, cpd), cpd };
        }
      }

      const cashRates = t.earningRates.filter(r => r.unit === 'percent');
      if (cashRates.length) {
        const { rate, cpd } = bestRateForCat(cashRates, cat.keywords, POINTS_PROGRAMS);
        if (rate && cpd > (bestCash?.cpd ?? 0)) {
          bestCash = { card: t.name, issuer: t.issuer, rate: formatRate(rate, cpd), cpd };
        }
      }
    }

    const bestCpd = Math.max(bestPoints?.cpd ?? 0, bestCash?.cpd ?? 0);
    return {
      cat,
      bestPoints,
      bestCash,
      bestCpd,
      annualVal: spend[cat.id as keyof MonthlySpendProfile] * 12 * bestCpd,
      monthly: spend[cat.id as keyof MonthlySpendProfile],
    };
  });

  const totalAnnual = results.reduce((s, r) => s + r.annualVal, 0);

  // ── "One card for everything" ranking ─────────────────────────────────────
  const cardTotals: { id: string; name: string; issuer: string; total: number }[] = [];
  for (const uc of activeCards) {
    const t = getCardById(uc.cardId);
    if (!t?.earningRates?.length) continue;
    let total = 0;
    for (const cat of SPEND_CATS) {
      const monthly = spend[cat.id as keyof MonthlySpendProfile];
      if (!monthly) continue;
      const { cpd } = bestRateForCat(t.earningRates, cat.keywords, POINTS_PROGRAMS);
      total += monthly * 12 * cpd;
    }
    cardTotals.push({ id: t.id, name: t.name, issuer: t.issuer, total });
  }
  cardTotals.sort((a, b) => b.total - a.total);
  const bestSingle = cardTotals[0];
  const cardBreakdown = cardTotals.slice(0, 5);

  // ── Card recommendations ───────────────────────────────────────────────────
  const heldIds = new Set(activeCards.map(c => c.cardId));

  // Current best CPD per category across all held cards
  const currentBestCpd: Record<string, number> = {};
  for (const cat of SPEND_CATS) {
    currentBestCpd[cat.id] = 0;
    for (const uc of activeCards) {
      const t = getCardById(uc.cardId);
      if (!t?.earningRates?.length) continue;
      const { cpd } = bestRateForCat(t.earningRates, cat.keywords, POINTS_PROGRAMS);
      if (cpd > currentBestCpd[cat.id]) currentBestCpd[cat.id] = cpd;
    }
  }

  const recommendations: Recommendation[] = CARD_TEMPLATES
    .filter(t => !heldIds.has(t.id) && t.earningRates?.length)
    .map(t => {
      let incremental = 0;
      let topCat = '';
      let topCatRate = '';
      let topCatGain = 0;

      for (const cat of SPEND_CATS) {
        const monthly = spend[cat.id as keyof MonthlySpendProfile];
        if (!monthly) continue;
        const { rate, cpd } = bestRateForCat(t.earningRates!, cat.keywords, POINTS_PROGRAMS);
        const gain = Math.max(0, cpd - currentBestCpd[cat.id]) * monthly * 12;
        incremental += gain;
        if (gain > topCatGain) {
          topCatGain = gain;
          topCat = cat.label;
          topCatRate = rate ? formatRate(rate, cpd) : '';
        }
      }

      return {
        cardId: t.id,
        name: t.name,
        issuer: t.issuer,
        annualFee: t.annualFee,
        firstYearFree: t.firstYearFeeWaived ?? false,
        incremental,
        netValue: incremental - t.annualFee,
        topCat,
        topCatRate,
        applyUrl: getApplyUrl(t.id),
      };
    })
    .filter(r => r.incremental > 5)
    .sort((a, b) => b.netValue - a.netValue)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-2xl p-6 text-white">
        <h2 className="text-lg font-semibold">Spend Optimizer</h2>
        <p className="text-slate-400 text-sm mt-1">
          Enter your average monthly spend per category to see which card earns the most.
        </p>
      </div>

      {/* Spend inputs */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm">Monthly Spend Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SPEND_CATS.map(cat => (
            <div key={cat.id} className="flex items-center gap-2">
              <span className="text-lg w-7 shrink-0 text-center">{cat.icon}</span>
              <label className="text-sm text-gray-700 w-32 shrink-0">{cat.label}</label>
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  value={spend[cat.id as keyof MonthlySpendProfile] || ''}
                  onChange={e => setAmount(cat.id, e.target.value)}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm font-mono"
                />
              </div>
            </div>
          ))}
        </div>
        {totalMonthly > 0 && (
          <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
            Total: <span className="font-mono font-semibold text-gray-700">${totalMonthly.toLocaleString()}/mo</span>
            {' '}· <span className="font-mono">${(totalMonthly * 12).toLocaleString()}/yr</span>
          </p>
        )}
      </div>

      {!hasCards && (
        <div className="text-center py-10 text-gray-400">
          <p className="text-4xl mb-3">💳</p>
          <p className="text-base font-medium text-gray-600">No cards added yet</p>
          <p className="text-sm mt-1 mb-4">Add your cards first, then come back to see which card earns the most for each spending category.</p>
          <button
            onClick={() => onNavigate('cards')}
            className="bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            Add Your First Card →
          </button>
        </div>
      )}

      {hasCards && !hasSpend && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-3xl mb-2">👆</p>
          <p className="text-sm">Enter your monthly spending above to see which card to use for each category.</p>
        </div>
      )}

      {hasCards && hasSpend && (
        <>
          {/* Results */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 text-sm">Optimization Results</h3>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span>🎯</span> Best points</span>
                <span className="flex items-center gap-1"><span>💵</span> Best cash back</span>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {results.filter(r => r.monthly > 0).map(r => {
                const showBoth = r.bestPoints && r.bestCash && r.bestPoints.card !== r.bestCash.card;
                const onlyOne = r.bestPoints ?? r.bestCash;

                return (
                  <div key={r.cat.id} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{r.cat.icon}</span>
                        <span className="text-xs text-gray-500">{r.cat.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-700 text-sm">
                          ${r.annualVal > 0 ? r.annualVal.toFixed(0) : '—'}
                        </span>
                        <span className="text-xs text-gray-400">/yr</span>
                      </div>
                    </div>

                    {showBoth ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs w-4 shrink-0">🎯</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full text-white font-medium shrink-0 ${ISSUER_COLORS[r.bestPoints!.issuer] ?? 'bg-slate-700'}`}>
                            {r.bestPoints!.issuer}
                          </span>
                          <span className="text-sm font-medium text-gray-800 truncate">{r.bestPoints!.card}</span>
                          <span className="text-xs text-blue-600 font-mono ml-auto shrink-0">{r.bestPoints!.rate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs w-4 shrink-0">💵</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full text-white font-medium shrink-0 ${ISSUER_COLORS[r.bestCash!.issuer] ?? 'bg-slate-700'}`}>
                            {r.bestCash!.issuer}
                          </span>
                          <span className="text-sm font-medium text-gray-800 truncate">{r.bestCash!.card}</span>
                          <span className="text-xs text-emerald-600 font-mono ml-auto shrink-0">{r.bestCash!.rate}</span>
                        </div>
                      </div>
                    ) : onlyOne ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs w-4 shrink-0">{r.bestPoints ? '🎯' : '💵'}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full text-white font-medium shrink-0 ${ISSUER_COLORS[onlyOne.issuer] ?? 'bg-slate-700'}`}>
                          {onlyOne.issuer}
                        </span>
                        <span className="text-sm font-medium text-gray-800 truncate">{onlyOne.card}</span>
                        <span className={`text-xs font-mono ml-auto shrink-0 ${r.bestPoints ? 'text-blue-600' : 'text-emerald-600'}`}>
                          {onlyOne.rate}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No card match</p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="px-4 py-3 bg-emerald-50 border-t border-emerald-200 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-800">Total estimated annual earn</span>
              <span className="font-mono font-bold text-xl text-emerald-700">${totalAnnual.toFixed(0)}</span>
            </div>
          </div>

          {/* "One card" ranking */}
          {cardBreakdown.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800 text-sm">If You Used One Card for Everything</h3>
                <p className="text-xs text-gray-500 mt-0.5">Ranked by total earn across all your spend</p>
              </div>
              <div className="divide-y divide-gray-100">
                {cardBreakdown.map((c, i) => (
                  <div key={c.id} className="px-4 py-3 flex items-center gap-3">
                    <span className={`text-xs font-bold w-5 shrink-0 ${i === 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                      #{i + 1}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full text-white font-medium shrink-0 ${ISSUER_COLORS[c.issuer] ?? 'bg-slate-700'}`}>
                      {c.issuer}
                    </span>
                    <span className="text-sm text-gray-800 flex-1 truncate">{c.name}</span>
                    <span className="font-mono font-bold text-sm text-gray-700">${c.total.toFixed(0)}/yr</span>
                  </div>
                ))}
              </div>
              {bestSingle && (
                <div className="px-4 py-3 bg-blue-50 border-t border-blue-200">
                  <p className="text-xs text-blue-700">
                    Optimizing by category earns{' '}
                    <span className="font-bold">${(totalAnnual - bestSingle.total).toFixed(0)}</span>
                    {' '}more than using {bestSingle.name} for everything.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Cards Worth Getting */}
          {recommendations.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
                <h3 className="font-semibold text-gray-800 text-sm">Cards Worth Getting</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Based on your spend — how much more you'd earn above your current best card
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {recommendations.map((rec, i) => (
                  <div key={rec.cardId} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Rank + issuer + name */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-amber-600">#{i + 1}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full text-white font-medium ${ISSUER_COLORS[rec.issuer] ?? 'bg-slate-700'}`}>
                            {rec.issuer}
                          </span>
                          <span className="text-sm font-semibold text-gray-900 truncate">{rec.name}</span>
                        </div>

                        {/* Fee */}
                        <p className="text-xs text-gray-500 mt-1">
                          {rec.annualFee === 0
                            ? 'No annual fee'
                            : rec.firstYearFree
                            ? `$${rec.annualFee}/yr · 1st year free`
                            : `$${rec.annualFee}/yr`}
                        </p>
                        {/* Why this card */}
                        {rec.topCat && (
                          <p className="text-xs text-blue-700 bg-blue-50 rounded-md px-2 py-1 mt-1.5 inline-block">
                            {rec.topCatRate && <span className="font-semibold">{rec.topCatRate}</span>}
                            {rec.topCatRate && ' · '}
                            {rec.topCat}
                          </p>
                        )}
                      </div>

                      {/* Earn numbers */}
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-400">extra earn/yr</p>
                        <p className="font-mono font-bold text-base text-gray-900">
                          +${rec.incremental.toFixed(0)}
                        </p>
                        <p className={`text-xs font-semibold mt-0.5 ${rec.netValue >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {rec.netValue >= 0
                            ? `+$${rec.netValue.toFixed(0)} after fee`
                            : `-$${Math.abs(rec.netValue).toFixed(0)} after fee`}
                        </p>
                      </div>
                    </div>

                    {/* Apply button */}
                    <div className="mt-3">
                      {rec.applyUrl ? (
                        <a
                          href={rec.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                          Apply Now →
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-semibold px-4 py-2 rounded-lg">
                          Search online to apply
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-400">
                  Extra earn is calculated vs your current best card per category. Net value subtracts the annual fee from year 1. Actual value depends on how you redeem points.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      <p className="text-xs text-gray-400 text-center pb-2">
        Points values use default program benchmarks. Set your personal CPP in the Points tab to personalize results.
      </p>
    </div>
  );
}
