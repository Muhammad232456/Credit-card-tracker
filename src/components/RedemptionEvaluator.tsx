import { useState } from 'react';
import { POINTS_PROGRAMS } from '../data/programs';

interface Props {
  onBack: () => void;
  initialProgramId?: string;
}

const ALLIANCE_LABELS: Record<string, string> = {
  star: '★ Star Alliance',
  oneworld: '✦ Oneworld',
  skyteam: '◆ SkyTeam',
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

  const programs = POINTS_PROGRAMS.filter(p =>
    tab === 'airline'
      ? p.type === 'airline' || p.type === 'transferable'
      : p.type === 'hotel'
  );

  const selected = POINTS_PROGRAMS.find(p => p.id === programId);

  const cash = parseFloat(cashPrice) || 0;
  const pts = parseInt(points.replace(/,/g, '')) || 0;

  const cpp = cash > 0 && pts > 0 ? (cash / pts) * 100 : null;

  type Rating = 'excellent' | 'good' | 'poor';
  let rating: Rating | null = null;
  let ratingLabel = '';
  let ratingColor = '';
  let ratingBg = '';

  if (cpp !== null && selected) {
    if (selected.excellentCpp && cpp >= selected.excellentCpp) {
      rating = 'excellent';
      ratingLabel = '🟢 EXCELLENT';
      ratingColor = 'text-emerald-700';
      ratingBg = 'bg-emerald-50 border-emerald-200';
    } else if (cpp > selected.defaultCpp) {
      rating = 'good';
      ratingLabel = '🟡 GOOD';
      ratingColor = 'text-amber-700';
      ratingBg = 'bg-amber-50 border-amber-200';
    } else {
      rating = 'poor';
      ratingLabel = '🔴 POOR';
      ratingColor = 'text-red-700';
      ratingBg = 'bg-red-50 border-red-200';
    }
  }

  const cashVsBenchmark = cpp !== null && selected
    ? ((cpp - selected.defaultCpp) / 100) * pts
    : null;

  const ratingDescriptions: Record<Rating, string> = {
    excellent: `Outstanding value — well above the ${selected?.name ?? ''} benchmark. Book it!`,
    good: `Solid redemption above the benchmark. Worth using your points.`,
    poor: `Low value — at or below benchmark. Consider paying cash and saving your points for a better redemption.`,
  };

  function switchTab(t: 'airline' | 'hotel') {
    setTab(t);
    setProgramId('');
  }

  return (
    <div className="space-y-0">
      <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
        ← Back to Points
      </button>

      <div className="bg-slate-800 rounded-2xl p-6 text-white mb-4">
        <h2 className="text-lg font-semibold">Redemption Evaluator</h2>
        <p className="text-slate-400 text-sm mt-1">
          Is your redemption worth it? Enter the cash price and points required to see your CPP rating.
        </p>
      </div>

      {/* Airline / Hotel toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => switchTab('airline')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
            tab === 'airline'
              ? 'bg-slate-800 text-white border-slate-800'
              : 'border-gray-300 text-gray-600 hover:border-gray-400'
          }`}
        >
          ✈️ Airline
        </button>
        <button
          onClick={() => switchTab('hotel')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
            tab === 'hotel'
              ? 'bg-slate-800 text-white border-slate-800'
              : 'border-gray-300 text-gray-600 hover:border-gray-400'
          }`}
        >
          🏨 Hotel
        </button>
      </div>

      {/* Inputs */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            {tab === 'airline' ? 'Airline / Program' : 'Hotel Program'}
          </label>
          <select
            value={programId}
            onChange={e => setProgramId(e.target.value)}
            className="w-full mt-1.5 border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white"
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
            <p className="text-xs text-blue-600 mt-1">{selected.note}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              {tab === 'airline' ? 'Cash Price of Flight (CAD)' : 'Cash Price of Stay (CAD)'}
            </label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 850.00"
                value={cashPrice}
                onChange={e => setCashPrice(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2.5 text-sm font-mono"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Points Required</label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 55000"
              value={points}
              onChange={e => setPoints(e.target.value)}
              className="w-full mt-1.5 border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono"
            />
          </div>
        </div>

        {selected && (
          <div className="flex items-center gap-4 text-xs text-gray-500 pt-1 border-t border-gray-100">
            <span>Benchmark: <strong className="text-gray-700">{selected.defaultCpp}¢/pt</strong></span>
            {selected.excellentCpp && (
              <span>Excellent: <strong className="text-emerald-700">{selected.excellentCpp}¢/pt</strong></span>
            )}
          </div>
        )}
      </div>

      {/* Result */}
      {cpp !== null && selected && rating && (
        <div className={`mt-4 border rounded-xl p-5 ${ratingBg}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-2xl font-bold font-mono ${ratingColor}`}>
                {cpp.toFixed(2)}¢<span className="text-base font-normal"> per point</span>
              </p>
              <p className={`text-lg font-bold mt-0.5 ${ratingColor}`}>{ratingLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">vs. {selected.defaultCpp}¢ benchmark</p>
              {cashVsBenchmark !== null && (
                <p className={`font-mono font-bold text-base mt-0.5 ${cashVsBenchmark >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {cashVsBenchmark >= 0 ? '+' : ''}${cashVsBenchmark.toFixed(0)} CAD
                </p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">vs. redeeming at benchmark</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-black/5">
            {ratingDescriptions[rating]}
          </p>
        </div>
      )}

      {/* Rating guide */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Rating Guide</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-base leading-none mt-0.5">🟢</span>
            <div>
              <span className="font-semibold text-emerald-700">EXCELLENT</span>
              <span className="text-gray-500"> — ≥ excellent threshold · Outstanding value, book it!</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-base leading-none mt-0.5">🟡</span>
            <div>
              <span className="font-semibold text-amber-700">GOOD</span>
              <span className="text-gray-500"> — Above benchmark CPP · Solid redemption, go for it</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-base leading-none mt-0.5">🔴</span>
            <div>
              <span className="font-semibold text-red-700">POOR</span>
              <span className="text-gray-500"> — At or below benchmark · Consider paying cash instead</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
          Benchmarks sourced from Prince of Travel, RewardExpert & points community data (2024–25).
        </p>
      </div>
    </div>
  );
}
