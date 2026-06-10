/**
 * MetabolismErrorFallbacks — Fallback UI components for MetabolismTracker error boundaries.
 *
 * Each fallback is rendered when its corresponding section crashes,
 * providing a degraded but non-blank experience.
 */

/** Fallback UI when the daily summary section crashes. */
export function DailySummaryError() {
  return (
    <div className="rounded-lg border border-red-200 dark:border-red-800 p-3 text-center text-sm text-red-600 dark:text-red-400">
      Unable to load daily summary
    </div>
  );
}

/** Fallback UI when the chart section crashes. */
export function ChartError() {
  return (
    <div className="card text-center py-8 text-sm text-coffee-400 dark:text-coffee-400">
      Unable to load blood level chart
    </div>
  );
}

/** Fallback UI when the drink log section crashes. */
export function DrinkLogError() {
  return (
    <div className="card text-center py-8 text-sm text-coffee-400 dark:text-coffee-400">
      Unable to load drink log
    </div>
  );
}
