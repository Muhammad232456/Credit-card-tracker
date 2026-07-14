import { useState } from 'react';
import { useStorage } from './hooks/useStorage';
import { useDevice } from './hooks/useDevice';
import Dashboard from './components/Dashboard';
import PointsTracker from './components/PointsTracker';
import TransferMap from './components/TransferMap';
import CardList from './components/CardList';
import Settings from './components/Settings';
import SpendOptimizer from './components/SpendOptimizer';
import RedemptionEvaluator from './components/RedemptionEvaluator';
import OnboardingQuiz from './components/OnboardingQuiz';
import CardComparison from './components/CardComparison';
import PrivacyPolicy from './components/PrivacyPolicy';
import AffiliateDisclosure from './components/AffiliateDisclosure';
import InstallBanner from './components/InstallBanner';
import { Analytics } from '@vercel/analytics/react';
import { trackTabView, trackEvent } from './analytics';
import { WalletMark, DashboardIcon, CardsIcon, PointsIcon, OptimizeIcon, RedeemIcon, SettingsIcon } from './components/Icons';

type Tab = 'dashboard' | 'cards' | 'points' | 'optimize' | 'redeem' | 'transfers' | 'settings' | 'compare' | 'privacy' | 'affiliate';

const TABS: { id: Tab; label: string; Icon: typeof DashboardIcon }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { id: 'cards',     label: 'Cards',     Icon: CardsIcon },
  { id: 'points',    label: 'Points',    Icon: PointsIcon },
  { id: 'optimize',  label: 'Optimize',  Icon: OptimizeIcon },
  { id: 'redeem',    label: 'Redeem',    Icon: RedeemIcon },
  { id: 'settings',  label: 'Settings',  Icon: SettingsIcon },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [transferFocus, setTransferFocus] = useState<string | undefined>(undefined);
  const [redeemProgramId, setRedeemProgramId] = useState<string | undefined>(undefined);
  const { data, update, exportData, importData, resetYear, clearAll } = useStorage();
  const device = useDevice();

  function navigate(tab: string) {
    setActiveTab(tab as Tab);
    trackTabView(tab);
  }

  function viewTransfers(programId: string) {
    setTransferFocus(programId);
    setActiveTab('transfers');
  }

  function openEvaluator(programId?: string) {
    setRedeemProgramId(programId);
    setActiveTab('redeem');
  }

  const [showQuiz, setShowQuiz] = useState(false);

  function completeOnboarding(goal: 'cashback' | 'travel' | 'both') {
    update(prev => ({ ...prev, settings: { ...prev.settings, onboardingComplete: true, goal } }));
    trackEvent('quiz_complete', { goal });
    setShowQuiz(false);
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col" data-device={device.deviceType}>
      <header className="bg-ink text-paper px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => navigate('dashboard')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <WalletMark className="w-5 h-5" />
          <span className="font-semibold text-sm hidden sm:block tracking-tight">CA Card Tracker</span>
        </button>
        <nav className="flex gap-1">
          {TABS.filter(t => t.id !== 'settings').map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); trackTabView(tab.id); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-brass text-ink'
                  : 'text-paper/55 hover:text-paper hover:bg-white/10'
              }`}
            >
              <tab.Icon className="w-4 h-4 sm:hidden" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-brass text-ink'
                : 'text-paper/55 hover:text-paper hover:bg-white/10'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </nav>
      </header>

      {/* Quiz modal - opt-in, never auto-shown */}
      {showQuiz && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-lg shadow-2xl">
            <OnboardingQuiz onComplete={completeOnboarding} onSkip={() => setShowQuiz(false)} />
          </div>
        </div>
      )}

      <main className="flex-1 w-full px-4 sm:px-8 py-6 pb-28 sm:pb-6" style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom))' }}>
        {activeTab === 'dashboard' && (
          <Dashboard data={data} onNavigate={navigate} onStartQuiz={() => setShowQuiz(true)} />
        )}
        {activeTab === 'cards' && (
          <CardList data={data} update={update} onCompare={() => setActiveTab('compare')} isTablet={device.isTablet} />
        )}
        {activeTab === 'compare' && (
          <CardComparison onBack={() => setActiveTab('cards')} />
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
            exportData={exportData}
            importData={importData}
            resetYear={resetYear}
            clearAll={clearAll}
          />
        )}
        {activeTab === 'privacy' && (
          <PrivacyPolicy onBack={() => navigate('settings')} />
        )}
        {activeTab === 'affiliate' && (
          <AffiliateDisclosure onBack={() => navigate('settings')} />
        )}
      </main>

      <footer className="hidden sm:block text-center text-xs text-ink-soft py-4 border-t border-line bg-paper">
        <span>© 2026 CA Card Tracker · </span>
        <button onClick={() => navigate('privacy')} className="underline hover:text-ink">Privacy Policy</button>
        <span> · </span>
        <button onClick={() => navigate('affiliate')} className="underline hover:text-ink">Affiliate Disclosure</button>
      </footer>

      <InstallBanner />
      <Analytics />

      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-line flex z-10 pb-[env(safe-area-inset-bottom)]">
        {TABS.filter(t => t.id !== 'settings').map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); trackTabView(tab.id); }}
            className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
              activeTab === tab.id ? 'text-brass' : 'text-ink-soft'
            }`}
          >
            <tab.Icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
