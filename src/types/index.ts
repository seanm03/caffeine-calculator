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

/** Coffee species (Arabica, Robusta, or a blend of both) */
export type Species = 'arabica' | 'robusta' | 'blend';

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
