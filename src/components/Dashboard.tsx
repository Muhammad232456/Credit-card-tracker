import { getCardById } from '../data/cards';
import { POINTS_PROGRAMS } from '../data/programs';
import type { UserData, MonthlySpendProfile } from '../types';
import { effectiveBenefitValue, nextCalendarReset, nextCardmemberReset, SPEND_CATS, bestRateForCat } from '../utils';
import GlossaryTerm from './GlossaryTerm';
import FeedbackWidget from './FeedbackWidget';
import { WalletMark, CardsIcon, PointsIcon, OptimizeIcon, LoungeIcon, AlertIcon, ClockIcon } from './Icons';

interface Props {
  data: UserData;
  onNavigate: (tab: string, cardId?: string) => void;
  onStartQuiz?: () => void;
}

const ISSUER_FACE: Record<string, string> = {
  Amex: 'from-[#1E3A5F] to-[#0E1F35]',
  TD: 'from-[#2E6B4F] to-[#143624]',
  CIBC: 'from-[#8B3A3A] to-[#4A1B1B]',
  RBC: 'from-[#1E4C6B] to-[#0E2536]',
  Scotiabank: 'from-[#8B3A3A] to-[#3F1717]',
  BMO: 'from-[#1E4C6B] to-[#122E42]',
  'National Bank': 'from-[#7A3030] to-[#3A1414]',
  HSBC: 'from-[#7A2020] to-[#360E0E]',
  Neo: 'from-[#4A3468] to-[#241832]',
  MBNA: 'from-[#3E4451] to-[#1E2129]',
  'Canadian Tire': 'from-[#8B3A3A] to-[#3F1717]',
  'PC Financial': 'from-[#8B5A2A] to-[#3F2710]',
  Rogers: 'from-[#8B3A3A] to-[#3F1717]',
  Tangerine: 'from-[#B8873A] to-[#5A3F13]',
  Brim: 'from-[#3C3A68] to-[#1C1B32]',
  Desjardins: 'from-[#2E6B4F] to-[#143624]',
  'Home Trust': 'from-[#1E5A5A] to-[#0E2C2C]',
  Meridian: 'from-[#1E5A6B] to-[#0E2C36]',
  'Capital One': 'from-[#8B3A3A] to-[#3F1717]',
  Walmart: 'from-[#1E4C6B] to-[#0E2536]',
  Simplii: 'from-[#7A3055] to-[#3A1428]',
  ATB: 'from-[#B8873A] to-[#5A3F13]',
};

function CardChip({ issuer }: { issuer: string }) {
  const face = ISSUER_FACE[issuer] ?? 'from-ink to-ink-soft';
  return (
    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${face} shrink-0 flex items-center justify-center`}>
      <span className="text-white text-[8px] font-bold uppercase leading-none px-0.5 text-center">
        {issuer.slice(0, 4)}
      </span>
    </div>
  );
}

function RingProgress({ pct }: { pct: number }) {
  const r = 17;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(pct, 100) / 100) * circ;
  const color = pct >= 100 ? 'var(--color-forest)' : pct >= 50 ? 'var(--color-amber)' : 'var(--color-rust)';
  return (
    <svg width="42" height="42" viewBox="0 0 42 42" className="shrink-0">
      <circle cx="21" cy="21" r={r} fill="none" stroke="var(--color-line)" strokeWidth="4" />
      {pct > 0 && (
        <circle cx="21" cy="21" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 21 21)" />
      )}
    </svg>
  );
}

function calcNextRenewal(openedDate: string, feeFrequency: 'monthly' | 'annual' = 'annual'): string {
  const opened = new Date(openedDate + 'T12:00:00');
  const today = new Date(); today.setHours(12, 0, 0, 0);
  if (feeFrequency === 'monthly') {
    const day = opened.getDate();
    let next = new Date(today.getFullYear(), today.getMonth(), day);
    if (next <= today) next = new Date(today.getFullYear(), today.getMonth() + 1, day);
    return next.toISOString().split('T')[0];
  }
  let next = new Date(opened.getFullYear() + 1, opened.getMonth(), opened.getDate());
  while (next <= today) next = new Date(next.getFullYear() + 1, next.getMonth(), next.getDate());
  return next.toISOString().split('T')[0];
}

export default function Dashboard({ data, onNavigate, onStartQuiz }: Props) {
  const activeCards = data.cards.filter(c => (c.status ?? 'active') === 'active');
  const settings = data.settings;

  const totalFees = activeCards.reduce((sum, uc) => {
    const t = getCardById(uc.cardId);
    return sum + (t?.annualFee ?? 0);
  }, 0);

  const totalRecovered = activeCards.reduce((sum, uc) => {
    const t = getCardById(uc.cardId);
    if (!t) return sum;
    return sum + t.benefits.reduce((s, b) => {
      const used = uc.benefitUsage[b.id] ?? 0;
      const val = effectiveBenefitValue(b, settings);
      return s + (b.frequency === 'annual' ? (used > 0 ? val : 0) : used * val);
    }, 0);
  }, 0);

  const totalPoints = data.pointsBalances.reduce((sum, pb) => {
    const prog = POINTS_PROGRAMS.find(p => p.id === pb.programId);
    const cpp = pb.cppOverride ?? prog?.defaultCpp ?? 1;
    return sum + (pb.balance * cpp) / 100;
  }, 0);

  const totalCreditLimit = activeCards.reduce((sum, uc) => sum + (uc.creditLimit ?? 0), 0);
  const overallRecovery = totalFees > 0 ? Math.round((totalRecovered / totalFees) * 100) : 0;

  const monthlySpend = settings.monthlySpend ?? {};
  const portfolioEarn = SPEND_CATS.reduce((sum, cat) => {
    const monthly = (monthlySpend[cat.id as keyof MonthlySpendProfile] ?? 0) as number;
    if (!monthly) return sum;
    let bestCpd = 0;
    for (const uc of activeCards) {
      const t = getCardById(uc.cardId);
      if (!t?.earningRates?.length) continue;
      const { cpd } = bestRateForCat(t.earningRates, cat.keywords, POINTS_PROGRAMS);
      if (cpd > bestCpd) bestCpd = cpd;
    }
    return sum + bestCpd * monthly * 12;
  }, 0);
  const hasSpendProfile = Object.values(monthlySpend).some(v => (v ?? 0) > 0);

  const upcomingRenewals = activeCards
    .map(uc => {
      const template = getCardById(uc.cardId);
      if (!template) return null;
      const feeFreq = template.feeFrequency ?? 'annual';
      const renewal = uc.renewalDate ?? (uc.openedDate ? calcNextRenewal(uc.openedDate, feeFreq) : null);
      if (!renewal) return null;
      const days = Math.ceil((new Date(renewal).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return { uc, template, days, renewal };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null && x.days <= 90 && x.days >= -7)
    .sort((a, b) => a.days - b.days)
    .slice(0, 3);

  const welcomeBonusCards = activeCards
    .filter(uc => {
      const wb = uc.welcomeBonus;
      if (!wb) return false;
      const spendTier = wb.tiers.find(t => t.type === 'spend');
      return spendTier && !spendTier.earned && (spendTier.spendRequired ?? 0) > 0 && wb.spendSoFar < (spendTier.spendRequired ?? 0);
    })
    .map(uc => ({ uc, template: getCardById(uc.cardId) }))
    .filter(x => x.template);

  const upcomingResets: {
    cardName: string; cardId: string; benefitName: string; daysUntil: number; value: number;
  }[] = [];
  for (const uc of activeCards) {
    const t = getCardById(uc.cardId);
    if (!t || !uc.openedDate) continue;
    for (const b of t.benefits) {
      if (b.frequency === 'monthly') continue;
      const val = effectiveBenefitValue(b, settings);
      if (val === 0) continue;
      const used = uc.benefitUsage[b.id] ?? 0;
      const maxUses = b.maxUses ?? 1;
      if (used >= maxUses) continue;
      const resetDate = b.resetDate === 'calendar-year'
        ? nextCalendarReset()
        : nextCardmemberReset(uc.openedDate);
      const daysUntil = Math.ceil((new Date(resetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntil >= 0 && daysUntil <= 60) {
        upcomingResets.push({ cardName: t.name, cardId: uc.cardId, benefitName: b.name, daysUntil, value: val });
      }
    }
  }
  upcomingResets.sort((a, b) => a.daysUntil - b.daysUntil);

  const isFirstVisit = data.cards.length === 0 && data.pointsBalances.length === 0;

  if (isFirstVisit) {
    return (
      <div className="space-y-8 py-8">
        <div className="text-center">
          <WalletMark className="w-12 h-12 mx-auto mb-4 text-brass" />
          <h1 className="text-2xl font-bold text-ink">Canadian Credit Card Tracker</h1>
          <p className="text-ink-soft mt-2 max-w-md mx-auto text-sm">
            Track your points balances, card benefits, renewal dates, and annual fee recovery — all in your browser.
          </p>
          <p className="text-xs text-ink-soft mt-2">
            No account needed — your data saves automatically on this device, completely free.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface border border-line rounded-xl p-5 text-center">
            <CardsIcon className="w-7 h-7 mx-auto mb-2 text-brass" />
            <p className="font-semibold text-ink">Add Cards</p>
            <p className="text-xs text-ink-soft mt-1">Track Canadian credit cards and their benefits</p>
          </div>
          <div className="bg-surface border border-line rounded-xl p-5 text-center">
            <PointsIcon className="w-7 h-7 mx-auto mb-2 text-brass" />
            <p className="font-semibold text-ink">Track Points</p>
            <p className="text-xs text-ink-soft mt-1">Monitor loyalty programs with CAD valuations</p>
          </div>
          <div className="bg-surface border border-line rounded-xl p-5 text-center">
            <OptimizeIcon className="w-7 h-7 mx-auto mb-2 text-brass" />
            <p className="font-semibold text-ink">Optimize Spend</p>
            <p className="text-xs text-ink-soft mt-1">Find the best card for each spend category</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => onNavigate('cards')} className="bg-brass text-ink px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity">
            Add Your First Card →
          </button>
          <button onClick={() => onNavigate('points')} className="border border-line text-ink px-6 py-3 rounded-xl font-medium hover:bg-paper transition-colors">
            Track Points First →
          </button>
        </div>
        {onStartQuiz && (
          <div className="text-center">
            <p className="text-xs text-ink-soft mb-2">Not sure which cards to get?</p>
            <button
              onClick={onStartQuiz}
              className="text-sm text-brass font-medium underline underline-offset-2"
            >
              Get personalized card recommendations →
            </button>
          </div>
        )}
      </div>
    );
  }

  // Card perks: dollar credits only (lounge and status have their own tiles)
  const CREDIT_CATS = new Set(['travel-credit', 'dining', 'delivery', 'fuel', 'subscription', 'nexus', 'free-night', 'companion']);
  const cardPerks = activeCards.flatMap(uc => {
    const t = getCardById(uc.cardId);
    if (!t) return [];
    return t.benefits
      .filter(b => CREDIT_CATS.has(b.category))
      .map(b => {
        const val = effectiveBenefitValue(b, settings);
        if (val === 0) return null;
        const used = uc.benefitUsage[b.id] ?? 0;
        const effectiveMax = b.maxUses ?? (b.frequency !== 'monthly' ? 1 : null);
        const isMonthly = b.frequency === 'monthly';
        const isUsed = !isMonthly && effectiveMax !== null && used >= effectiveMax;
        return { cardId: uc.cardId, cardName: t.name, issuer: t.issuer, b, used, val, isUsed, isMonthly };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }).sort((a, b) => {
    if (a.isUsed !== b.isUsed) return a.isUsed ? 1 : -1;
    return b.val - a.val;
  });

  // Status perks — hotel status, elite status, etc. (shown beside Lounge)
  const statusPerks = activeCards.flatMap(uc => {
    const t = getCardById(uc.cardId);
    if (!t) return [];
    return t.benefits
      .filter(b => b.category === 'status')
      .map(b => ({ cardId: uc.cardId, cardName: t.name, issuer: t.issuer, b }));
  });

  // Lounge data
  const loungeEntries = activeCards.flatMap(uc => {
    const t = getCardById(uc.cardId);
    if (!t) return [];
    return t.benefits
      .filter(b => b.category === 'lounge')
      .map(b => {
        const used = uc.benefitUsage[b.id] ?? 0;
        const total = b.maxUses ?? null;
        const remaining = total !== null ? Math.max(0, total - used) : null;
        const isPaid = b.note?.includes('NOT complimentary') || b.note?.includes('cost');
        return { cardId: uc.cardId, cardName: t.name, issuer: t.issuer, b, used, total, remaining, isPaid };
      });
  }).sort((a, b) => {
    const score = (e: typeof a) => e.isPaid ? 1 : e.remaining === null ? 3 : e.remaining > 0 ? 2 : 0;
    return score(b) - score(a);
  });

  return (
    <div className="space-y-4">
      {/* Hero stats */}
      <div className="bg-surface border border-brass/40 rounded-2xl p-6 text-ink">
        <p className="text-ink-soft text-sm">{new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div>
            <p className="text-ink-soft text-xs uppercase tracking-wide">Points Value</p>
            <p className="font-mono font-bold text-xl mt-1">${totalPoints.toLocaleString('en-CA', { maximumFractionDigits: 0 })}</p>
            <p className="text-ink-soft text-xs">in loyalty programs</p>
          </div>
          <div>
            <p className="text-ink-soft text-xs uppercase tracking-wide">
              <GlossaryTerm term="Benefit Recovery">Benefit Recovery</GlossaryTerm>
            </p>
            <p className="font-mono font-bold text-xl mt-1">{overallRecovery}%</p>
            <p className="text-ink-soft text-xs">${totalRecovered.toFixed(0)} recovered of ${totalFees.toFixed(0)} in fees</p>
          </div>
          <div>
            <p className="text-ink-soft text-xs uppercase tracking-wide">Active Cards</p>
            <p className="font-mono font-bold text-xl mt-1">{activeCards.length}</p>
            {data.cards.length > activeCards.length && (
              <p className="text-ink-soft text-xs">{data.cards.length - activeCards.length} inactive</p>
            )}
          </div>
          <div>
            <p className="text-ink-soft text-xs uppercase tracking-wide">Total Credit</p>
            {totalCreditLimit > 0 ? (
              <>
                <p className="font-mono font-bold text-xl mt-1">${totalCreditLimit.toLocaleString()}</p>
                <p className="text-ink-soft text-xs">across {activeCards.filter(c => c.creditLimit).length} cards</p>
              </>
            ) : (
              <p className="font-mono text-ink-soft text-sm mt-1">—</p>
            )}
          </div>
          {hasSpendProfile && (
            <div className="col-span-2 sm:col-span-4 border-t border-line pt-4 mt-2">
              <p className="text-ink-soft text-xs uppercase tracking-wide">Est. Annual Earn</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="font-mono font-bold text-2xl text-forest">${Math.round(portfolioEarn).toLocaleString()}</p>
                <p className="text-ink-soft text-xs">using the best card per category</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Use Before Reset — amber alert tile, full width */}
        {upcomingResets.length > 0 && (
          <div className="lg:col-span-2 bg-amber-bg border border-amber/30 rounded-2xl p-5">
            <h3 className="font-semibold text-ink mb-4 flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-amber" />
              Use Before Reset
              <span className="ml-auto text-xs font-normal text-amber">next 60 days</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {upcomingResets.slice(0, 6).map((r, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate('cards', r.cardId)}
                  className="text-left flex items-center gap-3 px-4 py-3 bg-paper/60 rounded-xl hover:bg-paper transition-colors"
                >
                  <span className={`text-xl font-mono font-bold w-12 shrink-0 ${r.daysUntil <= 14 ? 'text-rust' : 'text-amber'}`}>
                    {r.daysUntil}d
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{r.benefitName}</p>
                    <p className="text-xs text-ink-soft truncate">{r.cardName}</p>
                  </div>
                  <span className="font-mono font-semibold text-forest text-sm shrink-0">${r.value}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Welcome Bonus Progress — brass-tinted, full width */}
        {welcomeBonusCards.length > 0 && (
          <div className="lg:col-span-2 bg-brass-soft/25 border border-brass/20 rounded-2xl p-5">
            <h3 className="font-semibold text-ink mb-4 flex items-center gap-2">
              <OptimizeIcon className="w-4 h-4 text-brass" />
              Welcome Bonus Progress
            </h3>
            <div className="space-y-5">
              {welcomeBonusCards.map(({ uc, template }) => {
                const wb = uc.welcomeBonus!;
                const spendTier = wb.tiers.find(t => t.type === 'spend')!;
                const spendTarget = spendTier.spendRequired ?? 0;
                const pct = spendTarget > 0 ? Math.min(100, Math.round((wb.spendSoFar / spendTarget) * 100)) : 0;
                const remaining = spendTarget - wb.spendSoFar;
                const deadlineDays = wb.deadline
                  ? Math.ceil((new Date(wb.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  : null;
                return (
                  <button key={uc.cardId} onClick={() => onNavigate('cards', uc.cardId)} className="w-full text-left">
                    <div className="flex items-center gap-3 mb-2.5">
                      <CardChip issuer={template!.issuer} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-semibold text-sm text-ink truncate">{template!.name}</span>
                          <span className="text-xs text-ink-soft shrink-0 tabular-nums">
                            ${wb.spendSoFar.toLocaleString()} / ${spendTarget.toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-line rounded-full h-2 mb-1.5">
                          <div
                            className={`h-2 rounded-full transition-all ${pct >= 100 ? 'bg-forest' : 'bg-brass'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-brass font-medium">
                            {spendTier.label.replace(/\b(\d{4,})\b/g, n => Number(n).toLocaleString())}
                          </span>
                          <span className={deadlineDays !== null && deadlineDays < 30 ? 'text-rust font-semibold' : 'text-ink-soft'}>
                            {pct < 100 && `$${remaining.toLocaleString()} to go`}
                            {deadlineDays !== null && ` · ${deadlineDays}d left`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Lounge Access — half width, Status sits beside it */}
        {loungeEntries.length > 0 ? (
          <div className="bg-forest-bg border border-forest/20 rounded-2xl p-5">
            <h3 className="font-semibold text-ink mb-4 flex items-center gap-2">
              <LoungeIcon className="w-4 h-4 text-forest" />
              Lounge Access
              <span className="ml-auto text-xs text-forest font-medium">
                {loungeEntries.filter(e => !e.isPaid && (e.remaining === null || e.remaining > 0)).length} active
              </span>
            </h3>
            <div className="space-y-3">
              {loungeEntries.map(({ cardId, cardName, issuer, b, used, total, remaining, isPaid }) => {
                const exhausted = remaining !== null && remaining <= 0;
                return (
                  <button
                    key={b.id}
                    onClick={() => onNavigate('cards', cardId)}
                    className={`w-full text-left flex items-center gap-3 hover:opacity-80 transition-opacity ${exhausted ? 'opacity-50' : ''}`}
                  >
                    <CardChip issuer={issuer} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{b.name}</p>
                      <p className="text-xs text-ink-soft truncate">{cardName}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      {isPaid ? (
                        <span className="text-xs font-medium text-amber bg-amber-bg px-2 py-0.5 rounded-full">Paid</span>
                      ) : total === null ? (
                        <span className="text-xs font-medium text-forest bg-forest-bg px-2 py-0.5 rounded-full border border-forest/20">Unlimited</span>
                      ) : exhausted ? (
                        <span className="text-xs font-medium text-ink-soft bg-line px-2 py-0.5 rounded-full">Used up</span>
                      ) : (
                        <div className="text-right">
                          <p className="text-2xl font-bold text-forest font-mono leading-none">{remaining}</p>
                          <p className="text-xs text-ink-soft">{used}/{total} used</p>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-surface border border-line rounded-2xl p-5">
            <h3 className="font-semibold text-ink mb-2 flex items-center gap-2">
              <LoungeIcon className="w-4 h-4 text-ink-soft" />
              Lounge Access
            </h3>
            <p className="text-sm text-ink-soft">None of your current cards include lounge access.</p>
          </div>
        )}

        {/* Status — beside Lounge */}
        {statusPerks.length > 0 ? (
          <div className="bg-brass-soft/20 border border-brass/20 rounded-2xl p-5">
            <h3 className="font-semibold text-ink mb-4 flex items-center gap-2">
              <span className="w-4 h-4 text-brass flex items-center justify-center text-xs font-bold">★</span>
              Status & Elite
            </h3>
            <div className="space-y-3">
              {statusPerks.map(({ cardId, cardName, issuer, b }) => (
                <button
                  key={`${cardId}-${b.id}`}
                  onClick={() => onNavigate('cards', cardId)}
                  className="w-full text-left flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <CardChip issuer={issuer} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{b.name}</p>
                    <p className="text-xs text-ink-soft truncate">{cardName}</p>
                  </div>
                  <span className="text-[10px] font-semibold bg-brass-soft/40 text-brass px-1.5 py-0.5 rounded-full shrink-0">Active</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-surface border border-line rounded-2xl p-5">
            <h3 className="font-semibold text-ink mb-2 flex items-center gap-2">
              <span className="text-ink-soft text-xs font-bold">★</span>
              Status & Elite
            </h3>
            <p className="text-sm text-ink-soft">None of your current cards include status benefits.</p>
          </div>
        )}

        {/* Perks — dollar credits + status perks across all cards */}
        {cardPerks.length > 0 && (
          <div className="lg:col-span-2 bg-surface border border-line rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink">Perks</h3>
              <span className="text-xs text-ink-soft">
                {cardPerks.filter(c => !c.isUsed).length} active
                {cardPerks.filter(c => c.isUsed).length > 0 && ` · ${cardPerks.filter(c => c.isUsed).length} used`}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
              {cardPerks.map(({ cardId, cardName, issuer, b, val, isUsed, isMonthly }) => (
                <button
                  key={`${cardId}-${b.id}`}
                  onClick={() => onNavigate('cards', cardId)}
                  className={`text-left flex items-center gap-3 px-2 py-2 -mx-2 rounded-xl hover:bg-paper transition-colors ${isUsed ? 'opacity-40' : ''}`}
                >
                  <CardChip issuer={issuer} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{b.name}</p>
                    <p className="text-xs text-ink-soft truncate">{cardName}</p>
                  </div>
                  <div className="text-right shrink-0 mr-2">
                    <p className={`text-sm font-semibold tabular-nums ${isUsed ? 'text-ink-soft' : 'text-forest'}`}>
                      ${val.toFixed(0)}
                    </p>
                    <p className="text-xs text-ink-soft">
                      {isMonthly ? '/mo' : b.frequency === 'per-use' ? 'once' : '/yr'}
                    </p>
                  </div>
                  {isUsed ? (
                    <span className="text-[10px] font-semibold bg-line text-ink-soft px-1.5 py-0.5 rounded-full shrink-0 w-14 text-center">Used</span>
                  ) : isMonthly ? (
                    <span className="text-[10px] font-semibold bg-brass-soft/40 text-brass px-1.5 py-0.5 rounded-full shrink-0 w-14 text-center">Monthly</span>
                  ) : (
                    <span className="text-[10px] font-semibold bg-forest-bg text-forest px-1.5 py-0.5 rounded-full shrink-0 w-14 text-center">Available</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Points Summary — brass tint */}
        <div className="bg-brass-soft/20 border border-brass/20 rounded-2xl p-5">
          <h3 className="font-semibold text-ink mb-1 flex items-center gap-2">
            <PointsIcon className="w-4 h-4 text-brass" />
            Points Summary
          </h3>
          {data.pointsBalances.length === 0 ? (
            <button onClick={() => onNavigate('points')} className="text-sm text-brass mt-4 block">
              + Add loyalty programs →
            </button>
          ) : (
            <>
              <p className="font-mono font-bold text-3xl text-forest mt-2">
                ${totalPoints.toLocaleString('en-CA', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-ink-soft mb-4">total loyalty value</p>
              <div className="space-y-2.5">
                {data.pointsBalances.slice(0, 5).map(pb => {
                  const prog = POINTS_PROGRAMS.find(p => p.id === pb.programId);
                  const cpp = pb.cppOverride ?? prog?.defaultCpp ?? 1;
                  const value = (pb.balance * cpp) / 100;
                  return (
                    <div key={pb.programId} className="flex items-center gap-2.5 text-sm">
                      <div className="w-1 h-4 rounded-full bg-brass shrink-0" />
                      <span className="text-ink flex-1 truncate">{prog?.name}</span>
                      <span className="font-mono text-ink-soft text-xs tabular-nums">{pb.balance.toLocaleString()}</span>
                      <span className="font-mono text-forest font-semibold shrink-0 tabular-nums">${value.toFixed(0)}</span>
                    </div>
                  );
                })}
              </div>
              {data.pointsBalances.length > 5 && (
                <button onClick={() => onNavigate('points')} className="text-xs text-brass mt-3 block">
                  +{data.pointsBalances.length - 5} more →
                </button>
              )}
            </>
          )}
        </div>

        {/* Upcoming Renewals */}
        {upcomingRenewals.length > 0 && (
          <div className="bg-surface border border-line rounded-2xl p-5">
            <h3 className="font-semibold text-ink mb-4">Upcoming Renewals</h3>
            <div className="space-y-3">
              {upcomingRenewals.map(({ uc, template, days }) => {
                const isUrgent = days < 30;
                const isSoon = days < 60;
                return (
                  <button
                    key={uc.cardId}
                    onClick={() => onNavigate('cards', uc.cardId)}
                    className="w-full text-left flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <CardChip issuer={template?.issuer ?? ''} />
                    <span className="flex-1 text-sm text-ink truncate min-w-0">{template?.name}</span>
                    <span className={`text-2xl font-mono font-bold shrink-0 ${
                      isUrgent ? 'text-rust' : isSoon ? 'text-amber' : 'text-ink-soft'
                    }`}>
                      {days}d
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Fee Recovery — full width, ring progress per card */}
        <div className="lg:col-span-2 bg-surface border border-line rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink">Fee Recovery by Card</h3>
            <span className="text-xs text-ink-soft tabular-nums">
              ${totalRecovered.toFixed(0)} of ${totalFees.toFixed(0)} recovered
            </span>
          </div>
          <div className="space-y-3">
            {activeCards.map(uc => {
              const t = getCardById(uc.cardId);
              if (!t) return null;
              const recovered = t.benefits.reduce((s, b) => {
                const used = uc.benefitUsage[b.id] ?? 0;
                const val = effectiveBenefitValue(b, settings);
                return s + (b.frequency === 'annual' ? (used > 0 ? val : 0) : used * val);
              }, 0);
              const pct = t.annualFee > 0 ? Math.round((recovered / t.annualFee) * 100) : 100;
              const pctColor = pct >= 100 ? 'text-forest' : pct >= 50 ? 'text-amber' : 'text-rust';
              return (
                <button
                  key={uc.cardId}
                  onClick={() => onNavigate('cards', uc.cardId)}
                  className="w-full text-left flex items-center gap-3 hover:bg-paper rounded-xl px-2 py-1 -mx-2 transition-colors"
                >
                  <CardChip issuer={t.issuer} />
                  <span className="flex-1 text-sm text-ink truncate">{t.name}</span>
                  <div className="relative shrink-0">
                    <RingProgress pct={pct} />
                    <span className={`absolute inset-0 flex items-center justify-center text-[9px] font-bold ${pctColor}`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="w-20 text-right shrink-0">
                    <p className={`text-sm font-bold ${pctColor}`}>${recovered.toFixed(0)}</p>
                    <p className="text-xs text-ink-soft">of ${t.annualFee.toFixed(0)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expiry warnings — full width alert */}
      {data.cards.some(uc => { const t = getCardById(uc.cardId); return t?.benefits.some(b => b.expiryWarning); }) && (
        <div className="bg-rust-bg border border-rust/30 rounded-2xl p-4">
          <p className="font-semibold text-rust text-sm flex items-center gap-1.5 mb-1">
            <AlertIcon className="w-3.5 h-3.5" /> Upcoming Changes
          </p>
          {data.cards.flatMap(uc => {
            const t = getCardById(uc.cardId);
            return (t?.benefits.filter(b => b.expiryWarning) ?? []).map(b => (
              <p key={b.id} className="text-xs text-rust mt-1">
                <strong>{t?.name}</strong>: {b.expiryWarning}
              </p>
            ));
          })}
        </div>
      )}

      <FeedbackWidget />
    </div>
  );
}
