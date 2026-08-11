/**
 * Deterministic time helpers for wall-clock-dependent tests.
 *
 * Several components compute values relative to `new Date()` (e.g.,
 * SleepImpactCard's bedtime projection and the metabolism engine's "now"
 * reference). Tests that derive timestamps from the real clock are
 * time-of-day dependent: "bedtime 1 hour from now" yields hour 24 near
 * midnight, and an entry offset by one hour can cross a calendar-day
 * boundary (the same class of flake fixed in useCaffeineLog.test.tsx).
 * These helpers freeze the clock at a fixed local midday so behavior is
 * identical on any machine at any time of day.
 *
 * Usage:
 *
 *   import { mockNow, isoHoursAgo } from '@/test/time';
 *
 *   it('...', () => {
 *     mockNow(); // freeze `new Date()` at REFERENCE_NOW
 *     render(<SleepImpactCard entries={[makeEntry({ timestamp: isoHoursAgo(1) })]} />);
 *   });
 *
 *   afterEach(() => restoreNow());
 */

import { vi } from 'vitest';

/**
 * Fixed reference "now" — local midday to avoid calendar-day edge cases.
 * Constructed from local components, so both `getHours()` (noon → 12) and
 * date arithmetic are timezone-robust.
 */
export const REFERENCE_NOW = new Date(2026, 0, 15, 12, 0, 0);

/** Freeze the system clock at the deterministic reference time. */
export function mockNow(): void {
  vi.useFakeTimers();
  vi.setSystemTime(REFERENCE_NOW);
}

/** Restore the real system clock after `mockNow()`. */
export function restoreNow(): void {
  vi.useRealTimers();
}

/** ISO timestamp for `hours` hours before the reference time. */
export function isoHoursAgo(hours: number): string {
  return new Date(REFERENCE_NOW.getTime() - hours * 3600000).toISOString();
}

/** ISO timestamp for `minutes` minutes before the reference time. */
export function isoMinutesAgo(minutes: number): string {
  return new Date(REFERENCE_NOW.getTime() - minutes * 60000).toISOString();
}

/** ISO timestamp for `minutes` minutes after the reference time. */
export function isoMinutesFromNow(minutes: number): string {
  return new Date(REFERENCE_NOW.getTime() + minutes * 60000).toISOString();
}
