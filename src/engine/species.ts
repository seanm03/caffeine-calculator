/**
 * Coffee Caffeine Calculator — Species Constants
 *
 * Caffeine content by coffee species, derived from peer-reviewed literature.
 * Each value is cited with source papers.
 *
 * @module engine/species
 */

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
 * Decaf: 0–0.7 mg/g range; default 0.3 mg/g used here (97% decaffeination).
 *   Based on McCusker et al. (2006) finding 0–13.9 mg per 16-oz serving.
 *
 * @see Caracostea et al. (2021)
 * @see Kalaswari et al. (2024)
 * @see Olechno et al. (2021) — comprehensive systematic review
 * @see McCusker et al. (2006), Journal of Analytical Toxicology, 30(9):611-613
 */
export const SPECIES_CAFFEINE: Record<string, number> = {
  arabica: 12,
  robusta: 20,
  decaf: 0.3,
};
