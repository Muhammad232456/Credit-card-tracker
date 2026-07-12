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

  // Estimated annual earn across all active cards (best card per category × spend profile)
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

  // Upcoming renewals
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

  // Welcome bonus progress — show cards with an incomplete spend tier
  const welcomeBonusCards = activeCards
    .filter(uc => {
      const wb = uc.welcomeBonus;
      if (!wb) return false;
      const spendTier = wb.tiers.find(t => t.type === 'spend');
      return spendTier && !spendTier.earned && (spendTier.spendRequired ?? 0) > 0 && wb.spendSoFar < (spendTier.spendRequired ?? 0);
    })
    .map(uc => ({ uc, template: getCardById(uc.cardId) }))
    .filter(x => x.template);

  // Benefit reset calendar — unused benefits resetting in next 60 days
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
              className="text-sm text-brass hover:text-brass font-medium underline underline-offset-2"
            >
              Get personalized card recommendations →
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8 items-start">
      {/* Benefit reset calendar */}
      {upcomingResets.length > 0 && (
        <div>
          <h3 className="font-semibold text-ink mb-3 flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-amber" /> Use Before Reset
            <span className="text-xs font-normal text-amber bg-amber-bg px-2 py-0.5 rounded-full">next 60 days</span>
          </h3>
          <div className="space-y-1">
            {upcomingResets.slice(0, 5).map((r, i) => (
              <button
                key={i}
                onClick={() => onNavigate('cards', r.cardId)}
                className="w-full text-left flex items-center gap-3 py-2 border-l-2 pl-3 hover:bg-paper transition-colors"
                style={{ borderColor: r.daysUntil <= 14 ? 'var(--color-rust)' : 'var(--color-amber)' }}
              >
                <span className={`text-xs font-bold shrink-0 ${r.daysUntil <= 14 ? 'text-rust' : 'text-amber'}`}>{r.daysUntil}d</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{r.benefitName}</p>
                  <p className="text-xs text-ink-soft">{r.cardName}</p>
                </div>
                <span className="text-sm font-mono text-forest font-semibold shrink-0">${r.value}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Welcome bonus progress */}
      {welcomeBonusCards.length > 0 && (
        <div>
          <h3 className="font-semibold text-ink mb-3 flex items-center gap-2"><OptimizeIcon className="w-4 h-4 text-brass" /> Welcome Bonus Progress</h3>
          <div className="space-y-3">
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
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-ink truncate flex-1 mr-2">{template!.name}</span>
                    <span className="text-xs text-ink-soft shrink-0">${wb.spendSoFar.toLocaleString()} / ${spendTarget.toLocaleString()}</span>
                  </div>
                  <div className="bg-line rounded-full h-2 mb-1">
                    <div className={`h-2 rounded-full transition-all ${pct >= 100 ? 'bg-forest' : 'bg-brass'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-ink-soft">
                    <span className="text-brass font-medium">{spendTier.label.replace(/\b(\d{4,})\b/g, n => Number(n).toLocaleString())}</span>
                    <span className={deadlineDays !== null && deadlineDays < 30 ? 'text-rust font-medium' : ''}>
                      {pct < 100 && `$${remaining.toLocaleString()} to go`}
                      {deadlineDays !== null && ` · ${deadlineDays}d left`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Lounge Access */}
      {(() => {
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
              return { cardId: uc.cardId, cardName: t.name, b, used, total, remaining, isPaid };
            });
        });
        if (loungeEntries.length === 0) return (
          <div>
            <h3 className="font-semibold text-ink mb-2 flex items-center gap-2"><LoungeIcon className="w-4 h-4 text-brass" /> Lounge Access</h3>
            <p className="text-sm text-ink-soft">None of your current cards include lounge access.</p>
          </div>
        );

        // Sort: free visits with remaining > 0 first, then unlimited, then paid, then exhausted
        loungeEntries.sort((a, b) => {
          const score = (e: typeof a) =>
            e.isPaid ? 1 : e.remaining === null ? 2 : e.remaining > 0 ? 3 : 0;
          return score(b) - score(a);
        });

        return (
          <div>
            <h3 className="font-semibold text-ink mb-3 flex items-center gap-2">
              <LoungeIcon className="w-4 h-4 text-brass" /> Lounge Access
              <span className="text-xs font-normal text-ink-soft">
                {loungeEntries.filter(e => !e.isPaid && (e.remaining === null || e.remaining > 0)).length} active
              </span>
            </h3>
            <div className="space-y-2">
              {loungeEntries.map(({ cardId, cardName, b, used, total, remaining, isPaid }) => {
                const exhausted = remaining !== null && remaining <= 0;
                return (
                  <button
                    key={b.id}
                    onClick={() => onNavigate('cards', cardId)}
                    className={`w-full text-left flex items-start justify-between gap-3 py-2.5 border-b border-line last:border-0 hover:bg-paper transition-colors ${exhausted ? 'opacity-50' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{b.name}</p>
                      <p className="text-xs text-ink-soft mt-0.5 truncate">{cardName}</p>
                      {b.expiryWarning && (
                        <p className="text-xs text-amber mt-1 leading-snug">{b.expiryWarning}</p>
                      )}
                      {isPaid && b.note && (
                        <p className="text-xs text-amber mt-1">{b.note}</p>
                      )}
                      {!isPaid && b.note && !b.expiryWarning && (
                        <p className="text-xs text-ink-soft mt-0.5">{b.note}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      {isPaid ? (
                        <span className="text-xs font-medium text-amber bg-amber-bg px-2 py-1 rounded-full">Paid</span>
                      ) : total === null ? (
                        <span className="text-xs font-medium text-forest bg-forest-bg px-2 py-1 rounded-full">Unlimited</span>
                      ) : exhausted ? (
                        <span className="text-xs font-medium text-ink-soft bg-line px-2 py-1 rounded-full">Used up</span>
                      ) : (
                        <div className="text-right">
                          <p className="text-lg font-bold text-forest font-mono leading-none">{remaining}</p>
                          <p className="text-xs text-ink-soft mt-0.5">{used}/{total} used</p>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Upcoming renewals */}
      {upcomingRenewals.length > 0 && (
        <div>
          <h3 className="font-semibold text-ink mb-3">Upcoming Renewals</h3>
          <div className="space-y-1">
            {upcomingRenewals.map(({ uc, template, days }) => (
              <button
                key={uc.cardId}
                onClick={() => onNavigate('cards', uc.cardId)}
                className="w-full text-left flex items-center justify-between py-2 border-l-2 pl-3 hover:bg-paper transition-colors"
                style={{ borderColor: days < 30 ? 'var(--color-rust)' : days < 60 ? 'var(--color-amber)' : 'var(--color-line)' }}
              >
                <span className="text-sm font-medium text-ink">{template?.name}</span>
                <span className={`text-sm font-mono font-bold ${days < 30 ? 'text-rust' : days < 60 ? 'text-amber' : 'text-forest'}`}>{days}d</span>
              </button>
            ))}
          </div>
        </div>
      )}

        {/* Fee recovery */}
        <div>
          <h3 className="font-semibold text-ink mb-3">Fee Recovery by Card</h3>
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
              return (
                <div key={uc.cardId}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-ink truncate flex-1 mr-2">{t.name}</span>
                    <span className={`font-mono font-semibold shrink-0 ${pct >= 100 ? 'text-forest' : pct >= 50 ? 'text-amber' : 'text-rust'}`}>{pct}%</span>
                  </div>
                  <div className="bg-line rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${pct >= 100 ? 'bg-forest' : pct >= 50 ? 'bg-amber' : 'bg-rust'}`}
                      style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Points summary */}
        <div>
          <h3 className="font-semibold text-ink mb-3">Points Summary</h3>
          {data.pointsBalances.length === 0 ? (
            <button onClick={() => onNavigate('points')} className="w-full text-center text-sm text-brass hover:text-brass py-4">
              + Add loyalty programs →
            </button>
          ) : (
            <div className="space-y-2">
              {data.pointsBalances.slice(0, 5).map(pb => {
                const prog = POINTS_PROGRAMS.find(p => p.id === pb.programId);
                const cpp = pb.cppOverride ?? prog?.defaultCpp ?? 1;
                const value = (pb.balance * cpp) / 100;
                return (
                  <div key={pb.programId} className="flex items-center justify-between text-sm">
                    <span className="text-ink truncate flex-1 mr-2">{prog?.name}</span>
                    <span className="font-mono text-ink-soft mr-2">{pb.balance.toLocaleString()}</span>
                    <span className="font-mono text-forest font-semibold shrink-0">${value.toFixed(0)}</span>
                  </div>
                );
              })}
              {data.pointsBalances.length > 5 && (
                <button onClick={() => onNavigate('points')} className="text-xs text-brass hover:text-brass">
                  +{data.pointsBalances.length - 5} more →
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expiry warnings */}
      {data.cards.some(uc => { const t = getCardById(uc.cardId); return t?.benefits.some(b => b.expiryWarning); }) && (
        <div className="bg-rust-bg border border-rust rounded-xl p-4">
          <p className="font-semibold text-rust text-sm flex items-center gap-1.5"><AlertIcon className="w-3.5 h-3.5" /> Upcoming Changes</p>
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
