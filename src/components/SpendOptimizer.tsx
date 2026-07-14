import { useState } from 'react';
import { CARD_TEMPLATES, getCardById, getApplyUrl } from '../data/cards';
import { POINTS_PROGRAMS } from '../data/programs';
import type { UserData, MonthlySpendProfile } from '../types';
import { SPEND_CATS, bestRateForCat, formatRate } from '../utils';
import FxCalculator from './FxCalculator';
import GlossaryTerm from './GlossaryTerm';
import { trackApplyClick } from '../analytics';
import { SPEND_CAT_ICON_COMPONENTS, CardsIcon, OptimizeIcon, DollarCircleIcon, AlertIcon } from './Icons';

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
  Amex: 'bg-[#1E3A5F]', TD: 'bg-[#2E6B4F]', CIBC: 'bg-[#8B3A3A]', RBC: 'bg-[#1E4C6B]',
  Scotiabank: 'bg-[#8B3A3A]', BMO: 'bg-[#1E4C6B]', 'National Bank': 'bg-[#7A3030]',
  HSBC: 'bg-[#7A2020]', Neo: 'bg-[#4A3468]', MBNA: 'bg-[#3E4451]',
  'Canadian Tire': 'bg-[#8B3A3A]', 'PC Financial': 'bg-[#8B5A2A]', Rogers: 'bg-[#8B3A3A]',
  Tangerine: 'bg-[#B8873A]', Brim: 'bg-[#3C3A68]', Desjardins: 'bg-[#2E6B4F]',
  'Home Trust': 'bg-[#1E5A5A]', Meridian: 'bg-[#1E5A6B]', 'Capital One': 'bg-[#8B3A3A]',
  Walmart: 'bg-[#1E4C6B]', Simplii: 'bg-[#7A3055]', ATB: 'bg-[#B8873A]',
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
    .filter(t => !heldIds.has(t.id) && t.earningRates?.length && !t.discontinued)
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
      <div className="bg-surface border border-brass/40 rounded-2xl p-6 text-ink">
        <h2 className="text-lg font-semibold">Spend Optimizer</h2>
        <p className="text-ink-soft text-sm mt-1">
          Enter your average monthly spend per category to see which card earns the most.
        </p>
      </div>

      {/* Spend inputs */}
      <div className="bg-surface border border-line rounded-xl p-4">
        <h3 className="font-semibold text-ink mb-3 text-sm">Monthly Spend Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SPEND_CATS.map(cat => {
            const CatIcon = SPEND_CAT_ICON_COMPONENTS[cat.id];
            return (
            <div key={cat.id} className="flex items-center gap-2">
              <CatIcon className="w-5 h-5 shrink-0 text-ink-soft" />
              <label className="text-sm text-ink w-32 shrink-0">{cat.label}</label>
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  value={spend[cat.id as keyof MonthlySpendProfile] || ''}
                  onChange={e => setAmount(cat.id, e.target.value)}
                  placeholder="0"
                  className="w-full border border-line rounded-lg pl-7 pr-3 py-2 text-sm font-mono"
                />
              </div>
            </div>
            );
          })}
        </div>
        {totalMonthly > 0 && (
          <p className="text-xs text-ink-soft mt-3 pt-3 border-t border-line">
            Total: <span className="font-mono font-semibold text-ink">${totalMonthly.toLocaleString()}/mo</span>
            {' '}· <span className="font-mono">${(totalMonthly * 12).toLocaleString()}/yr</span>
          </p>
        )}
      </div>

      {!hasCards && (
        <div className="text-center py-10 text-ink-soft">
          <CardsIcon className="w-10 h-10 mx-auto mb-3 text-ink-soft" />
          <p className="text-base font-medium text-ink-soft">No cards added yet</p>
          <p className="text-sm mt-1 mb-4">Add your cards first, then come back to see which card earns the most for each spending category.</p>
          <button
            onClick={() => onNavigate('cards')}
            className="bg-brass text-ink px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Add Your First Card →
          </button>
        </div>
      )}

      {hasCards && !hasSpend && (
        <div className="text-center py-8 text-ink-soft">
          <p className="text-sm">Enter your monthly spending above to see which card to use for each category.</p>
        </div>
      )}

      {hasCards && hasSpend && (
        <>
          {/* Results */}
          <div className="bg-surface border border-line rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-paper border-b border-line flex items-center justify-between">
              <h3 className="font-semibold text-ink text-sm">Optimization Results</h3>
              <div className="flex items-center gap-3 text-xs text-ink-soft">
                <span className="flex items-center gap-1"><OptimizeIcon className="w-3.5 h-3.5" /> Best points</span>
                <span className="flex items-center gap-1"><DollarCircleIcon className="w-3.5 h-3.5" /> Best cash back</span>
              </div>
            </div>
            <div className="divide-y divide-line">
              {results.filter(r => r.monthly > 0).map(r => {
                const showBoth = r.bestPoints && r.bestCash && r.bestPoints.card !== r.bestCash.card;
                const onlyOne = r.bestPoints ?? r.bestCash;

                return (
                  <div key={r.cat.id} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {(() => { const CatIcon = SPEND_CAT_ICON_COMPONENTS[r.cat.id]; return <CatIcon className="w-4 h-4 text-ink-soft" />; })()}
                        <span className="text-xs text-ink-soft">{r.cat.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-forest text-sm">
                          ${r.annualVal > 0 ? r.annualVal.toFixed(0) : '-'}
                        </span>
                        <span className="text-xs text-ink-soft">/yr</span>
                      </div>
                    </div>

                    {showBoth ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <OptimizeIcon className="w-3.5 h-3.5 shrink-0 text-ink-soft" />
                          <span className={`text-xs px-1.5 py-0.5 rounded-full text-white font-medium shrink-0 ${ISSUER_COLORS[r.bestPoints!.issuer] ?? 'bg-ink-soft'}`}>
                            {r.bestPoints!.issuer}
                          </span>
                          <span className="text-sm font-medium text-ink truncate">{r.bestPoints!.card}</span>
                          <span className="text-xs text-brass font-mono ml-auto shrink-0">{r.bestPoints!.rate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarCircleIcon className="w-3.5 h-3.5 shrink-0 text-ink-soft" />
                          <span className={`text-xs px-1.5 py-0.5 rounded-full text-white font-medium shrink-0 ${ISSUER_COLORS[r.bestCash!.issuer] ?? 'bg-ink-soft'}`}>
                            {r.bestCash!.issuer}
                          </span>
                          <span className="text-sm font-medium text-ink truncate">{r.bestCash!.card}</span>
                          <span className="text-xs text-forest font-mono ml-auto shrink-0">{r.bestCash!.rate}</span>
                        </div>
                      </div>
                    ) : onlyOne ? (
                      <div className="flex items-center gap-2">
                        {r.bestPoints ? <OptimizeIcon className="w-3.5 h-3.5 shrink-0 text-ink-soft" /> : <DollarCircleIcon className="w-3.5 h-3.5 shrink-0 text-ink-soft" />}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full text-white font-medium shrink-0 ${ISSUER_COLORS[onlyOne.issuer] ?? 'bg-ink-soft'}`}>
                          {onlyOne.issuer}
                        </span>
                        <span className="text-sm font-medium text-ink truncate">{onlyOne.card}</span>
                        <span className={`text-xs font-mono ml-auto shrink-0 ${r.bestPoints ? 'text-brass' : 'text-forest'}`}>
                          {onlyOne.rate}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-ink-soft">No card match</p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="px-4 py-3 bg-forest-bg border-t border-forest flex justify-between items-center">
              <span className="text-sm font-semibold text-ink">Total estimated annual earn</span>
              <span className="font-mono font-bold text-xl text-forest">${totalAnnual.toFixed(0)}</span>
            </div>
          </div>

          {/* "One card" ranking */}
          {cardBreakdown.length > 0 && (
            <div className="bg-surface border border-line rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-paper border-b border-line">
                <h3 className="font-semibold text-ink text-sm">If You Used One Card for Everything</h3>
                <p className="text-xs text-ink-soft mt-0.5">Ranked by total earn across all your spend</p>
              </div>
              <div className="divide-y divide-line">
                {cardBreakdown.map((c, i) => (
                  <div key={c.id} className="px-4 py-3 flex items-center gap-3">
                    <span className={`text-xs font-bold w-5 shrink-0 ${i === 0 ? 'text-forest' : 'text-ink-soft'}`}>
                      #{i + 1}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full text-white font-medium shrink-0 ${ISSUER_COLORS[c.issuer] ?? 'bg-ink-soft'}`}>
                      {c.issuer}
                    </span>
                    <span className="text-sm text-ink flex-1 truncate">{c.name}</span>
                    <span className="font-mono font-bold text-sm text-ink">${c.total.toFixed(0)}/yr</span>
                  </div>
                ))}
              </div>
              {bestSingle && (
                <div className="px-4 py-3 bg-brass-soft border-t border-brass">
                  <p className="text-xs text-brass">
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
            <div className="bg-surface border border-line rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-amber-bg border-b border-amber">
                <h3 className="font-semibold text-ink text-sm">Cards Worth Getting</h3>
                <p className="text-xs text-ink-soft mt-0.5">
                  Based on your spend - incremental <GlossaryTerm term="Earn Rate">earn</GlossaryTerm> above your current best card per category
                </p>
              </div>
              <div className="divide-y divide-line">
                {recommendations.map((rec, i) => (
                  <div key={rec.cardId} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Rank + issuer + name */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-amber">#{i + 1}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full text-white font-medium ${ISSUER_COLORS[rec.issuer] ?? 'bg-ink-soft'}`}>
                            {rec.issuer}
                          </span>
                          <span className="text-sm font-semibold text-ink truncate">{rec.name}</span>
                        </div>

                        {/* Fee */}
                        <p className="text-xs text-ink-soft mt-1">
                          {rec.annualFee === 0
                            ? 'No annual fee'
                            : rec.firstYearFree
                            ? `$${rec.annualFee}/yr · 1st year free`
                            : `$${rec.annualFee}/yr`}
                        </p>
                        {/* Why this card */}
                        {rec.topCat && (
                          <p className="text-xs text-brass bg-brass-soft rounded-md px-2 py-1 mt-1.5 inline-block">
                            {rec.topCatRate && <span className="font-semibold">{rec.topCatRate}</span>}
                            {rec.topCatRate && ' · '}
                            {rec.topCat}
                          </p>
                        )}
                      </div>

                      {/* Earn numbers */}
                      <div className="text-right shrink-0">
                        <p className="text-xs text-ink-soft">extra earn/yr</p>
                        <p className="font-mono font-bold text-base text-ink">
                          +${rec.incremental.toFixed(0)}
                        </p>
                        <p className={`text-xs font-semibold mt-0.5 ${rec.netValue >= 0 ? 'text-forest' : 'text-amber'}`}>
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
                          onClick={() => trackApplyClick(rec.cardId, rec.name, rec.issuer, 'optimizer')}
                          className="inline-flex items-center gap-1.5 bg-brass hover:opacity-90 text-ink text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                          Apply Now →
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-line text-ink-soft text-xs font-semibold px-4 py-2 rounded-lg">
                          Search online to apply
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 bg-paper border-t border-line">
                <p className="text-xs text-ink-soft">
                  Extra earn is calculated vs your current best card per category. Net value subtracts the annual fee from year 1. Actual value depends on how you redeem points.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      <FxCalculator data={data} />

      <div className="bg-amber-bg border border-amber rounded-xl p-3 text-xs text-amber space-y-1">
        <p className="font-semibold flex items-center gap-1.5"><AlertIcon className="w-3.5 h-3.5" /> Estimates may not reflect real-world earning</p>
        <p>Spend categories assume your card is accepted at every merchant. In practice, some stores restrict card networks - for example, Costco only accepts Mastercard, and some merchants don't accept Amex. Your actual earn may be lower if part of your spend is at merchants that don't accept your card.</p>
      </div>
      <p className="text-xs text-ink-soft text-center pb-2">
        Points values use default <GlossaryTerm term="CPP">CPP</GlossaryTerm> benchmarks. Set your personal CPP in the Points tab to personalize results.
      </p>
    </div>
  );
}
