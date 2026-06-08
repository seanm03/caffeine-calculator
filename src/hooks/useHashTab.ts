import { useState, useEffect, useCallback } from 'react';

export type Tab = 'calculator' | 'brands' | 'methodology' | 'tracker';

export const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: 'calculator', label: 'Calculator', emoji: '☕' },
  { key: 'brands', label: 'Brand Reference', emoji: '🏷️' },
  { key: 'methodology', label: 'Methodology', emoji: '📚' },
  { key: 'tracker', label: 'Tracker', emoji: '📊' },
];

const VALID_TABS = new Set<string>(TABS.map((t) => t.key));

function tabFromHash(): Tab {
  const raw = window.location.hash.replace(/^#/, '');
  if (VALID_TABS.has(raw)) return raw as Tab;
  return 'calculator';
}

export function useHashTab() {
  const [activeTab, setActiveTabState] = useState<Tab>(tabFromHash);

  useEffect(() => {
    const onHashChange = () => setActiveTabState(tabFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const setActiveTab = useCallback((tab: Tab) => {
    window.location.hash = tab;
  }, []);

  return { activeTab, setActiveTab, tabs: TABS };
}
