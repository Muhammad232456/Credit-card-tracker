import { useState } from 'react';
import { getCardById } from '../data/cards';
import { POINTS_PROGRAMS } from '../data/programs';
import type { UserData, MonthlySpendProfile } from '../types';
import { SPEND_CATS, bestRateForCat, formatRate } from '../utils';

interface Props {
  data: UserData;
  update: (updater: (prev: UserData) => UserData) => void;
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

export default function SpendOptimizer({ data, update }: Props) {
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

  // Compute best card per category
  const results = SPEND_CATS.map(cat => {
    let bestCard = '';
    let bestCpd = 0;
    let bestRateStr = '';
    let bestIssuer = '';
    let annualVal = 0;

    for (const uc of activeCards) {
      const t = getCardById(uc.cardId);
      if (!t?.earningRates?.length) continue;
      const { rate, cpd } = bestRateForCat(t.earningRates, cat.keywords, POINTS_PROGRAMS);
      if (!rate) continue;
      if (cpd > bestCpd) {
        bestCpd = cpd;
        bestCard = t.name;
        bestIssuer = t.issuer;
        bestRateStr = formatRate(rate, cpd);
        annualVal = spend[cat.id as keyof MonthlySpendProfile] * 12 * cpd;
      }
    }

    return {
      cat,
      bestCard,
      bestIssuer,
      bestRateStr,
      cpd: bestCpd,
      annualVal,
      monthly: spend[cat.id as keyof MonthlySpendProfile],
    };
  });

  const totalAnnual = results.reduce((s, r) => s + r.annualVal, 0);

  // "All on one card" comparison — best single card for total spend
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

  // Per-card breakdown: for each card, sum earn across all categories
  const cardBreakdown = cardTotals.slice(0, 5);

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
        <div className="text-center py-8 text-gray-400">
          <p className="text-3xl mb-2">💳</p>
          <p className="text-sm">Add cards first to see optimization results.</p>
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
          {/* Results table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800 text-sm">Optimization Results</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {results.filter(r => r.monthly > 0).map(r => (
                <div key={r.cat.id} className="px-4 py-3 flex items-center gap-3">
                  <span className="text-base w-6 shrink-0 text-center">{r.cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">{r.cat.label}</p>
                    {r.bestCard ? (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full text-white font-medium ${ISSUER_COLORS[r.bestIssuer] ?? 'bg-slate-700'}`}>
                          {r.bestIssuer}
                        </span>
                        <span className="text-sm font-medium text-gray-800 truncate">{r.bestCard}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 mt-0.5">No card match</p>
                    )}
                    {r.bestRateStr && (
                      <p className="text-xs text-blue-600 font-mono mt-0.5">{r.bestRateStr}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-emerald-700 text-sm">
                      ${r.annualVal > 0 ? r.annualVal.toFixed(0) : '—'}
                    </p>
                    <p className="text-xs text-gray-400">/yr</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 bg-emerald-50 border-t border-emerald-200 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-800">Total estimated annual earn</span>
              <span className="font-mono font-bold text-xl text-emerald-700">${totalAnnual.toFixed(0)}</span>
            </div>
          </div>

          {/* Card ranking */}
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
        </>
      )}

      <p className="text-xs text-gray-400 text-center pb-2">
        Estimates based on card earning rates and points program valuations. Actual value varies.
      </p>
    </div>
  );
}
