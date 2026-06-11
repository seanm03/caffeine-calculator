import { useState, useRef, useEffect } from 'react';
import SegmentedControl from '@/components/SegmentedControl';
import { useUnits } from '@/hooks/useUnits';
import { TemperatureC } from '@/types/branded';
import type { RoastLevel, GrindSize, ProcessingMethod, Altitude } from '@/types';

// ---------------------------------------------------------------------------
// Prop types
// ---------------------------------------------------------------------------

export interface AdvancedOptionsProps {
  roastLevel: RoastLevel;
  onRoastLevelChange: (r: RoastLevel) => void;
  grindSize: GrindSize;
  onGrindSizeChange: (g: GrindSize) => void;
  waterTemperatureC: TemperatureC;
  onWaterTemperatureChange: (t: TemperatureC) => void;
  processingMethod: ProcessingMethod;
  onProcessingMethodChange: (p: ProcessingMethod) => void;
  altitude: Altitude;
  onAltitudeChange: (a: Altitude) => void;
}

// ---------------------------------------------------------------------------
// Option definitions
// ---------------------------------------------------------------------------

const ROAST_OPTIONS: { value: RoastLevel; label: string; indicator: string }[] = [
  { value: 'light', label: 'Light', indicator: '#c9a87c' },
  { value: 'medium', label: 'Medium', indicator: '#8b5e3c' },
  { value: 'dark', label: 'Dark', indicator: '#3d2415' },
];

const GRIND_OPTIONS: { value: GrindSize; label: string }[] = [
  { value: 'extra-fine', label: 'Extra Fine' },
  { value: 'fine', label: 'Fine' },
  { value: 'medium', label: 'Medium' },
  { value: 'coarse', label: 'Coarse' },
  { value: 'extra-coarse', label: 'Extra Coarse' },
];

const PROCESSING_OPTIONS: { value: ProcessingMethod; label: string }[] = [
  { value: 'washed', label: 'Washed' },
  { value: 'honey', label: 'Honey' },
  { value: 'natural', label: 'Natural' },
];

const ALTITUDE_OPTIONS: { value: Altitude; label: string }[] = [
  { value: 'low', label: 'Low <1,000m' },
  { value: 'medium', label: 'Medium 1,000–1,600m' },
  { value: 'high', label: 'High >1,600m' },
];

// ---------------------------------------------------------------------------
// Effect magnitude help text (★ = weak, ★★★★★ = strong)
// ---------------------------------------------------------------------------

const EFFECT_MAGNITUDE: Record<string, string> = {
  roast: '★★★ Moderate — Light roasts retain ~5% more caffeine; dark roasts lose ~10%',
  grind: '★★★★ Strong — Finer grinds increase surface area and extraction rate',
  temperature: '★★ Weak — Effect modest (<5%) within typical brewing ranges',
  processing: '★ Very weak — Natural processing may slightly concentrate caffeine (±3%)',
  altitude: '★ Very weak — Higher altitude beans may have slightly less caffeine (±5%)',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdvancedOptions({
  roastLevel,
  onRoastLevelChange,
  grindSize,
  onGrindSizeChange,
  waterTemperatureC,
  onWaterTemperatureChange,
  processingMethod,
  onProcessingMethodChange,
  altitude,
  onAltitudeChange,
}: AdvancedOptionsProps) {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const { unitSystem, cToF } = useUnits();

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [expanded, roastLevel, grindSize, waterTemperatureC, processingMethod, altitude]);

  const displayTemp = unitSystem === 'imperial' ? cToF(waterTemperatureC) : waterTemperatureC;
  const tempUnit = unitSystem === 'imperial' ? '°F' : '°C';

  return (
    <div className="border border-coffee-200 dark:border-coffee-700 rounded-xl overflow-hidden">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-3.5
                   bg-coffee-50 dark:bg-coffee-800/50
                   hover:bg-coffee-100 dark:hover:bg-coffee-700/50
                   transition-colors duration-200
                   text-sm font-semibold text-coffee-700 dark:text-coffee-200
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-inset
                   focus-visible:ring-coffee-400"
        aria-expanded={expanded}
        aria-controls="advanced-options-panel"
      >
        <span>
          {expanded ? '▾ Hide advanced options' : '▸ Fine-tune your estimate'}
        </span>
      </button>

      {/* Collapsible content */}
      <div
        id="advanced-options-panel"
        ref={contentRef}
        className="transition-[max-height] duration-300 ease-in-out overflow-hidden"
        style={{
          maxHeight: expanded ? `${contentHeight}px` : '0px',
        }}
      >
        <div className="px-5 pb-5 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-8">
          {/* Roast Level */}
          <fieldset>
            <legend className="block text-sm font-semibold text-coffee-800 dark:text-coffee-300 mb-1.5">
              Roast Level
            </legend>
            <SegmentedControl
              options={ROAST_OPTIONS}
              value={roastLevel}
              onChange={onRoastLevelChange}
              size="sm"
            />
            <p className="text-xs text-coffee-500 dark:text-coffee-300 mt-1">
              {EFFECT_MAGNITUDE.roast}
            </p>
          </fieldset>

          {/* Grind Size — spans full width to accommodate 5 segments */}
          <fieldset className="md:col-span-2">
            <legend className="block text-sm font-semibold text-coffee-800 dark:text-coffee-300 mb-1.5">
              Grind Size
            </legend>
            <SegmentedControl
              options={GRIND_OPTIONS}
              value={grindSize}
              onChange={onGrindSizeChange}
              size="sm"
            />
            <p className="text-xs text-coffee-500 dark:text-coffee-300 mt-1">
              {EFFECT_MAGNITUDE.grind}
            </p>
          </fieldset>

          {/* Water Temperature */}
          <fieldset>
            <legend className="block text-sm font-semibold text-coffee-800 dark:text-coffee-300 mb-1.5">
              Water Temperature
            </legend>
            <div className="flex items-center gap-3 mb-2">
              <input
                id="water-temp"
                type="number"
                min={unitSystem === 'metric' ? 70 : Math.round(cToF(70))}
                max={unitSystem === 'metric' ? 100 : cToF(100)}
                step={1}
                value={displayTemp}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v)) {
                    const celsius = unitSystem === 'metric' ? v : Math.round(((v - 32) * 5 / 9) * 10) / 10;
                    if (celsius >= 70 && celsius <= 100) {
                      onWaterTemperatureChange(TemperatureC(celsius));
                    }
                  } else if (e.target.value === '') {
                    onWaterTemperatureChange(TemperatureC(93));
                  }
                }}
                className="w-20 px-2 py-1.5 text-center text-sm border border-coffee-300
                           dark:border-coffee-700 dark:bg-coffee-800 dark:text-coffee-100
                           rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                aria-label={`Water temperature in ${tempUnit}`}
              />
              <span className="text-sm text-coffee-600 dark:text-coffee-200">{tempUnit}</span>
            </div>
            <p className="text-xs text-coffee-500 dark:text-coffee-300">
              {EFFECT_MAGNITUDE.temperature}
            </p>
          </fieldset>

          {/* Processing Method */}
          <fieldset>
            <legend className="block text-sm font-semibold text-coffee-800 dark:text-coffee-300 mb-1.5">
              Processing Method
            </legend>
            <SegmentedControl
              options={PROCESSING_OPTIONS}
              value={processingMethod}
              onChange={onProcessingMethodChange}
              size="sm"
            />
            <p className="text-xs text-coffee-500 dark:text-coffee-300 mt-1">
              {EFFECT_MAGNITUDE.processing}
            </p>
          </fieldset>

          {/* Altitude */}
          <fieldset>
            <legend className="block text-sm font-semibold text-coffee-800 dark:text-coffee-300 mb-1.5">
              Growing Altitude
            </legend>
            <SegmentedControl
              options={ALTITUDE_OPTIONS}
              value={altitude}
              onChange={onAltitudeChange}
              size="sm"
            />
            <p className="text-xs text-coffee-500 dark:text-coffee-300 mt-1">
              {EFFECT_MAGNITUDE.altitude}
            </p>
          </fieldset>
          </div>
        </div>
      </div>
    </div>
  );
}
