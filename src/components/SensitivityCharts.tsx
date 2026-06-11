/**
 * SensitivityCharts — Caffeine visualization charts using Recharts.
 *
 * Provides four analysis views:
 * 1. Bar chart comparing caffeine across all 8 brew methods at current parameters
 * 2. Line chart showing caffeine vs. coffee weight (1–100g range)
 * 3. Radar chart showing parameter contribution multipliers
 * 4. Heatmap for grind × temperature interactions
 */

import { memo, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
  Legend,
} from 'recharts';
import { calculateCaffeine } from '@/engine/caffeineCalculator';
import type { BrewMethod, BrewingParameters, CaffeineResult, GrindSize } from '@/types';

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

const ALL_GRIND_SIZES: GrindSize[] = [
  'extra-fine',
  'fine',
  'medium',
  'coarse',
  'extra-coarse',
];

const GRIND_LABELS: Record<GrindSize, string> = {
  'extra-fine': 'Extra Fine',
  fine: 'Fine',
  medium: 'Medium',
  coarse: 'Coarse',
  'extra-coarse': 'Extra Coarse',
};

const HEATMAP_TEMPS = [70, 75, 80, 85, 90, 95, 100];

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

  // ── Radar chart: parameter contribution data ───────────────────
  const radarData = useMemo(() => {
    const result: CaffeineResult = calculateCaffeine(currentParams);
    const { breakdown } = result;
    return [
      { param: 'Roast', value: Math.round(breakdown.roastAdjustment * 100), fullMark: 120 },
      { param: 'Processing', value: Math.round(breakdown.processingAdjustment * 100), fullMark: 120 },
      { param: 'Altitude', value: Math.round(breakdown.altitudeAdjustment * 100), fullMark: 120 },
      { param: 'Grind', value: Math.round(breakdown.grindAdjustment * 100), fullMark: 120 },
      { param: 'Temperature', value: Math.round(breakdown.temperatureAdjustment * 100), fullMark: 120 },
      { param: 'Base Efficiency', value: Math.round(breakdown.baseEfficiency * 100), fullMark: 120 },
    ];
  }, [currentParams]);

  // ── Heatmap: grind × temperature data ──────────────────────────
  const heatmapData = useMemo(() => {
    const grid: Array<{ grind: string; temp: number; caffeineMg: number }> = [];
    for (const grind of ALL_GRIND_SIZES) {
      for (const temp of HEATMAP_TEMPS) {
        const params: BrewingParameters = {
          ...currentParams,
          grindSize: grind,
          waterTemperatureC: temp,
        };
        const result: CaffeineResult = calculateCaffeine(params);
        grid.push({
          grind: GRIND_LABELS[grind],
          temp,
          caffeineMg: Math.round(result.totalCaffeineMg),
        });
      }
    }
    return grid;
  }, [currentParams]);

  const heatmapMin = useMemo(
    () => Math.min(...heatmapData.map((d) => d.caffeineMg)),
    [heatmapData],
  );
  const heatmapMax = useMemo(
    () => Math.max(...heatmapData.map((d) => d.caffeineMg)),
    [heatmapData],
  );

  function heatmapColor(caffeineMg: number): string {
    if (heatmapMax === heatmapMin) return 'rgb(198, 123, 75)';
    const t = (caffeineMg - heatmapMin) / (heatmapMax - heatmapMin);
    // Interpolate from light cream to dark coffee
    const r = Math.round(255 - t * 105);
    const g = Math.round(235 - t * 160);
    const b = Math.round(210 - t * 135);
    return `rgb(${r}, ${g}, ${b})`;
  }

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

      {/* ── Radar chart: parameter contributions ────────────────── */}
      <div className={compact ? '' : 'card'}>
        <h4 className="text-sm font-semibold text-coffee-800 dark:text-coffee-300 mb-3">
          Parameter Contribution Weights
        </h4>
        <p className="text-xs text-coffee-500 dark:text-coffee-400 mb-4">
          How each parameter multiplier affects the total caffeine (100% = no adjustment)
        </p>
        <div className="w-full h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#8b7355" strokeOpacity={0.3} />
              <PolarAngleAxis
                dataKey="param"
                tick={{ fontSize: 11, fill: '#8b7355' }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[60, 120]}
                tick={{ fontSize: 10, fill: '#8b7355' }}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Radar
                name="Multiplier %"
                dataKey="value"
                stroke="#c67b4b"
                fill="#c67b4b"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Heatmap: grind × temperature ────────────────────────── */}
      <div className={compact ? '' : 'card'}>
        <h4 className="text-sm font-semibold text-coffee-800 dark:text-coffee-300 mb-3">
          Grind × Temperature Interaction
        </h4>
        <p className="text-xs text-coffee-500 dark:text-coffee-400 mb-4">
          Caffeine (mg) across all grind size and water temperature combinations
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse" aria-label="Grind size and temperature interaction heatmap">
            <thead>
              <tr>
                <th className="p-2 text-left text-coffee-500 dark:text-coffee-400 font-medium">
                  Grind ↓ / Temp →
                </th>
                {HEATMAP_TEMPS.map((t) => (
                  <th
                    key={t}
                    className="p-2 text-center text-coffee-500 dark:text-coffee-400 font-medium"
                  >
                    {t}°C
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_GRIND_SIZES.map((grind) => (
                <tr key={grind}>
                  <td className="p-2 text-left font-medium text-coffee-600 dark:text-coffee-300">
                    {GRIND_LABELS[grind]}
                  </td>
                  {HEATMAP_TEMPS.map((temp) => {
                    const cell = heatmapData.find(
                      (d) => d.grind === GRIND_LABELS[grind] && d.temp === temp,
                    );
                    const mg = cell?.caffeineMg ?? 0;
                    const isLight = mg > (heatmapMin + heatmapMax) / 2;
                    return (
                      <td
                        key={temp}
                        className="p-2 text-center tabular-nums rounded"
                        style={{
                          backgroundColor: heatmapColor(mg),
                          color: isLight ? '#fff' : '#3b2f2f',
                        }}
                        title={`${GRIND_LABELS[grind]} at ${temp}°C: ${mg} mg`}
                      >
                        {mg}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end gap-2 mt-3">
          <span className="text-xs text-coffee-400 dark:text-coffee-500">
            {heatmapMin} mg
          </span>
          <div
            className="h-3 w-32 rounded"
            style={{
              background: `linear-gradient(to right, ${heatmapColor(heatmapMin)}, ${heatmapColor(heatmapMax)})`,
            }}
          />
          <span className="text-xs text-coffee-400 dark:text-coffee-500">
            {heatmapMax} mg
          </span>
        </div>
      </div>
    </div>
  );
});

export default SensitivityCharts;
