import { useState } from 'react';
import { fetchWelcomeBonus } from '../api/bonusChecker';
import { getCachedBonus, buildCacheEntry } from '../hooks/useBonusCache';
import type { CardTemplate, UserData, WelcomeBonusResult } from '../types';

interface Props {
  card: CardTemplate;
  data: UserData;
  update: (updater: (prev: UserData) => UserData) => void;
}

export default function BonusChecker({ card, data, update }: Props) {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cached = getCachedBonus(data, 'welcome', card.id);
  const result = cached?.data as WelcomeBonusResult | undefined;

  async function checkBonus() {
    setError(null);
    setChecking(true);
    try {
      const bonus = await fetchWelcomeBonus(card.name, card.issuer);
      const entry = buildCacheEntry('welcome', card.id, bonus);
      update(prev => ({
        ...prev,
        bonusCache: [
          ...prev.bonusCache.filter(b => !(b.type === 'welcome' && b.key === card.id)),
          entry,
        ],
      }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="bg-surface border border-line rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-ink text-sm">Current Welcome Bonus</p>
          {cached && (
            <p className="text-xs text-ink-soft">
              Last checked: {new Date(cached.checkedAt).toLocaleDateString('en-CA')}
            </p>
          )}
        </div>
        <button
          onClick={checkBonus}
          disabled={checking}
          className="bg-brass text-ink px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {checking ? 'Checking...' : cached ? 'Refresh' : 'Check Now'}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-rust">{error}</p>
      )}

      {result && (
        <div className="mt-3 space-y-2">
          <p className="text-sm font-semibold text-ink">{result.bonus_summary}</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-ink-soft">
            <div>
              <span className="text-ink-soft">Spend req: </span>
              {result.spend_requirement}
            </div>
            <div>
              <span className="text-ink-soft">Timeframe: </span>
              {result.timeframe}
            </div>
            {result.expiry_date && (
              <div className="col-span-2 text-amber">
                Expires: {result.expiry_date}
              </div>
            )}
          </div>
          {result.source_url && (
            <a
              href={result.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brass hover:text-brass underline"
            >
              Source →
            </a>
          )}
        </div>
      )}

      {!cached && !checking && !error && (
        <p className="mt-2 text-xs text-ink-soft">
          Uses Claude AI + web search. Results cached for 7 days.
        </p>
      )}
    </div>
  );
}
