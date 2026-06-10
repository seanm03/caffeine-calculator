import type { Species } from '@/types';
import { useUnits } from '@/hooks/useUnits';
import SegmentedControl from '@/components/SegmentedControl';

export interface CoffeeInputsProps {
  coffeeWeightG: number;
  onCoffeeWeightChange: (g: number) => void;
  waterVolumeMl: number;
  onWaterVolumeChange: (ml: number) => void;
  species: Species;
  onSpeciesChange: (s: Species) => void;
  robustaPercent?: number;
  onRobustaPercentChange?: (p: number) => void;
}

const SPECIES_OPTIONS: { value: Species; label: string }[] = [
  { value: 'arabica', label: 'Arabica' },
  { value: 'robusta', label: 'Robusta' },
  { value: 'blend', label: 'Blend' },
  { value: 'decaf', label: 'Decaf' },
];

function formatRatio(coffeeG: number, waterMl: number): string {
  if (coffeeG <= 0) return '—';
  const ratio = waterMl / coffeeG;
  return `1:${ratio.toFixed(1)}`;
}

export default function CoffeeInputs({
  coffeeWeightG,
  onCoffeeWeightChange,
  waterVolumeMl,
  onWaterVolumeChange,
  species,
  onSpeciesChange,
  robustaPercent = 50,
  onRobustaPercentChange,
}: CoffeeInputsProps) {
  const { unitSystem, gToOz, mlToFlOz } = useUnits();
  const isWeightOutOfRange = coffeeWeightG < 1 || coffeeWeightG > 100;
  const isWaterOutOfRange = waterVolumeMl < 10 || waterVolumeMl > 1000;

  const imperialWeight = gToOz(coffeeWeightG);
  const imperialVolume = mlToFlOz(waterVolumeMl);

  return (
    <div className="space-y-5">
      {/* Coffee Weight + Water Volume: stacked mobile, side-by-side tablet */}
      <div className="flex flex-col md:flex-row md:gap-6">
        {/* Coffee Weight */}
        <div className="flex-1">
          <label
            htmlFor="coffee-weight"
            className="block text-sm font-semibold text-coffee-800 dark:text-coffee-300 mb-1"
          >
            Coffee Weight{' '}
            <span className="text-coffee-500 dark:text-coffee-300 font-normal">
              ({unitSystem === 'metric' ? 'g' : 'oz'})
            </span>
          </label>
          <input
            id="coffee-weight"
            type="number"
            min={unitSystem === 'metric' ? 1 : 0.1}
            max={unitSystem === 'metric' ? 100 : 4}
            step={unitSystem === 'metric' ? 0.1 : 0.01}
            value={unitSystem === 'metric' ? coffeeWeightG : imperialWeight}
            onChange={(e) => {
              const v = parseFloat(e.target.value) || 0;
              onCoffeeWeightChange(unitSystem === 'metric' ? v : Math.round((v / 0.035274) * 10) / 10);
            }}
            className={`input-coffee dark:bg-coffee-800 dark:border-coffee-700 dark:text-coffee-100
              dark:placeholder-coffee-500 min-h-[44px] text-base
              ${isWeightOutOfRange ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}
            `}
            aria-invalid={isWeightOutOfRange || undefined}
            aria-describedby={isWeightOutOfRange ? 'coffee-weight-hint' : undefined}
          />
          {unitSystem === 'imperial' && (
            <p className="text-xs text-coffee-400 dark:text-coffee-400 mt-1">
              = {coffeeWeightG} g
            </p>
          )}
          {isWeightOutOfRange && (
            <p id="coffee-weight-hint" className="text-xs text-red-500 mt-1">
              {unitSystem === 'metric'
                ? 'Enter a value between 1 and 100 g'
                : 'Enter a value between 0.1 and 4 oz'}
            </p>
          )}
        </div>

        {/* Water Volume */}
        <div className="flex-1 mt-4 md:mt-0">
          <label
            htmlFor="water-volume"
            className="block text-sm font-semibold text-coffee-800 dark:text-coffee-300 mb-1"
          >
            Water Volume{' '}
            <span className="text-coffee-500 dark:text-coffee-300 font-normal">
              ({unitSystem === 'metric' ? 'mL' : 'fl oz'})
            </span>
          </label>
          <input
            id="water-volume"
            type="number"
            min={unitSystem === 'metric' ? 10 : 0.5}
            max={unitSystem === 'metric' ? 1000 : 34}
            step={unitSystem === 'metric' ? 1 : 0.1}
            value={unitSystem === 'metric' ? waterVolumeMl : imperialVolume}
            onChange={(e) => {
              const v = parseFloat(e.target.value) || 0;
              onWaterVolumeChange(unitSystem === 'metric' ? v : Math.round((v / 0.033814) * 10) / 10);
            }}
            className={`input-coffee dark:bg-coffee-800 dark:border-coffee-700 dark:text-coffee-100
              dark:placeholder-coffee-500 min-h-[44px] text-base
              ${isWaterOutOfRange ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}
            `}
            aria-invalid={isWaterOutOfRange || undefined}
            aria-describedby={isWaterOutOfRange ? 'water-volume-hint' : undefined}
          />
          {unitSystem === 'imperial' && (
            <p className="text-xs text-coffee-400 dark:text-coffee-400 mt-1">
              = {waterVolumeMl} mL
            </p>
          )}
          {isWaterOutOfRange && (
            <p id="water-volume-hint" className="text-xs text-red-500 mt-1">
              {unitSystem === 'metric'
                ? 'Enter a value between 10 and 1000 mL'
                : 'Enter a value between 0.5 and 34 fl oz'}
            </p>
          )}
        </div>
      </div>

      {/* Water-to-Coffee Ratio */}
      <div className="text-center py-3 px-4 bg-coffee-100 dark:bg-coffee-800 rounded-lg transition-colors duration-300">
        <span className="text-sm text-coffee-600 dark:text-coffee-200">
          Water-to-coffee ratio:{' '}
        </span>
        <span className="text-sm font-bold text-coffee-800 dark:text-coffee-100">
          {formatRatio(coffeeWeightG, waterVolumeMl)}
        </span>
        {unitSystem === 'imperial' && (
          <p className="text-xs text-coffee-400 dark:text-coffee-400 mt-1">
            Ratio always uses metric (specialty coffee standard)
          </p>
        )}
      </div>

      {/* Species */}
      <fieldset>
        <legend className="block text-sm font-semibold text-coffee-800 dark:text-coffee-300 mb-2">
          Coffee Species
        </legend>
        <SegmentedControl
          options={SPECIES_OPTIONS}
          value={species}
          onChange={onSpeciesChange}
          size="md"
        />
      </fieldset>

      {/* Robusta % Slider (only when Blend is selected) */}
      {species === 'blend' && (
        <div className="animate-fadeIn">
          <label
            htmlFor="robusta-percent"
            className="block text-sm font-semibold text-coffee-800 dark:text-coffee-300 mb-1"
          >
            Robusta in Blend: {robustaPercent}%
          </label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-coffee-500 dark:text-coffee-300">Arabica</span>
            <input
              id="robusta-percent"
              type="range"
              min={0}
              max={100}
              step={5}
              value={robustaPercent}
              onChange={(e) => onRobustaPercentChange?.(parseInt(e.target.value, 10))}
              className="flex-1 accent-coffee-500 dark:accent-coffee-400 min-h-[44px]"
            />
            <span className="text-xs text-coffee-500 dark:text-coffee-300">Robusta</span>
          </div>
        </div>
      )}

      {/* Decaf brewing notes (only when Decaf is selected) */}
      {species === 'decaf' && (
        <div className="animate-fadeIn bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-sm leading-relaxed">
          <p className="text-amber-800 dark:text-amber-200">
            <strong>Decaf</strong> contains ~97% less caffeine than Arabica
            (~0.3 mg/g vs. 12 mg/g). Actual caffeine varies widely by brand
            (0–0.7 mg/g). For best flavor, decaf often benefits from a slightly
            finer grind.
          </p>
        </div>
      )}
    </div>
  );
}
