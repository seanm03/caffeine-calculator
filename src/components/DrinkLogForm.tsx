/**
 * DrinkLogForm — Manual entry form for logging a caffeine drink.
 *
 * Provides fields for caffeine amount, drink name, brew method, and optional notes.
 * Used within the MetabolismTracker for manual drink logging.
 */

import { useState, useCallback } from 'react';
import type { CaffeineLogEntry, BrewMethod } from '../types';

interface DrinkLogFormProps {
  onAdd: (entry: Omit<CaffeineLogEntry, 'id'>) => void;
}

const BREW_METHODS: { value: BrewMethod | ''; label: string }[] = [
  { value: '', label: '— Select —' },
  { value: 'espresso', label: 'Espresso' },
  { value: 'pour-over', label: 'Pour-Over' },
  { value: 'french-press', label: 'French Press' },
  { value: 'aeropress', label: 'AeroPress' },
  { value: 'moka-pot', label: 'Moka Pot' },
  { value: 'cold-brew', label: 'Cold Brew' },
  { value: 'turkish', label: 'Turkish' },
  { value: 'instant', label: 'Instant' },
];

export default function DrinkLogForm({ onAdd }: DrinkLogFormProps) {
  const [caffeineMg, setCaffeineMg] = useState<string>('');
  const [drinkName, setDrinkName] = useState('');
  const [brewMethod, setBrewMethod] = useState<BrewMethod | ''>('');
  const [coffeeWeightG, setCoffeeWeightG] = useState<string>('');
  const [waterVolumeMl, setWaterVolumeMl] = useState<string>('');
  const [notes, setNotes] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const mg = parseFloat(caffeineMg);
      if (isNaN(mg) || mg <= 0 || mg > 2000) return;

      onAdd({
        timestamp: new Date().toISOString(),
        caffeineMg: mg,
        drinkName: drinkName.trim() || undefined,
        brewMethod: brewMethod || undefined,
        coffeeWeightG: coffeeWeightG ? parseFloat(coffeeWeightG) : undefined,
        waterVolumeMl: waterVolumeMl ? parseFloat(waterVolumeMl) : undefined,
        notes: notes.trim() || undefined,
      });

      // Reset form
      setCaffeineMg('');
      setDrinkName('');
      setBrewMethod('');
      setCoffeeWeightG('');
      setWaterVolumeMl('');
      setNotes('');
    },
    [caffeineMg, drinkName, brewMethod, coffeeWeightG, waterVolumeMl, notes, onAdd],
  );

  const isValid = caffeineMg && parseFloat(caffeineMg) > 0 && parseFloat(caffeineMg) <= 2000;

  return (
    <form onSubmit={handleSubmit} className="space-y-3" aria-label="Log a caffeine drink">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Caffeine amount (required) */}
        <div>
          <label
            htmlFor="log-caffeine-mg"
            className="block text-xs font-medium text-coffee-700 dark:text-coffee-200 mb-1"
          >
            Caffeine (mg) <span className="text-red-500">*</span>
          </label>
          <input
            id="log-caffeine-mg"
            type="number"
            inputMode="decimal"
            min={0}
            max={2000}
            step={1}
            value={caffeineMg}
            onChange={(e) => setCaffeineMg(e.target.value)}
            placeholder="e.g., 95"
            className="input-coffee text-sm"
            required
          />
        </div>

        {/* Drink name */}
        <div>
          <label
            htmlFor="log-drink-name"
            className="block text-xs font-medium text-coffee-700 dark:text-coffee-200 mb-1"
          >
            Drink name
          </label>
          <input
            id="log-drink-name"
            type="text"
            value={drinkName}
            onChange={(e) => setDrinkName(e.target.value)}
            placeholder="e.g., Morning pour-over"
            className="input-coffee text-sm"
            maxLength={100}
          />
        </div>

        {/* Brew method */}
        <div>
          <label
            htmlFor="log-brew-method"
            className="block text-xs font-medium text-coffee-700 dark:text-coffee-200 mb-1"
          >
            Brew method
          </label>
          <select
            id="log-brew-method"
            value={brewMethod}
            onChange={(e) => setBrewMethod(e.target.value as BrewMethod | '')}
            className="input-coffee text-sm"
          >
            {BREW_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Coffee weight */}
        <div>
          <label
            htmlFor="log-coffee-weight"
            className="block text-xs font-medium text-coffee-700 dark:text-coffee-200 mb-1"
          >
            Coffee weight (g)
          </label>
          <input
            id="log-coffee-weight"
            type="number"
            inputMode="decimal"
            min={0}
            max={500}
            step={0.1}
            value={coffeeWeightG}
            onChange={(e) => setCoffeeWeightG(e.target.value)}
            placeholder="e.g., 18"
            className="input-coffee text-sm"
          />
        </div>

        {/* Water volume */}
        <div>
          <label
            htmlFor="log-water-volume"
            className="block text-xs font-medium text-coffee-700 dark:text-coffee-200 mb-1"
          >
            Water volume (ml)
          </label>
          <input
            id="log-water-volume"
            type="number"
            inputMode="decimal"
            min={0}
            max={2000}
            step={1}
            value={waterVolumeMl}
            onChange={(e) => setWaterVolumeMl(e.target.value)}
            placeholder="e.g., 300"
            className="input-coffee text-sm"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="log-notes"
          className="block text-xs font-medium text-coffee-700 dark:text-coffee-200 mb-1"
        >
          Notes
        </label>
        <input
          id="log-notes"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes..."
          className="input-coffee text-sm"
          maxLength={200}
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!isValid}
          className="btn-coffee text-sm py-1.5 px-4"
        >
          Log Drink
        </button>
      </div>
    </form>
  );
}
