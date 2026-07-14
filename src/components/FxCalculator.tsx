import { useState } from 'react';
import { CARD_TEMPLATES, getApplyUrl } from '../data/cards';
import type { UserData } from '../types';
import { trackApplyClick } from '../analytics';
import { FxIcon } from './Icons';

const FX_RATE = 0.025;

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'THB', name: 'Thai Baht' },
  { code: 'INR', name: 'Indian Rupee' },
];

interface Props {
  data: UserData;
}

export default function FxCalculator({ data }: Props) {
  const [open, setOpen] = useState(false);
  const [budgetCAD, setBudgetCAD] = useState('');
  const [currency, setCurrency] = useState('USD');

  const budget = parseFloat(budgetCAD) || 0;
  const fxFee = budget * FX_RATE;

  const heldIds = new Set(
    data.cards.filter(c => !c.status || c.status === 'active').map(c => c.cardId)
  );

  const heldNoFxCards = Array.from(heldIds)
    .map(id => CARD_TEMPLATES.find(t => t.id === id))
    .filter((t): t is NonNullable<typeof t> =>
      !!t && t.benefits.some(b => b.category === 'fx-savings')
    );

  const recommendedNoFx = CARD_TEMPLATES.filter(t =>
    !heldIds.has(t.id) &&
    !t.discontinued &&
    t.benefits.some(b => b.category === 'fx-savings') &&
    t.annualFee <= 120
  ).slice(0, 3);

  const hasSavings = heldNoFxCards.length > 0;

  return (
    <div className="bg-surface border border-line rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full px-4 py-3 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <FxIcon className="w-4 h-4 text-brass" />
          <span className="text-sm font-semibold text-ink">FX Trip Calculator</span>
          <span className="text-xs text-ink-soft hidden sm:block">· estimate foreign transaction fee savings</span>
        </div>
        <span className="text-ink-soft text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-line px-4 pb-4 pt-3 space-y-4">
          <p className="text-xs text-ink-soft">
            Most Canadian cards charge a 2.5% foreign transaction fee on non-CAD purchases.
            Enter your trip budget to see how much you save by using the right card.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-ink-soft uppercase tracking-wide">Trip Budget (CAD equivalent)</label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 3000"
                  value={budgetCAD}
                  onChange={e => setBudgetCAD(e.target.value)}
                  className="w-full border border-line rounded-lg pl-7 pr-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ink-soft"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-ink-soft uppercase tracking-wide">Spending Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full mt-1.5 border border-line rounded-lg px-3 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-ink-soft"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code}: {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {budget > 0 && (
            <div className="space-y-3">
              {/* Result banner */}
              <div className={`rounded-xl p-4 flex items-center justify-between ${
                hasSavings ? 'bg-forest-bg border border-forest' : 'bg-rust-bg border border-rust'
              }`}>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {hasSavings
                      ? `You save $${fxFee.toFixed(2)} on this trip`
                      : `You'd pay $${fxFee.toFixed(2)} in FX fees`}
                  </p>
                  <p className="text-xs text-ink-soft mt-0.5">
                    {hasSavings
                      ? `Use your ${heldNoFxCards[0].name}, no foreign transaction fee`
                      : 'None of your current cards waive the 2.5% FX fee'}
                  </p>
                  {hasSavings && heldNoFxCards.length > 1 && (
                    <p className="text-xs text-ink-soft mt-1">
                      Also no FX fee: {heldNoFxCards.slice(1).map(t => t.name).join(', ')}
                    </p>
                  )}
                </div>
                <p className={`font-mono font-bold text-2xl shrink-0 ml-4 ${hasSavings ? 'text-forest' : 'text-rust'}`}>
                  {hasSavings ? '+' : '−'}${fxFee.toFixed(2)}
                </p>
              </div>

              {/* Recommendations if no no-FX card */}
              {!hasSavings && recommendedNoFx.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2">
                    Cards that would save you ${fxFee.toFixed(2)} on this trip
                  </p>
                  <div className="space-y-2">
                    {recommendedNoFx.map(t => (
                      <div key={t.id} className="flex items-center justify-between bg-paper rounded-lg px-3 py-2.5">
                        <div>
                          <p className="text-sm font-medium text-ink">{t.name}</p>
                          <p className="text-xs text-ink-soft">
                            {t.annualFee === 0 ? 'No annual fee' : `$${t.annualFee}/yr annual fee`}
                          </p>
                        </div>
                        {getApplyUrl(t.id) ? (
                          <a
                            href={getApplyUrl(t.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackApplyClick(t.id, t.name, t.issuer, 'fx_calculator')}
                            className="text-xs bg-brass text-ink px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
                          >
                            Apply →
                          </a>
                        ) : (
                          <span className="text-xs text-ink-soft">Search online</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

<p className="text-xs text-ink-soft">
                Based on the standard 2.5% foreign transaction fee charged by most Canadian cards on non-CAD purchases.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
