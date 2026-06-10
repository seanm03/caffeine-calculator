import { useCallback } from 'react';
import type { BrewMethod } from '@/types';

const BREW_METHODS: { value: BrewMethod; label: string }[] = [
  { value: 'espresso', label: 'Espresso' },
  { value: 'pour-over', label: 'Pour Over' },
  { value: 'french-press', label: 'French Press' },
  { value: 'aeropress', label: 'Aeropress' },
  { value: 'moka-pot', label: 'Moka Pot' },
  { value: 'cold-brew', label: 'Cold Brew' },
  { value: 'turkish', label: 'Turkish' },
  { value: 'instant', label: 'Instant' },
];

const BREW_VALUES = BREW_METHODS.map((m) => m.value);

export interface BrewMethodSelectorProps {
  value: BrewMethod;
  onChange: (method: BrewMethod) => void;
}

export default function BrewMethodSelector({ value, onChange }: BrewMethodSelectorProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const idx = BREW_VALUES.indexOf(value);
        const nextIdx = (idx + 1) % BREW_VALUES.length;
        onChange(BREW_VALUES[nextIdx]);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const idx = BREW_VALUES.indexOf(value);
        const prevIdx = (idx - 1 + BREW_VALUES.length) % BREW_VALUES.length;
        onChange(BREW_VALUES[prevIdx]);
      } else if (e.key === 'Home') {
        e.preventDefault();
        onChange(BREW_VALUES[0]);
      } else if (e.key === 'End') {
        e.preventDefault();
        onChange(BREW_VALUES[BREW_VALUES.length - 1]);
      }
    },
    [value, onChange],
  );

  return (
    <fieldset>
      <legend className="block text-sm font-semibold text-coffee-800 dark:text-coffee-300 mb-3">
        Brew Method
      </legend>
      <div
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2"
        role="radiogroup"
        aria-label="Brew Method"
        onKeyDown={handleKeyDown}
      >
        {BREW_METHODS.map(({ value: method, label }) => {
          const isSelected = value === method;
          return (
            <button
              key={method}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onChange(method)}
              className={`
                flex flex-col items-center justify-center gap-1 p-4 rounded-xl border-2
                transition-all duration-200 cursor-pointer select-none
                focus:outline-none focus-visible:ring-2 focus-visible:ring-coffee-400
                focus-visible:ring-offset-2
                ${
                  isSelected
                    ? 'border-coffee-500 bg-coffee-100 dark:border-coffee-400 dark:bg-coffee-900 ring-2 ring-coffee-500 dark:ring-coffee-400'
                    : 'border-coffee-200 bg-white dark:border-coffee-700 dark:bg-coffee-800 hover:border-coffee-300 dark:hover:border-coffee-600'
                }
              `}
            >
              <span
                className={`text-[10px] sm:text-xs font-medium ${
                  isSelected
                    ? 'text-coffee-800 dark:text-coffee-100'
                    : 'text-coffee-600 dark:text-coffee-200'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
