/**
 * DrinkLogTimeline — Chronological list of today's caffeine entries.
 *
 * Shows each logged drink with time, amount, and optional details.
 * Allows deleting individual entries.
 */

import { memo } from 'react';
import type { CaffeineLogEntry } from '@/types';

interface DrinkLogTimelineProps {
  entries: CaffeineLogEntry[];
  onRemove: (id: string) => void;
}

/** Format an ISO 8601 timestamp to a readable time string. */
function formatTime(isoTimestamp: string): string {
  const d = new Date(isoTimestamp);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Format the brew method label for display. */
function formatBrewMethod(method?: string): string {
  if (!method) return '';
  return method
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const DrinkLogTimeline = memo(function DrinkLogTimeline({ entries, onRemove }: DrinkLogTimelineProps) {
  const entryCount = entries.length;

  return (
    <div
      className="space-y-2"
      role="list"
      aria-label="Today's caffeine drink entries"
      aria-live="polite"
      aria-atomic="false"
      aria-relevant="additions removals"
    >
      {entryCount === 0 && (
        <p className="text-center text-sm text-coffee-400 dark:text-coffee-500 py-4">
          No drinks logged yet
        </p>
      )}
      {entries.map((entry, index) => (
        <div
          key={entry.id}
          className={`
            flex items-start gap-3 p-3 rounded-lg
            bg-coffee-50 dark:bg-coffee-900/50
            border border-coffee-100 dark:border-coffee-800
            transition-colors duration-200
            animate-fadeIn
          `}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Time badge */}
          <div className="flex-shrink-0 w-14 text-center">
            <span className="text-xs font-semibold text-coffee-600 dark:text-coffee-300">
              {formatTime(entry.timestamp)}
            </span>
          </div>

          {/* Entry details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              {entry.drinkName ? (
                <span className="text-sm font-medium text-coffee-800 dark:text-coffee-100 truncate">
                  {entry.drinkName}
                </span>
              ) : (
                <span className="text-sm text-coffee-500 dark:text-coffee-400 italic">
                  {entry.brewMethod ? formatBrewMethod(entry.brewMethod) : 'Coffee'}
                </span>
              )}
              <span className="text-sm font-bold text-coffee-700 dark:text-coffee-200 flex-shrink-0">
                {Math.round(entry.caffeineMg)} mg
              </span>
            </div>

            {(entry.brewMethod || entry.coffeeWeightG || entry.waterVolumeMl) && (
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                {entry.brewMethod && (
                  <span className="text-xs text-coffee-400 dark:text-coffee-500">
                    {formatBrewMethod(entry.brewMethod)}
                  </span>
                )}
                {entry.coffeeWeightG !== undefined && (
                  <span className="text-xs text-coffee-400 dark:text-coffee-500">
                    {entry.coffeeWeightG}g
                  </span>
                )}
                {entry.waterVolumeMl !== undefined && (
                  <span className="text-xs text-coffee-400 dark:text-coffee-500">
                    {entry.waterVolumeMl}ml
                  </span>
                )}
              </div>
            )}

            {entry.notes && (
              <p className="text-xs text-coffee-400 dark:text-coffee-500 mt-0.5 truncate">
                {entry.notes}
              </p>
            )}
          </div>

          {/* Delete button */}
          <button
            type="button"
            onClick={() => onRemove(entry.id)}
            className="flex-shrink-0 p-1 rounded text-coffee-400 hover:text-red-500 dark:hover:text-red-400
                       hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
            aria-label={`Remove ${entry.drinkName ?? 'entry'} at ${formatTime(entry.timestamp)}`}
            title="Remove entry"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
});

export default DrinkLogTimeline;
