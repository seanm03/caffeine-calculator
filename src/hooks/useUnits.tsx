import { useState, useCallback } from 'react';
import { createCtxWithName } from './createCtx';

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

const [useUnitsCtx, UnitContextProvider] = createCtxWithName<UnitHelpers>('UnitContext');

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
        // Silent failure is intentional: unit preference is low-impact and has
        // a sensible default ('metric'). No user-facing notification needed.
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
    <UnitContextProvider value={{ unitSystem, toggle, gToOz, ozToG, mlToFlOz, flOzToMl, cToF, fToC }}>
      {children}
    </UnitContextProvider>
  );
}

export const useUnits = useUnitsCtx;
