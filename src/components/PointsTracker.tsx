import { useState, useRef, useEffect } from 'react';
import { POINTS_PROGRAMS } from '../data/programs';
import type { UserData, PointsBalance } from '../types';
import { trackProgramAdded, trackProgramRemoved, trackBalanceUpdated, updatePersonProperties } from '../analytics';

interface Props {
  data: UserData;
  update: (updater: (prev: UserData) => UserData) => void;
  onViewTransfers: (programId: string) => void;
  onEvaluate: (programId?: string) => void;
}

const PROGRAM_COLORS: Record<string, string> = {
  airline: 'bg-brass-soft text-brass',
  hotel: 'bg-purple-100 text-purple-800',
  transferable: 'bg-amber-bg text-amber',
  bank: 'bg-line text-ink',
};

function cppRatingDot(cpp: number, defaultCpp: number, excellentCpp?: number): string {
  if (excellentCpp && cpp >= excellentCpp) return '🟢';
  if (cpp > defaultCpp) return '🟡';
  return '🔴';
}

export default function PointsTracker({ data, update, onViewTransfers, onEvaluate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingProgram, setAddingProgram] = useState(false);
  const [selectedForAdd, setSelectedForAdd] = useState<string | null>(null);
  const [addBalance, setAddBalance] = useState('');
  const [programSearch, setProgramSearch] = useState('');
  const addBalanceRef = useRef<HTMLInputElement>(null);

  const trackedIds = new Set(data.pointsBalances.map(b => b.programId));
  const untrackedPrograms = POINTS_PROGRAMS.filter(p => !trackedIds.has(p.id));

  function getBalance(programId: string): PointsBalance | undefined {
    return data.pointsBalances.find(b => b.programId === programId);
  }

  function getCpp(programId: string): number {
    const bal = getBalance(programId);
    if (bal?.cppOverride != null) return bal.cppOverride;
    return POINTS_PROGRAMS.find(p => p.id === programId)?.defaultCpp ?? 1;
  }

  function addProgram(programId: string, balance: number) {
    const prog = POINTS_PROGRAMS.find(p => p.id === programId);
    update(prev => {
      const next = [...prev.pointsBalances, { programId, balance, lastUpdated: new Date().toISOString() }];
      if (prog) trackProgramAdded(programId, prog.name, balance);
      updatePersonProperties({ programs_count: next.length });
      return { ...prev, pointsBalances: next };
    });
    setAddingProgram(false);
    setSelectedForAdd(null);
    setAddBalance('');
    setProgramSearch('');
  }

  function cancelAdd() {
    setAddingProgram(false);
    setSelectedForAdd(null);
    setAddBalance('');
    setProgramSearch('');
  }

  useEffect(() => {
    if (selectedForAdd) addBalanceRef.current?.focus();
  }, [selectedForAdd]);

  function removeProgram(programId: string) {
    const prog = POINTS_PROGRAMS.find(p => p.id === programId);
    update(prev => {
      const next = prev.pointsBalances.filter(b => b.programId !== programId);
      if (prog) trackProgramRemoved(programId, prog.name);
      updatePersonProperties({ programs_count: next.length });
      return { ...prev, pointsBalances: next };
    });
  }

  function updateBalance(programId: string, balance: number) {
    trackBalanceUpdated(programId, balance);
    update(prev => ({
      ...prev,
      pointsBalances: prev.pointsBalances.map(b =>
        b.programId === programId
          ? { ...b, balance, lastUpdated: new Date().toISOString() }
          : b
      ),
    }));
    setEditingId(null);
  }

  function updateCpp(programId: string, cpp: number) {
    update(prev => ({
      ...prev,
      pointsBalances: prev.pointsBalances.map(b =>
        b.programId === programId ? { ...b, cppOverride: cpp } : b
      ),
    }));
  }

  const totalValue = data.pointsBalances.reduce((sum, b) => {
    const cpp = getCpp(b.programId);
    return sum + (b.balance * cpp) / 100;
  }, 0);

  const trackedPrograms = POINTS_PROGRAMS.filter(p => trackedIds.has(p.id));

  return (
    <div className="space-y-6">
      <div className="bg-ink rounded-2xl p-6 text-white">
        <p className="text-ink-soft text-sm">Total Portfolio Value (est.)</p>
        <p className="text-4xl font-mono font-bold mt-1">
          ${totalValue.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CAD
        </p>
        <p className="text-ink-soft text-xs mt-2">
          Based on default cpp valuations. Adjust per-program below.
        </p>
        <button
          onClick={() => onEvaluate()}
          className="mt-4 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          🧮 Evaluate a Redemption →
        </button>
      </div>

      {trackedPrograms.length === 0 && (
        <div className="text-center py-12 text-ink-soft">
          <p className="text-lg">No programs tracked yet.</p>
          <p className="text-sm mt-1">Add your first loyalty program below.</p>
        </div>
      )}

      <div className="space-y-3">
        {trackedPrograms.map(program => {
          const bal = getBalance(program.id);
          const cpp = getCpp(program.id);
          const value = bal ? (bal.balance * cpp) / 100 : 0;
          const isEditing = editingId === program.id;
          const hasRating = program.type === 'airline' || program.type === 'hotel' || program.type === 'transferable';
          const dot = hasRating ? cppRatingDot(cpp, program.defaultCpp, program.excellentCpp) : null;

          return (
            <div key={program.id} className="bg-white border border-line rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-ink truncate">{program.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PROGRAM_COLORS[program.type]}`}>
                      {program.type}
                    </span>
                    {program.alliance && (
                      <span className="text-xs text-ink-soft capitalize">{program.alliance}</span>
                    )}
                  </div>
                  {program.note && (
                    <p className="text-xs text-ink-soft mt-0.5">{program.note}</p>
                  )}
                  {bal && (
                    <p className="text-xs text-ink-soft mt-1">
                      Updated {new Date(bal.lastUpdated).toLocaleDateString('en-CA')}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {isEditing ? (
                    <BalanceEditor
                      initialBalance={bal?.balance ?? 0}
                      onSave={v => updateBalance(program.id, v)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <button
                      onClick={() => setEditingId(program.id)}
                      className={`text-right transition-colors ${
                        (bal?.balance ?? 0) === 0
                          ? 'text-xs text-brass hover:text-brass border border-dashed border-brass rounded-lg px-2 py-1'
                          : 'font-mono text-xl font-bold text-ink hover:text-brass'
                      }`}
                      title="Click to edit"
                    >
                      {(bal?.balance ?? 0) === 0 ? '+ Enter points' : (bal!.balance).toLocaleString('en-CA')}
                    </button>
                  )}
                  <p className="font-mono text-sm text-forest font-semibold">
                    ≈ ${value.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} CAD
                  </p>

                  <div className="flex items-center gap-1.5">
                    {dot && <span title={`Benchmark: ${program.defaultCpp}¢${program.excellentCpp ? ` · Excellent: ${program.excellentCpp}¢` : ''}`}>{dot}</span>}
                    <span className="text-xs text-ink-soft">cpp:</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={cpp}
                      onChange={e => updateCpp(program.id, parseFloat(e.target.value) || 0)}
                      className="w-16 font-mono text-xs border border-line rounded px-1.5 py-0.5 text-right"
                    />
                    <span className="text-xs text-ink-soft">¢</span>
                  </div>
                  {hasRating && (
                    <p className="text-xs text-ink-soft text-right">
                      benchmark {program.defaultCpp}¢
                      {program.excellentCpp ? ` · excellent ${program.excellentCpp}¢` : ''}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-line">
                {program.isTransferable && (
                  <button
                    onClick={() => onViewTransfers(program.id)}
                    className="text-xs text-brass hover:text-brass font-medium"
                  >
                    Transfer Partners →
                  </button>
                )}
                {(program.type === 'airline' || program.type === 'hotel' || program.type === 'transferable') && (
                  <button
                    onClick={() => onEvaluate(program.id)}
                    className="text-xs text-violet-600 hover:text-violet-800 font-medium"
                  >
                    🧮 Evaluate Redemption →
                  </button>
                )}
                <button
                  onClick={() => removeProgram(program.id)}
                  className="text-xs text-rust hover:text-rust ml-auto"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {addingProgram ? (
        <div className="bg-white border border-line rounded-xl p-4">
          {selectedForAdd ? (() => {
            const prog = POINTS_PROGRAMS.find(p => p.id === selectedForAdd)!;
            return (
              <div>
                <p className="font-medium text-ink mb-3">
                  Adding <span className="text-ink">{prog.name}</span>
                </p>
                <div className="flex items-center gap-2">
                  <input
                    ref={addBalanceRef}
                    type="number"
                    min="0"
                    value={addBalance}
                    onChange={e => setAddBalance(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') addProgram(selectedForAdd, parseInt(addBalance) || 0);
                      if (e.key === 'Escape') setSelectedForAdd(null);
                    }}
                    placeholder="Starting balance (0)"
                    className="flex-1 border border-line rounded-lg px-3 py-2 text-sm font-mono"
                  />
                  <button
                    onClick={() => addProgram(selectedForAdd, parseInt(addBalance) || 0)}
                    className="bg-brass text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brass transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setSelectedForAdd(null)}
                    className="text-sm text-ink-soft hover:text-ink px-3 py-2"
                  >
                    Back
                  </button>
                </div>
              </div>
            );
          })() : (
            <div>
              <p className="font-medium text-ink mb-3">Add Program</p>
              <input
                type="text"
                value={programSearch}
                onChange={e => setProgramSearch(e.target.value)}
                placeholder="Search programs..."
                className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-3"
                autoFocus
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {untrackedPrograms
                  .filter(p => !programSearch || p.name.toLowerCase().includes(programSearch.toLowerCase()))
                  .map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedForAdd(p.id); setAddBalance(''); }}
                      className="text-left px-3 py-2 rounded-lg border border-line hover:border-brass hover:bg-brass-soft text-sm transition-colors"
                    >
                      <span className="font-medium text-ink">{p.name}</span>
                      <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${PROGRAM_COLORS[p.type]}`}>
                        {p.type}
                      </span>
                    </button>
                  ))}
              </div>
              <button
                onClick={cancelAdd}
                className="mt-3 text-sm text-ink-soft hover:text-ink"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      ) : (
        untrackedPrograms.length > 0 && (
          <button
            onClick={() => setAddingProgram(true)}
            className="w-full py-3 border-2 border-dashed border-line rounded-xl text-ink-soft hover:border-brass hover:text-brass transition-colors text-sm font-medium"
          >
            + Add Loyalty Program
          </button>
        )
      )}
    </div>
  );
}

function BalanceEditor({
  initialBalance,
  onSave,
  onCancel,
}: {
  initialBalance: number;
  onSave: (v: number) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(String(initialBalance));

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min="0"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') onSave(parseInt(value) || 0);
          if (e.key === 'Escape') onCancel();
        }}
        autoFocus
        className="w-28 font-mono text-sm border border-brass rounded px-2 py-1 text-right"
      />
      <button
        onClick={() => onSave(parseInt(value) || 0)}
        className="text-xs bg-brass text-white px-2 py-1 rounded hover:bg-brass"
      >
        Save
      </button>
    </div>
  );
}
