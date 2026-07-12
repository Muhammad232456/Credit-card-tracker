import { useState } from 'react';
import { CARD_TEMPLATES, getApplyUrl } from '../data/cards';
import { POINTS_PROGRAMS } from '../data/programs';
import { SPEND_CATS, bestRateForCat, formatRate } from '../utils';
import { trackApplyClick } from '../analytics';

interface Props {
  onBack: () => void;
}

export default function CardComparison({ onBack }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const filtered = CARD_TEMPLATES.filter(t => {
    const q = search.toLowerCase();
    return !q || t.name.toLowerCase().includes(q) || t.issuer.toLowerCase().includes(q);
  }).slice(0, 25);

  const selected = selectedIds
    .map(id => CARD_TEMPLATES.find(t => t.id === id))
    .filter((t): t is NonNullable<typeof t> => !!t);

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id));
    } else if (selectedIds.length < 3) {
      setSelectedIds(prev => [...prev, id]);
    }
  }

  const cols = selected.length === 3 ? 'grid-cols-3' : selected.length === 2 ? 'grid-cols-2' : 'grid-cols-1';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="text-sm text-ink-soft hover:text-ink flex items-center gap-1">
          ← Back
        </button>
        <h2 className="font-semibold text-ink">Compare Cards</h2>
      </div>

      {/* Card picker */}
      <div className="bg-surface border border-line rounded-xl p-4">
        <p className="text-xs text-ink-soft mb-2">
          Select up to 3 cards to compare
          {selectedIds.length > 0 && <span className="ml-1 text-ink font-medium">({selectedIds.length}/3 selected)</span>}
        </p>
        <input
          type="text"
          placeholder="Search by name or issuer…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-ink-soft"
        />
        <div className="space-y-1 max-h-52 overflow-y-auto">
          {filtered.map(t => {
            const isSel = selectedIds.includes(t.id);
            const disabled = !isSel && selectedIds.length >= 3;
            return (
              <button
                key={t.id}
                onClick={() => toggle(t.id)}
                disabled={disabled}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
                  isSel ? 'bg-brass text-ink' :
                  disabled ? 'text-line cursor-not-allowed' :
                  'hover:bg-paper text-ink'
                }`}
              >
                <span className="truncate flex-1">{t.name}</span>
                <span className={`text-xs ml-2 shrink-0 ${isSel ? 'text-ink/70' : 'text-ink-soft'}`}>
                  {t.annualFee === 0 ? 'No fee' : `$${t.annualFee}/yr`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selected.length < 2 && (
        <p className="text-center text-sm text-ink-soft py-6">Select at least 2 cards to see the comparison</p>
      )}

      {selected.length >= 2 && (
        <div className="overflow-x-auto -mx-4 px-4 pb-2">
          <div className="space-y-3 min-w-[480px]">
          {/* Header */}
          <div className={`grid gap-2 ${cols}`}>
            {selected.map(t => (
              <div key={t.id} className="bg-surface border border-brass/40 text-ink rounded-xl p-3 text-center">
                <p className="text-xs font-semibold leading-tight truncate">{t.name}</p>
                <p className="text-ink-soft text-xs mt-0.5">{t.issuer}</p>
                <p className="font-mono font-bold text-lg mt-1">
                  {t.annualFee === 0 ? 'Free' : `$${t.annualFee}`}
                  {t.annualFee > 0 && <span className="text-ink-soft text-xs">/yr</span>}
                </p>
                {t.firstYearFeeWaived && (
                  <p className="text-forest text-xs mt-0.5">1st year free</p>
                )}
              </div>
            ))}
          </div>

          {/* Current Offers */}
          {selected.some(t => t.currentOffer) && (
            <div className="bg-surface border border-line rounded-xl overflow-hidden">
              <div className="px-4 py-2 bg-paper border-b border-line">
                <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide">Current Welcome Offer</p>
              </div>
              <div className={`grid divide-x divide-line ${cols}`}>
                {selected.map(t => {
                  const offer = t.currentOffer;
                  if (!offer) return (
                    <div key={t.id} className="p-3">
                      <p className="text-xs text-line italic">No current offer</p>
                    </div>
                  );
                  const ratingColors = {
                    'standard':      { badge: 'bg-amber-bg text-amber',   border: 'border-amber' },
                    'elevated':      { badge: 'bg-orange-100 text-orange-700',  border: 'border-orange-200' },
                    'all-time-high': { badge: 'bg-forest-bg text-forest', border: 'border-forest' },
                  };
                  const rc = offer.rating ? ratingColors[offer.rating] : ratingColors['standard'];
                  return (
                    <div key={t.id} className="p-3 space-y-1.5">
                      {offer.rating && (
                        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${rc.badge}`}>
                          {offer.rating === 'all-time-high' ? 'All-Time High' : offer.rating === 'elevated' ? 'Elevated' : 'Standard'}
                        </span>
                      )}
                      <p className="text-xs text-ink leading-snug">{offer.description}</p>
                      {offer.expiryDate && (
                        <p className="text-xs text-rust font-medium">Expires {offer.expiryDate}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Earn rates */}
          <div className="bg-surface border border-line rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-paper border-b border-line">
              <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide">Earn Rates by Category</p>
            </div>
            {SPEND_CATS.filter(c => c.id !== 'other').map(cat => (
              <div key={cat.id} className="border-b border-line last:border-0">
                <p className="text-xs text-ink-soft px-4 pt-2 pb-0.5">{cat.icon} {cat.label}</p>
                <div className={`grid gap-px bg-line ${cols}`}>
                  {selected.map(t => {
                    const { rate, cpd } = t.earningRates?.length
                      ? bestRateForCat(t.earningRates, cat.keywords, POINTS_PROGRAMS)
                      : { rate: null, cpd: 0 };
                    const isTop = selected.every(other => {
                      const { cpd: oCpd } = other.earningRates?.length
                        ? bestRateForCat(other.earningRates, cat.keywords, POINTS_PROGRAMS)
                        : { cpd: 0 };
                      return cpd >= oCpd;
                    });
                    return (
                      <div key={t.id} className={`bg-surface px-3 pb-2 text-center ${isTop && cpd > 0 ? 'bg-forest-bg' : ''}`}>
                        {rate ? (
                          <p className={`text-xs font-medium ${isTop && cpd > 0 ? 'text-forest font-semibold' : 'text-ink'}`}>
                            {formatRate(rate, cpd)}
                          </p>
                        ) : (
                          <p className="text-xs text-line">—</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div className="bg-surface border border-line rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-paper border-b border-line">
              <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide">Key Benefits</p>
            </div>
            <div className={`grid divide-x divide-line ${cols}`}>
              {selected.map(t => (
                <div key={t.id} className="p-3 space-y-1.5">
                  {t.benefits.length === 0 ? (
                    <p className="text-xs text-line italic">No tracked credits</p>
                  ) : (
                    <>
                      {t.benefits.slice(0, 5).map(b => (
                        <p key={b.id} className="text-xs text-ink leading-snug">
                          • {b.name}{b.value > 0 ? ` ($${b.value})` : ''}
                        </p>
                      ))}
                      {t.benefits.length > 5 && (
                        <p className="text-xs text-ink-soft">+{t.benefits.length - 5} more</p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Apply links */}
          <div className={`grid gap-2 ${cols}`}>
            {selected.map(t => {
              const url = getApplyUrl(t.id);
              return url ? (
                <a
                  key={t.id}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackApplyClick(t.id, t.name, t.issuer, 'comparison')}
                  className="bg-brass text-ink text-xs text-center py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity block"
                >
                  Apply — {t.issuer} →
                </a>
              ) : (
                <div key={t.id} className="bg-line text-ink-soft text-xs text-center py-2.5 rounded-xl">
                  Search online to apply
                </div>
              );
            })}
          </div>

          <p className="text-xs text-ink-soft text-center">
            Green earn rates indicate the highest for that category among the selected cards.
          </p>
          </div>
        </div>
      )}
    </div>
  );
}
