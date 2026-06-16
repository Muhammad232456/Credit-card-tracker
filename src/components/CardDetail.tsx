import { useState } from 'react';
import { POINTS_PROGRAMS } from '../data/programs';
import type { CardTemplate, UserCard, UserSettings, UserSupplementaryCard } from '../types';
import {
  effectiveBenefitValue, cardAge,
  SPEND_CATS, bestRateForCat, rateToCpd,
} from '../utils';

interface Props {
  template: CardTemplate;
  userCard: UserCard;
  settings: UserSettings;
  onUpdateUsage: (benefitId: string, count: number) => void;
  onUpdateCard: (updates: Partial<UserCard>) => void;
  onRemove: () => void;
  onBack: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  'travel-credit': '✈️', lounge: '🛋️', companion: '👥', 'free-night': '🏨',
  status: '⭐', insurance: '🛡️', bag: '🧳', nexus: '🛂', 'fx-savings': '💱',
  dining: '🍽️', delivery: '📦', fuel: '⛽', subscription: '📱', data: '📡', other: '•',
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

function effectiveRenewal(userCard: UserCard, feeFreq: 'monthly' | 'annual' = 'annual'): string | null {
  if (userCard.renewalDate) return userCard.renewalDate;
  if (userCard.openedDate) return calcNextRenewal(userCard.openedDate, feeFreq);
  return null;
}

export default function CardDetail({
  template, userCard, settings, onUpdateUsage, onUpdateCard, onBack, onRemove,
}: Props) {
  const [showInsurance, setShowInsurance] = useState(false);
  const [showEarning, setShowEarning] = useState(false);
  const [showSupplementary, setShowSupplementary] = useState(false);
  const [showNetValue, setShowNetValue] = useState(false);
  const [showCardMeta, setShowCardMeta] = useState(false);
  const [newSupHolder, setNewSupHolder] = useState('');
  const [newSupOption, setNewSupOption] = useState(0);

  const headerBg = ISSUER_COLORS[template.issuer] ?? 'bg-slate-800';
  const feeFreq = template.feeFrequency ?? 'annual';
  const isActive = (userCard.status ?? 'active') === 'active';
  const age = userCard.openedDate ? cardAge(userCard.openedDate, userCard.closedDate) : null;

  const totalBenefitValue = template.benefits.reduce((sum, b) => {
    const used = userCard.benefitUsage[b.id] ?? 0;
    const val = effectiveBenefitValue(b, settings);
    if (b.frequency === 'annual') return sum + (used > 0 ? val : 0);
    return sum + used * val;
  }, 0);

  const recoveryPct = template.annualFee > 0
    ? Math.min(100, Math.round((totalBenefitValue / template.annualFee) * 100))
    : 100;

  const renewal = effectiveRenewal(userCard, feeFreq);
  const renewalDays = renewal
    ? Math.ceil((new Date(renewal).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  // Net annual value calculation
  let estimatedEarn: number | null = null;
  if (settings.monthlySpend && template.earningRates?.length) {
    estimatedEarn = SPEND_CATS.reduce((sum, cat) => {
      const monthly = (settings.monthlySpend?.[cat.id as keyof typeof settings.monthlySpend] ?? 0) as number;
      if (!monthly) return sum;
      const { cpd } = bestRateForCat(template.earningRates!, cat.keywords, POINTS_PROGRAMS);
      return sum + monthly * 12 * cpd;
    }, 0);
  }
  const netValue = totalBenefitValue + (estimatedEarn ?? 0) - template.annualFee;

  function toggleStatus() {
    if (isActive) {
      onUpdateCard({ status: 'inactive', closedDate: new Date().toISOString().split('T')[0] });
    } else {
      onUpdateCard({ status: 'active', closedDate: undefined });
    }
  }

  function addSupplementary() {
    if (!newSupHolder.trim()) return;
    const sup: UserSupplementaryCard = {
      id: Date.now().toString(),
      holderName: newSupHolder.trim(),
      optionIndex: newSupOption,
      addedDate: new Date().toISOString().split('T')[0],
    };
    onUpdateCard({ supplementaryCards: [...(userCard.supplementaryCards ?? []), sup] });
    setNewSupHolder('');
  }

  function removeSupplementary(id: string) {
    onUpdateCard({ supplementaryCards: (userCard.supplementaryCards ?? []).filter(s => s.id !== id) });
  }

  return (
    <div className="space-y-0">
      <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
        ← Back to cards
      </button>

      {/* Card header */}
      <div className={`${headerBg} rounded-2xl p-6 text-white ${!isActive ? 'opacity-60' : ''}`}>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs opacity-70 uppercase tracking-wide">{template.issuer} · {template.network}</p>
              {!isActive && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">INACTIVE</span>}
              {template.firstYearFeeWaived && isActive && (
                <span className="text-xs bg-emerald-400/30 border border-emerald-300/40 px-2 py-0.5 rounded-full font-medium">1st year free</span>
              )}
            </div>
            <h2 className="text-xl font-bold mt-1">{template.name}</h2>
            <p className="text-sm opacity-80 mt-1 font-mono">
              {feeFreq === 'monthly'
                ? `$${(template.annualFee / 12).toFixed(2)}/month ($${template.annualFee.toFixed(2)}/yr)`
                : `$${template.annualFee.toFixed(2)}/yr`}
            </p>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {userCard.creditLimit && (
                <p className="text-xs opacity-60 font-mono">Limit: ${userCard.creditLimit.toLocaleString()}</p>
              )}
              {age && (
                <p className="text-xs opacity-60 font-mono">Held: {age}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-70">Value recovered</p>
            <p className="text-2xl font-mono font-bold">
              ${totalBenefitValue.toFixed(0)} <span className="text-sm opacity-70">/ ${template.annualFee.toFixed(0)}</span>
            </p>
            <div className="mt-2 bg-white/20 rounded-full h-2 w-32">
              <div
                className={`h-2 rounded-full transition-all ${recoveryPct >= 100 ? 'bg-emerald-400' : recoveryPct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ width: `${Math.min(100, recoveryPct)}%` }}
              />
            </div>
            <p className="text-xs opacity-70 mt-1">{recoveryPct}% recovered</p>
          </div>
        </div>
      </div>

      {/* Net Annual Value */}
      <div className="bg-white border border-gray-200 rounded-xl mt-4 overflow-hidden">
        <button
          onClick={() => setShowNetValue(v => !v)}
          className="w-full px-4 py-3 flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">💰 Net Annual Value</span>
            <span className={`text-sm font-mono font-bold ${netValue >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {netValue >= 0 ? '+' : ''}${netValue.toFixed(0)}
            </span>
          </div>
          <span className="text-gray-400 text-sm">{showNetValue ? '▲' : '▼'}</span>
        </button>
        {showNetValue && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Annual fee</span>
              <span className="font-mono text-red-600">−${template.annualFee.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Benefits recovered (so far)</span>
              <span className="font-mono text-emerald-600">+${totalBenefitValue.toFixed(0)}</span>
            </div>
            {estimatedEarn !== null && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Est. annual earn (your spend)</span>
                <span className="font-mono text-blue-600">+${estimatedEarn.toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-100">
              <span className="text-gray-800">Net value</span>
              <span className={`font-mono ${netValue >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                {netValue >= 0 ? '+' : ''}${netValue.toFixed(0)}
              </span>
            </div>
            {estimatedEarn === null && (
              <p className="text-xs text-gray-400">
                Set a spend profile in the Optimize tab to include estimated earn.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Card details */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4 space-y-4">
        <p className="text-sm font-semibold text-gray-700">Card Details</p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500">Opened Date</label>
            <input
              type="date"
              value={userCard.openedDate ?? ''}
              onChange={e => onUpdateCard({ openedDate: e.target.value })}
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">
              Renewal Date
              {userCard.openedDate && !userCard.renewalDate && (
                <span className="ml-1 text-blue-500">(auto)</span>
              )}
            </label>
            <input
              type="date"
              value={userCard.renewalDate ?? (userCard.openedDate ? calcNextRenewal(userCard.openedDate, feeFreq) : '')}
              onChange={e => onUpdateCard({ renewalDate: e.target.value || undefined })}
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        {renewal && renewalDays !== null && (
          <p className={`text-xs font-medium px-3 py-1.5 rounded-lg inline-block ${
            renewalDays < 30 ? 'bg-red-50 text-red-700' : renewalDays < 60 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
          }`}>
            {renewalDays > 0
              ? `Renews in ${renewalDays} days (${renewal})`
              : `Renewal was ${Math.abs(renewalDays)} days ago`}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500">Credit Limit (CAD)</label>
            <input
              type="number"
              placeholder="e.g. 10000"
              value={userCard.creditLimit ?? ''}
              onChange={e => onUpdateCard({ creditLimit: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          {!isActive && (
            <div>
              <label className="text-xs text-gray-500">Closed Date</label>
              <input
                type="date"
                value={userCard.closedDate ?? ''}
                onChange={e => onUpdateCard({ closedDate: e.target.value })}
                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          )}
        </div>

        {/* Statement & payment due dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500">Statement Closes (day of month)</label>
            <input
              type="number"
              min="1" max="31"
              placeholder="e.g. 15"
              value={userCard.statementDay ?? ''}
              onChange={e => onUpdateCard({ statementDay: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Payment Due (days after statement)</label>
            <input
              type="number"
              min="1" max="45"
              placeholder="e.g. 21"
              value={userCard.paymentDueDays ?? ''}
              onChange={e => onUpdateCard({ paymentDueDays: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        {userCard.statementDay && userCard.paymentDueDays && (
          <p className="text-xs text-blue-600">
            Closes day {userCard.statementDay} · Payment due ~day {((userCard.statementDay + userCard.paymentDueDays - 1) % 31) + 1}
          </p>
        )}
      </div>

      {/* Product change history */}
      <div className="bg-white border border-gray-200 rounded-xl mt-4 overflow-hidden">
        <button
          onClick={() => setShowCardMeta(v => !v)}
          className="w-full px-4 py-3 flex items-center justify-between text-left"
        >
          <span className="text-sm font-semibold text-gray-700">
            📋 Product History
            {userCard.productChangeNote && (
              <span className="ml-2 text-xs font-normal text-gray-400 truncate">{userCard.productChangeNote}</span>
            )}
          </span>
          <span className="text-gray-400 text-sm">{showCardMeta ? '▲' : '▼'}</span>
        </button>
        {showCardMeta && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Product Change Date</label>
                <input
                  type="date"
                  value={userCard.productChangeDate ?? ''}
                  onChange={e => onUpdateCard({ productChangeDate: e.target.value || undefined })}
                  className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Note (e.g. "Downgraded from TD Aeroplan Infinite")</label>
              <input
                type="text"
                placeholder="e.g. Downgraded from TD Aeroplan Infinite"
                value={userCard.productChangeNote ?? ''}
                onChange={e => onUpdateCard({ productChangeNote: e.target.value || undefined })}
                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            {userCard.openedDate && (
              <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600 space-y-0.5">
                <p>Opened: {userCard.openedDate}</p>
                {userCard.productChangeDate && <p>Product change: {userCard.productChangeDate}</p>}
                {age && <p>Time held: {age}</p>}
                {userCard.closedDate && <p>Closed: {userCard.closedDate}</p>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Welcome bonus tracker */}
      <div className="bg-white border border-blue-200 rounded-xl p-4 mt-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">🎯 Welcome Bonus Tracker</p>
        {userCard.welcomeBonus ? (() => {
          const wb = userCard.welcomeBonus!;
          const pct = Math.min(100, Math.round((wb.spendSoFar / wb.spendTarget) * 100));
          const remaining = Math.max(0, wb.spendTarget - wb.spendSoFar);
          const deadlineDays = wb.deadline
            ? Math.ceil((new Date(wb.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : null;
          return (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-blue-700">{wb.bonusDescription}</span>
                  <span className="font-mono text-gray-600">{pct}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div className={`h-3 rounded-full transition-all ${pct >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>${wb.spendSoFar.toLocaleString()} spent</span>
                  <span>${wb.spendTarget.toLocaleString()} required</span>
                </div>
              </div>
              {pct < 100 && (
                <p className="text-sm text-gray-600">
                  <span className="font-mono font-bold text-blue-700">${remaining.toLocaleString()}</span> still needed
                  {deadlineDays !== null && (
                    <span className={`ml-2 font-medium ${deadlineDays < 30 ? 'text-red-600' : 'text-amber-600'}`}>
                      · {deadlineDays} days left
                    </span>
                  )}
                </p>
              )}
              {pct >= 100 && <p className="text-sm text-emerald-600 font-medium">✅ Minimum spend met!</p>}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
                <div>
                  <label className="text-xs text-gray-500">Spent So Far ($)</label>
                  <input
                    type="number"
                    value={wb.spendSoFar}
                    onChange={e => onUpdateCard({ welcomeBonus: { ...wb, spendSoFar: Number(e.target.value) || 0 } })}
                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Deadline</label>
                  <input
                    type="date"
                    value={wb.deadline ?? ''}
                    onChange={e => onUpdateCard({ welcomeBonus: { ...wb, deadline: e.target.value || undefined } })}
                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <button onClick={() => onUpdateCard({ welcomeBonus: undefined })} className="text-xs text-red-400 hover:text-red-600">
                Remove bonus tracker
              </button>
            </div>
          );
        })() : (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Track your minimum spend to earn the welcome bonus.</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500">Bonus Description</label>
                <input id="wb-desc" type="text" placeholder="e.g. 60,000 Aeroplan pts" className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Min Spend Required ($)</label>
                <input id="wb-target" type="number" placeholder="e.g. 3000" className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <button
              onClick={() => {
                const desc = (document.getElementById('wb-desc') as HTMLInputElement)?.value?.trim();
                const target = Number((document.getElementById('wb-target') as HTMLInputElement)?.value);
                if (!desc || !target) return;
                onUpdateCard({ welcomeBonus: { bonusDescription: desc, spendTarget: target, spendSoFar: 0 } });
              }}
              className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Set Up Bonus Tracker
            </button>
          </div>
        )}
      </div>

      {/* Earning rates */}
      {template.earningRates && template.earningRates.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl mt-4 overflow-hidden">
          <button
            onClick={() => setShowEarning(v => !v)}
            className="w-full px-4 py-3 flex items-center justify-between text-left"
          >
            <span className="text-sm font-semibold text-gray-700">💎 Earning Rates</span>
            <span className="text-gray-400 text-sm">{showEarning ? '▲' : '▼'}</span>
          </button>
          {showEarning && (
            <div className="px-4 pb-4 space-y-2 border-t border-gray-100">
              {template.earningRates.map((r, i) => {
                const cpd = rateToCpd(r, POINTS_PROGRAMS);
                return (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-700">{r.category}</span>
                    <div className="text-right">
                      <span className="font-mono font-bold text-blue-700 text-sm">
                        {r.unit === 'points'
                          ? `${r.multiplier}× pts`
                          : `${(r.multiplier * 100).toFixed(1).replace(/\.0$/, '')}%`}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">≈{(cpd * 100).toFixed(1).replace(/\.0$/, '')}¢/$</span>
                      {r.note && <p className="text-xs text-gray-400">{r.note}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Insurance */}
      {template.insurance && template.insurance.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl mt-4 overflow-hidden">
          <button
            onClick={() => setShowInsurance(v => !v)}
            className="w-full px-4 py-3 flex items-center justify-between text-left"
          >
            <span className="text-sm font-semibold text-gray-700">🛡️ Insurance Coverage</span>
            <span className="text-gray-400 text-sm">{showInsurance ? '▲' : '▼'}</span>
          </button>
          {showInsurance && (
            <div className="px-4 pb-4 space-y-2 border-t border-gray-100">
              {template.insurance.map((ins, i) => (
                <div key={i} className="flex items-start justify-between py-1.5 border-b border-gray-50 last:border-0 gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 font-medium">{ins.type}</p>
                    {ins.note && <p className="text-xs text-gray-500">{ins.note}</p>}
                  </div>
                  <div className="text-right shrink-0 text-xs text-gray-500 space-y-0.5">
                    {ins.maxCoverage && <p className="font-mono text-emerald-700 font-medium">{ins.maxCoverage}</p>}
                    {ins.maxDays && <p>{ins.maxDays} days</p>}
                    {ins.ageLimit && <p>Under {ins.ageLimit}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Benefits checklist */}
      <div className="space-y-3 mt-4">
        <h3 className="font-semibold text-gray-800">
          Benefits Checklist
          {template.benefits.length === 0 && (
            <span className="ml-2 text-sm font-normal text-gray-400">— no trackable credits</span>
          )}
        </h3>
        {template.benefits.map(benefit => {
          const used = userCard.benefitUsage[benefit.id] ?? 0;
          const maxUses = benefit.frequency === 'annual' ? 1
            : benefit.frequency === 'monthly' ? (benefit.maxUses ?? 12)
            : (benefit.maxUses ?? 1);
          const effectiveVal = effectiveBenefitValue(benefit, settings);
          const earnedValue = benefit.frequency === 'annual'
            ? (used > 0 ? effectiveVal : 0)
            : used * effectiveVal;
          const isAutoFx = benefit.category === 'fx-savings' && benefit.value === 0 && !!settings.annualFxSpend;

          return (
            <div key={benefit.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">{CATEGORY_ICONS[benefit.category]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{benefit.name}</p>
                      {benefit.note && <p className="text-xs text-gray-500 mt-0.5">{benefit.note}</p>}
                      {isAutoFx && (
                        <p className="text-xs text-blue-500 mt-0.5">Auto-calculated from ${settings.annualFxSpend!.toLocaleString()} annual FX spend</p>
                      )}
                      {benefit.condition && <p className="text-xs text-amber-600 mt-0.5">⚠ {benefit.condition}</p>}
                      {benefit.expiryWarning && <p className="text-xs text-red-600 mt-0.5 font-medium">⚠ {benefit.expiryWarning}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      {effectiveVal > 0 && (
                        <p className="text-xs text-gray-500">${effectiveVal}/use · {benefit.frequency}</p>
                      )}
                      <p className="font-mono text-sm font-bold text-emerald-600">${earnedValue.toFixed(0)} earned</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    {benefit.frequency === 'annual' ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={used > 0}
                          onChange={e => onUpdateUsage(benefit.id, e.target.checked ? 1 : 0)}
                          className="w-4 h-4 rounded accent-blue-600"
                        />
                        <span className="text-sm text-gray-600">Used this year</span>
                      </label>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onUpdateUsage(benefit.id, Math.max(0, used - 1))}
                          disabled={used <= 0}
                          className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 font-bold text-lg leading-none"
                        >−</button>
                        <span className="font-mono font-bold text-lg w-12 text-center">{used}/{maxUses}</span>
                        <button
                          onClick={() => onUpdateUsage(benefit.id, Math.min(maxUses, used + 1))}
                          disabled={used >= maxUses}
                          className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 font-bold text-lg leading-none"
                        >+</button>
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${used >= maxUses ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${(used / maxUses) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Supplementary cards */}
      {template.supplementaryCardOptions && template.supplementaryCardOptions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl mt-4 overflow-hidden">
          <button
            onClick={() => setShowSupplementary(v => !v)}
            className="w-full px-4 py-3 flex items-center justify-between text-left"
          >
            <span className="text-sm font-semibold text-gray-700">
              👤 Supplementary Cards
              {(userCard.supplementaryCards?.length ?? 0) > 0 && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                  {userCard.supplementaryCards!.length}
                </span>
              )}
            </span>
            <span className="text-gray-400 text-sm">{showSupplementary ? '▲' : '▼'}</span>
          </button>
          {showSupplementary && (
            <div className="px-4 pb-4 border-t border-gray-100 space-y-3 pt-3">
              {(userCard.supplementaryCards ?? []).map(sup => {
                const opt = template.supplementaryCardOptions![sup.optionIndex];
                return (
                  <div key={sup.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{sup.holderName}</p>
                      <p className="text-xs text-gray-500">
                        {opt?.name} · {opt?.fee === 0 ? 'Free' : `$${opt?.fee}/yr`}
                        {sup.addedDate && ` · Added ${sup.addedDate}`}
                      </p>
                      {opt?.perks && <p className="text-xs text-blue-600 mt-0.5">{opt.perks.join(' · ')}</p>}
                    </div>
                    <button onClick={() => removeSupplementary(sup.id)} className="text-red-400 hover:text-red-600 text-xs ml-3 shrink-0">
                      Remove
                    </button>
                  </div>
                );
              })}
              <div className="space-y-2 pt-1 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Add Cardholder</p>
                <input
                  type="text"
                  placeholder="Cardholder name"
                  value={newSupHolder}
                  onChange={e => setNewSupHolder(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                {template.supplementaryCardOptions.length > 1 && (
                  <select
                    value={newSupOption}
                    onChange={e => setNewSupOption(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    {template.supplementaryCardOptions.map((opt, i) => (
                      <option key={i} value={i}>{opt.name} — {opt.fee === 0 ? 'Free' : `$${opt.fee}/yr`}</option>
                    ))}
                  </select>
                )}
                <div className="bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-700">
                  <strong>{template.supplementaryCardOptions[newSupOption].name}</strong>
                  {' · '}
                  {template.supplementaryCardOptions[newSupOption].fee === 0
                    ? 'No additional fee'
                    : `$${template.supplementaryCardOptions[newSupOption].fee}/yr`}
                  {template.supplementaryCardOptions[newSupOption].perks && (
                    <p className="mt-0.5 text-blue-600">{template.supplementaryCardOptions[newSupOption].perks!.join(' · ')}</p>
                  )}
                </div>
                <button
                  onClick={addSupplementary}
                  disabled={!newSupHolder.trim()}
                  className="w-full py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Add Cardholder
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
        <button
          onClick={toggleStatus}
          className={`text-sm font-medium px-4 py-2 rounded-lg border transition-colors ${
            isActive
              ? 'border-amber-300 text-amber-700 hover:bg-amber-50'
              : 'border-green-300 text-green-700 hover:bg-green-50'
          }`}
        >
          {isActive ? '📁 Mark as Inactive (keep history)' : '✅ Reactivate Card'}
        </button>
        <div className="flex items-center justify-between">
          <button onClick={onRemove} className="text-sm text-red-500 hover:text-red-700 font-medium">
            🗑 Remove card permanently
          </button>
          <p className="text-xs text-gray-400">Verified: {template.lastVerified}</p>
        </div>
      </div>
    </div>
  );
}
