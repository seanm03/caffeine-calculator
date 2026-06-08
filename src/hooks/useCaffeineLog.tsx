import {
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { createCtxWithName } from './createCtx';
import type { CaffeineLogEntry, DailyCaffeineSummary } from '../types';
import { storageAvailable } from '../utils/storageAvailable';
import { computeDailySummary, DEFAULT_HALF_LIFE_HOURS } from '../engine/caffeineMetabolism';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'coffee-calc-logs';
const STORAGE_VERSION = 1;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PersistedPayload {
  version: number;
  entries: CaffeineLogEntry[];
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

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function CaffeineLogProvider({ children }: { children: React.ReactNode }) {
  const { entries: initialEntries, error: initialError } = loadEntries();
  const [entries, setEntries] = useState<CaffeineLogEntry[]>(initialEntries);
  const [loadError, setLoadError] = useState<LoadError>(initialError);
  const [halfLifeHours, setHalfLifeHoursState] = useState<number>(DEFAULT_HALF_LIFE_HOURS);

  // Persist to localStorage on every entries change
  useEffect(() => {
    persistEntries(entries);
  }, [entries]);

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
    const summary = computeDailySummary(todayChronological, halfLifeHours);
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

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearToday = useCallback(() => {
    setEntries((prev) => prev.filter((e) => !isToday(e)));
  }, []);

  const setHalfLifeHours = useCallback((h: number) => {
    setHalfLifeHoursState(Math.max(2, Math.min(12, h)));
  }, []);

  const dismissLoadError = useCallback(() => {
    setLoadError(null);
  }, []);

  const value = useMemo<CaffeineLogHelpers>(
    () => ({
      entries,
      todayEntries,
      addEntry,
      removeEntry,
      clearToday,
      todaySummary,
      halfLifeHours,
      setHalfLifeHours,
      loadError,
      dismissLoadError,
    }),
    [entries, todayEntries, addEntry, removeEntry, clearToday, todaySummary, halfLifeHours, setHalfLifeHours, loadError, dismissLoadError],
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
