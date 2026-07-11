import { useState } from 'react';
import { POINTS_PROGRAMS } from '../data/programs';
import { getApplyUrl } from '../data/cards';
import type { CardTemplate, UserCard, UserSettings, UserSupplementaryCard, WelcomeBonusTier } from '../types';
import { trackBenefitMarked, trackCardRemoved } from '../analytics';
import {
  effectiveBenefitValue, cardAge,
  SPEND_CATS, bestRateForCat, rateToCpd,
} from '../utils';

interface Props {
  template: CardTemplate;
  userCard: UserCard;
  settings: UserSettings;
  onUpdateUsage: (benefitId: string, count: number) => void;
  onUpdatePlanned: (benefitId: string, count: number) => void;
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
  template, userCard, settings, onUpdateUsage, onUpdatePlanned, onUpdateCard, onBack, onRemove,
}: Props) {
  const [showInsurance, setShowInsurance] = useState(false);
  const [showEarning, setShowEarning] = useState(false);
  const [showSupplementary, setShowSupplementary] = useState(false);
  const [showNetValue, setShowNetValue] = useState(false);
  const [showCardMeta, setShowCardMeta] = useState(false);
  const [newSupHolder, setNewSupHolder] = useState('');
  const [newSupOption, setNewSupOption] = useState(0);
  // Welcome bonus tier builder state
  const [draftTiers, setDraftTiers] = useState<WelcomeBonusTier[]>([]);
  const [tierType, setTierType] = useState<WelcomeBonusTier['type']>('approval');
  const [tierLabel, setTierLabel] = useState('');
  const [tierSpend, setTierSpend] = useState('');
  const [bonusDeadline, setBonusDeadline] = useState('');

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
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          ← Back to cards
        </button>
        <span className="text-xs text-gray-400">Changes save automatically</span>
      </div>

      {/* Card header */}
      <div className={`${headerBg} rounded-2xl p-6 text-white ${!isActive ? 'opacity-60' : ''}`}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs opacity-70 uppercase tracking-wide">{template.issuer} · {template.network}</p>
              {!isActive && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">INACTIVE</span>}
              {template.firstYearFeeWaived && isActive && (
                <span className="text-xs bg-emerald-400/30 border border-emerald-300/40 px-2 py-0.5 rounded-full font-medium">1st year free</span>
              )}
              {template.noFxFee && (
                <span className="text-xs bg-white/20 border border-white/30 px-2 py-0.5 rounded-full font-medium">No FX Fee</span>
              )}
            </div>
            <h2 className="text-xl font-bold mt-1">{template.name}</h2>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <p className="text-sm opacity-80 font-mono">
                {feeFreq === 'monthly'
                  ? `$${(template.annualFee / 12).toFixed(2)}/month ($${template.annualFee.toFixed(2)}/yr)`
                  : `$${template.annualFee.toFixed(2)}/yr`}
              </p>
              {template.supplementaryCardOptions && template.supplementaryCardOptions.length > 0 && (
                <p className="text-xs opacity-60 bg-white/10 px-2 py-0.5 rounded-full">
                  +{template.supplementaryCardOptions[0].fee === 0
                    ? 'Free'
                    : `$${template.supplementaryCardOptions[0].fee}/yr`} supp.
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {userCard.creditLimit && (
                <p className="text-xs opacity-60 font-mono">Limit: ${userCard.creditLimit.toLocaleString()}</p>
              )}
              {age && (
                <p className="text-xs opacity-60 font-mono">Held: {age}</p>
              )}
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-xs opacity-70">Value recovered</p>
            <p className="text-2xl font-mono font-bold">
              ${totalBenefitValue.toFixed(0)} <span className="text-sm opacity-70">/ ${template.annualFee.toFixed(0)}</span>
            </p>
            <div className="mt-2 bg-white/20 rounded-full h-2 w-full sm:w-32">
              <div
                className={`h-2 rounded-full transition-all ${recoveryPct >= 100 ? 'bg-emerald-400' : recoveryPct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ width: `${Math.min(100, recoveryPct)}%` }}
              />
            </div>
            <p className="text-xs opacity-70 mt-1">{recoveryPct}% recovered</p>
          </div>
        </div>
      </div>

      {/* Current promotional offer */}
      {(() => {
        if (!template.currentOffer) {
          return (
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Welcome Offer</p>
                  <p className="text-sm text-gray-400 italic mt-0.5">No current promotional welcome offer</p>
                </div>
              </div>
              {template.offerHistory && template.offerHistory.length > 0 && (
                <div className="border-t border-black/5 px-4 py-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Offer History</p>
                  <div className="space-y-1.5">
                    {template.offerHistory.map((h, i) => (
                      <div key={i} className="flex items-center justify-between text-xs text-gray-600">
                        <span className="flex-1 mr-2">{h.description}</span>
                        <span className="text-gray-400 shrink-0">
                          {h.startDate}{h.endDate ? ` – ${h.endDate}` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }
        const ratingConfig = {
          'standard':     { label: 'Standard Offer',  bg: 'bg-amber-50',   border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
          'elevated':     { label: 'Elevated Offer',  bg: 'bg-orange-50',  border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' },
          'all-time-high':{ label: 'All-Time High!',  bg: 'bg-emerald-50', border: 'border-emerald-300', badge: 'bg-emerald-100 text-emerald-700' },
        };
        const cfg = ratingConfig[template.currentOffer!.rating ?? 'standard'];
        const allTimeHigh = template.offerHistory ? Math.max(...template.offerHistory.map(h => h.points), template.currentOffer!.points) : template.currentOffer!.points;
        const historicalAvg = template.offerHistory && template.offerHistory.length > 0
          ? Math.round(template.offerHistory.reduce((s, h) => s + h.points, 0) / template.offerHistory.length)
          : null;
        return (
          <div className={`mt-4 ${cfg.bg} border ${cfg.border} rounded-xl overflow-hidden`}>
            <div className="px-4 py-3 flex items-start gap-3">
              <span className="text-xl">🎁</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900">Current Offer</p>
                  {template.currentOffer!.rating && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mt-0.5">{template.currentOffer!.description}</p>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500 flex-wrap">
                  {historicalAvg && <span>Avg offer: <strong>{historicalAvg.toLocaleString()} pts</strong></span>}
                  <span>All-time high: <strong>{allTimeHigh.toLocaleString()} pts</strong></span>
                  {template.currentOffer!.expiryDate && (
                    <span className="text-red-600 font-medium">Expires {new Date(template.currentOffer!.expiryDate + 'T12:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  )}
                </div>
              </div>
              {template.currentOffer!.applyUrl && (
                <a href={template.currentOffer!.applyUrl} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                  Apply →
                </a>
              )}
            </div>
            {/* Offer history */}
            {template.offerHistory && template.offerHistory.length > 0 && (
              <div className="border-t border-black/5 px-4 py-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Offer History</p>
                <div className="space-y-1.5">
                  {template.offerHistory.map((h, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-gray-600">
                      <span className="flex-1 mr-2">{h.description}</span>
                      <span className="text-gray-400 shrink-0">
                        {new Date(h.startDate + 'T12:00:00').toLocaleDateString('en-CA', { month: 'short', year: 'numeric' })}
                        {h.endDate ? ` – ${new Date(h.endDate + 'T12:00:00').toLocaleDateString('en-CA', { month: 'short', year: 'numeric' })}` : ' – present'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

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
            {/* Verdict */}
            {template.annualFee > 0 && (estimatedEarn !== null || totalBenefitValue > 0) && (
              <div className={`mt-2 pt-3 border-t border-gray-100 rounded-lg px-3 py-2 ${
                netValue >= 50 ? 'bg-emerald-50' : netValue >= -50 ? 'bg-amber-50' : 'bg-red-50'
              }`}>
                <p className={`text-xs font-semibold ${
                  netValue >= 50 ? 'text-emerald-800' : netValue >= -50 ? 'text-amber-800' : 'text-red-800'
                }`}>
                  {netValue >= 50
                    ? `✓ Worth keeping — earns $${Math.round(netValue)} more than it costs`
                    : netValue >= -50
                    ? `≈ Breaking even — use your benefits to push it positive`
                    : `⚠ Not justifying the fee — consider downgrading or cancelling`}
                </p>
                {netValue < -50 && (
                  <p className="text-xs text-red-700 mt-1">
                    This card costs ~${Math.round(Math.abs(netValue))} more than it earns you. Use the Compare Cards tool to find a better fit.
                  </p>
                )}
              </div>
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
          <div className="flex flex-wrap items-center gap-2">
            <p className={`text-xs font-medium px-3 py-1.5 rounded-lg inline-block ${
              renewalDays < 30 ? 'bg-red-50 text-red-700' : renewalDays < 60 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
            }`}>
              {renewalDays > 0
                ? `Renews in ${renewalDays} days (${renewal})`
                : `Renewal was ${Math.abs(renewalDays)} days ago`}
            </p>
            {renewalDays > 0 && (() => {
              const title = encodeURIComponent(`${template.name} — Annual Fee Renewal`);
              const details = encodeURIComponent(`Review whether to keep or cancel your ${template.name} (annual fee: $${template.annualFee}).`);
              const date = renewal.replace(/-/g, '');
              const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${date}/${date}&details=${details}`;
              const icsContent = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'BEGIN:VEVENT',
                `DTSTART;VALUE=DATE:${date}`,
                `DTEND;VALUE=DATE:${date}`,
                `SUMMARY:${template.name} — Annual Fee Renewal`,
                `DESCRIPTION:Review whether to keep or cancel your ${template.name} (annual fee: $${template.annualFee}).`,
                'END:VEVENT',
                'END:VCALENDAR',
              ].join('\r\n');
              const icsUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
              return (
                <>
                  <a
                    href={gcalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
                  >
                    📅 Google Calendar
                  </a>
                  <a
                    href={icsUrl}
                    download={`${template.name}-renewal.ics`}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
                  >
                    📅 Apple / Outlook
                  </a>
                </>
              );
            })()}
          </div>
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
            <p className="text-xs text-gray-400 mt-1">The day each month your billing cycle ends. Found on your statement or online banking under "Statement Date."</p>
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
            <p className="text-xs text-gray-400 mt-1">How many days after your statement closes until payment is due. Usually 21–25 days. Found on your statement or card agreement. If you have autopay enabled, this is when money is deducted from your bank account.</p>
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
          const spendTier = wb.tiers.find(t => t.type === 'spend');
          const deadlineDays = wb.deadline
            ? Math.ceil((new Date(wb.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : null;
          return (
            <div className="space-y-3">
              {/* Tier list */}
              {wb.tiers.map((tier, i) => {
                const isSpend = tier.type === 'spend';
                const spendTarget = tier.spendRequired ?? 0;
                const pct = isSpend && spendTarget > 0
                  ? Math.min(100, Math.round((wb.spendSoFar / spendTarget) * 100))
                  : 0;
                const remaining = isSpend ? Math.max(0, spendTarget - wb.spendSoFar) : 0;
                return (
                  <div key={i} className={`rounded-lg p-3 border ${tier.earned ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => {
                          const updated = wb.tiers.map((t, j) => j === i ? { ...t, earned: !t.earned } : t);
                          onUpdateCard({ welcomeBonus: { ...wb, tiers: updated } });
                        }}
                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          tier.earned ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-400'
                        }`}
                      >
                        {tier.earned && <span className="text-xs leading-none">✓</span>}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${tier.earned ? 'text-emerald-700' : 'text-gray-800'}`}>
                          {tier.label.replace(/\b(\d{4,})\b/g, n => Number(n).toLocaleString())}
                        </p>
                        <p className="text-xs text-gray-500 capitalize mt-0.5">{tier.type === 'approval' ? 'On approval' : tier.type === 'spend' ? `Spend $${spendTarget.toLocaleString()}` : 'Anniversary bonus'}</p>
                        {isSpend && !tier.earned && spendTarget > 0 && (
                          <div className="mt-2 space-y-1">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div className={`h-2 rounded-full transition-all ${pct >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>${Number(wb.spendSoFar).toLocaleString()} spent</span>
                              <span className="font-medium">${remaining.toLocaleString()} to go{deadlineDays !== null ? ` · ${deadlineDays}d left` : ''}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => onUpdateCard({ welcomeBonus: { ...wb, tiers: wb.tiers.filter((_, j) => j !== i) } })}
                        className="text-gray-300 hover:text-red-400 text-xs shrink-0"
                      >✕</button>
                    </div>
                  </div>
                );
              })}

              {/* Spend + deadline inputs */}
              {spendTier && (
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
                  <div>
                    <label className="text-xs text-gray-500">Spent So Far ($)</label>
                    <input
                      type="number"
                      value={wb.spendSoFar || ''}
                      placeholder="e.g. 500"
                      onChange={e => onUpdateCard({ welcomeBonus: { ...wb, spendSoFar: Number(e.target.value) || 0 } })}
                      className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Spend Deadline</label>
                    <input
                      type="date"
                      value={wb.deadline ?? ''}
                      onChange={e => onUpdateCard({ welcomeBonus: { ...wb, deadline: e.target.value || undefined } })}
                      className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              )}
              {deadlineDays !== null && (
                <p className={`text-xs font-medium ${deadlineDays < 30 ? 'text-red-600' : 'text-amber-600'}`}>
                  ⏱ {deadlineDays} days until spend deadline
                </p>
              )}

              {/* Add another tier inline */}
              <details className="group">
                <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 font-medium list-none">+ Add another tier</summary>
                <div className="mt-2 space-y-2">
                  <select
                    value={tierType}
                    onChange={e => setTierType(e.target.value as WelcomeBonusTier['type'])}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="approval">On approval</option>
                    <option value="spend">Spend bonus</option>
                    <option value="anniversary">Anniversary bonus</option>
                  </select>
                  <input type="text" placeholder="e.g. 20,000 Avion Points" value={tierLabel}
                    onChange={e => setTierLabel(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  {tierType === 'spend' && (
                    <input type="number" placeholder="Min spend required ($)" value={tierSpend}
                      onChange={e => setTierSpend(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" />
                  )}
                  <button
                    onClick={() => {
                      if (!tierLabel.trim()) return;
                      const newTier: WelcomeBonusTier = {
                        label: tierLabel.trim(), type: tierType,
                        spendRequired: tierType === 'spend' ? Number(tierSpend) || 0 : undefined,
                        earned: false,
                      };
                      onUpdateCard({ welcomeBonus: { ...wb, tiers: [...wb.tiers, newTier] } });
                      setTierLabel(''); setTierSpend('');
                    }}
                    disabled={!tierLabel.trim()}
                    className="w-full py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40"
                  >Add Tier</button>
                </div>
              </details>

              <button onClick={() => onUpdateCard({ welcomeBonus: undefined })} className="text-xs text-red-400 hover:text-red-600">
                Remove bonus tracker
              </button>
            </div>
          );
        })() : (
          /* Setup: build tiers before saving */
          <div className="space-y-3">
            <p className="text-xs text-gray-500">Add each component of the welcome bonus, then save.</p>
            <div className="space-y-2">
              <select
                value={tierType}
                onChange={e => setTierType(e.target.value as WelcomeBonusTier['type'])}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="approval">On approval (no spend needed)</option>
                <option value="spend">Spend bonus (requires min spend)</option>
                <option value="anniversary">Anniversary bonus (once per year)</option>
              </select>
              <input
                type="text"
                placeholder={tierType === 'approval' ? 'e.g. 35,000 Avion Points' : tierType === 'spend' ? 'e.g. 20,000 Avion Points' : 'e.g. 15,000 Avion Points'}
                value={tierLabel}
                onChange={e => setTierLabel(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              {tierType === 'spend' && (
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Min spend ($)" value={tierSpend}
                    onChange={e => setTierSpend(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" />
                  <input type="date" value={bonusDeadline}
                    onChange={e => setBonusDeadline(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              )}
              <button
                onClick={() => {
                  if (!tierLabel.trim()) return;
                  const t: WelcomeBonusTier = {
                    label: tierLabel.trim(), type: tierType,
                    spendRequired: tierType === 'spend' ? Number(tierSpend) || 0 : undefined,
                    earned: false,
                  };
                  setDraftTiers(prev => [...prev, t]);
                  setTierLabel(''); setTierSpend('');
                  setTierType('approval');
                }}
                disabled={!tierLabel.trim()}
                className="w-full py-2 border border-blue-300 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 disabled:opacity-40"
              >+ Add This Tier</button>
            </div>

            {/* Preview of drafted tiers */}
            {draftTiers.length > 0 && (
              <div className="space-y-1">
                {draftTiers.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm">
                    <span className="text-gray-400">○</span>
                    <span className="flex-1 text-gray-700">{t.label}</span>
                    <span className="text-xs text-gray-400 capitalize">{t.type === 'approval' ? 'on approval' : t.type === 'spend' ? `spend $${t.spendRequired?.toLocaleString()}` : 'anniversary'}</span>
                    <button onClick={() => setDraftTiers(prev => prev.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-400 text-xs">✕</button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    onUpdateCard({ welcomeBonus: { tiers: draftTiers, spendSoFar: 0, deadline: bonusDeadline || undefined } });
                    setDraftTiers([]); setBonusDeadline('');
                  }}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >Start Tracking ({draftTiers.length} tier{draftTiers.length !== 1 ? 's' : ''})</button>
              </div>
            )}
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
              <p className="text-xs text-gray-400 pt-2">
                Source: official {template.issuer} benefit pages & insurance certificates
                {(template.applyUrl ?? getApplyUrl(template.id)) && (
                  <> · <a href={template.applyUrl ?? getApplyUrl(template.id)} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">view card page ↗</a></>
                )}
                {' '}· verified {template.lastVerified}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Benefits checklist */}
      <div className="space-y-3 mt-4">
        <h3 className="font-semibold text-gray-800">
          Benefits Checklist
          {template.benefits.length === 0 && !template.noFxFee && (
            <span className="ml-2 text-sm font-normal text-gray-400">— no trackable credits</span>
          )}
          {template.benefits.length === 0 && template.noFxFee && (
            <span className="ml-2 text-sm font-normal text-gray-400">— card feature only</span>
          )}
        </h3>
        {template.noFxFee && template.benefits.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
            <span className="text-lg">💱</span>
            <div>
              <p className="font-medium text-gray-900 text-sm">No Foreign Transaction Fee</p>
              <p className="text-xs text-gray-500 mt-0.5">Card feature — no surcharge on purchases in foreign currencies</p>
            </div>
          </div>
        )}
        {template.benefits.map(benefit => {
          const used = userCard.benefitUsage[benefit.id] ?? 0;
          const planned = (userCard.benefitPlanned ?? {})[benefit.id] ?? 0;
          const maxUses = benefit.frequency === 'annual' ? 1
            : benefit.frequency === 'monthly' ? (benefit.maxUses ?? 12)
            : (benefit.maxUses ?? 1);
          const effectiveVal = effectiveBenefitValue(benefit, settings);
          const earnedValue = benefit.frequency === 'annual'
            ? (used > 0 ? effectiveVal : 0)
            : used * effectiveVal;
          const plannedValue = benefit.frequency === 'annual'
            ? (planned > 0 && used === 0 ? effectiveVal : 0)
            : planned * effectiveVal;
          return (
            <div key={benefit.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">{CATEGORY_ICONS[benefit.category]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{benefit.name}</p>
                      {benefit.note && <p className="text-xs text-gray-500 mt-0.5">{benefit.note}</p>}
                      {benefit.condition && <p className="text-xs text-amber-600 mt-0.5">⚠ {benefit.condition}</p>}
                      {benefit.expiryWarning && <p className="text-xs text-red-600 mt-0.5 font-medium">⚠ {benefit.expiryWarning}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      {effectiveVal > 0 && (
                        <p className="text-xs text-gray-500">${effectiveVal}/use · {benefit.frequency}</p>
                      )}
                      {earnedValue > 0 && (
                        <p className="font-mono text-sm font-bold text-emerald-600">${earnedValue.toFixed(0)} redeemed</p>
                      )}
                      {plannedValue > 0 && earnedValue === 0 && (
                        <p className="font-mono text-sm font-bold text-amber-500">${plannedValue.toFixed(0)} planned</p>
                      )}
                      {earnedValue === 0 && plannedValue === 0 && (
                        <p className="font-mono text-sm text-gray-300">$0</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    {benefit.frequency === 'annual' ? (
                      <div className="flex gap-1.5">
                        {[
                          { label: 'Unredeemed', usedVal: 0, plannedVal: 0, activeClass: 'bg-gray-100 text-gray-600 border-gray-300', inactiveClass: 'bg-white text-gray-400 border-gray-200' },
                          { label: 'Planned', usedVal: 0, plannedVal: 1, activeClass: 'bg-amber-50 text-amber-700 border-amber-300', inactiveClass: 'bg-white text-gray-400 border-gray-200' },
                          { label: 'Redeemed', usedVal: 1, plannedVal: 0, activeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300', inactiveClass: 'bg-white text-gray-400 border-gray-200' },
                        ].map(opt => {
                          const isSelected = used === opt.usedVal && planned === opt.plannedVal;
                          return (
                            <button
                              key={opt.label}
                              onClick={() => {
                                onUpdateUsage(benefit.id, opt.usedVal);
                                onUpdatePlanned(benefit.id, opt.plannedVal);
                                if (opt.usedVal > 0) trackBenefitMarked(template.id, benefit.id, benefit.name, opt.usedVal);
                              }}
                              className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all ${isSelected ? opt.activeClass : opt.inactiveClass}`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-14 shrink-0">Redeemed</span>
                          <button
                            onClick={() => { const c = Math.max(0, used - 1); onUpdateUsage(benefit.id, c); trackBenefitMarked(template.id, benefit.id, benefit.name, c); }}
                            disabled={used <= 0}
                            className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 font-bold text-base leading-none"
                          >−</button>
                          <span className="font-mono font-bold text-base w-12 text-center">{used}/{maxUses}</span>
                          <button
                            onClick={() => { const c = Math.min(maxUses, used + 1); onUpdateUsage(benefit.id, c); trackBenefitMarked(template.id, benefit.id, benefit.name, c); }}
                            disabled={used >= maxUses}
                            className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 font-bold text-base leading-none"
                          >+</button>
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all ${used >= maxUses ? 'bg-emerald-500' : 'bg-blue-500'}`}
                              style={{ width: `${(used / maxUses) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-amber-600 w-14 shrink-0">Planned</span>
                          <button
                            onClick={() => { const c = Math.max(0, planned - 1); onUpdatePlanned(benefit.id, c); }}
                            disabled={planned <= 0}
                            className="w-7 h-7 rounded-full border border-amber-200 text-amber-600 hover:bg-amber-50 disabled:opacity-30 font-bold text-base leading-none"
                          >−</button>
                          <span className="font-mono font-bold text-base w-12 text-center text-amber-600">{planned}/{maxUses - used}</span>
                          <button
                            onClick={() => { const c = Math.min(maxUses - used, planned + 1); onUpdatePlanned(benefit.id, c); }}
                            disabled={planned + used >= maxUses}
                            className="w-7 h-7 rounded-full border border-amber-200 text-amber-600 hover:bg-amber-50 disabled:opacity-30 font-bold text-base leading-none"
                          >+</button>
                          {plannedValue > 0 && (
                            <span className="text-xs text-amber-500 font-mono">${plannedValue.toFixed(0)} planned</span>
                          )}
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
          <button onClick={() => { trackCardRemoved(template.id, template.name, template.issuer); onRemove(); }} className="text-sm text-red-500 hover:text-red-700 font-medium">
            🗑 Remove card permanently
          </button>
          <p className="text-xs text-gray-400">
            Data from official {template.issuer} pages
            {(template.applyUrl ?? getApplyUrl(template.id)) && (
              <> (<a href={template.applyUrl ?? getApplyUrl(template.id)} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">source ↗</a>)</>
            )}
            {' '}· verified {template.lastVerified}
          </p>
        </div>
        <p className="text-sm text-gray-500 text-center font-medium">✓ Changes save automatically</p>
      </div>
    </div>
  );
}
