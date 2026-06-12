/**
 * BloodLevelChart — Recharts AreaChart showing 24-hour blood caffeine levels.
 *
 * Visualizes the pharmacokinetic model output with:
 * - Filled area under the curve
 * - Shaded safe zone (under 400 mg daily limit)
 * - Current time marker
 * - Responsive container for all screen sizes
 */

import { memo, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { generateBloodLevelCurve, DAILY_SAFE_LIMIT_MG } from '@/engine/caffeineMetabolism';
import { CaffeineMg, Hours } from '@/types/branded';
import type { CaffeineLogEntry } from '@/types';

interface BloodLevelChartProps {
  entries: CaffeineLogEntry[];
  halfLifeHours: Hours;
}

/** Typed data point for the chart pipeline. */
interface ChartDataPoint {
  hours: number;
  caffeineMg: CaffeineMg;
  time: Date;
}

/** Format hours as readable time of day.
 *  Exported for testing — used internally as Recharts tickFormatter. */
export function formatHour(hoursSinceStart: number, startTime: Date): string {
  const d = new Date(startTime.getTime() + hoursSinceStart * 3600000);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

/** Custom tooltip for chart data points. Exported for testing. */
export function CustomTooltip({
  active,
  payload,
  label,
  startTime,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: number;
  startTime: Date;
}) {
  if (!active || !payload || !payload.length || label === undefined) return null;

  const timeLabel = formatHour(label, startTime);
  const level = payload[0].value;

  return (
    <div className="bg-white dark:bg-coffee-800 border border-coffee-200 dark:border-coffee-600 rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="text-coffee-500 dark:text-coffee-400 font-medium">{timeLabel}</p>
      <p className="text-coffee-800 dark:text-coffee-100 font-bold">
        {level.toFixed(1)} mg
      </p>
    </div>
  );
}

const BloodLevelChart = memo(function BloodLevelChart({ entries, halfLifeHours }: BloodLevelChartProps) {
  const data = useMemo<ChartDataPoint[]>(() => {
    const sorted = [...entries].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    const curve = generateBloodLevelCurve(sorted, halfLifeHours, Hours(24));

    // For the chart, use hoursSinceStart as x-axis and caffeineMg as y-axis
    return curve.map((point) => ({
      hours: point.hoursSinceStart,
      caffeineMg: point.caffeineMg,
      time: point.time,
    }));
  }, [entries, halfLifeHours]);

  // Start time for tooltip formatting
  const startTime = data.length > 0 ? data[0].time : new Date();

  // Find current time position
  const now = new Date();
  const currentHours = data.length > 0
    ? (now.getTime() - startTime.getTime()) / 3600000
    : 0;

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-coffee-400 dark:text-coffee-400">
        Log a drink to see your blood caffeine curve
      </div>
    );
  }

  const maxLevel = Math.max(...data.map((d) => d.caffeineMg), DAILY_SAFE_LIMIT_MG);
  const currentLevel = data.length > 0 ? data[data.length - 1]?.caffeineMg ?? 0 : 0;

  return (
    <div
      className="w-full h-64 sm:h-72 min-w-[200px] min-h-[100px]"
      role="img"
      aria-label={`Blood caffeine level chart. Current level: ${Math.round(currentLevel)} mg. Maximum level: ${Math.round(maxLevel)} mg.`}
    >
      {/* Screen-reader accessible data table (visually hidden) */}
      <div className="sr-only">
        <p>24-Hour Blood Caffeine Level Chart</p>
        <p>Current estimated level: {Math.round(currentLevel)} mg</p>
        <p>Peak level: {Math.round(maxLevel)} mg</p>
        <p>Daily safe limit: {DAILY_SAFE_LIMIT_MG} mg</p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="bloodLevelFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c67b4b" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#c67b4b" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          {/* Safe zone shading */}
          {maxLevel > DAILY_SAFE_LIMIT_MG && (
            <ReferenceArea
              y1={DAILY_SAFE_LIMIT_MG}
              y2={maxLevel + 10}
              fill="#ef4444"
              fillOpacity={0.08}
            />
          )}

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className="text-coffee-200 dark:text-coffee-700"
            strokeOpacity={0.5}
          />

          <XAxis
            dataKey="hours"
            tickFormatter={(h: number) => formatHour(h, startTime)}
            tick={{ fontSize: 11, fill: '#8b7355' }}
            stroke="#8b7355"
            tickLine={false}
            interval="preserveStartEnd"
          />

          <YAxis
            tick={{ fontSize: 11, fill: '#8b7355' }}
            stroke="#8b7355"
            tickLine={false}
            axisLine={false}
            width={45}
            domain={[0, Math.max(maxLevel * 1.1, 10)]}
            tickFormatter={(v: number) => `${Math.round(v)}`}
            label={{
              value: 'mg',
              position: 'insideTopLeft',
              offset: -5,
              style: { fontSize: 11, fill: '#8b7355' },
            }}
          />

          <Tooltip
            content={<CustomTooltip startTime={startTime} />}
          />

          {/* Daily safe limit reference line */}
          <ReferenceLine
            y={DAILY_SAFE_LIMIT_MG}
            stroke="#ef4444"
            strokeDasharray="4 4"
            strokeOpacity={0.6}
            label={{
              value: '400 mg limit',
              position: 'insideTopRight',
              style: { fontSize: 10, fill: '#ef4444' },
            }}
          />

          {/* Current time indicator */}
          {currentHours >= 0 && currentHours <= 24 && (
            <ReferenceLine
              x={currentHours}
              stroke="#8b5e3c"
              strokeWidth={2}
              strokeOpacity={0.7}
              label={{
                value: 'Now',
                position: 'top',
                style: { fontSize: 10, fill: '#8b5e3c', fontWeight: 600 },
              }}
            />
          )}

          <Area
            type="monotone"
            dataKey="caffeineMg"
            stroke="#c67b4b"
            strokeWidth={2}
            fill="url(#bloodLevelFill)"
            dot={false}
            activeDot={{ r: 4, fill: '#c67b4b', stroke: '#fff', strokeWidth: 2 }}
            isAnimationActive={true}
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

export default BloodLevelChart;
