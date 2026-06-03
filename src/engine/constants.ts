/**
 * Coffee Caffeine Calculator — Scientific Constants
 *
 * All constant values and lookup tables derived from peer-reviewed literature.
 * Each value is cited with source papers. These constants drive the
 * multiplicative caffeine estimation model.
 *
 * @module constants
 */

import type { BrewMethod } from '../types';

// ---------------------------------------------------------------------------
// Species caffeine content (mg/g, green bean basis)
// ---------------------------------------------------------------------------

/**
 * Caffeine content by species in mg per gram of green coffee beans.
 *
 * Arabica: 9–15 mg/g range; default 12 mg/g used here.
 *   Supported by Caracostea et al. (2021), Kalaswari et al. (2024),
 *   and aligns with Hoffmann's ~270 mg from 18 g = 15 mg/g for his specific coffee.
 *
 * Robusta: 12–24 mg/g range; default 20 mg/g used here.
 *   ~1.5–2× the caffeine of Arabica, consistent across all literature.
 *
 * @see Caracostea et al. (2021)
 * @see Kalaswari et al. (2024)
 * @see Olechno et al. (2021) — comprehensive systematic review
 */
export const SPECIES_CAFFEINE: Record<string, number> = {
  arabica: 12,
  robusta: 20,
};

// ---------------------------------------------------------------------------
// Roast level multipliers (vs. medium baseline)
// ---------------------------------------------------------------------------

/**
 * Roast level effect on caffeine retention.
 *
 * Light roast retains slightly more caffeine per gram (less thermal degradation).
 * Dark roast loses 5–20% due to sublimation at 178°C.
 *
 * Values derived from:
 *   - Hečimović et al. (2011): Light > Medium > Dark across 4 varieties
 *   - Severini et al. (2017): 5–20% loss at typical roast temperatures
 *   - Duke et al. (2025): Thermal degradation reduces caffeine in darker roasts (p < 0.05)
 *   - Lindsey et al. (2024): Quantitative roast-caffeine comparison in filter coffee
 *
 * @see Hečimović et al. (2011), Food Chemistry, 129(3):991-1000
 * @see Severini et al. (2017), The Question of Caffeine, IntechOpen
 * @see Duke et al. (2025), Journal of Food Quality, 2405668
 */
export const ROAST_MULTIPLIERS: Record<string, number> = {
  light: 1.05,
  medium: 1.0,
  dark: 0.9,
};

// ---------------------------------------------------------------------------
// Brew method base extraction efficiency (η)
// ---------------------------------------------------------------------------

/**
 * Base extraction efficiency by brew method.
 *
 * These represent the fraction of available caffeine that is extracted
 * into the cup under standard brewing conditions for each method.
 *
 * Derived from Severini et al. (2017) comprehensive data tables,
 * cross-calibrated with Hoffmann (2023) empirical results.
 *
 * Hoffmann calibration note: Hoffmann's specific coffee gave 41% (espresso)
 * and 63% (pour-over) efficiency. Our model uses literature-average values
 * (75–95%) based on 35+ papers, since Hoffmann's single coffee represents
 * one specific bean/roast combination. Users should understand actual
 * caffeine can vary ±20%.
 *
 * @see Severini et al. (2017), The Question of Caffeine, IntechOpen
 * @see Hoffmann (2023), "I Did Caffeine Analysis: Some Unexpected Results!"
 * @see Olechno et al. (2021), Foods, 10(6):1208
 */
export const BREW_METHOD_EFFICIENCY: Record<string, number> = {
  espresso: 0.8,
  'pour-over': 0.9,
  'french-press': 0.92,
  aeropress: 0.87,
  'moka-pot': 0.85,
  'cold-brew': 0.9,
  turkish: 0.92,
  instant: 1.0,
};

// ---------------------------------------------------------------------------
// Grind size multipliers
// ---------------------------------------------------------------------------

/**
 * Grind size effect on extraction efficiency.
 *
 * Each grind size has two multipliers:
 *   [0] = percolation methods (espresso, moka pot)
 *   [1] = immersion methods (all others)
 *
 * Finer grinds increase surface area and extraction rate.
 * For percolation, the "percolation paradox" (Severini et al., 2016) means
 * coarser grinds allow higher flow rates, which can increase total extraction.
 * Our model simplifies this into the percolation column values.
 *
 * Rate constants from Spiro & Selwood (1984): coarse 0.207×10⁻³ s⁻¹ →
 * fine 22×10⁻³ s⁻¹ (100× increase).
 *
 * For immersion methods with sufficient time (>4 min), grind size effect
 * diminishes (Bell et al., 1996).
 *
 * @see Spiro & Selwood (1984), JSFA, 34:915-924
 * @see Bell et al. (1996), Food Research International, 29:785-789
 * @see Severini et al. (2016) — percolation paradox
 */
export const GRIND_MULTIPLIERS: Record<string, [number, number]> = {
  'extra-fine': [1.05, 1.02],
  fine: [1.0, 1.01],
  medium: [0.9, 1.0],
  coarse: [0.8, 0.95],
  'extra-coarse': [0.75, 0.9],
};

// ---------------------------------------------------------------------------
// Temperature multiplier function
// ---------------------------------------------------------------------------

/**
 * Water temperature effect on extraction efficiency.
 *
 * Higher temperatures accelerate caffeine extraction kinetics.
 * The effect is modest (<5%) within typical brewing ranges.
 *
 * Temperature ranges adapted from:
 *   - Albanese et al. (2009): Temperature significantly affects extraction rate
 *   - Wang & Lim (2021): Investigated kinetics 4–37°C (cold brew) to 93°C
 *   - Wang & Lim (2023): Particle size × temperature interaction effects
 *
 * @param tempC - Water temperature in degrees Celsius
 * @returns Temperature multiplier (0.90–1.02)
 *
 * @see Albanese et al. (2009)
 * @see Wang & Lim (2021, 2023)
 */
export function getTemperatureMultiplier(tempC: number): number {
  if (tempC < 70) return 0.85;
  if (tempC <= 79) return 0.88;
  if (tempC <= 84) return 0.92;
  if (tempC <= 88) return 0.95;
  if (tempC <= 96) return 1.0;
  return 1.02;
}

// ---------------------------------------------------------------------------
// Processing method multipliers
// ---------------------------------------------------------------------------

/**
 * Post-harvest processing method effect on caffeine content in green beans.
 *
 * Natural/dry processing may slightly concentrate caffeine as the cherry
 * mucilage ferments and dries on the bean. Effect is small (<5%).
 *
 * Evidence from:
 *   - Várady et al. (2022): Processing method affects bioactive compounds
 *   - Wulandari et al. (2021): Natural processing increases caffeine slightly
 *   - Lidya et al. (2024): Confirmed small processing effect on caffeine
 *
 * @see Várady et al. (2022)
 * @see Wulandari et al. (2021)
 */
export const PROCESSING_MULTIPLIERS: Record<string, number> = {
  washed: 1.0,
  honey: 1.02,
  natural: 1.03,
};

// ---------------------------------------------------------------------------
// Altitude multipliers
// ---------------------------------------------------------------------------

/**
 * Growing altitude effect on caffeine content.
 *
 * Higher altitude generally correlates with slightly lower caffeine in Arabica.
 * Caffeine is a pest-defense compound; lower altitudes have more pests →
 * plants upregulate caffeine. Cooler high-altitude temperatures also slow
 * caffeine biosynthesis.
 *
 * Preponderance of evidence (3 of 4 studies) supports inverse relationship.
 *
 * Evidence from:
 *   - Ahmed et al. (2021): Systematic review; 3 of 4 studies found inverse
 *     altitude-caffeine relationship
 *   - Tolessa et al. (2017): High-grown Ethiopian (1,950–2,010 m) had lower
 *     caffeine than lower-grown (1,600–1,680 m)
 *   - Worku et al. (2018): Confirmed inverse relationship with shade/processing
 *     interaction
 *   - Hagos et al. (2018): Direct negative correlation altitude ↔ caffeine
 *   - Rusinek et al. (2025): Same Typica across 4 countries; altitude drove
 *     caffeine differences
 *
 * @see Ahmed et al. (2021), Frontiers in Plant Science, 12:708013
 * @see Tolessa et al. (2017), Food Research International
 * @see Worku et al. (2018)
 * @see Rusinek et al. (2025), Scientific Reports, 15:30117
 */
export const ALTITUDE_MULTIPLIERS: Record<string, number> = {
  /** Low altitude (<1,000 m): slightly higher caffeine */
  low: 1.05,
  /** Medium altitude (1,000–1,600 m): baseline */
  medium: 1.0,
  /** High altitude (>1,600 m): slightly lower caffeine */
  high: 0.95,
};

// ---------------------------------------------------------------------------
// Health constants
// ---------------------------------------------------------------------------

/**
 * FDA/EFSA daily safe caffeine limit for healthy adults.
 *
 * @see FDA (2018): "400mg a day is not generally associated with dangerous effects"
 * @see EFSA (2015): "Single doses up to 200mg and daily intakes up to 400mg
 *      do not raise safety concerns for healthy adults"
 */
export const DAILY_SAFE_LIMIT_MG = 400;

/**
 * "Standard cup of coffee" reference value.
 * Used for equivalent-cups comparison in results display.
 * Based on general consensus across FDA, USDA, and literature.
 */
export const STANDARD_CUP_CAFFEINE_MG = 95;

// ---------------------------------------------------------------------------
// Default brewing parameters
// ---------------------------------------------------------------------------

/**
 * Sensible default values for the calculator.
 * Arabica pour-over at standard specialty coffee parameters.
 */
export const DEFAULT_PARAMS = {
  brewMethod: 'pour-over' as const,
  coffeeWeightG: 18,
  waterVolumeMl: 300,
  species: 'arabica' as const,
  robustaPercent: 50,
  roastLevel: 'medium' as const,
  grindSize: 'medium' as const,
  waterTemperatureC: 93,
  processingMethod: 'washed' as const,
  altitude: 'medium' as const,
};

// ---------------------------------------------------------------------------
// Helper: percolation vs. immersion classification
// ---------------------------------------------------------------------------

/**
 * Check whether a brew method uses percolation (pressure-driven flow)
 * rather than immersion (steeping).
 *
 * Percolation methods: espresso, moka pot
 * Immersion methods: pour-over, french-press, aeropress, cold-brew, turkish, instant
 *
 * This determines which grind multiplier column to use (index 0 vs 1).
 */
export function isPercolationMethod(method: BrewMethod): boolean {
  return method === 'espresso' || method === 'moka-pot';
}
