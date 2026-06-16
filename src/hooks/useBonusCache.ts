import type { BonusCache, UserData } from '../types';

export function getCachedBonus(
  data: UserData,
  type: BonusCache['type'],
  key: string
): BonusCache | null {
  const now = new Date();
  const cached = data.bonusCache.find(b => b.type === type && b.key === key);
  if (!cached) return null;
  if (new Date(cached.expiresAt) < now) return null;
  return cached;
}

export function buildCacheEntry(
  type: BonusCache['type'],
  key: string,
  data: unknown
): BonusCache {
  const now = new Date();
  const ttlDays = type === 'welcome' ? 7 : 3;
  const expiresAt = new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000);
  return {
    type,
    key,
    data,
    checkedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}
