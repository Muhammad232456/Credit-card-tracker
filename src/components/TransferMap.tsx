import { useState, useEffect } from 'react';
import { TRANSFER_PARTNERS } from '../data/transfers';
import { POINTS_PROGRAMS } from '../data/programs';
import { trackTransferSourceViewed } from '../analytics';

interface Props {
  focusProgram?: string;
}

const ALLIANCE_COLORS: Record<string, string> = {
  star: 'bg-amber-bg text-amber',
  oneworld: 'bg-rust-bg text-rust',
  skyteam: 'bg-brass-soft text-brass',
};

const ISSUER_COLORS: Record<string, string> = {
  'amex-mr': 'border-brass bg-brass-soft',
  'rbc-avion': 'border-brass bg-brass-soft',
};

export default function TransferMap({ focusProgram }: Props) {
  const [activeSource, setActiveSource] = useState<string>(focusProgram ?? 'amex-mr');

  useEffect(() => {
    trackTransferSourceViewed(activeSource);
  }, [activeSource]);

  const sourceProgram = POINTS_PROGRAMS.find(p => p.id === activeSource);
  const partners = TRANSFER_PARTNERS.filter(tp =>
    tp.transfersFrom.some(r => r.sourceProgram === activeSource)
  );

  const overlap = ['avios', 'asia-miles'];

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-brass/40 rounded-2xl p-6 text-ink">
        <h2 className="text-lg font-semibold">Transfer Partner Map</h2>
        <p className="text-ink-soft text-sm mt-1">
          Canada has only 2 transferable currencies: Amex MR and RBC Avion. All other programs (Scene+, TD, BMO, NBC, HSBC) are portal-only with no airline/hotel transfers.
        </p>
      </div>

      <div className="flex gap-2">
        {['amex-mr', 'rbc-avion'].map(id => {
          const prog = POINTS_PROGRAMS.find(p => p.id === id);
          return (
            <button
              key={id}
              onClick={() => setActiveSource(id)}
              className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium text-sm transition-all ${
                activeSource === id
                  ? `${ISSUER_COLORS[id]} border-opacity-100`
                  : 'border-line bg-surface text-ink-soft hover:border-line'
              }`}
            >
              {prog?.name}
            </button>
          );
        })}
      </div>

      {sourceProgram && (
        <div className="text-center py-2">
          <span className="inline-block bg-brass text-ink px-4 py-2 rounded-full text-sm font-semibold">
            {sourceProgram.name}
          </span>
          {sourceProgram.note && (
            <p className="text-xs text-ink-soft mt-2">{sourceProgram.note}</p>
          )}
        </div>
      )}

      <div className="grid gap-3">
        {partners.map(partner => {
          const route = partner.transfersFrom.find(r => r.sourceProgram === activeSource)!;
          const isExpiring = route.expiryDate && new Date(route.expiryDate) <= new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
          const isOverlap = overlap.includes(partner.id);

          return (
            <div
              key={partner.id}
              className={`bg-surface border rounded-xl p-4 relative ${
                isExpiring ? 'border-rust bg-rust-bg' : 'border-line'
              }`}
            >
              {isExpiring && (
                <div className="absolute top-3 right-3 bg-rust text-paper text-xs px-2 py-0.5 rounded-full font-bold">
                  ENDING {route.expiryDate}
                </div>
              )}
              {isOverlap && (
                <div className="absolute top-3 left-3 bg-ink-soft text-paper text-xs px-2 py-0.5 rounded-full">
                  Also via {activeSource === 'amex-mr' ? 'RBC Avion' : 'Amex MR'}
                </div>
              )}

              <div className={`flex items-start justify-between gap-4 ${isOverlap ? 'mt-6' : ''}`}>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-ink">{partner.name}</span>
                    {partner.alliance && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${ALLIANCE_COLORS[partner.alliance]}`}>
                        {partner.alliance}
                      </span>
                    )}
                    <span className="text-xs text-ink-soft capitalize">{partner.type}</span>
                  </div>
                  <p className="text-xs text-ink-soft mt-1">{route.notes}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono font-bold text-lg text-ink">
                    {route.ratio[0]}:{route.ratio[1]}
                  </p>
                  <p className="text-xs text-ink-soft">{route.transferSpeed}</p>
                  <p className="text-xs text-ink-soft">min {route.minimumTransfer.toLocaleString()}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {activeSource === 'amex-mr' && (
        <div className="bg-brass-soft border border-brass rounded-xl p-4">
          <p className="text-sm font-semibold text-brass">Overlap Tip</p>
          <p className="text-xs text-brass mt-1">
            Both Amex MR and RBC Avion transfer 1:1 to BA Avios and Cathay Asia Miles. Burn RBC Avion on these overlapping partners and save Amex MR for exclusive partners (Aeroplan, Flying Blue, Delta, Etihad).
          </p>
        </div>
      )}

    </div>
  );
}
