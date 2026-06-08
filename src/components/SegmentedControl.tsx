import { useId, useCallback, useMemo } from 'react';

export interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string; indicator?: string }[];
  value: T;
  onChange: (v: T) => void;
  size?: 'sm' | 'md';
}

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
}: SegmentedControlProps<T>) {
  const baseId = useId();

  const optionValues = useMemo(() => options.map((o) => o.value), [options]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const idx = optionValues.indexOf(value);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIdx = (idx + 1) % optionValues.length;
        onChange(optionValues[nextIdx]);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIdx = (idx - 1 + optionValues.length) % optionValues.length;
        onChange(optionValues[prevIdx]);
      } else if (e.key === 'Home') {
        e.preventDefault();
        onChange(optionValues[0]);
      } else if (e.key === 'End') {
        e.preventDefault();
        onChange(optionValues[optionValues.length - 1]);
      }
    },
    [value, onChange, optionValues],
  );

  return (
    <div
      className="flex overflow-x-auto rounded-lg border border-coffee-300 dark:border-coffee-600"
      role="radiogroup"
      onKeyDown={handleKeyDown}
    >
      {options.map((opt, i) => {
        const isSelected = value === opt.value;
        const isSm = size === 'sm';
        return (
          <button
            key={opt.value}
            id={`${baseId}-${opt.value}`}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(opt.value)}
            className={`
              flex-1 min-w-fit flex items-center justify-center gap-1.5 whitespace-nowrap
              transition-colors duration-150 select-none
              focus:outline-none focus-visible:ring-2 focus-visible:ring-inset
              focus-visible:ring-coffee-400
              ${isSm ? 'px-2.5 py-2 text-xs min-h-[36px]' : 'px-3 py-2.5 text-sm min-h-[44px]'}
              ${i > 0 ? 'border-l border-coffee-300 dark:border-coffee-600' : ''}
              ${
                isSelected
                  ? 'bg-coffee-500 text-white dark:bg-coffee-400 dark:text-coffee-950 font-semibold'
                  : 'bg-white dark:bg-coffee-800 text-coffee-700 dark:text-coffee-200 hover:bg-coffee-50 dark:hover:bg-coffee-700 font-medium'
              }
            `}
          >
            {opt.indicator && (
              <span
                className={`inline-block rounded-full flex-shrink-0 ${isSm ? 'w-2.5 h-2.5' : 'w-3 h-3'}`}
                style={{ backgroundColor: opt.indicator }}
                aria-hidden="true"
              />
            )}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
