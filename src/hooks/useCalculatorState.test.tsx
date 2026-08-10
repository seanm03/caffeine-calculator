import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useCalculatorState, CalculatorStateProvider } from '@/hooks/useCalculatorState';
import { WeightG, VolumeMl, TemperatureC } from '@/types/branded';

function wrapper({ children }: { children: React.ReactNode }) {
  return <CalculatorStateProvider>{children}</CalculatorStateProvider>;
}

describe('useCalculatorState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to pour-over brew method', () => {
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    expect(result.current.brewMethod).toBe('pour-over');
  });

  it('defaults to 18g coffee weight', () => {
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    expect(result.current.coffeeWeightG).toBe(18);
  });

  it('defaults to 300mL water volume', () => {
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    expect(result.current.waterVolumeMl).toBe(300);
  });

  it('defaults to arabica species', () => {
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    expect(result.current.species).toBe('arabica');
  });

  it('defaults isDecaf to false', () => {
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    expect(result.current.isDecaf).toBe(false);
  });

  it('defaults robustaPercent to 50', () => {
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    expect(result.current.robustaPercent).toBe(50);
  });

  it('defaults roastLevel to medium', () => {
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    expect(result.current.roastLevel).toBe('medium');
  });

  it('defaults grindSize to medium', () => {
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    expect(result.current.grindSize).toBe('medium');
  });

  it('defaults waterTemperatureC to 93', () => {
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    expect(result.current.waterTemperatureC).toBe(93);
  });

  it('defaults processingMethod to washed', () => {
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    expect(result.current.processingMethod).toBe('washed');
  });

  it('defaults altitude to medium', () => {
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    expect(result.current.altitude).toBe('medium');
  });

  it('changes brew method via setBrewMethod', () => {
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    act(() => {
      result.current.setBrewMethod('espresso');
    });
    expect(result.current.brewMethod).toBe('espresso');
  });

  it('changes species via setSpecies', () => {
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    act(() => {
      result.current.setSpecies('robusta');
    });
    expect(result.current.species).toBe('robusta');
  });

  it('toggles isDecaf via setIsDecaf', () => {
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    expect(result.current.isDecaf).toBe(false);
    act(() => {
      result.current.setIsDecaf(true);
    });
    expect(result.current.isDecaf).toBe(true);
  });

  it('changes coffee weight via setCoffeeWeightG', () => {
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    act(() => {
      result.current.setCoffeeWeightG(WeightG(30));
    });
    expect(result.current.coffeeWeightG).toBe(30);
  });

  it('clamps out-of-range coffee weight to 0', () => {
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    act(() => {
      result.current.setCoffeeWeightG(WeightG(-10));
    });
    expect(result.current.coffeeWeightG).toBe(0);
  });

  it('clamps coffee weight above 500 to 500', () => {
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    act(() => {
      result.current.setCoffeeWeightG(WeightG(999));
    });
    expect(result.current.coffeeWeightG).toBe(500);
  });

  it('changes water volume via setWaterVolumeMl', () => {
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    act(() => {
      result.current.setWaterVolumeMl(VolumeMl(500));
    });
    expect(result.current.waterVolumeMl).toBe(500);
  });

  it('clamps robusta percent to valid range', () => {
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    act(() => {
      result.current.setRobustaPercent(150);
    });
    expect(result.current.robustaPercent).toBe(100);
    act(() => {
      result.current.setRobustaPercent(-20);
    });
    expect(result.current.robustaPercent).toBe(0);
  });

  it('changes roast level via setRoastLevel', () => {
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    act(() => {
      result.current.setRoastLevel('dark');
    });
    expect(result.current.roastLevel).toBe('dark');
  });

  it('changes water temperature via setWaterTemperatureC', () => {
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    act(() => {
      result.current.setWaterTemperatureC(TemperatureC(85));
    });
    expect(result.current.waterTemperatureC).toBe(85);
  });

  it('persists state to localStorage', () => {
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    act(() => {
      result.current.setBrewMethod('espresso');
    });
    const saved = localStorage.getItem('coffee-calc-state');
    expect(saved).not.toBeNull();
    const parsed = JSON.parse(saved!);
    expect(parsed.version).toBe(1);
    expect(parsed.state.brewMethod).toBe('espresso');
  });

  // ── Persisted-state loading (getInitialState) ─────────────────
  it('loads a saved state from localStorage with partial merge', () => {
    localStorage.setItem(
      'coffee-calc-state',
      JSON.stringify({
        version: 1,
        state: { brewMethod: 'espresso', coffeeWeightG: 22, species: 'robusta', robustaPercent: 60 },
      }),
    );
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    expect(result.current.brewMethod).toBe('espresso');
    expect(result.current.coffeeWeightG).toBe(22);
    expect(result.current.species).toBe('robusta');
    expect(result.current.robustaPercent).toBe(60);
    // Missing fields fall back to defaults via ?? semantics
    expect(result.current.waterVolumeMl).toBe(300);
    expect(result.current.roastLevel).toBe('medium');
    expect(result.current.altitude).toBe('medium');
  });

  it('discards a saved state with a mismatched version', () => {
    localStorage.setItem(
      'coffee-calc-state',
      JSON.stringify({ version: 99, state: { brewMethod: 'espresso' } }),
    );
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    expect(result.current.brewMethod).toBe('pour-over');
  });

  it('falls back to defaults when saved state is corrupted', () => {
    localStorage.setItem('coffee-calc-state', '{invalid json');
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    expect(result.current.brewMethod).toBe('pour-over');
    expect(result.current.coffeeWeightG).toBe(18);
  });

  // ── NaN clamp fallbacks ─────────────────────────────────────
  it('clamps NaN coffee weight to 0', () => {
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    act(() => {
      result.current.setCoffeeWeightG(WeightG(NaN));
    });
    expect(result.current.coffeeWeightG).toBe(0);
  });

  it('clamps NaN water volume to 0', () => {
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    act(() => {
      result.current.setWaterVolumeMl(VolumeMl(NaN));
    });
    expect(result.current.waterVolumeMl).toBe(0);
  });

  it('clamps NaN water temperature to 93', () => {
    const { result } = renderHook(() => useCalculatorState(), { wrapper });
    act(() => {
      result.current.setWaterTemperatureC(TemperatureC(NaN));
    });
    expect(result.current.waterTemperatureC).toBe(93);
  });
});
