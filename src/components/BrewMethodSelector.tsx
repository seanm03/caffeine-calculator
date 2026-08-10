import { useCallback } from 'react';
import { ALL_BREW_METHODS, BREW_METHOD_LABELS } from '@/engine/constants';
import type { BrewMethod } from '@/types';

export interface BrewMethodSelectorProps {
  value: BrewMethod;
  onChange: (method: BrewMethod) => void;
}

export default function BrewMethodSelector({ value, onChange }: BrewMethodSelectorProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const idx = ALL_BREW_METHODS.indexOf(value);
        const nextIdx = (idx + 1) % ALL_BREW_METHODS.length;
        onChange(ALL_BREW_METHODS[nextIdx]);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const idx = ALL_BREW_METHODS.indexOf(value);
        const prevIdx = (idx - 1 + ALL_BREW_METHODS.length) % ALL_BREW_METHODS.length;
        onChange(ALL_BREW_METHODS[prevIdx]);
      } else if (e.key === 'Home') {
        e.preventDefault();
        onChange(ALL_BREW_METHODS[0]);
      } else if (e.key === 'End') {
        e.preventDefault();
        onChange(ALL_BREW_METHODS[ALL_BREW_METHODS.length - 1]);
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
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-3 gap-2"
        role="radiogroup"
        aria-label="Brew Method"
        onKeyDown={handleKeyDown}
      >
        {ALL_BREW_METHODS.map((method) => {
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
                {BREW_METHOD_LABELS[method]}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
