/**
 * SleepImpactCard — Bedtime caffeine level estimator and sleep safety assessment.
 *
 * Displays projected blood caffeine level at user-configured bedtime,
 * sleep safety status, and time-until-safe estimate.
 */

import { memo, useMemo } from 'react';
import { assessSleepImpact, SLEEP_ADVISORY_THRESHOLD_MG } from '@/engine/caffeineMetabolism';
import { CaffeineMg, Hours } from '@/types/branded';
import type { CaffeineLogEntry } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SleepImpactCardProps {
  /** Today's entries in chronological order. */
  entries: readonly CaffeineLogEntry[];
  /** Caffeine half-life in hours. */
  halfLifeHours: Hours;
  /** Bedtime hour (0–23). */
  bedtimeHour: number;
  /** Sleep advisory threshold in mg (default 50). */
  sleepThresholdMg?: CaffeineMg;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(hours: number): string {
  const h = hours % 24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}:00 ${ampm}`;
}

function formatHoursUntil(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 2) return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;
  return `${Math.round(hours * 10) / 10}h`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SleepImpactCard = memo(function SleepImpactCard({
  entries,
  halfLifeHours,
  bedtimeHour,
  sleepThresholdMg = SLEEP_ADVISORY_THRESHOLD_MG,
}: SleepImpactCardProps) {
  const impact = useMemo(
    () => assessSleepImpact(entries, halfLifeHours, bedtimeHour, 0, sleepThresholdMg),
    [entries, halfLifeHours, bedtimeHour, sleepThresholdMg],
  );

  const { bedtimeLevel, isSafe, hoursUntilSafe } = impact;

  const hasEntries = entries.length > 0;

  // Determine status styling
  const statusStyle = !hasEntries
    ? 'bg-coffee-50 dark:bg-coffee-900/30 border-coffee-200 dark:border-coffee-700'
    : isSafe
      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      : bedtimeLevel <= sleepThresholdMg * 2
        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';

  const statusText = !hasEntries
    ? 'text-coffee-500 dark:text-coffee-400'
    : isSafe
      ? 'text-green-700 dark:text-green-400'
      : bedtimeLevel <= sleepThresholdMg * 2
        ? 'text-yellow-700 dark:text-yellow-400'
        : 'text-red-700 dark:text-red-400';

  return (
    <div className={`rounded-lg border p-4 ${statusStyle}`}>
      <h3 className="text-sm font-semibold text-coffee-800 dark:text-coffee-300 mb-3">
        Sleep Impact
      </h3>

      {!hasEntries ? (
        <p className="text-sm text-coffee-500 dark:text-coffee-400">
          Log drinks to see bedtime caffeine projection.
        </p>
      ) : (
        <div className="space-y-3">
          {/* Bedtime level */}
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-coffee-500 dark:text-coffee-400">
              Bedtime level ({formatTime(bedtimeHour)})
            </span>
            <span className={`text-xl font-extrabold ${statusText}`}>
              {Math.round(bedtimeLevel)} mg
            </span>
          </div>

          {/* Status */}
          <div className={`text-sm font-medium ${statusText}`}>
            {isSafe
              ? '✅ Caffeine unlikely to affect sleep'
              : bedtimeLevel <= sleepThresholdMg * 2
                ? '⚠️ Caffeine may mildly affect sleep'
                : '🔴 Caffeine likely to disrupt sleep'}
          </div>

          {/* Time until safe */}
          {!isSafe && hoursUntilSafe !== null && (
            <p className="text-xs text-coffee-500 dark:text-coffee-400">
              Estimated safe by:{' '}
              <span className="font-medium text-coffee-700 dark:text-coffee-300">
                {formatHoursUntil(hoursUntilSafe)}
              </span>{' '}
              from now
            </p>
          )}
        </div>
      )}
    </div>
  );
});

export default SleepImpactCard;
