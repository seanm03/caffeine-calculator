import type { UnitSystem } from '../hooks/useUnits';

export interface UnitToggleProps {
  unitSystem: UnitSystem;
  onToggle: () => void;
}

export default function UnitToggle({ unitSystem, onToggle }: UnitToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                 bg-coffee-100 dark:bg-coffee-800 text-coffee-700 dark:text-coffee-200
                 hover:bg-coffee-200 dark:hover:bg-coffee-700
                 transition-colors duration-200
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-coffee-400"
      aria-label={`Switch to ${unitSystem === 'metric' ? 'imperial' : 'metric'} units`}
      title={`Switch to ${unitSystem === 'metric' ? 'imperial (oz, fl oz, °F)' : 'metric (g, mL, °C)'}`}
    >
      <span aria-hidden="true">{unitSystem === 'metric' ? '📐' : '📏'}</span>
      <span>{unitSystem === 'metric' ? 'Metric' : 'Imperial'}</span>
    </button>
  );
}
