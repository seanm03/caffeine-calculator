import { useState, useCallback, createContext, useContext } from 'react';

export type UnitSystem = 'metric' | 'imperial';

export interface UnitHelpers {
  unitSystem: UnitSystem;
  toggle: () => void;
  gToOz: (g: number) => number;
  ozToG: (oz: number) => number;
  mlToFlOz: (ml: number) => number;
  flOzToMl: (flOz: number) => number;
  cToF: (c: number) => number;
  fToC: (f: number) => number;
}

const UnitContext = createContext<UnitHelpers | null>(null);

function getInitialUnits(): UnitSystem {
  const saved = localStorage.getItem('coffee-calc-units');
  return saved === 'imperial' ? 'imperial' : 'metric';
}

export function UnitProvider({ children }: { children: React.ReactNode }) {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(getInitialUnits);

  const toggle = useCallback(() => {
    setUnitSystem((prev) => {
      const next = prev === 'metric' ? 'imperial' : 'metric';
      try {
        localStorage.setItem('coffee-calc-units', next);
      } catch {
        // Silently fail on QuotaExceededError
      }
      return next;
    });
  }, []);

  const gToOz = useCallback((g: number) => Math.round(g * 0.035274 * 10) / 10, []);
  const ozToG = useCallback((oz: number) => Math.round((oz / 0.035274) * 10) / 10, []);
  const mlToFlOz = useCallback((ml: number) => Math.round(ml * 0.033814 * 10) / 10, []);
  const flOzToMl = useCallback((flOz: number) => Math.round((flOz / 0.033814) * 10) / 10, []);
  const cToF = useCallback((c: number) => Math.round((c * 9 / 5 + 32) * 10) / 10, []);
  const fToC = useCallback((f: number) => Math.round(((f - 32) * 5 / 9) * 10) / 10, []);

  return (
    <UnitContext.Provider value={{ unitSystem, toggle, gToOz, ozToG, mlToFlOz, flOzToMl, cToF, fToC }}>
      {children}
    </UnitContext.Provider>
  );
}

export function useUnits(): UnitHelpers {
  const ctx = useContext(UnitContext);
  if (!ctx) throw new Error('useUnits must be used within a UnitProvider');
  return ctx;
}
