import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { SLEEP_ADVISORY_THRESHOLD_MG, DAILY_SAFE_LIMIT_MG, DEFAULT_HALF_LIFE_HOURS } from '@/engine/caffeineMetabolism';
import { CaffeineMg, Hours } from '@/types/branded';
import { useCaffeineLog, CaffeineLogProvider } from '@/hooks/useCaffeineLog';

function wrapper({ children }: { children: React.ReactNode }) {
  return <CaffeineLogProvider>{children}</CaffeineLogProvider>;
}

describe('useCaffeineLog', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ── Default values ─────────────────────────────────────────
  it('defaults halfLifeHours to 5', () => {
    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    expect(result.current.halfLifeHours).toBe(DEFAULT_HALF_LIFE_HOURS);
  });

  it('defaults customSafeLimitMg to 400', () => {
    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    expect(result.current.customSafeLimitMg).toBe(DAILY_SAFE_LIMIT_MG);
  });

  it('defaults bedtimeHour to 22', () => {
    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    expect(result.current.bedtimeHour).toBe(22);
  });

  it('defaults customSleepThresholdMg to 50', () => {
    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    expect(result.current.customSleepThresholdMg).toBe(SLEEP_ADVISORY_THRESHOLD_MG);
  });

  // ── Settings persistence ───────────────────────────────────
  it('persists halfLifeHours to localStorage', () => {
    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    act(() => {
      result.current.setHalfLifeHours(Hours(8));
    });
    expect(result.current.halfLifeHours).toBe(8);

    const stored = JSON.parse(localStorage.getItem('coffee-calc-settings')!);
    expect(stored.halfLifeHours).toBe(8);
  });

  it('persists customSafeLimitMg to localStorage', () => {
    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    act(() => {
      result.current.setCustomSafeLimitMg(CaffeineMg(300));
    });
    expect(result.current.customSafeLimitMg).toBe(300);

    const stored = JSON.parse(localStorage.getItem('coffee-calc-settings')!);
    expect(stored.safeLimitMg).toBe(300);
  });

  it('persists bedtimeHour to localStorage', () => {
    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    act(() => {
      result.current.setBedtimeHour(23);
    });
    expect(result.current.bedtimeHour).toBe(23);

    const stored = JSON.parse(localStorage.getItem('coffee-calc-settings')!);
    expect(stored.bedtimeHour).toBe(23);
  });

  it('persists customSleepThresholdMg to localStorage', () => {
    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    act(() => {
      result.current.setCustomSleepThresholdMg(CaffeineMg(75));
    });
    expect(result.current.customSleepThresholdMg).toBe(75);

    const stored = JSON.parse(localStorage.getItem('coffee-calc-settings')!);
    expect(stored.sleepThresholdMg).toBe(75);
  });

  // ── Value clamping ─────────────────────────────────────────
  it('clamps halfLifeHours to [2, 12]', () => {
    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    act(() => {
      result.current.setHalfLifeHours(Hours(1));
    });
    expect(result.current.halfLifeHours).toBe(2);

    act(() => {
      result.current.setHalfLifeHours(Hours(15));
    });
    expect(result.current.halfLifeHours).toBe(12);
  });

  it('clamps customSafeLimitMg to [50, 1000]', () => {
    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    act(() => {
      result.current.setCustomSafeLimitMg(CaffeineMg(30));
    });
    expect(result.current.customSafeLimitMg).toBe(50);

    act(() => {
      result.current.setCustomSafeLimitMg(CaffeineMg(1200));
    });
    expect(result.current.customSafeLimitMg).toBe(1000);
  });

  it('clamps bedtimeHour to [0, 23]', () => {
    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    act(() => {
      result.current.setBedtimeHour(-5);
    });
    expect(result.current.bedtimeHour).toBe(0);

    act(() => {
      result.current.setBedtimeHour(30);
    });
    expect(result.current.bedtimeHour).toBe(23);
  });

  it('clamps customSleepThresholdMg to [10, 200]', () => {
    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    act(() => {
      result.current.setCustomSleepThresholdMg(CaffeineMg(5));
    });
    expect(result.current.customSleepThresholdMg).toBe(10);

    act(() => {
      result.current.setCustomSleepThresholdMg(CaffeineMg(300));
    });
    expect(result.current.customSleepThresholdMg).toBe(200);
  });

  // ── Settings restore from localStorage ─────────────────────
  it('restores settings from localStorage on mount', () => {
    localStorage.setItem(
      'coffee-calc-settings',
      JSON.stringify({
        version: 1,
        safeLimitMg: 350,
        halfLifeHours: 6,
        bedtimeHour: 21,
        sleepThresholdMg: 60,
      }),
    );

    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    expect(result.current.customSafeLimitMg).toBe(350);
    expect(result.current.halfLifeHours).toBe(6);
    expect(result.current.bedtimeHour).toBe(21);
    expect(result.current.customSleepThresholdMg).toBe(60);
  });

  it('falls back to defaults for invalid saved settings', () => {
    localStorage.setItem(
      'coffee-calc-settings',
      JSON.stringify({
        version: 1,
        safeLimitMg: 5000, // out of range
        halfLifeHours: 50, // out of range
        bedtimeHour: 100, // out of range
        sleepThresholdMg: 500, // out of range
      }),
    );

    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    expect(result.current.customSafeLimitMg).toBe(DAILY_SAFE_LIMIT_MG);
    expect(result.current.halfLifeHours).toBe(DEFAULT_HALF_LIFE_HOURS);
    expect(result.current.bedtimeHour).toBe(22);
    expect(result.current.customSleepThresholdMg).toBe(SLEEP_ADVISORY_THRESHOLD_MG);
  });

  it('falls back to defaults when saved data is malformed', () => {
    localStorage.setItem('coffee-calc-settings', 'not-valid-json');

    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    expect(result.current.customSafeLimitMg).toBe(DAILY_SAFE_LIMIT_MG);
    expect(result.current.halfLifeHours).toBe(DEFAULT_HALF_LIFE_HOURS);
  });

  // ── Entry management ────────────────────────────────────────
  it('starts with empty entries', () => {
    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    expect(result.current.entries).toEqual([]);
    expect(result.current.todayEntries).toEqual([]);
  });

  it('adds an entry', () => {
    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    act(() => {
      result.current.addEntry({
        timestamp: new Date().toISOString(),
        caffeineMg: CaffeineMg(100),
        drinkName: 'Test',
      });
    });
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.todayEntries).toHaveLength(1);
    expect(result.current.entries[0].caffeineMg).toBe(CaffeineMg(100));
  });

  it('generates an id for entries without one', () => {
    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    act(() => {
      result.current.addEntry({
        timestamp: new Date().toISOString(),
        caffeineMg: CaffeineMg(100),
      });
    });
    expect(result.current.entries[0].id).toBeDefined();
    expect(typeof result.current.entries[0].id).toBe('string');
    expect(result.current.entries[0].id.length).toBeGreaterThan(0);
  });

  it('removes an entry by id', () => {
    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    act(() => {
      result.current.addEntry({
        timestamp: new Date().toISOString(),
        caffeineMg: CaffeineMg(100),
      });
    });
    const id = result.current.entries[0].id;
    act(() => {
      result.current.removeEntry(id);
    });
    expect(result.current.entries).toHaveLength(0);
  });

  it('clears today entries', () => {
    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    act(() => {
      result.current.addEntry({
        timestamp: new Date().toISOString(),
        caffeineMg: CaffeineMg(100),
      });
    });
    expect(result.current.todayEntries).toHaveLength(1);
    act(() => {
      result.current.clearToday();
    });
    expect(result.current.todayEntries).toHaveLength(0);
  });

  it('computes todaySummary from entries', () => {
    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    act(() => {
      result.current.addEntry({
        timestamp: new Date().toISOString(),
        caffeineMg: CaffeineMg(100),
        drinkName: 'Morning coffee',
      });
    });
    expect(result.current.todaySummary.totalToday).toBeGreaterThan(0);
    expect(result.current.todaySummary.currentLevel).toBeGreaterThan(0);
    expect(result.current.todaySummary.entryCount).toBe(1);
  });
});
