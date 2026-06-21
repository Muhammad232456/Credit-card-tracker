import { getCardById } from '../data/cards';
import { POINTS_PROGRAMS } from '../data/programs';
import type { UserData } from '../types';
import { effectiveBenefitValue, nextCalendarReset, nextCardmemberReset } from '../utils';

interface Props {
  data: UserData;
  onNavigate: (tab: string, cardId?: string) => void;
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

export default function Dashboard({ data, onNavigate }: Props) {
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

  // Welcome bonus progress
  const welcomeBonusCards = activeCards
    .filter(uc => uc.welcomeBonus && uc.welcomeBonus.spendSoFar < uc.welcomeBonus.spendTarget)
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
          <p className="text-5xl mb-4">🍁</p>
          <h1 className="text-2xl font-bold text-gray-900">Canadian Credit Card Tracker</h1>
          <p className="text-gray-500 mt-2 max-w-md mx-auto text-sm">
            Track your points balances, card benefits, renewal dates, and annual fee recovery — all in your browser.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
            <p className="text-3xl mb-2">💳</p>
            <p className="font-semibold text-gray-800">Add Cards</p>
            <p className="text-xs text-gray-500 mt-1">Track Canadian credit cards and their benefits</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
            <p className="text-3xl mb-2">✈️</p>
            <p className="font-semibold text-gray-800">Track Points</p>
            <p className="text-xs text-gray-500 mt-1">Monitor loyalty programs with CAD valuations</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
            <p className="text-3xl mb-2">🎯</p>
            <p className="font-semibold text-gray-800">Optimize Spend</p>
            <p className="text-xs text-gray-500 mt-1">Find the best card for each spend category</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => onNavigate('cards')} className="bg-slate-800 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-700 transition-colors">
            Add Your First Card →
          </button>
          <button onClick={() => onNavigate('points')} className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
            Track Points First →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero stats */}
      <div className="bg-slate-800 rounded-2xl p-6 text-white">
        <p className="text-slate-400 text-sm">{new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wide">Points Value</p>
            <p className="font-mono font-bold text-xl mt-1">${totalPoints.toLocaleString('en-CA', { maximumFractionDigits: 0 })}</p>
            <p className="text-slate-500 text-xs">in loyalty programs</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wide">Benefit Recovery</p>
            <p className="font-mono font-bold text-xl mt-1">{overallRecovery}%</p>
            <p className="text-slate-500 text-xs">${totalRecovered.toFixed(0)} recovered of ${totalFees.toFixed(0)} in fees</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wide">Active Cards</p>
            <p className="font-mono font-bold text-xl mt-1">{activeCards.length}</p>
            {data.cards.length > activeCards.length && (
              <p className="text-slate-500 text-xs">{data.cards.length - activeCards.length} inactive</p>
            )}
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wide">Total Credit</p>
            {totalCreditLimit > 0 ? (
              <>
                <p className="font-mono font-bold text-xl mt-1">${totalCreditLimit.toLocaleString()}</p>
                <p className="text-slate-500 text-xs">across {activeCards.filter(c => c.creditLimit).length} cards</p>
              </>
            ) : (
              <p className="font-mono text-slate-500 text-sm mt-1">—</p>
            )}
          </div>
        </div>
      </div>

      {/* Benefit reset calendar */}
      {upcomingResets.length > 0 && (
        <div className="bg-white border border-orange-200 rounded-xl p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            ⏰ Use Before Reset
            <span className="text-xs font-normal text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">next 60 days</span>
          </h3>
          <div className="space-y-1">
            {upcomingResets.slice(0, 5).map((r, i) => (
              <button
                key={i}
                onClick={() => onNavigate('cards', r.cardId)}
                className="w-full text-left flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 transition-colors"
              >
                <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${
                  r.daysUntil <= 14 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                }`}>{r.daysUntil}d</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{r.benefitName}</p>
                  <p className="text-xs text-gray-500">{r.cardName}</p>
                </div>
                <span className="text-sm font-mono text-emerald-700 font-semibold shrink-0">${r.value}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Welcome bonus progress */}
      {welcomeBonusCards.length > 0 && (
        <div className="bg-white border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-gray-800 mb-3">🎯 Welcome Bonus Progress</h3>
          <div className="space-y-3">
            {welcomeBonusCards.map(({ uc, template }) => {
              const wb = uc.welcomeBonus!;
              const pct = Math.min(100, Math.round((wb.spendSoFar / wb.spendTarget) * 100));
              const remaining = wb.spendTarget - wb.spendSoFar;
              const deadlineDays = wb.deadline
                ? Math.ceil((new Date(wb.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null;
              return (
                <button key={uc.cardId} onClick={() => onNavigate('cards', uc.cardId)} className="w-full text-left">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-800 truncate flex-1 mr-2">{template!.name}</span>
                    <span className="text-xs text-gray-500 shrink-0">${wb.spendSoFar.toLocaleString()} / ${wb.spendTarget.toLocaleString()}</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2 mb-1">
                    <div className={`h-2 rounded-full transition-all ${pct >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="text-blue-600 font-medium">{wb.bonusDescription}</span>
                    <span className={deadlineDays !== null && deadlineDays < 30 ? 'text-red-600 font-medium' : ''}>
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

      {/* Upcoming renewals */}
      {upcomingRenewals.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Upcoming Renewals</h3>
          <div className="space-y-2">
            {upcomingRenewals.map(({ uc, template, days }) => (
              <button
                key={uc.cardId}
                onClick={() => onNavigate('cards', uc.cardId)}
                className={`w-full text-left flex items-center justify-between p-3 rounded-lg border ${
                  days < 30 ? 'border-red-200 bg-red-50' : days < 60 ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <span className="text-sm font-medium text-gray-800">{template?.name}</span>
                <span className={`text-sm font-mono font-bold ${days < 30 ? 'text-red-700' : days < 60 ? 'text-amber-700' : 'text-green-700'}`}>{days}d</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Fee recovery */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Fee Recovery by Card</h3>
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
                    <span className="text-gray-700 truncate flex-1 mr-2">{t.name}</span>
                    <span className={`font-mono font-semibold shrink-0 ${pct >= 100 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{pct}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          {settings.annualFxSpend ? (
            <p className="text-xs text-blue-600 mt-3 pt-3 border-t border-gray-100">
              FX savings on ${settings.annualFxSpend.toLocaleString()} annual FX spend
            </p>
          ) : null}
        </div>

        {/* Points summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Points Summary</h3>
          {data.pointsBalances.length === 0 ? (
            <button onClick={() => onNavigate('points')} className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-4">
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
                    <span className="text-gray-700 truncate flex-1 mr-2">{prog?.name}</span>
                    <span className="font-mono text-gray-500 mr-2">{pb.balance.toLocaleString()}</span>
                    <span className="font-mono text-emerald-600 font-semibold shrink-0">${value.toFixed(0)}</span>
                  </div>
                );
              })}
              {data.pointsBalances.length > 5 && (
                <button onClick={() => onNavigate('points')} className="text-xs text-blue-600 hover:text-blue-800">
                  +{data.pointsBalances.length - 5} more →
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expiry warnings */}
      {data.cards.some(uc => { const t = getCardById(uc.cardId); return t?.benefits.some(b => b.expiryWarning); }) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="font-semibold text-red-800 text-sm">⚠ Upcoming Changes</p>
          {data.cards.flatMap(uc => {
            const t = getCardById(uc.cardId);
            return (t?.benefits.filter(b => b.expiryWarning) ?? []).map(b => (
              <p key={b.id} className="text-xs text-red-700 mt-1">
                <strong>{t?.name}</strong>: {b.expiryWarning}
              </p>
            ));
          })}
        </div>
      )}
    </div>
  );
}
