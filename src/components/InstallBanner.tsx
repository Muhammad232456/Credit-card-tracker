import { useState, useEffect } from 'react';

const DISMISSED_KEY = 'pwa-install-dismissed';

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOS, setShowIOS] = useState(false);
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem(DISMISSED_KEY));

  useEffect(() => {
    // Already installed or dismissed
    if (dismissed) return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS) {
      setShowIOS(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, [dismissed]);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
    setDeferredPrompt(null);
    setShowIOS(false);
  }

  async function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') dismiss();
    else setDeferredPrompt(null);
  }

  if (dismissed) return null;

  // Android / Chrome install banner
  if (deferredPrompt) {
    return (
      <div className="sm:hidden fixed bottom-20 left-4 right-4 z-40 bg-ink text-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl">
        <span className="text-2xl">🍁</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Add to Home Screen</p>
          <p className="text-xs text-ink-soft">Use CA Card Tracker like an app</p>
        </div>
        <button
          onClick={install}
          className="bg-white text-ink text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0"
        >
          Install
        </button>
        <button onClick={dismiss} className="text-ink-soft hover:text-white text-lg leading-none shrink-0">×</button>
      </div>
    );
  }

  // iOS instructions banner
  if (showIOS) {
    return (
      <div className="sm:hidden fixed bottom-20 left-4 right-4 z-40 bg-ink text-white rounded-2xl px-4 py-3 shadow-xl">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🍁</span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Add to Home Screen</p>
            <p className="text-xs text-ink-soft mt-0.5">
              Tap <span className="text-white font-medium">Share</span> <span className="text-base">⎙</span> then <span className="text-white font-medium">Add to Home Screen</span>
            </p>
          </div>
          <button onClick={dismiss} className="text-ink-soft hover:text-white text-lg leading-none shrink-0">×</button>
        </div>
      </div>
    );
  }

  return null;
}
