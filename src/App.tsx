import { useState } from 'react';
import { useStorage } from './hooks/useStorage';
import Dashboard from './components/Dashboard';
import PointsTracker from './components/PointsTracker';
import TransferMap from './components/TransferMap';
import CardList from './components/CardList';
import Settings from './components/Settings';
import SpendOptimizer from './components/SpendOptimizer';
import RedemptionEvaluator from './components/RedemptionEvaluator';

type Tab = 'dashboard' | 'cards' | 'points' | 'optimize' | 'redeem' | 'transfers' | 'settings';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'cards',     label: 'Cards',     icon: '💳' },
  { id: 'points',    label: 'Points',    icon: '✈️' },
  { id: 'optimize',  label: 'Optimize',  icon: '🎯' },
  { id: 'redeem',    label: 'Redeem',    icon: '🧮' },
  { id: 'settings',  label: 'Settings',  icon: '⚙️' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [transferFocus, setTransferFocus] = useState<string | undefined>(undefined);
  const [redeemProgramId, setRedeemProgramId] = useState<string | undefined>(undefined);
  const { data, update, exportData, importData, resetYear, clearAll } = useStorage();

  function navigate(tab: string) {
    setActiveTab(tab as Tab);
  }

  function viewTransfers(programId: string) {
    setTransferFocus(programId);
    setActiveTab('transfers');
  }

  function openEvaluator(programId?: string) {
    setRedeemProgramId(programId);
    setActiveTab('redeem');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">🍁</span>
          <span className="font-semibold text-sm hidden sm:block">CA Card Tracker</span>
        </div>
        <nav className="flex gap-1">
          {TABS.filter(t => t.id !== 'settings').map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span className="sm:hidden">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-white text-slate-900'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            ⚙️
          </button>
        </nav>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-24 sm:pb-6">
        {activeTab === 'dashboard' && (
          <Dashboard data={data} onNavigate={navigate} />
        )}
        {activeTab === 'cards' && (
          <CardList data={data} update={update} />
        )}
        {activeTab === 'points' && (
          <PointsTracker data={data} update={update} onViewTransfers={viewTransfers} onEvaluate={openEvaluator} />
        )}
        {activeTab === 'redeem' && (
          <RedemptionEvaluator
            initialProgramId={redeemProgramId}
            key={redeemProgramId}
            onBack={() => setActiveTab('points')}
          />
        )}
        {activeTab === 'optimize' && (
          <SpendOptimizer data={data} update={update} onNavigate={navigate} />
        )}
        {activeTab === 'transfers' && (
          <TransferMap
            focusProgram={transferFocus}
            key={transferFocus}
          />
        )}
        {activeTab === 'settings' && (
          <Settings
            data={data}
            update={update}
            exportData={exportData}
            importData={importData}
            resetYear={resetYear}
            clearAll={clearAll}
          />
        )}
      </main>

      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-10">
        {TABS.filter(t => t.id !== 'settings').map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
              activeTab === tab.id ? 'text-slate-900' : 'text-gray-400'
            }`}
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
