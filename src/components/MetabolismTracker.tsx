/**
 * MetabolismTracker — Main orchestrator for the caffeine metabolism tracking tab.
 *
 * Composes BloodLevelChart, DrinkLogTimeline, DailySummary, DrinkLogForm,
 * SleepImpactCard, and half-life slider into a unified tracker experience.
 */

import { useState, memo, lazy, Suspense } from 'react';
import DailySummary from '@/components/DailySummary';
import DrinkLogForm from '@/components/DrinkLogForm';
import DrinkLogTimeline from '@/components/DrinkLogTimeline';
import ErrorBoundary from '@/components/ErrorBoundary';
import HalfLifeSlider from '@/components/HalfLifeSlider';
import { DailySummaryError, ChartError, DrinkLogError } from '@/components/MetabolismErrorFallbacks';
import SleepImpactCard from '@/components/SleepImpactCard';
import StorageStatusBanner from '@/components/StorageStatusBanner';
import { useCaffeineLog } from '@/hooks/useCaffeineLog';
import { CaffeineMg } from '@/types/branded';
import { exportEntriesToCsv } from '@/utils/csvExport';
import type { StorageStatus } from '@/components/StorageStatusBanner';
const BloodLevelChart = lazy(() => import('@/components/BloodLevelChart'));

const MetabolismTracker = memo(function MetabolismTracker() {
  const {
    todayEntries,
    todaySummary,
    halfLifeHours,
    setHalfLifeHours,
    customSafeLimitMg,
    setCustomSafeLimitMg,
    bedtimeHour,
    setBedtimeHour,
    customSleepThresholdMg,
    setCustomSleepThresholdMg,
    addEntry,
    updateEntry,
    removeEntry,
    clearToday,
    loadError,
    dismissLoadError,
  } = useCaffeineLog();

  const [showForm, setShowForm] = useState(false);

  const hasEntries = todayEntries.length > 0;

  const storageStatus: StorageStatus | null = loadError
    ? loadError.type === 'parse_error'
      ? 'load_error'
      : loadError.type === 'quota_exceeded'
        ? 'quota_full'
        : 'unavailable'
    : null;

  return (
    <div className="space-y-6">
      {/* ── Half-life slider ─────────────────────────────────────── */}
      <HalfLifeSlider halfLifeHours={halfLifeHours} onChange={setHalfLifeHours} />

      {/* ── Settings row ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="safe-limit-mg"
            className="block text-xs font-medium text-coffee-700 dark:text-coffee-200 mb-1"
          >
            Daily Safe Limit (mg)
          </label>
          <input
            id="safe-limit-mg"
            type="number"
            inputMode="numeric"
            min={50}
            max={1000}
            step={10}
            value={customSafeLimitMg}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v)) setCustomSafeLimitMg(CaffeineMg(v));
            }}
            className="input-coffee text-sm w-28"
            aria-label="Custom daily safe caffeine limit in milligrams"
          />
        </div>
        <div className="flex-1 min-w-[200px] flex flex-col items-center">
          <label
            htmlFor="bedtime-hour"
            className="block text-xs font-medium text-coffee-700 dark:text-coffee-200 mb-1 text-center"
          >
            Bedtime
          </label>
          <select
            id="bedtime-hour"
            value={bedtimeHour}
            onChange={(e) => setBedtimeHour(parseInt(e.target.value, 10))}
            className="input-coffee text-sm w-36"
            aria-label="Bedtime hour for sleep impact prediction"
          >
            {Array.from({ length: 24 }, (_, i) => {
              const h = i % 24;
              const ampm = h >= 12 ? 'PM' : 'AM';
              const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
              return (
                <option key={i} value={i}>
                  {display}:00 {ampm}
                </option>
              );
            })}
          </select>
        </div>
        <div className="flex-1 min-w-[200px] flex flex-col items-end">
          <label
            htmlFor="sleep-threshold-mg"
            className="block text-xs font-medium text-coffee-700 dark:text-coffee-200 mb-1 text-right"
          >
            Sleep Advisory Threshold (mg)
          </label>
          <input
            id="sleep-threshold-mg"
            type="number"
            inputMode="numeric"
            min={10}
            max={200}
            step={5}
            value={customSleepThresholdMg}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v)) setCustomSleepThresholdMg(CaffeineMg(v));
            }}
            className="input-coffee text-sm w-28"
            aria-label="Custom sleep advisory caffeine threshold in milligrams"
          />
        </div>
      </div>

      {/* ── Daily summary stats ──────────────────────────────────── */}
      <ErrorBoundary fallback={<DailySummaryError />}>
        <DailySummary summary={todaySummary} safeLimitMg={customSafeLimitMg} />
      </ErrorBoundary>

      {/* ── Sleep impact card ────────────────────────────────────── */}
      <ErrorBoundary fallback={<DailySummaryError />}>
        <SleepImpactCard
          entries={todayEntries}
          halfLifeHours={halfLifeHours}
          bedtimeHour={bedtimeHour}
          sleepThresholdMg={customSleepThresholdMg}
        />
      </ErrorBoundary>

      {/* ── Blood level chart ────────────────────────────────────── */}
      <ErrorBoundary fallback={<ChartError />}>
        <div className="card">
          <h3 className="text-sm font-semibold text-coffee-800 dark:text-coffee-300 mb-3">
            24-Hour Blood Caffeine Level
          </h3>
          <Suspense fallback={<div className="h-64 flex items-center justify-center text-coffee-400 dark:text-coffee-400 text-sm">Loading chart...</div>}>
            <BloodLevelChart
              entries={todayEntries}
              halfLifeHours={halfLifeHours}
            />
          </Suspense>
        </div>
      </ErrorBoundary>

      {/* ── Storage status banner ────────────────────────────────── */}
      {storageStatus && (
        <StorageStatusBanner status={storageStatus} onDismiss={dismissLoadError} />
      )}

      {/* ── Drink log ────────────────────────────────────────────── */}
      <ErrorBoundary fallback={<DrinkLogError />}>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-coffee-800 dark:text-coffee-300">
              Today&apos;s Drinks
            </h3>
            <div className="flex items-center gap-2">
              {hasEntries && (
                <>
                  <button
                    type="button"
                    onClick={() => exportEntriesToCsv(todayEntries, 'caffeine-log')}
                    className="text-xs text-coffee-500 hover:text-coffee-700 dark:text-coffee-400 dark:hover:text-coffee-200
                               underline underline-offset-2"
                    title="Export today's entries as CSV"
                  >
                    Export CSV
                  </button>
                  <button
                    type="button"
                    onClick={clearToday}
                    className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300
                               underline underline-offset-2"
                  >
                    Clear today
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setShowForm(!showForm)}
                className="btn-coffee text-sm py-1.5 px-3"
              >
                {showForm ? 'Cancel' : '+ Log Drink'}
              </button>
            </div>
          </div>

          {showForm && (
            <div className="mb-4 p-4 bg-coffee-50 dark:bg-coffee-900/50 rounded-lg border border-coffee-200 dark:border-coffee-700">
              <DrinkLogForm
                onAdd={(entry) => {
                  addEntry(entry);
                  setShowForm(false);
                }}
              />
            </div>
          )}

          {hasEntries ? (
            <DrinkLogTimeline entries={todayEntries} onRemove={removeEntry} onUpdate={updateEntry} />
          ) : (
            <div className="text-center py-8">
              <p className="text-coffee-400 dark:text-coffee-400 text-lg">
                📊 No drinks logged today
              </p>
              <p className="text-sm text-coffee-400 dark:text-coffee-500 mt-1">
                Log a drink manually or use &ldquo;Log This Drink&rdquo; from the Calculator
              </p>
            </div>
          )}
        </div>
      </ErrorBoundary>

      {/* ── Health disclaimer ────────────────────────────────────── */}
      <div className="text-xs text-coffee-400 dark:text-coffee-500 text-center px-4">
        <p>
          <strong className="text-coffee-500 dark:text-coffee-400">Disclaimer:</strong>{' '}
          Caffeine metabolism varies based on genetics, medications, pregnancy, smoking,
          and liver function. This is an estimate based on a one-compartment pharmacokinetic
          model, not medical advice. Consult a healthcare professional for personalized guidance.
        </p>
      </div>
    </div>
  );
});

export default MetabolismTracker;
