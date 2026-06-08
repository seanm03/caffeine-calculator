/**
 * Coffee Caffeine Calculator — Core Calculation Engine
 *
 * Pure functions implementing the multiplicative caffeine estimation model.
 * All functions are deterministic with no side effects.
 *
 * Formula (from peer-reviewed literature):
 *   C_grounds     = coffeeWeightG × speciesCaffeineMgPerG
 *   C_grounds_adj = C_grounds × roastMultiplier × processingMultiplier × altitudeMultiplier
 *   η             = brewMethodEfficiency × grindMultiplier × temperatureMultiplier
 *   C_cup         = C_grounds_adj × η
 *
 * @module caffeineCalculator
 */

import type {
  BrewMethod,
  BrewingParameters,
  CaffeineBreakdown,
  CaffeineResult,
  GrindSize,
  RoastLevel,
  ProcessingMethod,
  Altitude,
  Species,
} from '../types';

import {
  SPECIES_CAFFEINE,
  ROAST_MULTIPLIERS,
  BREW_METHOD_EFFICIENCY,
  GRIND_MULTIPLIERS,
  getTemperatureMultiplier,
  PROCESSING_MULTIPLIERS,
  ALTITUDE_MULTIPLIERS,
  DAILY_SAFE_LIMIT_MG,
  STANDARD_CUP_CAFFEINE_MG,
  isPercolationMethod,
} from './constants';
import { isValidNumber } from './utils';

/** Maximum plausible coffee weight in grams. */
const MAX_PLAUSIBLE_COFFEE_WEIGHT_G = 500;

// ---------------------------------------------------------------------------
// Parameter-level lookup helpers
// ---------------------------------------------------------------------------

/**
 * Get caffeine content in mg/g for the given species.
 * For blends, computes the weighted average of arabica and robusta.
 *
 * @param species - Coffee species (arabica, robusta, or blend)
 * @param robustaPercent - Percentage of robusta in blend (0–100), only used for 'blend'
 * @returns Caffeine content in mg/g of green coffee
 */
export function getSpeciesCaffeine(species: Species, robustaPercent?: number): number {
  // Input validation
  if (!species || typeof species !== 'string') return 0;

  if (species === 'blend') {
    const pct = (!isValidNumber(robustaPercent) ? 50 : Math.max(0, Math.min(100, robustaPercent))) / 100;
    return SPECIES_CAFFEINE.arabica * (1 - pct) + SPECIES_CAFFEINE.robusta * pct;
  }
  return SPECIES_CAFFEINE[species];
}

/**
 * Get the roast level multiplier.
 * Returns 1.00 (neutral) if roast is undefined.
 *
 * @param roast - Roast level (light, medium, dark), or undefined
 * @returns Roast multiplier factor
 */
export function getRoastMultiplier(roast?: RoastLevel): number {
  if (roast === undefined) return 1.0;
  return ROAST_MULTIPLIERS[roast];
}

/**
 * Get the processing method multiplier.
 * Returns 1.00 (neutral) if processing is undefined.
 *
 * @param processing - Processing method, or undefined
 * @returns Processing multiplier factor
 */
export function getProcessingMultiplier(processing?: ProcessingMethod): number {
  if (processing === undefined) return 1.0;
  return PROCESSING_MULTIPLIERS[processing];
}

/**
 * Get the altitude multiplier.
 * Returns 1.00 (neutral) if altitude is undefined.
 *
 * @param altitude - Altitude category, or undefined
 * @returns Altitude multiplier factor
 */
export function getAltitudeMultiplier(altitude?: Altitude): number {
  if (altitude === undefined) return 1.0;
  return ALTITUDE_MULTIPLIERS[altitude];
}

/**
 * Get the base extraction efficiency for a brew method.
 *
 * @param method - Brew method
 * @returns Base extraction efficiency (0–1)
 */
export function getBrewMethodEfficiency(method: BrewMethod): number {
  return BREW_METHOD_EFFICIENCY[method];
}

/**
 * Get the grind size multiplier for a given brew method.
 * Uses different columns for percolation (index 0) vs. immersion (index 1).
 * Returns 1.00 (neutral) if grind is undefined.
 *
 * @param grind - Grind size, or undefined
 * @param method - Brew method (determines percolation vs. immersion column)
 * @returns Grind multiplier factor
 */
export function getGrindMultiplier(grind: GrindSize | undefined, method: BrewMethod): number {
  if (grind === undefined) return 1.0;
  const column = isPercolationMethod(method) ? 0 : 1;
  return GRIND_MULTIPLIERS[grind][column];
}

// ---------------------------------------------------------------------------
// Breakdown builder
// ---------------------------------------------------------------------------

/**
 * Build the detailed caffeine breakdown from all intermediate values.
 * Exposed for transparency so users can see each step of the calculation.
 *
 * @param baseCaffeineMg - Caffeine in grounds before adjustments
 * @param roastAdj - Roast level adjustment factor
 * @param processingAdj - Processing method adjustment factor
 * @param altitudeAdj - Altitude adjustment factor
 * @param baseEff - Base extraction efficiency
 * @param grindAdj - Grind size adjustment factor
 * @param tempAdj - Temperature adjustment factor
 * @param finalEff - Final extraction efficiency after all adjustments
 * @returns Complete breakdown of calculation steps
 */
export function buildBreakdown(
  baseCaffeineMg: number,
  roastAdj: number,
  processingAdj: number,
  altitudeAdj: number,
  baseEff: number,
  grindAdj: number,
  tempAdj: number,
  finalEff: number,
): CaffeineBreakdown {
  return {
    baseCaffeineMg,
    roastAdjustment: roastAdj,
    processingAdjustment: processingAdj,
    altitudeAdjustment: altitudeAdj,
    baseEfficiency: baseEff,
    grindAdjustment: grindAdj,
    temperatureAdjustment: tempAdj,
    finalEfficiency: finalEff,
  };
}

// ---------------------------------------------------------------------------
// Main calculator
// ---------------------------------------------------------------------------

/**
 * Calculate caffeine content for a given set of brewing parameters.
 *
 * Implements the complete multiplicative model:
 *
 * Step 1: C_grounds = coffeeWeightG × speciesCaffeineMgPerG
 * Step 2: C_grounds_adj = C_grounds × roastMultiplier × processingMultiplier × altitudeMultiplier
 * Step 3: η = brewMethodEfficiency × grindMultiplier × temperatureMultiplier
 * Step 4: C_cup = C_grounds_adj × η
 *
 * @param params - Complete or partial brewing parameters
 * @returns CaffeineResult with total mg, daily limit %, equivalent cups, and breakdown
 */
export function calculateCaffeine(params: BrewingParameters): CaffeineResult {
  // Input validation
  if (!params || typeof params !== 'object') {
    return {
      totalCaffeineMg: 0,
      dailyLimitPercent: 0,
      equivalentCups: 0,
      breakdown: buildBreakdown(0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0),
    };
  }

  const {
    brewMethod,
    coffeeWeightG,
    species,
    robustaPercent,
    roastLevel,
    grindSize,
    waterTemperatureC,
    processingMethod,
    altitude,
  } = params;

  // Edge case: invalid or non-positive coffee weight → zero caffeine
  if (!isValidNumber(coffeeWeightG) || coffeeWeightG <= 0 || coffeeWeightG > MAX_PLAUSIBLE_COFFEE_WEIGHT_G) {
    return {
      totalCaffeineMg: 0,
      dailyLimitPercent: 0,
      equivalentCups: 0,
      breakdown: buildBreakdown(0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0),
    };
  }

  // --- Step 1: Base caffeine in grounds ---
  const speciesCaffeineMgPerG = getSpeciesCaffeine(species, robustaPercent);
  const baseCaffeineMg = coffeeWeightG * speciesCaffeineMgPerG;

  // --- Step 2a: Roast adjustment ---
  const roastAdj = getRoastMultiplier(roastLevel);

  // --- Step 2b: Processing adjustment ---
  const processingAdj = getProcessingMultiplier(processingMethod);

  // --- Step 2c: Altitude adjustment ---
  const altitudeAdj = getAltitudeMultiplier(altitude);

  // Combined grounds adjustment
  const groundsAdjusted = baseCaffeineMg * roastAdj * processingAdj * altitudeAdj;

  // --- Step 3a: Base extraction efficiency ---
  const baseEff = getBrewMethodEfficiency(brewMethod);

  // --- Step 3b: Grind adjustment ---
  const grindAdj = getGrindMultiplier(grindSize, brewMethod);

  // --- Step 3c: Temperature adjustment ---
  const tempAdj = waterTemperatureC !== undefined
    ? getTemperatureMultiplier(waterTemperatureC)
    : 1.0;

  // Combined extraction efficiency
  const finalEff = baseEff * grindAdj * tempAdj;

  // --- Step 4: Caffeine in cup ---
  const totalCaffeineMg = Math.round(groundsAdjusted * finalEff);

  // Derived values
  const dailyLimitPercent = Math.round((totalCaffeineMg / DAILY_SAFE_LIMIT_MG) * 100 * 10) / 10;
  const equivalentCups = Math.round((totalCaffeineMg / STANDARD_CUP_CAFFEINE_MG) * 10) / 10;

  const breakdown = buildBreakdown(
    Math.round(baseCaffeineMg),
    roastAdj,
    processingAdj,
    altitudeAdj,
    baseEff,
    grindAdj,
    tempAdj,
    Math.round(finalEff * 1000) / 1000,
  );

  return { totalCaffeineMg, dailyLimitPercent, equivalentCups, breakdown };
}
