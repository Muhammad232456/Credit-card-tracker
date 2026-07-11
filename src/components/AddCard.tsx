import { useState } from 'react';
import { CARD_TEMPLATES, CARD_INCOME_REQS } from '../data/cards';
import type { Issuer } from '../types';

interface Props {
  existingCardIds: string[];
  onAdd: (cardId: string) => void;
  onCancel: () => void;
}

const ISSUERS: Issuer[] = [
  "Amex", "TD", "CIBC", "RBC", "Scotiabank", "BMO", "National Bank", "HSBC",
  "Neo", "MBNA", "Canadian Tire", "PC Financial", "Rogers", "Tangerine",
  "Brim", "Desjardins", "Home Trust", "Meridian", "Capital One", "Walmart",
  "Simplii", "ATB",
];

const ISSUER_COLORS: Record<string, string> = {
  Amex: 'bg-[#1E3A5F] text-white',
  TD: 'bg-[#2E6B4F] text-white',
  CIBC: 'bg-[#8B3A3A] text-white',
  RBC: 'bg-[#1E4C6B] text-white',
  Scotiabank: 'bg-[#8B3A3A] text-white',
  BMO: 'bg-[#1E4C6B] text-white',
  'National Bank': 'bg-[#7A3030] text-white',
  HSBC: 'bg-[#7A2020] text-white',
  Neo: 'bg-[#4A3468] text-white',
  MBNA: 'bg-[#3E4451] text-white',
  'Canadian Tire': 'bg-[#8B3A3A] text-white',
  'PC Financial': 'bg-[#8B5A2A] text-white',
  Rogers: 'bg-[#8B3A3A] text-white',
  Tangerine: 'bg-[#B8873A] text-white',
  Brim: 'bg-[#3C3A68] text-white',
  Desjardins: 'bg-[#2E6B4F] text-white',
  'Home Trust': 'bg-[#1E5A5A] text-white',
  Meridian: 'bg-[#1E5A6B] text-white',
  'Capital One': 'bg-[#8B3A3A] text-white',
  Walmart: 'bg-[#1E4C6B] text-white',
  Simplii: 'bg-[#7A3055] text-white',
  ATB: 'bg-[#B8873A] text-white',
};

const isMobile = () => window.matchMedia('(max-width: 639px)').matches;

export default function AddCard({ existingCardIds, onAdd, onCancel }: Props) {
  const [selectedIssuer, setSelectedIssuer] = useState<Issuer | null>(null);
  const [search, setSearch] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);

  const available = CARD_TEMPLATES.filter(c => !existingCardIds.includes(c.id));

  const filtered = available.filter(c => {
    const matchesIssuer = !selectedIssuer || c.issuer === selectedIssuer;
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    return matchesIssuer && matchesSearch;
  });

  const issuerCounts = ISSUERS.reduce((acc, issuer) => {
    acc[issuer] = available.filter(c => c.issuer === issuer).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">Add a Card</h2>
        <button onClick={onCancel} className="text-ink-soft hover:text-ink text-sm">
          Cancel
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search cards..."
        className="w-full border border-line rounded-xl px-4 py-2.5 text-sm"
        autoFocus
      />

      <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:pb-0 no-scrollbar">
        <button
          onClick={() => setSelectedIssuer(null)}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            !selectedIssuer ? 'bg-ink text-white border-ink' : 'border-line text-ink-soft hover:border-ink-soft'
          }`}
        >
          All ({available.length})
        </button>
        {ISSUERS.filter(i => issuerCounts[i] > 0).map(issuer => (
          <button
            key={issuer}
            onClick={() => setSelectedIssuer(selectedIssuer === issuer ? null : issuer)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              selectedIssuer === issuer
                ? `${ISSUER_COLORS[issuer]} border-transparent`
                : 'border-line text-ink-soft hover:border-ink-soft'
            }`}
          >
            {issuer} ({issuerCounts[issuer]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-ink-soft py-8 text-sm">No cards found.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(card => (
            <button
              key={card.id}
              onClick={() => isMobile() ? onAdd(card.id) : setPendingId(card.id === pendingId ? null : card.id)}
              className={`w-full text-left border rounded-xl p-4 transition-all ${
                card.id === pendingId
                  ? 'border-brass bg-brass-soft ring-2 ring-brass'
                  : 'bg-white border-line hover:border-brass hover:bg-brass-soft'
              }`}
            >
              <div className="flex items-start justify-between gap-3 min-w-0">
                <div className="min-w-0 flex-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium mr-2 ${ISSUER_COLORS[card.issuer]}`}>
                    {card.issuer}
                  </span>
                  <span className="text-xs text-ink-soft">{card.network}</span>
                  <p className="font-semibold text-ink mt-1">{card.name}</p>
                  <p className="text-xs text-ink-soft mt-0.5">
                    {card.benefits.length} benefit{card.benefits.length !== 1 ? 's' : ''} · verified {card.lastVerified}
                  </p>
                  {CARD_INCOME_REQS[card.id] && (
                    <p className="text-xs text-amber mt-0.5 font-medium">
                      Min. income: ${(CARD_INCOME_REQS[card.id] / 1000).toFixed(0)}k
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0 max-w-[42%]">
                  <p className="font-mono font-bold text-ink text-sm">
                    {card.feeFrequency === 'monthly'
                      ? `$${(card.annualFee / 12).toFixed(2)}/mo`
                      : card.annualFee === 0 ? 'No fee' : `$${card.annualFee.toFixed(0)}/yr`}
                  </p>
                  {card.firstYearFeeWaived && (
                    <p className="text-xs text-forest font-medium">1st year free</p>
                  )}
                  {card.annualFeeNote && !card.firstYearFeeWaived && (
                    <p className="text-xs text-ink-soft leading-tight line-clamp-2">{card.annualFeeNote}</p>
                  )}
                  {card.currentOffer && (() => {
                    const r = card.currentOffer!.rating;
                    const label = r === 'all-time-high' ? 'All-Time High' : r === 'elevated' ? 'Elevated Offer' : 'Standard Offer';
                    const cls = r === 'all-time-high' ? 'text-forest' : r === 'elevated' ? 'text-orange-500' : 'text-amber';
                    return <p className={`text-xs font-medium ${cls}`}>🎁 {label}</p>;
                  })()}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {pendingId && (() => {
        const card = CARD_TEMPLATES.find(c => c.id === pendingId)!;
        return (
          <div className="sticky bottom-16 sm:bottom-0 bg-white border-t border-line rounded-b-xl px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
            <p className="text-sm text-ink truncate">
              <span className="font-semibold">{card.name}</span>
            </p>
            <button
              onClick={() => onAdd(pendingId)}
              className="shrink-0 bg-brass text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-brass transition-colors"
            >
              Add Card
            </button>
          </div>
        );
      })()}
    </div>
  );
}
