import { useState } from 'react';
import { getApplyUrl } from '../data/cards';
import { trackApplyClick } from '../analytics';

type Goal = 'cashback' | 'travel' | 'both';
type SpendRange = 'low' | 'medium' | 'high';

interface Rec { id: string; name: string; issuer: string; why: string; fee: number; }

const RECS: Record<Goal, Record<SpendRange, Rec[]>> = {
  cashback: {
    low: [
      { id: 'tangerine-money-back', name: 'Tangerine Money-Back', issuer: 'Tangerine', why: '2% on 3 categories you choose — no annual fee, straightforward cash back.', fee: 0 },
      { id: 'neo-mastercard', name: 'Neo Mastercard', issuer: 'Neo', why: 'Up to 5% back at Neo partner merchants, no annual fee.', fee: 0 },
    ],
    medium: [
      { id: 'bmo-cashback-world-elite', name: 'BMO CashBack World Elite', issuer: 'BMO', why: '5% on groceries, 4% transit, 3% gas — highest cash back rates in Canada.', fee: 120 },
      { id: 'tangerine-money-back', name: 'Tangerine Money-Back', issuer: 'Tangerine', why: '2% on 3 categories — great no-fee companion card.', fee: 0 },
    ],
    high: [
      { id: 'bmo-cashback-world-elite', name: 'BMO CashBack World Elite', issuer: 'BMO', why: '5% groceries, 4% transit, 3% gas — pays for itself quickly at higher spend.', fee: 120 },
      { id: 'scotia-momentum-infinite', name: 'Scotia Momentum Infinite', issuer: 'Scotiabank', why: '4% groceries and transit, 2% gas — strong all-around cash back card.', fee: 120 },
    ],
  },
  travel: {
    low: [
      { id: 'amex-cobalt', name: 'Amex Cobalt', issuer: 'Amex', why: '5× MR on dining and groceries — the best points earn rate in Canada per dollar.', fee: 155.88 },
      { id: 'cibc-aeroplan-visa', name: 'CIBC Aeroplan Visa', issuer: 'CIBC', why: 'No annual fee entry into Aeroplan — start earning Air Canada miles right away.', fee: 0 },
    ],
    medium: [
      { id: 'amex-cobalt', name: 'Amex Cobalt', issuer: 'Amex', why: '5× MR on dining and groceries — earns the most flexible travel points in Canada.', fee: 155.88 },
      { id: 'td-aeroplan-infinite', name: 'TD Aeroplan Visa Infinite', issuer: 'TD', why: 'Strong Aeroplan earn + Air Canada perks like a free checked bag.', fee: 139 },
    ],
    high: [
      { id: 'amex-cobalt', name: 'Amex Cobalt', issuer: 'Amex', why: '5× MR on dining and groceries — the anchor of any serious travel points setup.', fee: 155.88 },
      { id: 'td-aeroplan-infinite-privilege', name: 'TD Aeroplan Infinite Privilege', issuer: 'TD', why: 'Premium Aeroplan card with Maple Leaf Club lounge access and 3× on Air Canada.', fee: 599 },
    ],
  },
  both: {
    low: [
      { id: 'amex-cobalt', name: 'Amex Cobalt', issuer: 'Amex', why: '5× MR on dining and groceries — points that transfer to airlines or redeem like cash.', fee: 155.88 },
      { id: 'rbc-cashback-mastercard', name: 'RBC Cash Back Mastercard', issuer: 'RBC', why: 'No-fee cash back on groceries — solid backup for when Amex isn\'t accepted.', fee: 0 },
    ],
    medium: [
      { id: 'amex-cobalt', name: 'Amex Cobalt', issuer: 'Amex', why: '5× MR on dining and groceries — most flexible earn card in Canada.', fee: 155.88 },
      { id: 'bmo-cashback-world-elite', name: 'BMO CashBack World Elite', issuer: 'BMO', why: '5% cash back on groceries — pairs with Cobalt to cover non-dining spend.', fee: 120 },
    ],
    high: [
      { id: 'amex-cobalt', name: 'Amex Cobalt', issuer: 'Amex', why: '5× MR on dining and groceries — the best earn-rate card in Canada, period.', fee: 155.88 },
      { id: 'scotia-gold-amex', name: 'Scotiabank Gold Amex', issuer: 'Scotiabank', why: '6× Scene+ on dining and groceries, no FX fee — excellent all-around card.', fee: 120 },
    ],
  },
};

interface Props {
  onComplete: (goal: Goal) => void;
  onSkip: () => void;
}

export default function OnboardingQuiz({ onComplete, onSkip }: Props) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [spendRange, setSpendRange] = useState<SpendRange | null>(null);

  const recs = goal && spendRange ? RECS[goal][spendRange] : null;

  if (step === 2 && recs && goal) {
    return (
      <div className="space-y-6 py-4">
        <div className="text-center">
          <p className="text-4xl mb-3">🎉</p>
          <h2 className="text-xl font-bold text-ink">Your Starter Stack</h2>
          <p className="text-ink-soft text-sm mt-1">Based on your goal and spending level</p>
        </div>
        <div className="space-y-3">
          {recs.map((rec, i) => (
            <div key={rec.id} className="bg-white border border-line rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-xs font-bold text-line mt-0.5">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink text-sm">{rec.name}</p>
                  <p className="text-xs text-ink-soft mt-0.5">{rec.issuer} · {rec.fee === 0 ? 'No annual fee' : `$${rec.fee.toFixed(0)}/yr`}</p>
                  <p className="text-xs text-ink-soft mt-1.5 leading-relaxed">{rec.why}</p>
                </div>
                {getApplyUrl(rec.id) && (
                  <a
                    href={getApplyUrl(rec.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackApplyClick(rec.id, rec.name, rec.issuer, 'quiz')}
                    className="shrink-0 bg-ink text-white text-xs px-3 py-2 rounded-lg font-medium hover:bg-ink transition-colors"
                  >
                    Apply →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-center text-ink-soft">
          Add cards you already hold in the Cards tab to start tracking benefits and earn.
        </p>
        <button
          onClick={() => onComplete(goal)}
          className="w-full bg-ink text-white py-3 rounded-xl font-semibold hover:bg-ink transition-colors"
        >
          Go to Dashboard →
        </button>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="space-y-6 py-4">
        <div className="text-center">
          <p className="text-4xl mb-3">💰</p>
          <h2 className="text-xl font-bold text-ink">What's your total monthly card spend?</h2>
          <p className="text-ink-soft text-sm mt-1">Across all purchases — groceries, dining, travel, etc.</p>
        </div>
        <div className="space-y-3">
          {([
            { id: 'low',    label: 'Under $1,000/mo',      sub: 'No-fee cards will likely serve you best' },
            { id: 'medium', label: '$1,000 – $3,000/mo',   sub: 'Mid-tier cards will pay for themselves' },
            { id: 'high',   label: 'Over $3,000/mo',       sub: 'Premium cards earn more than they cost' },
          ] as { id: SpendRange; label: string; sub: string }[]).map(opt => (
            <button
              key={opt.id}
              onClick={() => { setSpendRange(opt.id); setStep(2); }}
              className="w-full text-left bg-white border-2 border-line rounded-xl p-4 hover:border-ink-soft transition-colors"
            >
              <p className="font-semibold text-ink">{opt.label}</p>
              <p className="text-xs text-ink-soft mt-0.5">{opt.sub}</p>
            </button>
          ))}
        </div>
        <button onClick={() => setStep(0)} className="w-full text-center text-sm text-ink-soft hover:text-ink-soft py-2">
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <div className="text-center">
        <p className="text-5xl mb-3">🍁</p>
        <h1 className="text-2xl font-bold text-ink">Canadian Credit Card Tracker</h1>
        <p className="text-ink-soft text-sm mt-2 max-w-sm mx-auto">
          Let's find the right cards for you. What's your main goal?
        </p>
      </div>
      <div className="space-y-3">
        {([
          { id: 'cashback', icon: '💵', label: 'Earn Cash Back',       sub: 'Get money back on everyday purchases — simple and straightforward' },
          { id: 'travel',   icon: '✈️', label: 'Earn Travel Points',   sub: 'Collect points and miles to pay for flights and hotels' },
          { id: 'both',     icon: '🎯', label: 'Maximize Everything',  sub: 'Best of both worlds — mix of travel points and cash back' },
        ] as { id: Goal; icon: string; label: string; sub: string }[]).map(opt => (
          <button
            key={opt.id}
            onClick={() => { setGoal(opt.id); setStep(1); }}
            className="w-full text-left bg-white border-2 border-line rounded-xl p-4 hover:border-ink-soft transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl shrink-0">{opt.icon}</span>
              <div>
                <p className="font-semibold text-ink">{opt.label}</p>
                <p className="text-xs text-ink-soft mt-0.5">{opt.sub}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      <button onClick={onSkip} className="w-full text-center text-sm text-ink-soft hover:text-ink-soft py-2">
        Skip — I'll set up manually
      </button>
    </div>
  );
}
