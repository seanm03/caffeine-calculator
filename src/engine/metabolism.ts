/**
 * Coffee Caffeine Calculator — Metabolism & Health Constants
 *
 * Pharmacokinetic constants for the one-compartment caffeine metabolism model
 * and health reference values from FDA/EFSA guidelines.
 *
 * @module engine/metabolism
 */

import { CaffeineMg, Hours } from '@/types/branded';

// ---------------------------------------------------------------------------
// Pharmacokinetic constants
// ---------------------------------------------------------------------------

/** Default caffeine half-life in hours (typical healthy adult). */
export const DEFAULT_HALF_LIFE_HOURS: Hours = Hours(5);

/** Minimum configurable half-life in hours. */
export const MIN_HALF_LIFE_HOURS: Hours = Hours(2);

/** Maximum configurable half-life in hours. */
export const MAX_HALF_LIFE_HOURS: Hours = Hours(12);

/** Default visualization window in hours. */
export const DEFAULT_WINDOW_HOURS: Hours = Hours(24);

/** Sampling interval in hours for blood level curve generation (15 minutes). */
export const CURVE_SAMPLING_INTERVAL_H = 0.25;

/** Level at which caffeine may begin to affect sleep (mg). */
export const SLEEP_ADVISORY_THRESHOLD_MG: CaffeineMg = CaffeineMg(50);

/** Level at which caffeine poses health concern (mg). */
export const HEALTH_ADVISORY_THRESHOLD_MG: CaffeineMg = CaffeineMg(800);

/** Maximum physiologically plausible single dose in mg. */
export const MAX_PLAUSIBLE_DOSE_MG: CaffeineMg = CaffeineMg(2000);

/** Maximum physiologically plausible total entries in a single log. */
export const MAX_PLAUSIBLE_ENTRIES = 200;

// ---------------------------------------------------------------------------
// Health reference values
// ---------------------------------------------------------------------------

/**
 * FDA/EFSA daily safe caffeine limit for healthy adults.
 *
 * @see FDA (2018): "400mg a day is not generally associated with dangerous effects"
 * @see EFSA (2015): "Single doses up to 200mg and daily intakes up to 400mg
 *      do not raise safety concerns for healthy adults"
 */
export const DAILY_SAFE_LIMIT_MG: CaffeineMg = CaffeineMg(400);

/**
 * "Standard cup of coffee" reference value.
 * Used for equivalent-cups comparison in results display.
 * Based on general consensus across FDA, USDA, and literature.
 */
export const STANDARD_CUP_CAFFEINE_MG: CaffeineMg = CaffeineMg(95);
