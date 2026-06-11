/**
 * Branded Types — Compile-time unit safety for domain values.
 *
 * Uses the `number & { readonly __brand: B }` intersection pattern,
 * validated by TypeScript's own compiler test suite and production
 * usage at PayPal and Zod 4. Zero runtime overhead.
 *
 * Only domain-meaningful inputs are branded. Multipliers, fractions,
 * and derived values remain plain `number`.
 *
 * @module branded
 */

export type Branded<T, B> = T & { readonly __brand: B };

// ---------------------------------------------------------------------------
// Domain type aliases
// ---------------------------------------------------------------------------

/** Caffeine mass in milligrams. */
export type CaffeineMg = Branded<number, 'CaffeineMg'>;
export const CaffeineMg = (value: number): CaffeineMg => value as CaffeineMg;
export const unwrapMg = (mg: CaffeineMg): number => mg;

/** Time duration in hours. */
export type Hours = Branded<number, 'Hours'>;
export const Hours = (value: number): Hours => value as Hours;
export const unwrapHours = (h: Hours): number => h;

/** Mass in grams. */
export type WeightG = Branded<number, 'WeightG'>;
export const WeightG = (value: number): WeightG => value as WeightG;
export const unwrapWeightG = (g: WeightG): number => g;

/** Volume in milliliters. */
export type VolumeMl = Branded<number, 'VolumeMl'>;
export const VolumeMl = (value: number): VolumeMl => value as VolumeMl;
export const unwrapVolumeMl = (ml: VolumeMl): number => ml;

/** Temperature in degrees Celsius. */
export type TemperatureC = Branded<number, 'TemperatureC'>;
export const TemperatureC = (value: number): TemperatureC => value as TemperatureC;
export const unwrapTemperatureC = (c: TemperatureC): number => c;
