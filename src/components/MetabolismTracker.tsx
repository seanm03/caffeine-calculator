/**
 * MetabolismTracker — Main orchestrator for the caffeine metabolism tracking tab.
 *
 * Composes BloodLevelChart, DrinkLogTimeline, DailySummary, DrinkLogForm,
 * and half-life slider into a unified tracker experience.
 */

import { useState, memo } from 'react';
import { useCaffeineLog } from '@/hooks/useCaffeineLog';
import BloodLevelChart from '@/components/BloodLevelChart';
import DrinkLogTimeline from '@/components/DrinkLogTimeline';
import DailySummary from '@/components/DailySummary';
import DrinkLogForm from '@/components/DrinkLogForm';
import ErrorBoundary from '@/components/ErrorBoundary';
import HalfLifeSlider from '@/components/HalfLifeSlider';
import StorageStatusBanner from '@/components/StorageStatusBanner';
import type { StorageStatus } from '@/components/StorageStatusBanner';
import { DailySummaryError, ChartError, DrinkLogError } from '@/components/MetabolismErrorFallbacks';

const MetabolismTracker = memo(function MetabolismTracker() {
  const {
    todayEntries,
    todaySummary,
    halfLifeHours,
    setHalfLifeHours,
    addEntry,
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

      {/* ── Daily summary stats ──────────────────────────────────── */}
      <ErrorBoundary fallback={<DailySummaryError />}>
        <DailySummary summary={todaySummary} />
      </ErrorBoundary>

      {/* ── Blood level chart ────────────────────────────────────── */}
      <ErrorBoundary fallback={<ChartError />}>
        <div className="card">
          <h3 className="text-sm font-semibold text-coffee-800 dark:text-coffee-300 mb-3">
            24-Hour Blood Caffeine Level
          </h3>
          <BloodLevelChart
            entries={todayEntries}
            halfLifeHours={halfLifeHours}
          />
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
                <button
                  type="button"
                  onClick={clearToday}
                  className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300
                             underline underline-offset-2"
                >
                  Clear today
                </button>
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
            <DrinkLogTimeline entries={todayEntries} onRemove={removeEntry} />
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
