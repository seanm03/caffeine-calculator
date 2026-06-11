import { useState, useCallback, useEffect, useMemo } from 'react';
import { DEFAULT_PARAMS } from '@/engine/constants';
import { clampNumber } from '@/engine/utils';
import { WeightG, VolumeMl, TemperatureC } from '@/types/branded';
import { createCtxWithName } from '@/utils/createCtx';
import type {
  BrewMethod,
  Species,
  RoastLevel,
  GrindSize,
  ProcessingMethod,
  Altitude,
} from '@/types';

const STORAGE_KEY = 'coffee-calc-state';
const STORAGE_VERSION = 1;

interface PersistedPayload {
  version: number;
  state: CalculatorState;
}

interface CalculatorState {
  brewMethod: BrewMethod;
  coffeeWeightG: WeightG;
  waterVolumeMl: VolumeMl;
  species: Species;
  isDecaf: boolean;
  robustaPercent: number;
  roastLevel: RoastLevel;
  grindSize: GrindSize;
  waterTemperatureC: TemperatureC;
  processingMethod: ProcessingMethod;
  altitude: Altitude;
}

interface CalculatorStateContextValue extends CalculatorState {
  setBrewMethod: (value: BrewMethod) => void;
  setCoffeeWeightG: (value: WeightG) => void;
  setWaterVolumeMl: (value: VolumeMl) => void;
  setSpecies: (value: Species) => void;
  setIsDecaf: (value: boolean) => void;
  setRobustaPercent: (value: number) => void;
  setRoastLevel: (value: RoastLevel) => void;
  setGrindSize: (value: GrindSize) => void;
  setWaterTemperatureC: (value: TemperatureC) => void;
  setProcessingMethod: (value: ProcessingMethod) => void;
  setAltitude: (value: Altitude) => void;
}

const [useCalculatorStateCtx, CalculatorStateContextProvider] = createCtxWithName<CalculatorStateContextValue>('CalculatorStateContext');

function getInitialState(): CalculatorState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const payload = JSON.parse(saved) as PersistedPayload;
      // Version check: discard payloads with mismatched version
      if (payload.version !== STORAGE_VERSION) {
        return getDefaults();
      }
      const p = payload.state;
      return {
        brewMethod: p.brewMethod ?? DEFAULT_PARAMS.brewMethod,
        coffeeWeightG: WeightG(p.coffeeWeightG ?? DEFAULT_PARAMS.coffeeWeightG),
        waterVolumeMl: VolumeMl(p.waterVolumeMl ?? DEFAULT_PARAMS.waterVolumeMl),
        species: p.species ?? DEFAULT_PARAMS.species,
        isDecaf: p.isDecaf ?? false,
        robustaPercent: p.robustaPercent ?? DEFAULT_PARAMS.robustaPercent,
        roastLevel: p.roastLevel ?? DEFAULT_PARAMS.roastLevel,
        grindSize: p.grindSize ?? DEFAULT_PARAMS.grindSize,
        waterTemperatureC: TemperatureC(p.waterTemperatureC ?? DEFAULT_PARAMS.waterTemperatureC),
        processingMethod: p.processingMethod ?? DEFAULT_PARAMS.processingMethod,
        altitude: p.altitude ?? DEFAULT_PARAMS.altitude,
      };
    }
  } catch {
    // Ignore parse errors, fall through to defaults
  }
  return getDefaults();
}

function getDefaults(): CalculatorState {
  return {
    brewMethod: DEFAULT_PARAMS.brewMethod,
    coffeeWeightG: WeightG(DEFAULT_PARAMS.coffeeWeightG),
    waterVolumeMl: VolumeMl(DEFAULT_PARAMS.waterVolumeMl),
    species: DEFAULT_PARAMS.species,
    isDecaf: false,
    robustaPercent: DEFAULT_PARAMS.robustaPercent,
    roastLevel: DEFAULT_PARAMS.roastLevel,
    grindSize: DEFAULT_PARAMS.grindSize,
    waterTemperatureC: TemperatureC(DEFAULT_PARAMS.waterTemperatureC),
    processingMethod: DEFAULT_PARAMS.processingMethod,
    altitude: DEFAULT_PARAMS.altitude,
  };
}

/** Persist state to localStorage with versioning, silently failing on error. */
function persistState(state: CalculatorState): void {
  try {
    const payload: PersistedPayload = { version: STORAGE_VERSION, state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Silently fail on QuotaExceededError or serialization errors
  }
}

export function CalculatorStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CalculatorState>(getInitialState);

  // Persist to localStorage on every state change (with error handling)
  useEffect(() => {
    persistState(state);
  }, [state]);

  const setBrewMethod = useCallback((value: BrewMethod) => {
    setState((prev) => ({ ...prev, brewMethod: value }));
  }, []);

  const setCoffeeWeightG = useCallback((value: WeightG) => {
    setState((prev) => ({ ...prev, coffeeWeightG: WeightG(clampNumber(value, 0, 500, 0)) }));
  }, []);

  const setWaterVolumeMl = useCallback((value: VolumeMl) => {
    setState((prev) => ({ ...prev, waterVolumeMl: VolumeMl(clampNumber(value, 0, 5000, 0)) }));
  }, []);

  const setSpecies = useCallback((value: Species) => {
    setState((prev) => ({ ...prev, species: value }));
  }, []);

  const setIsDecaf = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, isDecaf: value }));
  }, []);

  const setRobustaPercent = useCallback((value: number) => {
    setState((prev) => ({ ...prev, robustaPercent: clampNumber(value, 0, 100, 50) }));
  }, []);

  const setRoastLevel = useCallback((value: RoastLevel) => {
    setState((prev) => ({ ...prev, roastLevel: value }));
  }, []);

  const setGrindSize = useCallback((value: GrindSize) => {
    setState((prev) => ({ ...prev, grindSize: value }));
  }, []);

  const setWaterTemperatureC = useCallback((value: TemperatureC) => {
    setState((prev) => ({ ...prev, waterTemperatureC: TemperatureC(clampNumber(value, 0, 150, 93)) }));
  }, []);

  const setProcessingMethod = useCallback((value: ProcessingMethod) => {
    setState((prev) => ({ ...prev, processingMethod: value }));
  }, []);

  const setAltitude = useCallback((value: Altitude) => {
    setState((prev) => ({ ...prev, altitude: value }));
  }, []);

  const value = useMemo<CalculatorStateContextValue>(
    () => ({
      ...state,
      setBrewMethod,
      setCoffeeWeightG,
      setWaterVolumeMl,
      setSpecies,
      setIsDecaf,
      setRobustaPercent,
      setRoastLevel,
      setGrindSize,
      setWaterTemperatureC,
      setProcessingMethod,
      setAltitude,
    }),
    [
      state,
      setBrewMethod,
      setCoffeeWeightG,
      setWaterVolumeMl,
      setSpecies,
      setIsDecaf,
      setRobustaPercent,
      setRoastLevel,
      setGrindSize,
      setWaterTemperatureC,
      setProcessingMethod,
      setAltitude,
    ],
  );

  return (
    <CalculatorStateContextProvider value={value}>
      {children}
    </CalculatorStateContextProvider>
  );
}

export const useCalculatorState = useCalculatorStateCtx;
