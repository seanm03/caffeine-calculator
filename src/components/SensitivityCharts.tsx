/**
 * SensitivityCharts — WI-12: Caffeine visualization charts using Recharts.
 *
 * Provides two analysis views:
 * 1. Bar chart comparing caffeine across all 8 brew methods at current parameters
 * 2. Line chart showing caffeine vs. coffee weight (1–100g range)
 *
 * Both charts use useMemo for computed data and ResponsiveContainer
 * for responsive rendering across all screen sizes.
 */

import { memo, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
  Legend,
} from 'recharts';
import type { BrewMethod, BrewingParameters, CaffeineResult } from '@/types';
import { calculateCaffeine } from '@/engine/caffeineCalculator';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SensitivityChartsProps {
  /** Current parameters for sensitivity analysis baseline. */
  currentParams: BrewingParameters;
  /** Whether to show charts inline or as a separate panel. */
  compact?: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALL_BREW_METHODS: BrewMethod[] = [
  'espresso',
  'pour-over',
  'french-press',
  'aeropress',
  'moka-pot',
  'cold-brew',
  'turkish',
  'instant',
];

const BREW_METHOD_LABELS: Record<BrewMethod, string> = {
  espresso: 'Espresso',
  'pour-over': 'Pour-Over',
  'french-press': 'French Press',
  aeropress: 'AeroPress',
  'moka-pot': 'Moka Pot',
  'cold-brew': 'Cold Brew',
  turkish: 'Turkish',
  instant: 'Instant',
};

const COFFEE_WEIGHT_RANGE = {
  min: 1,
  max: 100,
  step: 2,
};

// ---------------------------------------------------------------------------
// Custom Tooltip
// ---------------------------------------------------------------------------

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white dark:bg-coffee-800 border border-coffee-200 dark:border-coffee-600 rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="text-coffee-500 dark:text-coffee-400 font-medium mb-1">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="text-coffee-800 dark:text-coffee-100 font-bold">
          <span style={{ color: entry.color }}>● </span>
          {Math.round(entry.value)} mg
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SensitivityCharts = memo(function SensitivityCharts({ currentParams, compact = false }: SensitivityChartsProps) {
  // ── Brew method comparison data ────────────────────────────────
  const brewMethodData = useMemo(() => {
    return ALL_BREW_METHODS.map((method) => {
      const params: BrewingParameters = { ...currentParams, brewMethod: method };
      const result: CaffeineResult = calculateCaffeine(params);
      return {
        method: BREW_METHOD_LABELS[method],
        caffeineMg: Math.round(result.totalCaffeineMg),
      };
    });
  }, [currentParams]);

  // ── Coffee weight sensitivity data ─────────────────────────────
  const weightData = useMemo(() => {
    const points: Array<{ weightG: number; caffeineMg: number }> = [];
    for (
      let w = COFFEE_WEIGHT_RANGE.min;
      w <= COFFEE_WEIGHT_RANGE.max;
      w += COFFEE_WEIGHT_RANGE.step
    ) {
      const params: BrewingParameters = { ...currentParams, coffeeWeightG: w };
      const result: CaffeineResult = calculateCaffeine(params);
      points.push({
        weightG: w,
        caffeineMg: Math.round(result.totalCaffeineMg),
      });
    }
    return points;
  }, [currentParams]);

  const maxBrewMethodCaffeine = useMemo(
    () => Math.max(...brewMethodData.map((d) => d.caffeineMg), 1),
    [brewMethodData],
  );

  return (
    <div className="space-y-6">
      {/* ── Brew method comparison bar chart ─────────────────────── */}
      <div className={compact ? '' : 'card'}>
        <h4 className="text-sm font-semibold text-coffee-800 dark:text-coffee-300 mb-3">
          Caffeine by Brew Method
        </h4>
        <p className="text-xs text-coffee-500 dark:text-coffee-400 mb-4">
          Comparing all 8 methods at your current coffee weight, species, and parameters
        </p>
        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={brewMethodData}
              margin={{ top: 15, right: 10, left: 0, bottom: 40 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-coffee-200 dark:text-coffee-700"
                strokeOpacity={0.5}
                vertical={false}
              />
              <XAxis
                dataKey="method"
                tick={{ fontSize: 10, fill: '#8b7355' }}
                stroke="#8b7355"
                tickLine={false}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#8b7355' }}
                stroke="#8b7355"
                tickLine={false}
                axisLine={false}
                width={40}
                domain={[0, Math.max(maxBrewMethodCaffeine * 1.15, 10)]}
                tickFormatter={(v: number) => `${Math.round(v)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="caffeineMg"
                fill="#c67b4b"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
                animationDuration={400}
              >
                <LabelList
                  dataKey="caffeineMg"
                  position="top"
                  style={{ fontSize: 10, fill: '#8b7355', fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Coffee weight sensitivity line chart ────────────────── */}
      <div className={compact ? '' : 'card'}>
        <h4 className="text-sm font-semibold text-coffee-800 dark:text-coffee-300 mb-3">
          Caffeine vs. Coffee Weight
        </h4>
        <p className="text-xs text-coffee-500 dark:text-coffee-400 mb-4">
          How caffeine scales with coffee weight (1–100g) using your current brew method
        </p>
        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={weightData}
              margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-coffee-200 dark:text-coffee-700"
                strokeOpacity={0.5}
              />
              <XAxis
                dataKey="weightG"
                tick={{ fontSize: 11, fill: '#8b7355' }}
                stroke="#8b7355"
                tickLine={false}
                label={{
                  value: 'Coffee weight (g)',
                  position: 'insideBottom',
                  offset: -5,
                  style: { fontSize: 11, fill: '#8b7355' },
                }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#8b7355' }}
                stroke="#8b7355"
                tickLine={false}
                axisLine={false}
                width={45}
                tickFormatter={(v: number) => `${Math.round(v)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, color: '#8b7355' }}
              />
              <Line
                type="monotone"
                dataKey="caffeineMg"
                name="Caffeine (mg)"
                stroke="#c67b4b"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#c67b4b', stroke: '#fff', strokeWidth: 1.5 }}
                activeDot={{ r: 5, fill: '#c67b4b', stroke: '#fff', strokeWidth: 2 }}
                animationDuration={600}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
});

export default SensitivityCharts;
