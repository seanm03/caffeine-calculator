import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SLEEP_ADVISORY_THRESHOLD_MG, DAILY_SAFE_LIMIT_MG, DEFAULT_HALF_LIFE_HOURS } from '@/engine/metabolism';
import { useCaffeineLog, CaffeineLogProvider } from '@/hooks/useCaffeineLog';
import { CaffeineMg, Hours } from '@/types/branded';

function wrapper({ children }: { children: React.ReactNode }) {
  return <CaffeineLogProvider>{children}</CaffeineLogProvider>;
}

describe('useCaffeineLog', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

  it('preserves an explicit id when provided', () => {
    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    act(() => {
      result.current.addEntry({
        id: 'explicit-1',
        timestamp: new Date().toISOString(),
        caffeineMg: CaffeineMg(120),
        drinkName: 'Explicit',
      });
    });
    expect(result.current.entries[0].id).toBe('explicit-1');
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

  // ── Entry updates ──────────────────────────────────────────
  it('updates an entry by id', () => {
    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    act(() => {
      result.current.addEntry({
        timestamp: new Date().toISOString(),
        caffeineMg: CaffeineMg(100),
        drinkName: 'Original',
      });
      result.current.addEntry({
        timestamp: new Date().toISOString(),
        caffeineMg: CaffeineMg(50),
        drinkName: 'Second',
      });
    });
    const id = result.current.entries.find((e) => e.drinkName === 'Original')!.id;
    act(() => {
      result.current.updateEntry(id, { drinkName: 'Updated' });
    });
    expect(result.current.entries).toHaveLength(2);
    const updated = result.current.entries.find((e) => e.id === id)!;
    expect(updated.drinkName).toBe('Updated');
    expect(updated.caffeineMg).toBe(CaffeineMg(100));
  });

  // ── Multi-entry sorting ────────────────────────────────────
  it('sorts today entries newest first with multiple entries', () => {
    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    // Anchor both timestamps to fixed midday hours of today's real date so both
    // entries are guaranteed to fall on the current calendar day regardless of
    // when the test runs (avoids a 00:00–01:00 local-time flake in isToday).
    const now = new Date();
    const later = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0).toISOString();
    const earlier = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0, 0).toISOString();
    act(() => {
      result.current.addEntry({ timestamp: earlier, caffeineMg: CaffeineMg(100) });
      result.current.addEntry({ timestamp: later, caffeineMg: CaffeineMg(50) });
    });
    expect(result.current.todayEntries).toHaveLength(2);
    expect(result.current.todayEntries[0].timestamp).toBe(later);
    expect(result.current.todayEntries[1].timestamp).toBe(earlier);
    expect(result.current.todaySummary.entryCount).toBe(2);
  });

  // ── Load error handling ────────────────────────────────────
  it('restores entries from localStorage on mount when data is valid', () => {
    const savedEntry = {
      id: 'saved-1',
      timestamp: new Date().toISOString(),
      caffeineMg: 80,
      drinkName: 'Saved coffee',
    };
    localStorage.setItem(
      'coffee-calc-logs',
      JSON.stringify({ version: 1, entries: [savedEntry] }),
    );
    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    expect(result.current.loadError).toBeNull();
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].drinkName).toBe('Saved coffee');
    expect(result.current.entries[0].caffeineMg).toBe(80);
  });

  it('reports a parse_error when saved log JSON is malformed', () => {
    localStorage.setItem('coffee-calc-logs', 'not-valid-json');
    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    expect(result.current.loadError).toEqual({
      type: 'parse_error',
      message: 'Failed to parse saved data',
    });
    expect(result.current.entries).toEqual([]);
  });

  it('reports a parse_error with the raw message when the thrown error is not a SyntaxError', () => {
    // getItem throws while storage remains available → falls through to parse_error
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('boom');
    });
    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    expect(result.current.loadError).toEqual({
      type: 'parse_error',
      message: 'Error: boom',
    });
  });

  it('reports storage_unavailable when localStorage access throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    expect(result.current.loadError?.type).toBe('storage_unavailable');
  });

  it('reports quota_exceeded when localStorage is full', () => {
    localStorage.setItem('seed', 'x'); // ensure length > 0 so quotaExceeded is detected
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });
    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    expect(result.current.loadError?.type).toBe('quota_exceeded');
  });

  it('dismisses the load error', () => {
    localStorage.setItem('coffee-calc-logs', 'not-valid-json');
    const { result } = renderHook(() => useCaffeineLog(), { wrapper });
    expect(result.current.loadError).not.toBeNull();
    act(() => {
      result.current.dismissLoadError();
    });
    expect(result.current.loadError).toBeNull();
  });

  // ── ID generation fallback ─────────────────────────────────
  it('falls back to a UUID-like id when crypto.randomUUID is unavailable', () => {
    const original = crypto.randomUUID;
    Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true });
    try {
      const { result } = renderHook(() => useCaffeineLog(), { wrapper });
      act(() => {
        result.current.addEntry({
          timestamp: new Date().toISOString(),
          caffeineMg: CaffeineMg(100),
        });
      });
      expect(result.current.entries[0].id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    } finally {
      Object.defineProperty(crypto, 'randomUUID', { value: original, configurable: true });
    }
  });
});
