import { useState, useEffect } from 'react';
import { TRANSFER_PARTNERS } from '../data/transfers';
import { POINTS_PROGRAMS } from '../data/programs';
import { trackTransferSourceViewed } from '../analytics';

interface Props {
  focusProgram?: string;
}

const ALLIANCE_COLORS: Record<string, string> = {
  star: 'bg-yellow-100 text-yellow-800',
  oneworld: 'bg-red-100 text-red-800',
  skyteam: 'bg-blue-100 text-blue-800',
};

const ISSUER_COLORS: Record<string, string> = {
  'amex-mr': 'border-blue-700 bg-blue-50',
  'rbc-avion': 'border-blue-500 bg-blue-50',
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
      <div className="bg-slate-800 rounded-2xl p-6 text-white">
        <h2 className="text-lg font-semibold">Transfer Partner Map</h2>
        <p className="text-slate-400 text-sm mt-1">
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
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              {prog?.name}
            </button>
          );
        })}
      </div>

      {sourceProgram && (
        <div className="text-center py-2">
          <span className="inline-block bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-semibold">
            {sourceProgram.name}
          </span>
          {sourceProgram.note && (
            <p className="text-xs text-gray-500 mt-2">{sourceProgram.note}</p>
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
              className={`bg-white border rounded-xl p-4 relative ${
                isExpiring ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            >
              {isExpiring && (
                <div className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  ENDING {route.expiryDate}
                </div>
              )}
              {isOverlap && (
                <div className="absolute top-3 left-3 bg-slate-600 text-white text-xs px-2 py-0.5 rounded-full">
                  Also via {activeSource === 'amex-mr' ? 'RBC Avion' : 'Amex MR'}
                </div>
              )}

              <div className={`flex items-start justify-between gap-4 ${isOverlap ? 'mt-6' : ''}`}>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{partner.name}</span>
                    {partner.alliance && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${ALLIANCE_COLORS[partner.alliance]}`}>
                        {partner.alliance}
                      </span>
                    )}
                    <span className="text-xs text-gray-500 capitalize">{partner.type}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{route.notes}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono font-bold text-lg text-gray-900">
                    {route.ratio[0]}:{route.ratio[1]}
                  </p>
                  <p className="text-xs text-gray-500">{route.transferSpeed}</p>
                  <p className="text-xs text-gray-400">min {route.minimumTransfer.toLocaleString()}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {activeSource === 'amex-mr' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-blue-800">Overlap Tip</p>
          <p className="text-xs text-blue-700 mt-1">
            Both Amex MR and RBC Avion transfer 1:1 to BA Avios and Cathay Asia Miles. Burn RBC Avion on these overlapping partners and save Amex MR for exclusive partners (Aeroplan, Flying Blue, Delta, Etihad).
          </p>
        </div>
      )}

    </div>
  );
}
