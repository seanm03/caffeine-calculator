/**
 * Coffee Caffeine Calculator — Type Definitions
 *
 * All types used across the calculation engine and UI components.
 * These form the contract between engine outputs and rendering logic.
 */

/** Supported coffee brewing methods */
export type BrewMethod =
  | 'espresso'
  | 'pour-over'
  | 'french-press'
  | 'aeropress'
  | 'moka-pot'
  | 'cold-brew'
  | 'turkish'
  | 'instant';

/** Coffee species (Arabica, Robusta, blend, or decaf) */
export type Species = 'arabica' | 'robusta' | 'blend' | 'decaf';

/** Roast level — affects caffeine retention during roasting */
export type RoastLevel = 'light' | 'medium' | 'dark';

/** Grind size — affects extraction rate and efficiency */
export type GrindSize = 'extra-fine' | 'fine' | 'medium' | 'coarse' | 'extra-coarse';

/** Post-harvest processing method — minor effect on caffeine content */
export type ProcessingMethod = 'washed' | 'honey' | 'natural';

/** Growing altitude — inversely correlated with caffeine content */
export type Altitude = 'low' | 'medium' | 'high';

/**
 * Input parameters for the caffeine calculation.
 * Weight and water are always required; advanced parameters are optional.
 */
export interface BrewingParameters {
  /** Brew method (espresso, pour-over, etc.) */
  brewMethod: BrewMethod;
  /** Dry coffee weight in grams */
  coffeeWeightG: number;
  /** Water volume in milliliters */
  waterVolumeMl: number;
  /** Coffee species (arabica, robusta, or blend) */
  species: Species;
  /** Percentage of robusta in the blend (0–100). Only relevant when species is 'blend'. */
  robustaPercent?: number;
  /** Roast level (light, medium, dark) */
  roastLevel?: RoastLevel;
  /** Grind size (extra-fine through extra-coarse) */
  grindSize?: GrindSize;
  /** Water temperature in °C */
  waterTemperatureC?: number;
  /** Post-harvest processing method */
  processingMethod?: ProcessingMethod;
  /** Growing altitude category */
  altitude?: Altitude;
}

/**
 * Intermediate calculation values exposed for transparency.
 * Each field represents one step in the multiplicative model.
 */
export interface CaffeineBreakdown {
  /** Caffeine in grounds before adjustments: coffeeWeightG × speciesCaffeineMgPerG */
  baseCaffeineMg: number;
  /** Adjustment factor from roast level (light/medium/dark) */
  roastAdjustment: number;
  /** Adjustment factor from processing method (washed/honey/natural) */
  processingAdjustment: number;
  /** Adjustment factor from growing altitude (low/medium/high) */
  altitudeAdjustment: number;
  /** Base extraction efficiency of the brew method */
  baseEfficiency: number;
  /** Adjustment factor from grind size on extraction efficiency */
  grindAdjustment: number;
  /** Adjustment factor from water temperature on extraction efficiency */
  temperatureAdjustment: number;
  /** Final extraction efficiency after all adjustments */
  finalEfficiency: number;
}

/**
 * Complete caffeine calculation result.
 * Includes total caffeine, health reference comparisons, and detailed breakdown.
 */
export interface CaffeineResult {
  /** Total estimated caffeine in the brewed cup (mg) */
  totalCaffeineMg: number;
  /** Percentage of the 400 mg daily safe limit */
  dailyLimitPercent: number;
  /** Equivalent number of "standard" 95 mg cups of coffee */
  equivalentCups: number;
  /** Step-by-step breakdown of the calculation */
  breakdown: CaffeineBreakdown;
}

/**
 * A commercial brand coffee drink with known caffeine content.
 * Used in the brand reference database for comparison.
 */
export interface BrandDrink {
  /** Brand name (e.g., "Starbucks") */
  brand: string;
  /** Drink name (e.g., "Caffè Americano") */
  name: string;
  /** Size label (e.g., "Grande") */
  size: string;
  /** Volume in milliliters */
  volumeMl: number;
  /** Caffeine content in milligrams */
  caffeineMg: number;
  /** Source citation (e.g., "USDA FDC", brand website URL) */
  source: string;
  /** ISO date when the data was last verified */
  lastUpdated: string;
}

// ---------------------------------------------------------------------------
// Metabolism Tracker Types (v2)
// ---------------------------------------------------------------------------

/**
 * A single logged caffeine consumption entry.
 * Stored in localStorage under key 'coffee-calc-logs'.
 */
export interface CaffeineLogEntry {
  /** Unique identifier (UUID v4) */
  id: string;
  /** ISO 8601 timestamp of consumption */
  timestamp: string;
  /** Caffeine consumed in milligrams */
  caffeineMg: number;
  /** Optional user label (e.g., "Morning pour-over") */
  drinkName?: string;
  /** Brew method used (from the calculator) */
  brewMethod?: BrewMethod;
  /** Dry coffee weight in grams */
  coffeeWeightG?: number;
  /** Water volume in milliliters */
  waterVolumeMl?: number;
  /** Optional free-text notes */
  notes?: string;
}

/**
 * User-configurable metabolism parameters.
 */
export interface MetabolismParams {
  /** Caffeine half-life in hours (range 2–12, default 5) */
  halfLifeHours: number;
  /** Visualization window in hours (default 24) */
  windowHours: number;
}

/**
 * A single sampling point on the blood caffeine level curve.
 */
export interface BloodLevelPoint {
  /** Absolute time of this sample */
  time: Date;
  /** Hours elapsed since the start of the visualization window */
  hoursSinceStart: number;
  /** Estimated blood caffeine level in mg at this point */
  caffeineMg: number;
}

/**
 * Summary statistics for the current day's caffeine consumption.
 */
export interface DailyCaffeineSummary {
  /** Estimated current blood caffeine level (mg) */
  currentLevel: number;
  /** Total caffeine consumed today (mg) */
  totalToday: number;
  /** Peak blood caffeine level reached today (mg) */
  peakLevel: number;
  /** Time when peak level occurred */
  peakTime: Date | null;
  /** Number of entries logged today */
  entryCount: number;
}
