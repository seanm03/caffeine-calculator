import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useUnits, UnitProvider } from '@/hooks/useUnits';

function wrapper({ children }: { children: React.ReactNode }) {
  return <UnitProvider>{children}</UnitProvider>;
}

describe('useUnits', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to metric', () => {
    const { result } = renderHook(() => useUnits(), { wrapper });
    expect(result.current.unitSystem).toBe('metric');
  });

  it('toggles from metric to imperial', () => {
    const { result } = renderHook(() => useUnits(), { wrapper });
    expect(result.current.unitSystem).toBe('metric');
    act(() => {
      result.current.toggle();
    });
    expect(result.current.unitSystem).toBe('imperial');
  });

  it('toggles from imperial back to metric', () => {
    localStorage.setItem('coffee-calc-units', 'imperial');
    const { result } = renderHook(() => useUnits(), { wrapper });
    expect(result.current.unitSystem).toBe('imperial');
    act(() => {
      result.current.toggle();
    });
    expect(result.current.unitSystem).toBe('metric');
  });

  it('reads initial units from localStorage', () => {
    localStorage.setItem('coffee-calc-units', 'imperial');
    const { result } = renderHook(() => useUnits(), { wrapper });
    expect(result.current.unitSystem).toBe('imperial');
  });

  it('converts grams to ounces', () => {
    const { result } = renderHook(() => useUnits(), { wrapper });
    // 18g → ~0.6 oz
    const oz = result.current.gToOz(18);
    expect(oz).toBeCloseTo(0.6, 1);
  });

  it('converts ounces to grams', () => {
    const { result } = renderHook(() => useUnits(), { wrapper });
    // 1 oz → ~28.35g
    const g = result.current.ozToG(1);
    expect(g).toBeCloseTo(28.3, 0);
  });

  it('converts milliliters to fluid ounces', () => {
    const { result } = renderHook(() => useUnits(), { wrapper });
    // 300 mL → ~10.1 fl oz
    const flOz = result.current.mlToFlOz(300);
    expect(flOz).toBeCloseTo(10.1, 1);
  });

  it('converts fluid ounces to milliliters', () => {
    const { result } = renderHook(() => useUnits(), { wrapper });
    // 10 fl oz → ~296 mL
    const ml = result.current.flOzToMl(10);
    expect(ml).toBeCloseTo(296, 0);
  });

  it('converts Celsius to Fahrenheit', () => {
    const { result } = renderHook(() => useUnits(), { wrapper });
    // 93°C → ~199.4°F
    const f = result.current.cToF(93);
    expect(f).toBeCloseTo(199.4, 1);
  });

  it('converts Fahrenheit to Celsius', () => {
    const { result } = renderHook(() => useUnits(), { wrapper });
    // 200°F → ~93.3°C
    const c = result.current.fToC(200);
    expect(c).toBeCloseTo(93.3, 1);
  });

  it('persists unit preference to localStorage', () => {
    const { result } = renderHook(() => useUnits(), { wrapper });
    act(() => {
      result.current.toggle();
    });
    expect(localStorage.getItem('coffee-calc-units')).toBe('imperial');
  });
});
