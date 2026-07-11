import { useState } from 'react';
import { trackEvent } from '../analytics';

const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined;

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function submit() {
    if (!message.trim() || !ACCESS_KEY) return;
    setStatus('sending');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject: 'CA Card Tracker — User Feedback',
          message: message.trim(),
          from_name: 'CA Card Tracker User',
        }),
      });
      if (res.ok) {
        setStatus('sent');
        setMessage('');
        trackEvent('feedback_submitted');
        setTimeout(() => { setOpen(false); setStatus('idle'); }, 2500);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="bg-surface border border-line rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full px-4 py-3 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <span>💬</span>
          <span className="text-sm font-semibold text-ink">Share Feedback</span>
          <span className="text-xs text-ink-soft hidden sm:block">— suggest a feature or report an issue</span>
        </div>
        <span className="text-ink-soft text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-line px-4 pb-4 pt-3 space-y-3">
          {status === 'sent' ? (
            <p className="text-sm text-forest font-medium text-center py-4">
              ✓ Thanks for your feedback!
            </p>
          ) : (
            <>
              <textarea
                rows={4}
                placeholder="What could be better? Missing a card? Found a bug?"
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full border border-line rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink-soft resize-none"
              />
              {status === 'error' && (
                <p className="text-xs text-rust">Something went wrong — try again.</p>
              )}
              <button
                onClick={submit}
                disabled={!message.trim() || status === 'sending'}
                className="w-full bg-ink text-white py-2.5 rounded-lg text-sm font-medium hover:bg-ink transition-colors disabled:opacity-40"
              >
                {status === 'sending' ? 'Sending…' : 'Submit Feedback'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
