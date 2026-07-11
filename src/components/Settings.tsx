import { useRef, useState } from 'react';
import type { UserData } from '../types';

interface Props {
  data: UserData;
  exportData: () => void;
  importData: (json: string) => void;
  resetYear: () => void;
  clearAll: () => void;
}

export default function Settings({ data, exportData, importData, resetYear, clearAll }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        importData(ev.target!.result as string);
        setImportError(null);
      } catch {
        setImportError('Invalid JSON file. Please check the format.');
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-6">
      <div className="bg-ink rounded-2xl p-6 text-white">
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-ink-soft text-sm mt-1">
          Your data is stored locally in this browser. Export to back it up or share across devices.
        </p>
      </div>

      <div className="bg-surface border border-line rounded-xl divide-y divide-line">
        <div className="p-4">
          <h3 className="font-semibold text-ink mb-1">Data Summary</h3>
          <div className="text-sm text-ink-soft space-y-1">
            <p>{data.cards.length} card{data.cards.length !== 1 ? 's' : ''} tracked</p>
            <p>{data.pointsBalances.length} loyalty program{data.pointsBalances.length !== 1 ? 's' : ''}</p>
            <p>Tracking year: {data.trackingYear}</p>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-ink mb-2">Export Data</h3>
          <p className="text-sm text-ink-soft mb-3">Download your data as JSON for backup or transfer.</p>
          <button
            onClick={exportData}
            className="bg-ink text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-ink transition-colors"
          >
            Download JSON
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-ink mb-2">Import Data</h3>
          <p className="text-sm text-ink-soft mb-3">Restore from a previously exported JSON file. This will overwrite your current data.</p>
          <input
            type="file"
            accept=".json"
            ref={fileRef}
            onChange={handleFileImport}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="border border-line text-ink px-4 py-2 rounded-lg text-sm font-medium hover:bg-paper transition-colors"
          >
            Import JSON
          </button>
          {importError && <p className="mt-2 text-sm text-rust">{importError}</p>}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-ink mb-2">Reset Tracking Year</h3>
          <p className="text-sm text-ink-soft mb-3">
            Clears all benefit usage counts for the new year. Keeps your cards, points balances, and dates.
          </p>
          {confirmReset ? (
            <div className="flex gap-3">
              <button
                onClick={() => { resetYear(); setConfirmReset(false); }}
                className="bg-amber text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber"
              >
                Yes, reset usage
              </button>
              <button onClick={() => setConfirmReset(false)} className="text-ink-soft text-sm px-4 py-2">
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="border border-amber text-amber px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-bg transition-colors"
            >
              Reset Year
            </button>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-ink mb-2">Clear All Data</h3>
          <p className="text-sm text-ink-soft mb-3">
            Permanently delete all cards, points, and settings from this browser.
          </p>
          {confirmClear ? (
            <div className="flex gap-3">
              <button
                onClick={() => { clearAll(); setConfirmClear(false); }}
                className="bg-rust text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rust"
              >
                Yes, delete everything
              </button>
              <button onClick={() => setConfirmClear(false)} className="text-ink-soft text-sm px-4 py-2">
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="border border-rust text-rust px-4 py-2 rounded-lg text-sm font-medium hover:bg-rust-bg transition-colors"
            >
              Clear All Data
            </button>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-ink-soft pb-4">
        Canadian Credit Card Tracker · Data verified June 2026
      </div>
    </div>
  );
}
