/**
 * Shared Utility Functions for the Caffeine Calculator Engine.
 *
 * Provides reusable validation helpers used across the calculation and
 * metabolism engines. Extracted to eliminate code duplication (IV-010).
 */

// ---------------------------------------------------------------------------
// Type Guards
// ---------------------------------------------------------------------------

/** Check if a value is a valid finite number (not NaN, not Infinity). */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Check if a Date object is valid (not NaN timestamp). */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

/** Check if a value is a non-null array. */
export function isValidArray<T>(value: unknown): value is readonly T[] {
  return Array.isArray(value);
}

/** Check if a value is a non-empty string. */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

// ---------------------------------------------------------------------------
// Clamp Helpers
// ---------------------------------------------------------------------------

/**
 * Clamp a number to a [min, max] range.
 * Returns `fallback` when the value is not a valid finite number.
 */
export function clampNumber(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
): number {
  if (!isValidNumber(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}
