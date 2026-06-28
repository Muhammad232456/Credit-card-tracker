import { useState } from 'react';
import { getCardById } from '../data/cards';
import type { UserCard, UserData } from '../types';
import { effectiveBenefitValue, cardAge } from '../utils';
import AddCard from './AddCard';
import CardDetail from './CardDetail';

interface Props {
  data: UserData;
  update: (updater: (prev: UserData) => UserData) => void;
}

const ISSUER_COLORS: Record<string, string> = {
  Amex: 'bg-blue-900',
  TD: 'bg-green-700',
  CIBC: 'bg-red-700',
  RBC: 'bg-blue-700',
  Scotiabank: 'bg-red-600',
  BMO: 'bg-blue-600',
  'National Bank': 'bg-red-800',
  Neo: 'bg-purple-700',
  MBNA: 'bg-gray-700',
  'Canadian Tire': 'bg-red-500',
  'PC Financial': 'bg-orange-600',
  Rogers: 'bg-red-600',
  Tangerine: 'bg-orange-500',
  Brim: 'bg-indigo-600',
  Desjardins: 'bg-green-800',
  'Home Trust': 'bg-teal-700',
  Meridian: 'bg-cyan-700',
  'Capital One': 'bg-red-700',
  Walmart: 'bg-blue-800',
  Simplii: 'bg-pink-700',
  ATB: 'bg-amber-700',
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

export default function CardList({ data, update }: Props) {
  const [addingCard, setAddingCard] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  function addCard(cardId: string) {
    update(prev => ({
      ...prev,
      cards: [...prev.cards, { cardId, benefitUsage: {}, status: 'active' as const }],
    }));
    setAddingCard(false);
    setSelectedCardId(cardId);
  }

  function removeCard(cardId: string) {
    update(prev => ({ ...prev, cards: prev.cards.filter(c => c.cardId !== cardId) }));
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
    const headerBg = ISSUER_COLORS[template.issuer] ?? 'bg-slate-800';
    const feeFreq = template.feeFrequency ?? 'annual';

    const renewal = getEffectiveRenewal(userCard, feeFreq);
    const renewalDays = renewal
      ? Math.ceil((new Date(renewal).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    return (
      <button
        key={userCard.cardId}
        onClick={() => setSelectedCardId(userCard.cardId)}
        className={`w-full text-left bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow ${dimmed ? 'opacity-50' : ''}`}
      >
        <div className={`${headerBg} px-4 py-3 flex items-center justify-between`}>
          <div>
            <p className="text-xs text-white/70 uppercase tracking-wide">{template.issuer}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-white">{template.name}</p>
              {dimmed && <span className="text-xs text-white/60 bg-white/10 px-1.5 py-0.5 rounded-full">Inactive</span>}
              {template.firstYearFeeWaived && !dimmed && (
                <span className="text-xs text-emerald-300 bg-white/10 px-1.5 py-0.5 rounded-full">1st yr free</span>
              )}
            </div>
            {userCard.openedDate && (
              <p className="text-xs text-white/50 mt-0.5">{cardAge(userCard.openedDate, userCard.closedDate)}</p>
            )}
          </div>
          <div className="text-right">
            <p className="font-mono text-white font-bold">
              {feeFreq === 'monthly'
                ? `$${(template.annualFee / 12).toFixed(2)}/mo`
                : template.annualFee === 0 ? 'No fee' : `$${template.annualFee.toFixed(0)}/yr`}
            </p>
          </div>
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            {template.benefits.length > 0 ? (
              <>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-emerald-600">${totalValue.toFixed(0)}</span>
                  <span className="text-gray-400"> of ${template.annualFee.toFixed(0)} fee recovered</span>
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="w-24 bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        recoveryPct >= 100 ? 'bg-emerald-500' : recoveryPct >= 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, recoveryPct)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{recoveryPct}%</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400">No trackable credits</p>
            )}
            {(userCard.supplementaryCards?.length ?? 0) > 0 && (
              <p className="text-xs text-blue-600 mt-1">
                👤 {userCard.supplementaryCards!.length} supplementary
              </p>
            )}
          </div>
          <div className="text-right">
            {renewalDays !== null && !dimmed && (
              <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                renewalDays < 30 ? 'bg-red-100 text-red-700' :
                renewalDays < 60 ? 'bg-amber-100 text-amber-700' :
                'bg-green-100 text-green-700'
              }`}>
                Renews in {renewalDays}d
              </div>
            )}
            {renewalDays === null && !dimmed && !userCard.openedDate && (
              <span className="text-xs text-gray-400">Set opened date →</span>
            )}
            {userCard.creditLimit && (
              <p className="text-xs text-gray-400 mt-1 font-mono">${userCard.creditLimit.toLocaleString()} limit</p>
            )}
          </div>
        </div>
      </button>
    );
  }

  if (data.cards.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-5xl mb-4">💳</p>
        <p className="text-lg font-semibold text-gray-800">No cards yet</p>
        <p className="text-sm text-gray-500 mt-1">Add your first Canadian credit card to start tracking benefits.</p>
        <button
          onClick={() => setAddingCard(true)}
          className="mt-6 bg-slate-800 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-700 transition-colors"
        >
          Add Your First Card
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active cards */}
      <div className="space-y-3">
        {activeCards.map(c => renderCardRow(c, false))}
      </div>

      <button
        onClick={() => setAddingCard(true)}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm font-medium"
      >
        + Add Another Card
      </button>

      {/* Inactive cards */}
      {inactiveCards.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowInactive(v => !v)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            📁 {inactiveCards.length} inactive card{inactiveCards.length > 1 ? 's' : ''}
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
