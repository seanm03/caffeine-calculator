/**
 * Shared formatting helpers for the caffeine calculator UI.
 */

/**
 * Format an hour of the day (0-23) as a 12-hour clock label with minutes
 * fixed to :00, e.g. `9:00 PM` or `12:00 AM`.
 */
export function formatHour12(hour: number): string {
  const h = hour % 24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}:00 ${ampm}`;
}
