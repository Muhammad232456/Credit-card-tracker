import { useState, useCallback } from 'react';
import type { UserData } from '../types';

const STORAGE_KEY = 'canadian-card-tracker-v1';

const DEFAULT_DATA: UserData = {
  version: 1,
  trackingYear: new Date().getFullYear(),
  cards: [],
  pointsBalances: [],
  bonusCache: [],
  settings: {
    displayCurrency: 'CAD',
    showValueEstimates: true,
  },
};

function migrate(data: UserData): UserData {
  // v1 → v2: add status field to existing cards
  const cards = data.cards.map(c => ({
    ...c,
    status: c.status ?? 'active',
  }));
  return { ...data, cards };
}

function load(): UserData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    return migrate({ ...DEFAULT_DATA, ...JSON.parse(raw) });
  } catch {
    return DEFAULT_DATA;
  }
}

function save(data: UserData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useStorage() {
  const [data, setData] = useState<UserData>(load);

  const update = useCallback((updater: (prev: UserData) => UserData) => {
    setData(prev => {
      const next = updater(prev);
      save(next);
      return next;
    });
  }, []);

  const exportData = useCallback(() => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `card-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const importData = useCallback((json: string) => {
    const parsed = JSON.parse(json) as UserData;
    save(parsed);
    setData(parsed);
  }, []);

  const resetYear = useCallback(() => {
    update(prev => ({
      ...prev,
      trackingYear: new Date().getFullYear(),
      cards: prev.cards.map(c => ({ ...c, benefitUsage: {} })),
    }));
  }, [update]);

  const clearAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setData(DEFAULT_DATA);
  }, []);

  return { data, update, exportData, importData, resetYear, clearAll };
}
