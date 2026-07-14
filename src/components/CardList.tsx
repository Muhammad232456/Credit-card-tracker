import { useState } from 'react';
import { getCardById } from '../data/cards';
import type { UserCard, UserData } from '../types';
import { effectiveBenefitValue, cardAge } from '../utils';
import AddCard from './AddCard';
import CardDetail from './CardDetail';
import { trackCardAdded, trackCardRemoved, trackCardDetailViewed, trackAddCardFlowStarted, updatePersonProperties } from '../analytics';
import { CardsIcon, CheckIcon, ClockIcon, AlertIcon } from './Icons';

interface Props {
  data: UserData;
  update: (updater: (prev: UserData) => UserData) => void;
  onCompare?: () => void;
  onStartQuiz?: () => void;
  isTablet?: boolean;
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

function calcNextRenewal(openedDate: string, feeFrequency: 'monthly' | 'annual' = 'annual'): string {
  const opened = new Date(openedDate + 'T12:00:00');
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  if (feeFrequency === 'monthly') {
    const day = opened.getDate();
    let next = new Date(today.getFullYear(), today.getMonth(), day);
    if (next <= today) next = new Date(today.getFullYear(), today.getMonth() + 1, day);
    return next.toISOString().split('T')[0];
  }
  let next = new Date(opened.getFullYear() + 1, opened.getMonth(), opened.getDate());
  while (next <= today) {
    next = new Date(next.getFullYear() + 1, next.getMonth(), next.getDate());
  }
  return next.toISOString().split('T')[0];
}

function getEffectiveRenewal(userCard: UserCard, feeFreq: 'monthly' | 'annual' = 'annual'): string | null {
  if (userCard.renewalDate) return userCard.renewalDate;
  if (userCard.openedDate) return calcNextRenewal(userCard.openedDate, feeFreq);
  return null;
}

export default function CardList({ data, update, onCompare, onStartQuiz, isTablet }: Props) {
  const [addingCard, setAddingCard] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function addCard(cardId: string) {
    update(prev => {
      const next = [...prev.cards, { cardId, benefitUsage: {}, status: 'active' as const }];
      const t = getCardById(cardId);
      if (t) trackCardAdded(cardId, t.name, t.issuer);
      updatePersonProperties({ cards_count: next.length });
      return { ...prev, cards: next };
    });
    setAddingCard(false);
    setSelectedCardId(cardId);
    const name = getCardById(cardId)?.name ?? 'Card';
    setToast(`${name} added`);
    setTimeout(() => setToast(null), 3000);
  }

  function removeCard(cardId: string) {
    const t = getCardById(cardId);
    if (t) trackCardRemoved(cardId, t.name, t.issuer);
    update(prev => {
      const next = prev.cards.filter(c => c.cardId !== cardId);
      updatePersonProperties({ cards_count: next.length });
      return { ...prev, cards: next };
    });
    setSelectedCardId(null);
  }

  function updateBenefitUsage(cardId: string, benefitId: string, count: number) {
    update(prev => ({
      ...prev,
      cards: prev.cards.map(c =>
        c.cardId === cardId
          ? { ...c, benefitUsage: { ...c.benefitUsage, [benefitId]: count } }
          : c
      ),
    }));
  }

  function updateBenefitPlanned(cardId: string, benefitId: string, count: number) {
    update(prev => ({
      ...prev,
      cards: prev.cards.map(c =>
        c.cardId === cardId
          ? { ...c, benefitPlanned: { ...(c.benefitPlanned ?? {}), [benefitId]: count } }
          : c
      ),
    }));
  }

  function updateCard(cardId: string, updates: Partial<UserCard>) {
    update(prev => ({
      ...prev,
      cards: prev.cards.map(c => c.cardId === cardId ? { ...c, ...updates } : c),
    }));
  }

  if (selectedCardId) {
    const template = getCardById(selectedCardId);
    const userCard = data.cards.find(c => c.cardId === selectedCardId);
    if (template && userCard) {
      return (
        <CardDetail
          template={template}
          userCard={userCard}
          settings={data.settings}
          onUpdateUsage={(benefitId, count) => updateBenefitUsage(selectedCardId, benefitId, count)}
          onUpdatePlanned={(benefitId, count) => updateBenefitPlanned(selectedCardId, benefitId, count)}
          onUpdateCard={updates => updateCard(selectedCardId, updates)}
          onRemove={() => removeCard(selectedCardId)}
          onBack={() => setSelectedCardId(null)}
        />
      );
    }
  }

  if (addingCard) {
    return (
      <AddCard
        existingCardIds={data.cards.map(c => c.cardId)}
        onAdd={addCard}
        onCancel={() => setAddingCard(false)}
      />
    );
  }

  const activeCards = data.cards.filter(c => (c.status ?? 'active') === 'active');
  const inactiveCards = data.cards.filter(c => c.status === 'inactive');

  function renderCardRow(userCard: UserCard, dimmed = false) {
    const template = getCardById(userCard.cardId);
    if (!template) return null;

    const totalValue = template.benefits.reduce((sum, b) => {
      const used = userCard.benefitUsage[b.id] ?? 0;
      const val = effectiveBenefitValue(b, data.settings);
      return sum + (b.frequency === 'annual' ? (used > 0 ? val : 0) : used * val);
    }, 0);
    const recoveryPct = template.annualFee > 0
      ? Math.round((totalValue / template.annualFee) * 100) : 100;
    const face = ISSUER_FACE[template.issuer] ?? 'from-ink to-ink-soft';
    const feeFreq = template.feeFrequency ?? 'annual';

    const renewal = getEffectiveRenewal(userCard, feeFreq);
    const renewalDays = renewal
      ? Math.ceil((new Date(renewal).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    const barClass = recoveryPct >= 100 ? 'bg-forest' : recoveryPct >= 50 ? 'bg-amber' : 'bg-rust';
    const statusPill = renewalDays !== null
      ? renewalDays < 30
        ? { cls: 'bg-rust-bg text-rust', icon: AlertIcon, label: `Renews in ${renewalDays}d` }
        : { cls: 'bg-amber-bg text-amber', icon: ClockIcon, label: `Renews in ${renewalDays}d` }
      : null;

    return (
      <button
        key={userCard.cardId}
        onClick={() => { setSelectedCardId(userCard.cardId); trackCardDetailViewed(userCard.cardId, template.name, template.issuer); }}
        className={`w-full text-left bg-surface border border-line rounded-2xl overflow-hidden flex hover:-translate-y-0.5 hover:shadow-md transition-all ${dimmed ? 'opacity-50' : ''}`}
      >
        {/* Card face */}
        <div className={`w-16 sm:w-28 lg:w-32 shrink-0 bg-gradient-to-br ${face} p-2 sm:p-3 flex flex-col justify-between text-white`}>
          <div className="w-5 h-[14px] sm:w-6 sm:h-[18px] rounded-[4px] bg-gradient-to-br from-[#E9CD8C] to-brass shadow-inner" />
          <div className="hidden sm:flex gap-1">
            {[0, 1, 2, 3].map(i => <span key={i} className="w-1 h-1 rounded-full bg-white/50" />)}
          </div>
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide opacity-85 truncate">{template.issuer}</p>
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0 px-2.5 sm:px-4 py-3 flex flex-col justify-center gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-ink text-sm truncate">{template.name}</p>
            {dimmed && <span className="text-[10px] font-semibold text-ink-soft bg-line px-1.5 py-0.5 rounded-full shrink-0">Inactive</span>}
            {template.firstYearFeeWaived && !dimmed && (
              <span className="text-[10px] font-semibold text-forest bg-forest-bg px-1.5 py-0.5 rounded-full shrink-0">1st yr free</span>
            )}
          </div>
          <p className="text-xs text-ink-soft truncate">
            {feeFreq === 'monthly'
              ? `$${(template.annualFee / 12).toFixed(2)}/mo`
              : template.annualFee === 0 ? 'No fee' : `$${template.annualFee.toFixed(0)}/yr`}
            {userCard.openedDate && ` · held ${cardAge(userCard.openedDate, userCard.closedDate)}`}
          </p>
          {(userCard.supplementaryCards?.length ?? 0) > 0 && (
            <p className="text-[11px] text-ink-soft">{userCard.supplementaryCards!.length} supplementary</p>
          )}
        </div>

        {/* Stats */}
        <div className="w-24 sm:w-40 lg:w-48 shrink-0 px-2 sm:px-4 py-3 flex flex-col justify-center gap-1.5 border-l border-line">
          {template.benefits.length > 0 ? (
            <>
              <p className="text-xs sm:text-sm tabular-nums truncate">
                <span className="font-bold text-ink">${totalValue.toFixed(0)}</span>
                <span className="text-ink-soft text-[10px] sm:text-xs"> of ${template.annualFee.toFixed(0)}</span>
              </p>
              <div className="h-[5px] rounded-full bg-line overflow-hidden">
                <div className={`h-full rounded-full ${barClass}`} style={{ width: `${Math.min(100, recoveryPct)}%` }} />
              </div>
            </>
          ) : (
            <p className="text-[10px] sm:text-xs text-ink-soft">No trackable credits</p>
          )}
          {statusPill && (
            <span className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full w-fit ${statusPill.cls}`}>
              <statusPill.icon className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">{statusPill.label}</span>
            </span>
          )}
          {renewalDays === null && !dimmed && !userCard.openedDate && (
            <span className="text-[10px] sm:text-[11px] text-ink-soft">Set date →</span>
          )}
          {userCard.creditLimit && (
            <p className="text-[10px] sm:text-[11px] text-ink-soft truncate">${userCard.creditLimit.toLocaleString()} limit</p>
          )}
        </div>
      </button>
    );
  }

  if (data.cards.length === 0) {
    return (
      <div className="space-y-8 py-8">
        <div className="text-center">
          <div className="text-5xl mb-4">💳</div>
          <p className="text-xl font-bold text-ink">Your cards, all in one place</p>
          <p className="text-sm text-ink-soft mt-2 max-w-sm mx-auto">Add your Canadian credit cards to track benefits, renewal dates, and annual fee recovery.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-surface border border-line rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">🎁</div>
            <p className="font-semibold text-ink text-sm">Track Benefits</p>
            <p className="text-xs text-ink-soft mt-1">Know exactly which perks you've used and what's left</p>
          </div>
          <div className="bg-surface border border-line rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">📅</div>
            <p className="font-semibold text-ink text-sm">Renewal Alerts</p>
            <p className="text-xs text-ink-soft mt-1">Never miss a renewal or forget to use your credits</p>
          </div>
          <div className="bg-surface border border-line rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">📊</div>
            <p className="font-semibold text-ink text-sm">Compare Cards</p>
            <p className="text-xs text-ink-soft mt-1">See how any Canadian credit card stacks up side by side</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => setAddingCard(true)}
            className="bg-brass text-ink px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Add Your First Card →
          </button>
          {onCompare && (
            <button
              onClick={onCompare}
              className="border border-line text-ink px-6 py-3 rounded-xl font-medium hover:bg-surface transition-colors"
            >
              Compare Cards
            </button>
          )}
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

  return (
    <div className="space-y-4 relative">
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-forest text-paper text-sm font-medium px-5 py-3 rounded-full shadow-lg pointer-events-none flex items-center gap-2">
          <CheckIcon className="w-4 h-4" />
          {toast}
        </div>
      )}
      {/* Active cards */}
      <div className={isTablet ? 'grid grid-cols-2 gap-3' : 'space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0'}>
        {activeCards.map(c => renderCardRow(c, false))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => { setAddingCard(true); trackAddCardFlowStarted(); }}
          className="flex-1 py-3 border-2 border-dashed border-line rounded-xl text-ink-soft hover:border-brass hover:text-brass transition-colors text-sm font-medium"
        >
          + Add Another Card
        </button>
        {onCompare && (
          <button
            onClick={onCompare}
            className="px-4 py-3 border-2 border-dashed border-line rounded-xl text-ink-soft hover:border-ink hover:text-ink transition-colors text-sm font-medium"
          >
            Compare
          </button>
        )}
      </div>

      {/* Inactive cards */}
      {inactiveCards.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowInactive(v => !v)}
            className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink font-medium"
          >
            {inactiveCards.length} inactive card{inactiveCards.length > 1 ? 's' : ''}
            <span className="text-xs">{showInactive ? '▲' : '▼'}</span>
          </button>
          {showInactive && (
            <div className="space-y-3 mt-3">
              {inactiveCards.map(c => renderCardRow(c, true))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
