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
      <div className="bg-slate-800 rounded-2xl p-6 text-white">
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-slate-400 text-sm mt-1">
          Your data is stored locally in this browser. Export to back it up or share across devices.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-1">Data Summary</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>{data.cards.length} card{data.cards.length !== 1 ? 's' : ''} tracked</p>
            <p>{data.pointsBalances.length} loyalty program{data.pointsBalances.length !== 1 ? 's' : ''}</p>
            <p>Tracking year: {data.trackingYear}</p>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Export Data</h3>
          <p className="text-sm text-gray-500 mb-3">Download your data as JSON for backup or transfer.</p>
          <button
            onClick={exportData}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            Download JSON
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Import Data</h3>
          <p className="text-sm text-gray-500 mb-3">Restore from a previously exported JSON file. This will overwrite your current data.</p>
          <input
            type="file"
            accept=".json"
            ref={fileRef}
            onChange={handleFileImport}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Import JSON
          </button>
          {importError && <p className="mt-2 text-sm text-red-600">{importError}</p>}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Reset Tracking Year</h3>
          <p className="text-sm text-gray-500 mb-3">
            Clears all benefit usage counts for the new year. Keeps your cards, points balances, and dates.
          </p>
          {confirmReset ? (
            <div className="flex gap-3">
              <button
                onClick={() => { resetYear(); setConfirmReset(false); }}
                className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600"
              >
                Yes, reset usage
              </button>
              <button onClick={() => setConfirmReset(false)} className="text-gray-500 text-sm px-4 py-2">
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="border border-amber-300 text-amber-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors"
            >
              Reset Year
            </button>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Clear All Data</h3>
          <p className="text-sm text-gray-500 mb-3">
            Permanently delete all cards, points, and settings from this browser.
          </p>
          {confirmClear ? (
            <div className="flex gap-3">
              <button
                onClick={() => { clearAll(); setConfirmClear(false); }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Yes, delete everything
              </button>
              <button onClick={() => setConfirmClear(false)} className="text-gray-500 text-sm px-4 py-2">
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="border border-red-300 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Clear All Data
            </button>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 pb-4">
        Canadian Credit Card Tracker · Data verified June 2026 · Built with Claude Code
      </div>
    </div>
  );
}
