/**
 * Coffee Caffeine Calculator — Constants Barrel
 *
 * Re-exports all scientific constants from domain-specific modules.
 * New code may import directly from the domain files (e.g., `@/engine/species`)
 * for better discoverability. This barrel remains for backward compatibility.
 *
 * @module constants
 */

export { SPECIES_CAFFEINE, DECAF_CAFFEINE_MG_PER_G } from '@/engine/species';
export {
  ALL_BREW_METHODS,
  BREW_METHOD_EFFICIENCY,
  BREW_METHOD_LABELS,
  GRIND_MULTIPLIERS,
  getTemperatureMultiplier,
  PROCESSING_MULTIPLIERS,
  ALTITUDE_MULTIPLIERS,
  ROAST_MULTIPLIERS,
  isPercolationMethod,
  MAX_PLAUSIBLE_COFFEE_WEIGHT_G,
  DEFAULT_PARAMS,
} from '@/engine/brew';
export {
  DEFAULT_HALF_LIFE_HOURS,
  MIN_HALF_LIFE_HOURS,
  MAX_HALF_LIFE_HOURS,
  DEFAULT_WINDOW_HOURS,
  CURVE_SAMPLING_INTERVAL_H,
  MS_PER_HOUR,
  SLEEP_ADVISORY_THRESHOLD_MG,
  HEALTH_ADVISORY_THRESHOLD_MG,
  MAX_PLAUSIBLE_DOSE_MG,
  MAX_PLAUSIBLE_ENTRIES,
  DAILY_SAFE_LIMIT_MG,
  STANDARD_CUP_CAFFEINE_MG,
} from '@/engine/metabolism';
