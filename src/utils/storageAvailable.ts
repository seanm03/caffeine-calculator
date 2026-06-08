/**
 * Detects localStorage availability and quota status.
 *
 * Handles both the standard `QuotaExceededError` and Firefox's
 * `NS_ERROR_DOM_QUOTA_REACHED` error name.
 *
 * @returns An object indicating whether localStorage is available and
 *          whether a quota error was detected.
 */
export function storageAvailable(): {
  available: boolean;
  quotaExceeded: boolean;
} {
  try {
    const key = '__caffeine_calc_storage_test__';
    localStorage.setItem(key, key);
    localStorage.removeItem(key);
    return { available: true, quotaExceeded: false };
  } catch (e) {
    const isQuotaError =
      e instanceof DOMException &&
      (e.name === 'QuotaExceededError' ||
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    return {
      available: false,
      quotaExceeded: isQuotaError && localStorage.length > 0,
    };
  }
}
