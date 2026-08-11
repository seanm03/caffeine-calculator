import {
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { computeDailySummary } from '@/engine/caffeineMetabolism';
import { DEFAULT_HALF_LIFE_HOURS, MIN_HALF_LIFE_HOURS, MAX_HALF_LIFE_HOURS, DAILY_SAFE_LIMIT_MG, SLEEP_ADVISORY_THRESHOLD_MG } from '@/engine/metabolism';
import { clampNumber } from '@/engine/utils';
import { CaffeineMg, Hours } from '@/types/branded';
import { createCtxWithName } from '@/utils/createCtx';
import { storageAvailable } from '@/utils/storageAvailable';
import type { CaffeineLogEntry, DailyCaffeineSummary } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'coffee-calc-logs';
const SETTINGS_KEY = 'coffee-calc-settings';
const STORAGE_VERSION = 1;
const SETTINGS_VERSION = 1;

/** Default bedtime hour (10 PM) used when no saved setting exists. */
const DEFAULT_BEDTIME_HOUR = 22;
const BEDTIME_MIN = 0;
const BEDTIME_MAX = 23;
const SAFE_LIMIT_MIN_MG = 50;
const SAFE_LIMIT_MAX_MG = 1000;
const SLEEP_THRESHOLD_MIN_MG = 10;
const SLEEP_THRESHOLD_MAX_MG = 200;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PersistedPayload {
  version: number;
  entries: CaffeineLogEntry[];
}

interface SettingsPayload {
  version: number;
  safeLimitMg: CaffeineMg;
  halfLifeHours: Hours;
  bedtimeHour: number;
  sleepThresholdMg: CaffeineMg;
}

/** Structured error info for localStorage failures. */
export type LoadError = {
  type: 'storage_unavailable' | 'quota_exceeded' | 'parse_error';
  message: string;
} | null;

export interface CaffeineLogHelpers {
  /** All log entries (sorted newest first). */
  entries: CaffeineLogEntry[];
  /** Today's entries only. */
  todayEntries: CaffeineLogEntry[];
  /** Add a new caffeine log entry (id generated if missing). */
  addEntry: (entry: Omit<CaffeineLogEntry, 'id'> & { id?: string }) => void;
  /** Update an existing entry by id. */
  updateEntry: (id: string, updates: Partial<Omit<CaffeineLogEntry, 'id'>>) => void;
  /** Remove an entry by id. */
  removeEntry: (id: string) => void;
  /** Clear all of today's entries. */
  clearToday: () => void;
  /** Computed daily summary. */
  todaySummary: DailyCaffeineSummary;
  /** Current half-life setting in hours. */
  halfLifeHours: Hours;
  /** Set the half-life in hours (clamped 2–12). */
  setHalfLifeHours: (h: Hours) => void;
  /** User-customized daily safe caffeine limit in mg (default 400). */
  customSafeLimitMg: CaffeineMg;
  /** Set the custom daily safe limit in mg (clamped 50–1000). */
  setCustomSafeLimitMg: (mg: CaffeineMg) => void;
  /** User-configured bedtime hour (0–23). */
  bedtimeHour: number;
  /** Set the bedtime hour (clamped 0–23). */
  setBedtimeHour: (h: number) => void;
  /** User-configured sleep advisory threshold in mg (default 50). */
  customSleepThresholdMg: CaffeineMg;
  /** Set the sleep advisory threshold in mg (clamped 10–200). */
  setCustomSleepThresholdMg: (mg: CaffeineMg) => void;
  /** Structured load error from localStorage, or null if healthy. */
  loadError: LoadError;
  /** Dismiss the current load error (clears transient errors only). */
  dismissLoadError: () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const [useCaffeineLogCtx, CaffeineLogContextProvider] = createCtxWithName<CaffeineLogHelpers>('CaffeineLogContext');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function isToday(entry: CaffeineLogEntry): boolean {
  const entryDate = new Date(entry.timestamp);
  const now = new Date();
  return (
    entryDate.getFullYear() === now.getFullYear() &&
    entryDate.getMonth() === now.getMonth() &&
    entryDate.getDate() === now.getDate()
  );
}

function loadEntries(): { entries: CaffeineLogEntry[]; error: LoadError } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const payload = JSON.parse(saved) as PersistedPayload;
      if (payload.version === STORAGE_VERSION && Array.isArray(payload.entries)) {
        return { entries: payload.entries, error: null };
      }
    }
  } catch (e) {
    const storage = storageAvailable();
    if (!storage.available) {
      return {
        entries: [],
        error: {
          type: storage.quotaExceeded ? 'quota_exceeded' : 'storage_unavailable',
          message: storage.quotaExceeded
            ? 'localStorage quota exceeded'
            : 'localStorage is not available',
        },
      };
    }
    return {
      entries: [],
      error: {
        type: 'parse_error',
        message: e instanceof SyntaxError ? 'Failed to parse saved data' : String(e),
      },
    };
  }
  return { entries: [], error: null };
}

function persistEntries(entries: CaffeineLogEntry[]): void {
  try {
    const payload: PersistedPayload = { version: STORAGE_VERSION, entries };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Silently fail on QuotaExceededError
  }
}

function loadSettings(): SettingsPayload {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const payload = JSON.parse(saved) as SettingsPayload;
      if (payload.version === SETTINGS_VERSION) {
        return {
          version: SETTINGS_VERSION,
          safeLimitMg: CaffeineMg(
            typeof payload.safeLimitMg === 'number' && payload.safeLimitMg >= SAFE_LIMIT_MIN_MG && payload.safeLimitMg <= SAFE_LIMIT_MAX_MG
              ? payload.safeLimitMg
              : DAILY_SAFE_LIMIT_MG,
          ),
          halfLifeHours: Hours(
            typeof payload.halfLifeHours === 'number' && payload.halfLifeHours >= MIN_HALF_LIFE_HOURS && payload.halfLifeHours <= MAX_HALF_LIFE_HOURS
              ? payload.halfLifeHours
              : DEFAULT_HALF_LIFE_HOURS,
          ),
          bedtimeHour: typeof payload.bedtimeHour === 'number' && payload.bedtimeHour >= BEDTIME_MIN && payload.bedtimeHour <= BEDTIME_MAX
            ? payload.bedtimeHour
            : DEFAULT_BEDTIME_HOUR,
          sleepThresholdMg: CaffeineMg(
            typeof payload.sleepThresholdMg === 'number' && payload.sleepThresholdMg >= SLEEP_THRESHOLD_MIN_MG && payload.sleepThresholdMg <= SLEEP_THRESHOLD_MAX_MG
              ? payload.sleepThresholdMg
              : SLEEP_ADVISORY_THRESHOLD_MG,
          ),
        };
      }
    }
  } catch {
    // Silently return defaults on parse error
  }
  return {
    version: SETTINGS_VERSION,
    safeLimitMg: CaffeineMg(DAILY_SAFE_LIMIT_MG),
    halfLifeHours: Hours(DEFAULT_HALF_LIFE_HOURS),
    bedtimeHour: DEFAULT_BEDTIME_HOUR,
    sleepThresholdMg: CaffeineMg(SLEEP_ADVISORY_THRESHOLD_MG),
  };
}

function persistSettings(settings: SettingsPayload): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Silently fail on QuotaExceededError
  }
}

/**
 * Round a value to the nearest integer, then clamp it to [min, max].
 * Non-finite values pass through unchanged (clampNumber falls back to the
 * input), preserving the previous Math.max/Math.min NaN behavior.
 */
function clampRounded(value: number, min: number, max: number): number {
  return Math.round(clampNumber(value, min, max, value));
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function CaffeineLogProvider({ children }: { children: React.ReactNode }) {
  const [initial] = useState(() => {
    const { entries: initialEntries, error: initialError } = loadEntries();
    return { entries: initialEntries, error: initialError, settings: loadSettings() };
  });
  const [entries, setEntries] = useState<CaffeineLogEntry[]>(initial.entries);
  const [loadError, setLoadError] = useState<LoadError>(initial.error);
  const [halfLifeHours, setHalfLifeHoursState] = useState<Hours>(Hours(initial.settings.halfLifeHours));
  const [customSafeLimitMg, setCustomSafeLimitMgState] = useState<CaffeineMg>(CaffeineMg(initial.settings.safeLimitMg));
  const [bedtimeHour, setBedtimeHourState] = useState<number>(initial.settings.bedtimeHour);
  const [customSleepThresholdMg, setCustomSleepThresholdMgState] = useState<CaffeineMg>(CaffeineMg(initial.settings.sleepThresholdMg));

  // Persist entries to localStorage on every entries change
  useEffect(() => {
    persistEntries(entries);
  }, [entries]);

  // Persist settings to localStorage on change
  useEffect(() => {
    persistSettings({ version: SETTINGS_VERSION, safeLimitMg: customSafeLimitMg, halfLifeHours, bedtimeHour, sleepThresholdMg: customSleepThresholdMg });
  }, [customSafeLimitMg, halfLifeHours, bedtimeHour, customSleepThresholdMg]);

  // Today's entries (sorted newest first)
  const todayEntries = useMemo(
    () => entries.filter(isToday).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    ),
    [entries],
  );

  // Today's entries in chronological order for metabolism computation
  const todayChronological = useMemo(
    () => [...todayEntries].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    ),
    [todayEntries],
  );

  // Computed daily summary
  const todaySummary = useMemo<DailyCaffeineSummary>(() => {
    const summary = computeDailySummary(todayChronological, Hours(halfLifeHours));
    return {
      ...summary,
      entryCount: todayChronological.length,
    };
  }, [todayChronological, halfLifeHours]);

  const addEntry = useCallback(
    (entry: Omit<CaffeineLogEntry, 'id'> & { id?: string }) => {
      const newEntry: CaffeineLogEntry = {
        ...entry,
        id: entry.id ?? generateId(),
        // timestamp is required by CaffeineLogEntry and every call site passes
        // it explicitly — the `?? now()` fallback was provably dead.
        timestamp: entry.timestamp,
      };
      setEntries((prev) => [newEntry, ...prev]);
    },
    [],
  );

  const updateEntry = useCallback((id: string, updates: Partial<Omit<CaffeineLogEntry, 'id'>>) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearToday = useCallback(() => {
    setEntries((prev) => prev.filter((e) => !isToday(e)));
  }, []);

  const setHalfLifeHours = useCallback((h: Hours) => {
    setHalfLifeHoursState(Hours(clampNumber(h, MIN_HALF_LIFE_HOURS, MAX_HALF_LIFE_HOURS, h)));
  }, []);

  const setCustomSafeLimitMg = useCallback((mg: CaffeineMg) => {
    setCustomSafeLimitMgState(CaffeineMg(clampRounded(mg, SAFE_LIMIT_MIN_MG, SAFE_LIMIT_MAX_MG)));
  }, []);

  const setBedtimeHour = useCallback((h: number) => {
    setBedtimeHourState(clampRounded(h, BEDTIME_MIN, BEDTIME_MAX));
  }, []);

  const setCustomSleepThresholdMg = useCallback((mg: CaffeineMg) => {
    setCustomSleepThresholdMgState(CaffeineMg(clampRounded(mg, SLEEP_THRESHOLD_MIN_MG, SLEEP_THRESHOLD_MAX_MG)));
  }, []);

  const dismissLoadError = useCallback(() => {
    setLoadError(null);
  }, []);

  const value = useMemo<CaffeineLogHelpers>(
    () => ({
      entries,
      todayEntries,
      addEntry,
      updateEntry,
      removeEntry,
      clearToday,
      todaySummary,
      halfLifeHours,
      setHalfLifeHours,
      customSafeLimitMg,
      setCustomSafeLimitMg,
      bedtimeHour,
      setBedtimeHour,
      customSleepThresholdMg,
      setCustomSleepThresholdMg,
      loadError,
      dismissLoadError,
    }),
    [entries, todayEntries, addEntry, updateEntry, removeEntry, clearToday, todaySummary, halfLifeHours, setHalfLifeHours, customSafeLimitMg, setCustomSafeLimitMg, bedtimeHour, setBedtimeHour, customSleepThresholdMg, setCustomSleepThresholdMg, loadError, dismissLoadError],
  );

  return (
    <CaffeineLogContextProvider value={value}>
      {children}
    </CaffeineLogContextProvider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Access the caffeine log state and actions.
 *
 * Must be used within a {@link CaffeineLogProvider}.
 *
 * @throws If used outside of CaffeineLogProvider context
 */
export const useCaffeineLog = useCaffeineLogCtx;
