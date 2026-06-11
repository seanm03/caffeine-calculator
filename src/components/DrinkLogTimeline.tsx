/**
 * DrinkLogTimeline — Chronological list of today's caffeine entries.
 *
 * Shows each logged drink with time, amount, and optional details.
 * Allows editing entry time and deleting individual entries.
 */

import { useState, useCallback, memo } from 'react';
import type { CaffeineLogEntry } from '@/types';

interface DrinkLogTimelineProps {
  entries: CaffeineLogEntry[];
  onRemove: (id: string) => void;
  /** Called when an entry's timestamp is updated. */
  onUpdate: (id: string, updates: Partial<Omit<CaffeineLogEntry, 'id'>>) => void;
}

/** Format an ISO 8601 timestamp to a readable time string. */
function formatTime(isoTimestamp: string): string {
  const d = new Date(isoTimestamp);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Extract HH:MM from an ISO timestamp for input[type=time] value. */
function isoToTimeValue(isoTimestamp: string): string {
  const d = new Date(isoTimestamp);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Replace the time portion of an ISO timestamp while preserving the date. */
function timeToISO(isoTimestamp: string, timeValue: string): string {
  const d = new Date(isoTimestamp);
  const [h, m] = timeValue.split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

/** Format the brew method label for display. */
function formatBrewMethod(method?: string): string {
  if (!method) return '';
  return method
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const DrinkLogTimeline = memo(function DrinkLogTimeline({ entries, onRemove, onUpdate }: DrinkLogTimelineProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const entryCount = entries.length;

  const handleTimeChange = useCallback(
    (id: string, timeValue: string) => {
      const entry = entries.find((e) => e.id === id);
      if (entry) {
        onUpdate(id, { timestamp: timeToISO(entry.timestamp, timeValue) });
      }
    },
    [entries, onUpdate],
  );

  const handleTimeBlur = useCallback(() => {
    setEditingId(null);
  }, []);

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
        <div role="listitem">
          <p className="text-center text-sm text-coffee-400 dark:text-coffee-500 py-4">
            No drinks logged yet
          </p>
        </div>
      )}
      {entries.map((entry, index) => (
        <div
          key={entry.id}
          role="listitem"
          className={`
            flex items-start gap-3 p-3 rounded-lg
            bg-coffee-50 dark:bg-coffee-900/50
            border border-coffee-100 dark:border-coffee-800
            transition-colors duration-200
            animate-fadeIn
          `}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Time badge — click to edit */}
          <div className="flex-shrink-0 w-14 text-center">
            {editingId === entry.id ? (
              <input
                type="time"
                defaultValue={isoToTimeValue(entry.timestamp)}
                onChange={(e) => handleTimeChange(entry.id, e.target.value)}
                onBlur={handleTimeBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTimeBlur();
                }}
                className="input-coffee text-xs w-full py-0.5 px-1"
                aria-label="Edit drink time"
                autoFocus
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditingId(entry.id)}
                className="text-xs font-semibold text-coffee-600 dark:text-coffee-300
                           hover:text-coffee-800 dark:hover:text-coffee-100
                           hover:underline underline-offset-2 transition-colors cursor-pointer"
                title="Click to edit time"
                aria-label={`Edit time for ${entry.drinkName ?? 'entry'}`}
              >
                {formatTime(entry.timestamp)}
              </button>
            )}
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
