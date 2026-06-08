/**
 * StorageStatusBanner — Three-state notification banner for storage conditions.
 *
 * States:
 * - **unavailable**: localStorage not accessible (private browsing, disabled)
 * - **quota_full**: localStorage quota exceeded
 * - **load_error**: JSON parse failure or data corruption (dismissible)
 */

import { useState, memo } from 'react';

export type StorageStatus = 'unavailable' | 'quota_full' | 'load_error';

interface StorageStatusBannerProps {
  status: StorageStatus;
  /** Called when the user dismisses the banner (only for transient states). */
  onDismiss?: () => void;
}

const STATUS_CONFIG: Record<StorageStatus, {
  icon: string;
  title: string;
  message: string;
  bgColor: string;
  textColor: string;
  persistent: boolean;
}> = {
  unavailable: {
    icon: '⚠️',
    title: 'Storage unavailable',
    message: 'Your drink log won\'t be saved between sessions. Check your browser privacy settings.',
    bgColor: 'bg-amber-50 dark:bg-amber-900/30',
    textColor: 'text-amber-800 dark:text-amber-200',
    persistent: true,
  },
  quota_full: {
    icon: '🗄️',
    title: 'Storage full',
    message: 'Your drink log may not save new entries. Try clearing old entries to free up space.',
    bgColor: 'bg-orange-50 dark:bg-orange-900/30',
    textColor: 'text-orange-800 dark:text-orange-200',
    persistent: true,
  },
  load_error: {
    icon: '📄',
    title: 'Could not load saved data',
    message: 'Your drink log data may be corrupted. You can continue adding new entries.',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    textColor: 'text-blue-800 dark:text-blue-200',
    persistent: false,
  },
};

const StorageStatusBanner = memo(function StorageStatusBanner({
  status,
  onDismiss,
}: StorageStatusBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const config = STATUS_CONFIG[status];

  if (dismissed && !config.persistent) return null;

  return (
    <div
      role={config.persistent ? 'alert' : 'status'}
      aria-live="polite"
      className={`flex items-start gap-3 p-3 rounded-lg border ${config.bgColor} ${
        config.persistent
          ? 'border-amber-200 dark:border-amber-700'
          : 'border-blue-200 dark:border-blue-700'
      }`}
    >
      <span className="flex-shrink-0 text-base leading-5" aria-hidden="true">
        {config.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${config.textColor}`}>
          {config.title}
        </p>
        <p className={`text-xs mt-0.5 ${config.textColor} opacity-80`}>
          {config.message}
        </p>
      </div>
      {!config.persistent && onDismiss && (
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            onDismiss();
          }}
          className="flex-shrink-0 p-1 rounded text-blue-400 hover:text-blue-600
                     dark:text-blue-300 dark:hover:text-blue-100
                     hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors duration-150"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
});

export default StorageStatusBanner;
