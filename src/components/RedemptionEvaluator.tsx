import { useState, useEffect, useRef } from 'react';
import { POINTS_PROGRAMS } from '../data/programs';
import { trackRedemptionEvaluated } from '../analytics';
import { PlaneIcon, HotelIcon, LightbulbIcon } from './Icons';

interface Props {
  onBack?: () => void;
  initialProgramId?: string;
}

const ALLIANCE_LABELS: Record<string, string> = {
  star: 'Star Alliance',
  oneworld: 'Oneworld',
  skyteam: 'SkyTeam',
};

export default function RedemptionEvaluator({ onBack, initialProgramId }: Props) {
  const [tab, setTab] = useState<'airline' | 'hotel'>(
    initialProgramId
      ? (POINTS_PROGRAMS.find(p => p.id === initialProgramId)?.type === 'hotel' ? 'hotel' : 'airline')
      : 'airline'
  );
  const [programId, setProgramId] = useState(initialProgramId ?? '');
  const [cashPrice, setCashPrice] = useState('');
  const [points, setPoints] = useState('');
  const [taxes, setTaxes] = useState('');

  const programs = POINTS_PROGRAMS.filter(p =>
    tab === 'airline'
      ? p.type === 'airline' || p.type === 'transferable'
      : p.type === 'hotel'
  );

  const selected = POINTS_PROGRAMS.find(p => p.id === programId);

  const cash = parseFloat(cashPrice) || 0;
  const pts = parseInt(points.replace(/,/g, '')) || 0;
  const taxAmt = parseFloat(taxes) || 0;

  // Effective value of the redemption = what you'd otherwise have to pay cash
  // CPP is based on net savings (cash price minus taxes you still pay)
  const netSavings = cash > 0 && taxAmt >= 0 ? cash - taxAmt : cash;
  const cpp = netSavings > 0 && pts > 0 ? (netSavings / pts) * 100 : null;
  const hasTaxes = taxAmt > 0;

  type Rating = 'excellent' | 'good' | 'poor';
  let rating: Rating | null = null;
  let ratingLabel = '';
  let ratingColor = '';
  let ratingBg = '';

  if (cpp !== null && selected) {
    if (selected.excellentCpp && cpp >= selected.excellentCpp) {
      rating = 'excellent';
      ratingLabel = 'EXCELLENT';
      ratingColor = 'text-forest';
      ratingBg = 'bg-forest-bg border-forest';
    } else if (cpp > selected.defaultCpp) {
      rating = 'good';
      ratingLabel = 'GOOD';
      ratingColor = 'text-amber';
      ratingBg = 'bg-amber-bg border-amber';
    } else {
      rating = 'poor';
      ratingLabel = 'POOR';
      ratingColor = 'text-rust';
      ratingBg = 'bg-rust-bg border-rust';
    }
  }

  const cashVsBenchmark = cpp !== null && selected
    ? ((cpp - selected.defaultCpp) / 100) * pts
    : null;

  const ratingDescriptions: Record<Rating, string> = {
    excellent: `Use your points: outstanding value, one of the best uses of these points.`,
    good: `Use your points, solid value above benchmark.`,
    poor: `Pay cash instead. Save your points for a better redemption.`,
  };

  const trackedRef = useRef<string | null>(null);
  useEffect(() => {
    if (cpp === null || rating === null || !selected) return;
    const key = `${programId}-${cpp.toFixed(4)}-${rating}`;
    if (trackedRef.current === key) return;
    trackedRef.current = key;
    const timer = setTimeout(() => {
      trackRedemptionEvaluated(programId, cpp, rating, cash, pts);
    }, 800);
    return () => clearTimeout(timer);
  }, [cpp, rating, programId, cash, pts, selected]);

  function switchTab(t: 'airline' | 'hotel') {
    setTab(t);
    setProgramId('');
  }

  return (
    <div className="space-y-0">
      {onBack && (
        <button onClick={onBack} className="text-sm text-ink-soft hover:text-ink mb-4 flex items-center gap-1">
          ← Back to Points
        </button>
      )}

      <div className="bg-surface border border-brass/40 rounded-2xl p-6 text-ink mb-4">
        <h2 className="text-lg font-semibold">Redemption Evaluator</h2>
        <p className="text-ink-soft text-sm mt-1">
          Compare using points vs paying cash, taxes included.
        </p>
      </div>

      {/* Airline / Hotel toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => switchTab('airline')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors flex items-center justify-center gap-1.5 ${
            tab === 'airline'
              ? 'bg-brass text-ink border-brass'
              : 'border-line text-ink-soft hover:border-ink-soft'
          }`}
        >
          <PlaneIcon className="w-4 h-4" /> Airline
        </button>
        <button
          onClick={() => switchTab('hotel')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors flex items-center justify-center gap-1.5 ${
            tab === 'hotel'
              ? 'bg-brass text-ink border-brass'
              : 'border-line text-ink-soft hover:border-ink-soft'
          }`}
        >
          <HotelIcon className="w-4 h-4" /> Hotel
        </button>
      </div>

      {/* Inputs */}
      <div className="bg-surface border border-line rounded-xl p-4 space-y-4">
        <div>
          <label className="text-xs font-medium text-ink-soft uppercase tracking-wide">
            {tab === 'airline' ? 'Airline / Program' : 'Hotel Program'}
          </label>
          <select
            value={programId}
            onChange={e => setProgramId(e.target.value)}
            className="w-full mt-1.5 border border-line rounded-lg px-3 py-2.5 text-sm bg-surface"
          >
            <option value="">Select a program…</option>
            {programs.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.alliance ? ` (${ALLIANCE_LABELS[p.alliance] ?? p.alliance})` : ''}
              </option>
            ))}
          </select>
          {selected?.note && (
            <p className="text-xs text-brass mt-1">{selected.note}</p>
          )}
          {selected?.sweetSpots && (
            <p className="text-xs text-amber bg-amber-bg rounded-lg px-2.5 py-1.5 mt-1.5 flex items-start gap-1.5">
              <LightbulbIcon className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {selected.sweetSpots}
            </p>
          )}
        </div>

        {/* Cash price + points */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-ink-soft uppercase tracking-wide">
              {tab === 'airline' ? 'Full Cash Price (CAD)' : 'Full Cash Price (CAD)'}
            </label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft text-sm">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 850.00"
                value={cashPrice}
                onChange={e => setCashPrice(e.target.value)}
                className="w-full border border-line rounded-lg pl-7 pr-3 py-2.5 text-sm font-mono"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-ink-soft uppercase tracking-wide">Points Required</label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 55000"
              value={points}
              onChange={e => setPoints(e.target.value)}
              className="w-full mt-1.5 border border-line rounded-lg px-3 py-2.5 text-sm font-mono"
            />
          </div>
        </div>

        {/* Taxes field */}
        <div>
          <label className="text-xs font-medium text-ink-soft uppercase tracking-wide">
            Taxes &amp; Fees Out of Pocket (CAD)
            <span className="ml-1 font-normal text-ink-soft normal-case">(optional)</span>
          </label>
          <div className="relative mt-1.5">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft text-sm">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 120.00"
              value={taxes}
              onChange={e => setTaxes(e.target.value)}
              className="w-full border border-line rounded-lg pl-7 pr-3 py-2.5 text-sm font-mono"
            />
          </div>
          <p className="text-xs text-ink-soft mt-1">
            Carrier-imposed fees, airport taxes, surcharges you must pay even when redeeming points.
          </p>
        </div>

        {selected && (
          <div className="flex items-center gap-4 text-xs text-ink-soft pt-1 border-t border-line">
            <span>Benchmark: <strong className="text-ink">{selected.defaultCpp}¢/pt</strong></span>
            {selected.excellentCpp && (
              <span>Excellent: <strong className="text-forest">{selected.excellentCpp}¢/pt</strong></span>
            )}
          </div>
        )}
      </div>

      {/* Cash vs Points comparison */}
      {cash > 0 && pts > 0 && (
        <div className="mt-4 bg-surface border border-line rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-paper border-b border-line">
            <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide">Cash vs Points Comparison</p>
          </div>
          <div className="divide-y divide-line">
            {/* Option A: Pay cash */}
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-ink">Option A: Pay cash</p>
                <p className="text-xs text-ink-soft mt-0.5">No points used, full price</p>
              </div>
              <p className="font-mono font-bold text-lg text-ink">${cash.toFixed(2)}</p>
            </div>
            {/* Option B: Use points */}
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-ink">Option B: Use points</p>
                <p className="text-xs text-ink-soft mt-0.5">
                  {pts.toLocaleString()} pts
                  {hasTaxes ? ` + $${taxAmt.toFixed(2)} taxes/fees` : ' (no taxes entered)'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-lg text-ink">
                  {hasTaxes ? `$${taxAmt.toFixed(2)}` : '$0'}
                </p>
                <p className="text-xs text-ink-soft">out of pocket</p>
              </div>
            </div>
            {/* Benchmark verdict */}
            {cashVsBenchmark !== null && (
              <div className={`flex items-center justify-between px-4 py-3 ${cashVsBenchmark >= 0 ? 'bg-forest-bg' : 'bg-rust-bg'}`}>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {cashVsBenchmark >= 0 ? 'Extra value vs. best redemption' : 'Value lost vs. best redemption'}
                  </p>
                  <p className="text-xs text-ink-soft mt-0.5">
                    {pts.toLocaleString()} pts at {selected?.defaultCpp}¢ benchmark = ${((pts * (selected?.defaultCpp ?? 0)) / 100).toFixed(0)}
                  </p>
                </div>
                <p className={`font-mono font-bold text-lg ${cashVsBenchmark >= 0 ? 'text-forest' : 'text-rust'}`}>
                  {cashVsBenchmark >= 0 ? '+' : ''}${cashVsBenchmark.toFixed(0)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CPP Result */}
      {cpp !== null && selected && rating && (
        <div className={`mt-4 border rounded-xl p-5 ${ratingBg}`}>
          <p className={`text-base font-bold mb-3 ${ratingColor}`}>
            {ratingDescriptions[rating]}
          </p>
          <div className="flex items-center gap-4 pt-3 border-t border-black/5">
            <p className={`text-2xl font-bold font-mono ${ratingColor}`}>
              {cpp.toFixed(2)}¢<span className="text-base font-normal"> per point</span>
            </p>
            <p className={`text-lg font-bold ${ratingColor}`}>{ratingLabel}</p>
          </div>
          {hasTaxes && (
            <p className="text-xs text-ink-soft mt-1">effective CPP after taxes</p>
          )}
        </div>
      )}

      {/* Rating guide */}
      <div className="bg-surface border border-line rounded-xl p-4 mt-4">
        <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-3">Rating Guide</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-forest shrink-0 mt-1.5" />
            <div>
              <span className="font-semibold text-forest">EXCELLENT</span>
              <span className="text-ink-soft">: ≥ excellent threshold · Outstanding value, book it!</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber shrink-0 mt-1.5" />
            <div>
              <span className="font-semibold text-amber">GOOD</span>
              <span className="text-ink-soft">: above benchmark CPP · Solid redemption, go for it</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-rust shrink-0 mt-1.5" />
            <div>
              <span className="font-semibold text-rust">POOR</span>
              <span className="text-ink-soft">: at or below benchmark · Consider paying cash instead</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-ink-soft mt-3 pt-3 border-t border-line">
          CPP is calculated on net savings (cash price minus taxes). Benchmarks from Prince of Travel, RewardExpert & points community data (2024–25).
        </p>
      </div>
    </div>
  );
}
