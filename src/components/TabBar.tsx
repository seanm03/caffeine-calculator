import type { Tab } from '@/hooks/useHashTab';

interface TabBarProps {
  tabs: { key: Tab; label: string; emoji: string }[];
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

/** Renders the tab navigation bar. */
export default function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <nav
      className="grid grid-cols-2 sm:grid-cols-4 border-b border-coffee-200 dark:border-coffee-800"
      role="tablist"
      aria-label="Content sections"
    >
      {tabs.map(({ key, label, emoji }) => {
        const isActive = activeTab === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(key)}
            className={[
              'px-4 sm:px-6 py-3 text-sm font-medium',
              'transition-colors duration-200 relative',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-coffee-400',
              'focus-visible:ring-inset rounded-t-lg',
              isActive
                ? 'text-coffee-800 dark:text-coffee-100'
                : 'text-coffee-500 dark:text-coffee-300 hover:text-coffee-700 dark:hover:text-coffee-100',
            ].join(' ')}
          >
            <span className="hidden sm:inline mr-1.5" aria-hidden="true">
              {emoji}
            </span>
            {label}
            {isActive && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-coffee-500 dark:bg-coffee-300 rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
