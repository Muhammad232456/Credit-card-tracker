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
  Amex: 'bg-blue-900 text-white',
  TD: 'bg-green-700 text-white',
  CIBC: 'bg-red-700 text-white',
  RBC: 'bg-blue-700 text-white',
  Scotiabank: 'bg-red-600 text-white',
  BMO: 'bg-blue-600 text-white',
  'National Bank': 'bg-red-800 text-white',
  HSBC: 'bg-red-900 text-white',
  Neo: 'bg-purple-700 text-white',
  MBNA: 'bg-gray-700 text-white',
  'Canadian Tire': 'bg-red-500 text-white',
  'PC Financial': 'bg-orange-600 text-white',
  Rogers: 'bg-red-600 text-white',
  Tangerine: 'bg-orange-500 text-white',
  Brim: 'bg-indigo-600 text-white',
  Desjardins: 'bg-green-800 text-white',
  'Home Trust': 'bg-teal-700 text-white',
  Meridian: 'bg-cyan-700 text-white',
  'Capital One': 'bg-red-700 text-white',
  Walmart: 'bg-blue-800 text-white',
  Simplii: 'bg-pink-700 text-white',
  ATB: 'bg-amber-700 text-white',
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
        <h2 className="text-lg font-bold text-gray-900">Add a Card</h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 text-sm">
          Cancel
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search cards..."
        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
        autoFocus
      />

      <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:pb-0 no-scrollbar">
        <button
          onClick={() => setSelectedIssuer(null)}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            !selectedIssuer ? 'bg-slate-800 text-white border-slate-800' : 'border-gray-300 text-gray-600 hover:border-gray-400'
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
                : 'border-gray-300 text-gray-600 hover:border-gray-400'
            }`}
          >
            {issuer} ({issuerCounts[issuer]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-8 text-sm">No cards found.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(card => (
            <button
              key={card.id}
              onClick={() => isMobile() ? onAdd(card.id) : setPendingId(card.id === pendingId ? null : card.id)}
              className={`w-full text-left border rounded-xl p-4 transition-all ${
                card.id === pendingId
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-start justify-between gap-3 min-w-0">
                <div className="min-w-0 flex-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium mr-2 ${ISSUER_COLORS[card.issuer]}`}>
                    {card.issuer}
                  </span>
                  <span className="text-xs text-gray-500">{card.network}</span>
                  <p className="font-semibold text-gray-900 mt-1">{card.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {card.benefits.length} benefit{card.benefits.length !== 1 ? 's' : ''} · verified {card.lastVerified}
                  </p>
                  {CARD_INCOME_REQS[card.id] && (
                    <p className="text-xs text-amber-600 mt-0.5 font-medium">
                      Min. income: ${(CARD_INCOME_REQS[card.id] / 1000).toFixed(0)}k
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0 max-w-[42%]">
                  <p className="font-mono font-bold text-gray-900 text-sm">
                    {card.feeFrequency === 'monthly'
                      ? `$${(card.annualFee / 12).toFixed(2)}/mo`
                      : card.annualFee === 0 ? 'No fee' : `$${card.annualFee.toFixed(0)}/yr`}
                  </p>
                  {card.firstYearFeeWaived && (
                    <p className="text-xs text-emerald-600 font-medium">1st year free</p>
                  )}
                  {card.annualFeeNote && !card.firstYearFeeWaived && (
                    <p className="text-xs text-gray-500 leading-tight line-clamp-2">{card.annualFeeNote}</p>
                  )}
                  {card.currentOffer && (() => {
                    const r = card.currentOffer!.rating;
                    const label = r === 'all-time-high' ? 'All-Time High' : r === 'elevated' ? 'Elevated Offer' : 'Standard Offer';
                    const cls = r === 'all-time-high' ? 'text-emerald-600' : r === 'elevated' ? 'text-orange-500' : 'text-amber-600';
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
          <div className="sticky bottom-16 sm:bottom-0 bg-white border-t border-gray-200 rounded-b-xl px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
            <p className="text-sm text-gray-700 truncate">
              <span className="font-semibold">{card.name}</span>
            </p>
            <button
              onClick={() => onAdd(pendingId)}
              className="shrink-0 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Add Card
            </button>
          </div>
        );
      })()}
    </div>
  );
}
