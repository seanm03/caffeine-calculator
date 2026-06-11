import {
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { computeDailySummary, DEFAULT_HALF_LIFE_HOURS, DAILY_SAFE_LIMIT_MG, SLEEP_ADVISORY_THRESHOLD_MG } from '@/engine/caffeineMetabolism';
import { Hours } from '@/types/branded';
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PersistedPayload {
  version: number;
  entries: CaffeineLogEntry[];
}

interface SettingsPayload {
  version: number;
  safeLimitMg: number;
  halfLifeHours: number;
  bedtimeHour: number;
  sleepThresholdMg: number;
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
  halfLifeHours: number;
  /** Set the half-life in hours (clamped 2–12). */
  setHalfLifeHours: (h: number) => void;
  /** User-customized daily safe caffeine limit in mg (default 400). */
  customSafeLimitMg: number;
  /** Set the custom daily safe limit in mg (clamped 50–1000). */
  setCustomSafeLimitMg: (mg: number) => void;
  /** User-configured bedtime hour (0–23). */
  bedtimeHour: number;
  /** Set the bedtime hour (clamped 0–23). */
  setBedtimeHour: (h: number) => void;
  /** User-configured sleep advisory threshold in mg (default 50). */
  customSleepThresholdMg: number;
  /** Set the sleep advisory threshold in mg (clamped 10–200). */
  setCustomSleepThresholdMg: (mg: number) => void;
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
          safeLimitMg: typeof payload.safeLimitMg === 'number' && payload.safeLimitMg >= 50 && payload.safeLimitMg <= 1000
            ? payload.safeLimitMg
            : DAILY_SAFE_LIMIT_MG,
          halfLifeHours: typeof payload.halfLifeHours === 'number' && payload.halfLifeHours >= 2 && payload.halfLifeHours <= 12
            ? payload.halfLifeHours
            : DEFAULT_HALF_LIFE_HOURS,
          bedtimeHour: typeof payload.bedtimeHour === 'number' && payload.bedtimeHour >= 0 && payload.bedtimeHour <= 23
            ? payload.bedtimeHour
            : 22,
      sleepThresholdMg: typeof payload.sleepThresholdMg === 'number' && payload.sleepThresholdMg >= 10 && payload.sleepThresholdMg <= 200
        ? payload.sleepThresholdMg
        : SLEEP_ADVISORY_THRESHOLD_MG,
        };
      }
    }
  } catch {
    // Silently return defaults on parse error
  }
  return { version: SETTINGS_VERSION, safeLimitMg: DAILY_SAFE_LIMIT_MG, halfLifeHours: DEFAULT_HALF_LIFE_HOURS, bedtimeHour: 22, sleepThresholdMg: SLEEP_ADVISORY_THRESHOLD_MG };
}

function persistSettings(settings: SettingsPayload): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Silently fail on QuotaExceededError
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function CaffeineLogProvider({ children }: { children: React.ReactNode }) {
  const { entries: initialEntries, error: initialError } = loadEntries();
  const initialSettings = loadSettings();
  const [entries, setEntries] = useState<CaffeineLogEntry[]>(initialEntries);
  const [loadError, setLoadError] = useState<LoadError>(initialError);
  const [halfLifeHours, setHalfLifeHoursState] = useState<number>(initialSettings.halfLifeHours);
  const [customSafeLimitMg, setCustomSafeLimitMgState] = useState<number>(initialSettings.safeLimitMg);
  const [bedtimeHour, setBedtimeHourState] = useState<number>(initialSettings.bedtimeHour);
  const [customSleepThresholdMg, setCustomSleepThresholdMgState] = useState<number>(initialSettings.sleepThresholdMg);

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
        timestamp: entry.timestamp ?? new Date().toISOString(),
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

  const setHalfLifeHours = useCallback((h: number) => {
    setHalfLifeHoursState(Math.max(2, Math.min(12, h)));
  }, []);

  const setCustomSafeLimitMg = useCallback((mg: number) => {
    setCustomSafeLimitMgState(Math.max(50, Math.min(1000, Math.round(mg))));
  }, []);

  const setBedtimeHour = useCallback((h: number) => {
    setBedtimeHourState(Math.max(0, Math.min(23, Math.round(h))));
  }, []);

  const setCustomSleepThresholdMg = useCallback((mg: number) => {
    setCustomSleepThresholdMgState(Math.max(10, Math.min(200, Math.round(mg))));
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
