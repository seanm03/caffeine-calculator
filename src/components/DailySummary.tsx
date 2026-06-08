/**
 * DailySummary — Key caffeine consumption statistics for today.
 *
 * Displays current blood caffeine level, total consumed, peak level and time,
 * and percent of daily limit in a compact card layout.
 */

import { memo, useMemo } from 'react';
import type { DailyCaffeineSummary } from '../types';
import { DAILY_SAFE_LIMIT_MG } from '../engine/caffeineMetabolism';

interface DailySummaryProps {
  summary: DailyCaffeineSummary;
}

function zoneBg(percent: number): string {
  if (percent <= 50) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
  if (percent <= 80) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
  if (percent <= 100) return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
  return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
}

function zoneText(percent: number): string {
  if (percent <= 50) return 'text-green-700 dark:text-green-400';
  if (percent <= 80) return 'text-yellow-700 dark:text-yellow-400';
  if (percent <= 100) return 'text-orange-700 dark:text-orange-400';
  return 'text-red-700 dark:text-red-400';
}

const DailySummary = memo(function DailySummary({ summary }: DailySummaryProps) {
  const { currentLevel, totalToday, peakLevel, peakTime, entryCount } = summary;

  const dailyPercent = useMemo(
    () => Math.round((currentLevel / DAILY_SAFE_LIMIT_MG) * 100),
    [currentLevel],
  );

  const formatPeakTime = peakTime
    ? peakTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Current level */}
      <div className={`rounded-lg border p-3 text-center ${zoneBg(dailyPercent)}`}>
        <p className="text-xs text-coffee-500 dark:text-coffee-400 mb-1">Current Level</p>
        <p className={`text-2xl font-extrabold ${zoneText(dailyPercent)}`}>
          {Math.round(currentLevel)}
        </p>
        <p className="text-xs text-coffee-400 dark:text-coffee-500">mg</p>
      </div>

      {/* Total today */}
      <div className="rounded-lg border p-3 text-center bg-coffee-50 dark:bg-coffee-900/30 border-coffee-200 dark:border-coffee-700">
        <p className="text-xs text-coffee-500 dark:text-coffee-400 mb-1">Total Today</p>
        <p className="text-2xl font-extrabold text-coffee-700 dark:text-coffee-200">
          {Math.round(totalToday)}
        </p>
        <p className="text-xs text-coffee-400 dark:text-coffee-500">
          mg / {DAILY_SAFE_LIMIT_MG} mg limit
        </p>
      </div>

      {/* Peak level */}
      <div className="rounded-lg border p-3 text-center bg-coffee-50 dark:bg-coffee-900/30 border-coffee-200 dark:border-coffee-700">
        <p className="text-xs text-coffee-500 dark:text-coffee-400 mb-1">Peak Level</p>
        <p className="text-2xl font-extrabold text-coffee-700 dark:text-coffee-200">
          {Math.round(peakLevel)}
        </p>
        <p className="text-xs text-coffee-400 dark:text-coffee-500">mg at {formatPeakTime}</p>
      </div>

      {/* Daily limit % */}
      <div className={`rounded-lg border p-3 text-center ${zoneBg(dailyPercent)}`}>
        <p className="text-xs text-coffee-500 dark:text-coffee-400 mb-1">Daily Limit</p>
        <p className={`text-2xl font-extrabold ${zoneText(dailyPercent)}`}>
          {dailyPercent}%
        </p>
        <p className="text-xs text-coffee-400 dark:text-coffee-500">
          {entryCount} drink{entryCount !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
});

export default DailySummary;
