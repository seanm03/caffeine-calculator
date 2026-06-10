/**
 * HalfLifeSlider — Isolated caffeine half-life slider control.
 *
 * Extracted from MetabolismTracker to limit re-render scope:
 * slider drag events only re-render this component, not the drink log
 * or chart sections.
 */

import { memo } from 'react';
import { MIN_HALF_LIFE_HOURS, MAX_HALF_LIFE_HOURS } from '@/engine/caffeineMetabolism';

interface HalfLifeSliderProps {
  halfLifeHours: number;
  onChange: (hours: number) => void;
}

const HalfLifeSlider = memo(function HalfLifeSlider({
  halfLifeHours,
  onChange,
}: HalfLifeSliderProps) {
  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-coffee-800 dark:text-coffee-300">
            Caffeine Half-Life
          </h3>
          <p className="text-xs text-coffee-500 dark:text-coffee-400">
            Adjust based on your metabolism (typical: 5h)
          </p>
        </div>
        <div className="flex items-center gap-3 min-w-[200px]">
          <span className="text-xs text-coffee-400 dark:text-coffee-500 w-8 text-right">
            {MIN_HALF_LIFE_HOURS}h
          </span>
          <input
            type="range"
            min={MIN_HALF_LIFE_HOURS}
            max={MAX_HALF_LIFE_HOURS}
            step={0.5}
            value={halfLifeHours}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-coffee-200 dark:bg-coffee-700 rounded-lg appearance-none cursor-pointer
                       accent-coffee-600 dark:accent-coffee-400"
            aria-label={`Caffeine half-life: ${halfLifeHours} hours`}
          />
          <span className="text-xs font-semibold text-coffee-700 dark:text-coffee-200 w-10">
            {halfLifeHours}h
          </span>
          <span className="text-xs text-coffee-400 dark:text-coffee-500 w-8">
            {MAX_HALF_LIFE_HOURS}h
          </span>
        </div>
      </div>
    </div>
  );
});

export default HalfLifeSlider;
