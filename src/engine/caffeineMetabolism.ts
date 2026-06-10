/**
 * Caffeine Metabolism Engine — Pharmacokinetic Model
 *
 * Implements a one-compartment model with first-order elimination.
 * The superposition principle applies: each dose contributes independently
 * to total blood concentration, and the contributions sum linearly.
 *
 * Core formula:
 *   C(t) = Σᵢ Dᵢ × 2^(-(t - tᵢ) / t₁/₂)
 *
 * Where:
 *   - Dᵢ = caffeine dose i (mg)
 *   - tᵢ = time dose i was consumed (Date)
 *   - t  = target time (Date)
 *   - t₁/₂ = half-life (hours, default 5, configurable 2–12)
 *
 * Bioavailability approximated as 1.0 (99% actual, negligible difference).
 * Absorption treated as instantaneous (peak 30–60 min, acceptable at hourly timescale).
 *
 * @module caffeineMetabolism
 */

import type { CaffeineLogEntry, BloodLevelPoint } from '@/types';
import { isValidNumber, isValidDate, isValidArray, clampNumber } from '@/engine/utils';
import {
  DEFAULT_HALF_LIFE_HOURS,
  MIN_HALF_LIFE_HOURS,
  MAX_HALF_LIFE_HOURS,
  DEFAULT_WINDOW_HOURS,
  CURVE_SAMPLING_INTERVAL_H,
  SLEEP_ADVISORY_THRESHOLD_MG,
  MAX_PLAUSIBLE_DOSE_MG,
} from '@/engine/constants';

// Re-export constants consumed by other modules for backward compatibility
export {
  DEFAULT_HALF_LIFE_HOURS,
  MIN_HALF_LIFE_HOURS,
  MAX_HALF_LIFE_HOURS,
  DEFAULT_WINDOW_HOURS,
  CURVE_SAMPLING_INTERVAL_H,
  SLEEP_ADVISORY_THRESHOLD_MG,
  HEALTH_ADVISORY_THRESHOLD_MG,
  MAX_PLAUSIBLE_DOSE_MG,
  MAX_PLAUSIBLE_ENTRIES,
  DAILY_SAFE_LIMIT_MG,
} from '@/engine/constants';

/** Validate a single log entry has plausible values. */
function isValidLogEntry(entry: CaffeineLogEntry): boolean {
  if (!entry || typeof entry !== 'object') return false;
  if (!isValidNumber(entry.caffeineMg) || entry.caffeineMg < 0 || entry.caffeineMg > MAX_PLAUSIBLE_DOSE_MG) return false;
  if (typeof entry.timestamp !== 'string') return false;
  const ts = new Date(entry.timestamp);
  if (!isValidDate(ts)) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compute estimated blood caffeine level at a target time given logged doses.
 *
 * Uses the one-compartment first-order elimination model with superposition.
 * Empty dose array returns 0.
 *
 * @param doses - Array of logged caffeine entries
 * @param targetTime - The time at which to compute blood level
 * @param halfLifeHours - Caffeine half-life in hours (default 5)
 * @returns Estimated blood caffeine level in mg
 */
export function computeBloodLevel(
  doses: readonly CaffeineLogEntry[],
  targetTime: Date,
  halfLifeHours: number = DEFAULT_HALF_LIFE_HOURS,
): number {
  // Input validation
  if (!isValidArray(doses)) return 0;
  if (!isValidDate(targetTime)) return 0;
  if (doses.length === 0) return 0;

  const validHalfLife = clampHalfLife(halfLifeHours);
  const targetMs = targetTime.getTime();

  let total = 0;
  for (const entry of doses) {
    // Skip invalid entries silently
    if (!isValidLogEntry(entry)) continue;

    const doseTimeMs = new Date(entry.timestamp).getTime();
    // Skip future doses
    if (doseTimeMs > targetMs) continue;

    const elapsedHours = (targetMs - doseTimeMs) / (1000 * 60 * 60);
    // Guard against extreme elapsed time (24h tail decay → effectively zero)
    if (elapsedHours > 120) continue; // 5 days → < 2^-24 → negligible

    // Factor: 2^(-t / halfLife)
    const remaining = entry.caffeineMg * Math.pow(2, -elapsedHours / validHalfLife);
    total += remaining;
  }

  return total;
}

/**
 * Generate a blood level curve as an array of sampling points over a time window.
 *
 * Samples at regular intervals (default: 15 minutes) from the start of the
 * window to the end. The window starts at the earliest dose time and extends
 * for windowHours.
 *
 * @param doses - Array of logged caffeine entries
 * @param halfLifeHours - Caffeine half-life in hours (default 5)
 * @param windowHours - Time window to visualize in hours (default 24)
 * @returns Array of blood level sampling points
 */
export function generateBloodLevelCurve(
  doses: readonly CaffeineLogEntry[],
  halfLifeHours: number = DEFAULT_HALF_LIFE_HOURS,
  windowHours: number = DEFAULT_WINDOW_HOURS,
): BloodLevelPoint[] {
  // Input validation
  if (!isValidArray(doses)) {
    return generateEmptyCurve(isValidNumber(windowHours) ? windowHours : DEFAULT_WINDOW_HOURS);
  }
  if (!isValidNumber(windowHours) || windowHours <= 0 || windowHours > 168) {
    windowHours = DEFAULT_WINDOW_HOURS;
  }

  const validHalfLife = clampHalfLife(halfLifeHours);

  if (doses.length === 0) {
    return generateEmptyCurve(windowHours);
  }

  // Find window boundaries
  const sortedTimes = doses
    .map((d) => new Date(d.timestamp).getTime())
    .sort((a, b) => a - b);
  const firstDoseMs = sortedTimes[0];
  const windowStartMs = firstDoseMs;
  const windowEndMs = windowStartMs + windowHours * 3600000;

  const points: BloodLevelPoint[] = [];
  const steps = Math.ceil(windowHours / CURVE_SAMPLING_INTERVAL_H);

  for (let i = 0; i <= steps; i++) {
    const pointMs = windowStartMs + i * CURVE_SAMPLING_INTERVAL_H * 3600000;
    // Stop if past window end
    if (pointMs > windowEndMs) break;

    const pointTime = new Date(pointMs);
    const level = computeBloodLevel(doses, pointTime, validHalfLife);

    points.push({
      time: pointTime,
      hoursSinceStart: i * CURVE_SAMPLING_INTERVAL_H,
      caffeineMg: Math.round(level * 100) / 100,
    });
  }

  return points;
}

/**
 * Compute a daily summary from logged entries and metabolism parameters.
 *
 * @param entries - Today's caffeine log entries
 * @param halfLifeHours - Caffeine half-life in hours
 * @param now - Current time (defaults to new Date())
 * @returns Daily summary with current level, total, peak stats
 */
export function computeDailySummary(
  entries: readonly CaffeineLogEntry[],
  halfLifeHours: number = DEFAULT_HALF_LIFE_HOURS,
  now: Date = new Date(),
): {
  currentLevel: number;
  totalToday: number;
  peakLevel: number;
  peakTime: Date | null;
} {
  // Input validation
  if (!isValidArray(entries)) {
    return { currentLevel: 0, totalToday: 0, peakLevel: 0, peakTime: null };
  }
  if (!isValidDate(now)) {
    now = new Date();
  }

  const validHalfLife = clampHalfLife(halfLifeHours);
  const currentLevel = computeBloodLevel(entries, now, validHalfLife);

  // Filter to valid entries for total and peak calculations
  const validEntries = entries.filter(isValidLogEntry);
  const totalToday = validEntries.reduce((sum, e) => sum + e.caffeineMg, 0);

  // Find peak by sampling at each entry time and midpoints
  let peakLevel = 0;
  let peakTime: Date | null = null;

  if (validEntries.length > 0) {
    // Sample at each entry time to find peak
    const sorted = [...validEntries].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    for (let i = 0; i < sorted.length; i++) {
      const time = new Date(sorted[i].timestamp);
      // Check level right after this dose (adding it to the system)
      const level = computeBloodLevel(sorted.slice(0, i + 1), time, validHalfLife);
      if (level > peakLevel) {
        peakLevel = level;
        peakTime = time;
      }
    }

    // Also sample at current time
    if (currentLevel > peakLevel) {
      peakLevel = currentLevel;
      peakTime = now;
    }
  }

  return {
    currentLevel: Math.round(currentLevel * 100) / 100,
    totalToday,
    peakLevel: Math.round(peakLevel * 100) / 100,
    peakTime,
  };
}

/**
 * Project when blood caffeine will drop below a threshold.
 *
 * Returns the estimated Date when caffeine falls below the given threshold,
 * or null if it is already below or there are no entries.
 *
 * @param entries - Caffeine log entries
 * @param halfLifeHours - Caffeine half-life in hours
 * @param thresholdMg - Threshold to check (default: SLEEP_ADVISORY_THRESHOLD_MG)
 * @param now - Current time
 * @returns Date when level drops below threshold, or null
 */
export function timeUntilBelow(
  entries: readonly CaffeineLogEntry[],
  halfLifeHours: number = DEFAULT_HALF_LIFE_HOURS,
  thresholdMg: number = SLEEP_ADVISORY_THRESHOLD_MG,
  now: Date = new Date(),
): Date | null {
  // Input validation
  if (!isValidArray(entries)) return null;
  if (!isValidDate(now)) return null;
  if (!isValidNumber(thresholdMg) || thresholdMg < 0) return null;

  const currentLevel = computeBloodLevel(entries, now, halfLifeHours);

  if (currentLevel <= thresholdMg || entries.length === 0) return null;

  // Binary search for the time when level drops below threshold
  let low = 0; // hours from now
  let high = 48; // max 48 hours lookahead

  for (let i = 0; i < 30; i++) {
    const mid = (low + high) / 2;
    const futureTime = new Date(now.getTime() + mid * 3600000);
    const level = computeBloodLevel(entries, futureTime, halfLifeHours);

    if (level <= thresholdMg) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return new Date(now.getTime() + high * 3600000);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a zero-level curve over a time window.
 * Used when there are no entries or when inputs are invalid.
 */
function generateEmptyCurve(windowHours: number): BloodLevelPoint[] {
  const now = new Date();
  const points: BloodLevelPoint[] = [];
  const steps = Math.ceil(windowHours / CURVE_SAMPLING_INTERVAL_H);
  for (let i = 0; i <= steps; i++) {
    const t = new Date(now.getTime() - windowHours * 3600000 + i * CURVE_SAMPLING_INTERVAL_H * 3600000);
    points.push({
      time: t,
      hoursSinceStart: i * CURVE_SAMPLING_INTERVAL_H,
      caffeineMg: 0,
    });
  }
  return points;
}

/**
 * Clamp half-life to valid range [2, 12].
 * Handles NaN, Infinity, zero, and negative by returning the default.
 */
function clampHalfLife(hours: number): number {
  if (!isValidNumber(hours) || hours <= 0) return DEFAULT_HALF_LIFE_HOURS;
  return clampNumber(hours, MIN_HALF_LIFE_HOURS, MAX_HALF_LIFE_HOURS, DEFAULT_HALF_LIFE_HOURS);
}
