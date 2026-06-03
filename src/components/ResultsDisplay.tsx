import { useRef, useState, useEffect } from 'react';
import type { CaffeineResult } from '../types';
import { DAILY_SAFE_LIMIT_MG, STANDARD_CUP_CAFFEINE_MG } from '../engine/constants';
import { useUnits } from '../hooks/useUnits';

export interface ResultsDisplayProps {
  result: CaffeineResult | null;
  coffeeWeightG?: number;
  waterVolumeMl?: number;
}

/** Return the Tailwind color class for the given percentage threshold. */
function zoneColor(percent: number): string {
  if (percent <= 50) return 'text-green-600 dark:text-green-400';
  if (percent <= 80) return 'text-yellow-600 dark:text-yellow-400';
  if (percent <= 100) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

export default function ResultsDisplay({ result, coffeeWeightG, waterVolumeMl }: ResultsDisplayProps) {
  const { unitSystem, gToOz, mlToFlOz } = useUnits();

  // ── Number change animation trigger (before early return for hooks rule) ──
  const caffeineMg = result?.totalCaffeineMg ?? 0;
  const prevRef = useRef(caffeineMg);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (result && prevRef.current !== result.totalCaffeineMg) {
      prevRef.current = result.totalCaffeineMg;
      setAnimKey((k) => k + 1);
    }
  }, [result, result?.totalCaffeineMg]);

  // ── Empty / zero state ───────────────────────────────────────────
  if (!result) {
    return (
      <div className="card flex flex-col items-center justify-center py-10 text-center">
        <p className="text-coffee-400 dark:text-coffee-400 text-lg">
          ☕ Enter parameters to calculate
        </p>
      </div>
    );
  }

  const { totalCaffeineMg, dailyLimitPercent, equivalentCups } = result;
  const exceedsLimit = totalCaffeineMg > DAILY_SAFE_LIMIT_MG;

  return (
    <div className="card space-y-6 transition-shadow duration-300">
      {/* ── Large caffeine total ──────────────────────────────────── */}
      <div className="text-center">
        <span
          key={animKey}
          className={`text-5xl sm:text-6xl font-extrabold tracking-tight number-transition animate-number-pop ${zoneColor(dailyLimitPercent)}`}
        >
          {Math.round(totalCaffeineMg)}
        </span>
        <span className="text-2xl text-coffee-500 dark:text-coffee-300 ml-1">mg</span>
        <p className="text-sm text-coffee-500 dark:text-coffee-300 mt-1">
          {equivalentCups >= 0.1
            ? `≈ ${equivalentCups.toFixed(1)} standard cup${equivalentCups !== 1 ? 's' : ''}`
            : 'Less than 0.1 standard cups'}
          <span className="text-coffee-400 dark:text-coffee-400">
            {' '}
            ({STANDARD_CUP_CAFFEINE_MG} mg each)
          </span>
        </p>

        {/* Imperial equivalents */}
        {unitSystem === 'imperial' && coffeeWeightG !== undefined && waterVolumeMl !== undefined && (
          <div className="mt-2 pt-2 border-t border-coffee-100 dark:border-coffee-800">
            <p className="text-xs text-coffee-400 dark:text-coffee-400 space-x-3">
              <span>{gToOz(coffeeWeightG)} oz coffee</span>
              <span>·</span>
              <span>{mlToFlOz(waterVolumeMl)} fl oz water</span>
            </p>
          </div>
        )}
      </div>

      {/* ── Semi-circular SVG gauge ──────────────────────────────── */}
      <div className="flex flex-col items-center gap-2">
        <svg
          viewBox="0 0 120 65"
          className="w-48 h-26"
          aria-hidden="true"
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gauge-fill" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="80%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          {/* Background track arc */}
          <path
            d="M 10 55 A 50 50 0 0 1 110 55"
            fill="none"
            stroke="currentColor"
            className="text-coffee-200 dark:text-coffee-600"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Filled arc — uses stroke-dasharray to show only the fill portion */}
          <path
            d="M 10 55 A 50 50 0 0 1 110 55"
            fill="none"
            stroke="url(#gauge-fill)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(Math.min(dailyLimitPercent, 100) / 100) * 157.1} 157.1`}
            strokeDashoffset="0"
            className="transition-all duration-700 ease-out"
          />
          {/* Percentage text */}
          <text
            x="60"
            y="48"
            textAnchor="middle"
            className={`text-xl font-bold ${zoneColor(dailyLimitPercent)}`}
            fill="currentColor"
          >
            {Math.round(dailyLimitPercent)}%
          </text>
        </svg>
        <p className="text-sm font-medium text-coffee-700 dark:text-coffee-100">
          of {DAILY_SAFE_LIMIT_MG} mg daily limit
        </p>
      </div>

      {/* ── Warning when exceeding daily limit ───────────────────── */}
      {exceedsLimit && (
        <div
          className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 rounded-lg text-amber-700 dark:text-amber-200 text-sm animate-fadeIn"
          role="alert"
        >
          <span aria-hidden="true">⚠️</span>
          <span>
            Exceeds the recommended daily limit ({DAILY_SAFE_LIMIT_MG} mg)
          </span>
        </div>
      )}
    </div>
  );
}
