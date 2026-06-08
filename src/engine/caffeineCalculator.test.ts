/**
 * Tests for the caffeine calculator engine.
 *
 * Validates the multiplicative model against known examples from research,
 * edge cases, and all brew methods.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateCaffeine,
  getSpeciesCaffeine,
  getRoastMultiplier,
  getProcessingMultiplier,
  getAltitudeMultiplier,
  getBrewMethodEfficiency,
  getGrindMultiplier,
  buildBreakdown,
} from './caffeineCalculator';

import type { BrewingParameters, BrewMethod } from '../types';
import { DAILY_SAFE_LIMIT_MG } from './constants';

// ---------------------------------------------------------------------------
// Individual lookup function tests
// ---------------------------------------------------------------------------

describe('getSpeciesCaffeine', () => {
  it('returns 12 for arabica', () => {
    expect(getSpeciesCaffeine('arabica')).toBe(12);
  });

  it('returns 20 for robusta', () => {
    expect(getSpeciesCaffeine('robusta')).toBe(20);
  });

  it('returns weighted average for 50% blend (default)', () => {
    // arabica * 0.5 + robusta * 0.5 = 12*0.5 + 20*0.5 = 16
    expect(getSpeciesCaffeine('blend')).toBe(16);
  });

  it('returns arabica-only for 0% robusta blend', () => {
    expect(getSpeciesCaffeine('blend', 0)).toBe(12);
  });

  it('returns robusta-only for 100% robusta blend', () => {
    expect(getSpeciesCaffeine('blend', 100)).toBe(20);
  });

  it('returns correct weighted value for 30% robusta blend', () => {
    // 12 * 0.70 + 20 * 0.30 = 8.4 + 6.0 = 14.4
    expect(getSpeciesCaffeine('blend', 30)).toBeCloseTo(14.4, 5);
  });

  it('returns 0.3 for decaf', () => {
    expect(getSpeciesCaffeine('decaf')).toBe(0.3);
  });
});

describe('getRoastMultiplier', () => {
  it('returns 1.05 for light roast', () => {
    expect(getRoastMultiplier('light')).toBe(1.05);
  });

  it('returns 1.00 for medium roast', () => {
    expect(getRoastMultiplier('medium')).toBe(1.0);
  });

  it('returns 0.90 for dark roast', () => {
    expect(getRoastMultiplier('dark')).toBe(0.9);
  });

  it('returns 1.00 for undefined (neutral)', () => {
    expect(getRoastMultiplier(undefined)).toBe(1.0);
  });
});

describe('getProcessingMultiplier', () => {
  it('returns 1.00 for washed', () => {
    expect(getProcessingMultiplier('washed')).toBe(1.0);
  });

  it('returns 1.02 for honey', () => {
    expect(getProcessingMultiplier('honey')).toBe(1.02);
  });

  it('returns 1.03 for natural', () => {
    expect(getProcessingMultiplier('natural')).toBe(1.03);
  });

  it('returns 1.00 for undefined (neutral)', () => {
    expect(getProcessingMultiplier(undefined)).toBe(1.0);
  });
});

describe('getAltitudeMultiplier', () => {
  it('returns 1.05 for low altitude', () => {
    expect(getAltitudeMultiplier('low')).toBe(1.05);
  });

  it('returns 1.00 for medium altitude', () => {
    expect(getAltitudeMultiplier('medium')).toBe(1.0);
  });

  it('returns 0.95 for high altitude', () => {
    expect(getAltitudeMultiplier('high')).toBe(0.95);
  });

  it('returns 1.00 for undefined (neutral)', () => {
    expect(getAltitudeMultiplier(undefined)).toBe(1.0);
  });
});

describe('getBrewMethodEfficiency', () => {
  it('returns correct values for all 8 brew methods', () => {
    expect(getBrewMethodEfficiency('espresso')).toBe(0.8);
    expect(getBrewMethodEfficiency('pour-over')).toBe(0.9);
    expect(getBrewMethodEfficiency('french-press')).toBe(0.92);
    expect(getBrewMethodEfficiency('aeropress')).toBe(0.87);
    expect(getBrewMethodEfficiency('moka-pot')).toBe(0.85);
    expect(getBrewMethodEfficiency('cold-brew')).toBe(0.9);
    expect(getBrewMethodEfficiency('turkish')).toBe(0.92);
    expect(getBrewMethodEfficiency('instant')).toBe(1.0);
  });
});

describe('getGrindMultiplier', () => {
  it('returns percolation column for espresso', () => {
    expect(getGrindMultiplier('fine', 'espresso')).toBe(1.0); // col 0
    expect(getGrindMultiplier('extra-fine', 'espresso')).toBe(1.05); // col 0
    expect(getGrindMultiplier('medium', 'espresso')).toBe(0.9); // col 0
  });

  it('returns percolation column for moka-pot', () => {
    expect(getGrindMultiplier('fine', 'moka-pot')).toBe(1.0); // col 0
    expect(getGrindMultiplier('coarse', 'moka-pot')).toBe(0.8); // col 0
  });

  it('returns immersion column for pour-over', () => {
    expect(getGrindMultiplier('fine', 'pour-over')).toBe(1.01); // col 1
    expect(getGrindMultiplier('medium', 'pour-over')).toBe(1.0); // col 1
    expect(getGrindMultiplier('coarse', 'pour-over')).toBe(0.95); // col 1
  });

  it('returns immersion column for french-press', () => {
    expect(getGrindMultiplier('coarse', 'french-press')).toBe(0.95); // col 1
    expect(getGrindMultiplier('extra-coarse', 'french-press')).toBe(0.9); // col 1
  });

  it('returns 1.00 for undefined grind (neutral)', () => {
    expect(getGrindMultiplier(undefined, 'espresso')).toBe(1.0);
    expect(getGrindMultiplier(undefined, 'pour-over')).toBe(1.0);
  });
});

// ---------------------------------------------------------------------------
// Main calculator: research example validations
// ---------------------------------------------------------------------------

describe('calculateCaffeine', () => {
  const TOLERANCE_PCT = 5; // ±5% tolerance

  /**
   * Helper: assert value is within tolerance percentage of expected.
   */
  function expectWithinTolerance(actual: number, expected: number, label: string) {
    const pctDiff = Math.abs((actual - expected) / expected) * 100;
    expect(
      pctDiff,
      `${label}: expected ~${expected}, got ${actual} (${pctDiff.toFixed(1)}% off, tolerance ${TOLERANCE_PCT}%)`,
    ).toBeLessThanOrEqual(TOLERANCE_PCT);
  }

  // --- Example 1: Standard Pour-over ---
  // 18g Arabica, medium roast, medium grind, 93°C, 300mL water, washed
  // C_grounds = 18 × 12 = 216 mg
  // f_roast = 1.00, f_processing = 1.00 → C_adj = 216 mg
  // η_base = 0.90, f_grind = 1.00, f_temp = 1.00 → η = 0.90
  // C_cup = 216 × 0.90 = 194 mg

  it('Example 1: Standard pour-over ~194 mg (±5%)', () => {
    const params: BrewingParameters = {
      brewMethod: 'pour-over',
      coffeeWeightG: 18,
      waterVolumeMl: 300,
      species: 'arabica',
      roastLevel: 'medium',
      grindSize: 'medium',
      waterTemperatureC: 93,
      processingMethod: 'washed',
      altitude: 'medium',
    };

    const result = calculateCaffeine(params);

    expectWithinTolerance(result.totalCaffeineMg, 194, 'totalCaffeineMg');
    expect(result.dailyLimitPercent).toBeCloseTo(48.5, 0); // 194/400*100 ≈ 48.5
    expect(result.equivalentCups).toBeCloseTo(2.0, 1); // 194/95 ≈ 2.04

    // Validate intermediate breakdown values
    expect(result.breakdown.baseCaffeineMg).toBe(216);
    expect(result.breakdown.roastAdjustment).toBe(1.0);
    expect(result.breakdown.processingAdjustment).toBe(1.0);
    expect(result.breakdown.altitudeAdjustment).toBe(1.0);
    expect(result.breakdown.baseEfficiency).toBe(0.9);
    expect(result.breakdown.grindAdjustment).toBe(1.0);
    expect(result.breakdown.temperatureAdjustment).toBe(1.0);
    expect(result.breakdown.finalEfficiency).toBe(0.9);
  });

  // --- Example 2: Double Espresso ---
  // 18g Arabica, dark roast, fine grind, 93°C, 36mL output, washed
  // C_grounds = 18 × 12 = 216 mg
  // f_roast = 0.90 → C_adj = 194.4 mg
  // η_base = 0.80, f_grind = 1.00, f_temp = 1.00 → η = 0.80
  // C_cup = 194.4 × 0.80 = 155.52 mg (research says ~156 mg)

  it('Example 2: Double espresso ~156 mg (±5%)', () => {
    const params: BrewingParameters = {
      brewMethod: 'espresso',
      coffeeWeightG: 18,
      waterVolumeMl: 36,
      species: 'arabica',
      roastLevel: 'dark',
      grindSize: 'fine',
      waterTemperatureC: 93,
      processingMethod: 'washed',
      altitude: 'medium',
    };

    const result = calculateCaffeine(params);

    expectWithinTolerance(result.totalCaffeineMg, 156, 'totalCaffeineMg');

    // Validate intermediate breakdown values
    expect(result.breakdown.baseCaffeineMg).toBe(216);
    expect(result.breakdown.roastAdjustment).toBe(0.9);
    expect(result.breakdown.processingAdjustment).toBe(1.0);
    expect(result.breakdown.altitudeAdjustment).toBe(1.0);
    expect(result.breakdown.baseEfficiency).toBe(0.8);
    expect(result.breakdown.grindAdjustment).toBe(1.0); // fine grind, espresso = col 0
    expect(result.breakdown.temperatureAdjustment).toBe(1.0);
    expect(result.breakdown.finalEfficiency).toBe(0.8);
  });

  // --- Example 3: French Press Robusta ---
  // 30g Robusta, medium roast, coarse grind, 93°C, 500mL water, natural
  // C_grounds = 30 × 20 = 600 mg
  // f_roast = 1.00, f_processing = 1.03 → C_adj = 618 mg
  // η_base = 0.92, f_grind = 0.95, f_temp = 1.00 → η = 0.874
  // C_cup = 618 × 0.874 = 540.132 mg → ~540 mg

  it('Example 3: French Press Robusta ~540 mg (±5%)', () => {
    const params: BrewingParameters = {
      brewMethod: 'french-press',
      coffeeWeightG: 30,
      waterVolumeMl: 500,
      species: 'robusta',
      roastLevel: 'medium',
      grindSize: 'coarse',
      waterTemperatureC: 93,
      processingMethod: 'natural',
      altitude: 'medium',
    };

    const result = calculateCaffeine(params);

    expectWithinTolerance(result.totalCaffeineMg, 540, 'totalCaffeineMg');
    // Exceeds 400mg daily limit
    expect(result.dailyLimitPercent).toBeGreaterThan(100);

    // Validate intermediate breakdown values
    expect(result.breakdown.baseCaffeineMg).toBe(600);
    expect(result.breakdown.roastAdjustment).toBe(1.0);
    expect(result.breakdown.processingAdjustment).toBe(1.03);
    expect(result.breakdown.altitudeAdjustment).toBe(1.0);
    expect(result.breakdown.baseEfficiency).toBe(0.92);
    expect(result.breakdown.grindAdjustment).toBe(0.95); // coarse, immersion = col 1
    expect(result.breakdown.temperatureAdjustment).toBe(1.0);
    // finalEfficiency = 0.92 * 0.95 * 1.0 = 0.874
    expect(result.breakdown.finalEfficiency).toBeCloseTo(0.874, 3);
  });

  // --- Edge Cases ---

  it('Edge case: zero coffee weight → 0 mg', () => {
    const params: BrewingParameters = {
      brewMethod: 'pour-over',
      coffeeWeightG: 0,
      waterVolumeMl: 300,
      species: 'arabica',
    };

    const result = calculateCaffeine(params);

    expect(result.totalCaffeineMg).toBe(0);
    expect(result.dailyLimitPercent).toBe(0);
    expect(result.equivalentCups).toBe(0);
    expect(result.breakdown.baseCaffeineMg).toBe(0);
    expect(result.breakdown.finalEfficiency).toBe(1.0);
  });

  it('Edge case: negative coffee weight → 0 mg', () => {
    const params: BrewingParameters = {
      brewMethod: 'pour-over',
      coffeeWeightG: -5,
      waterVolumeMl: 300,
      species: 'arabica',
    };

    const result = calculateCaffeine(params);

    expect(result.totalCaffeineMg).toBe(0);
  });

  it('Edge case: missing optional params → uses defaults correctly, no NaN', () => {
    const params: BrewingParameters = {
      brewMethod: 'pour-over',
      coffeeWeightG: 18,
      waterVolumeMl: 300,
      species: 'arabica',
      // No roast, grind, temp, processing, altitude
    };

    const result = calculateCaffeine(params);

    // All values should be finite numbers
    expect(Number.isFinite(result.totalCaffeineMg)).toBe(true);
    expect(Number.isFinite(result.dailyLimitPercent)).toBe(true);
    expect(Number.isFinite(result.equivalentCups)).toBe(true);
    expect(Number.isFinite(result.breakdown.baseCaffeineMg)).toBe(true);
    expect(Number.isFinite(result.breakdown.finalEfficiency)).toBe(true);

    // Should produce a valid positive result (all neutrals applied)
    // 18 * 12 * 0.9 = 194.4 (since pour-over η=0.90, all other multipliers = 1.0)
    expect(result.totalCaffeineMg).toBeGreaterThan(0);
    expectWithinTolerance(result.totalCaffeineMg, 194.4, 'totalCaffeineMg - missing params');
  });

  // --- Blend test ---

  it('Robusta blend 50%: caffeine between pure Arabica and pure Robusta', () => {
    const baseParams: Omit<BrewingParameters, 'species' | 'robustaPercent'> = {
      brewMethod: 'pour-over',
      coffeeWeightG: 18,
      waterVolumeMl: 300,
    };

    const arabicaResult = calculateCaffeine({ ...baseParams, species: 'arabica' });
    const blendResult = calculateCaffeine({ ...baseParams, species: 'blend', robustaPercent: 50 });
    const robustaResult = calculateCaffeine({ ...baseParams, species: 'robusta' });

    expect(blendResult.totalCaffeineMg).toBeGreaterThan(arabicaResult.totalCaffeineMg);
    expect(blendResult.totalCaffeineMg).toBeLessThan(robustaResult.totalCaffeineMg);
  });

  // --- Decaf test ---

  it('Decaf species: 18g decaf yields very low caffeine (~5 mg)', () => {
    const params: BrewingParameters = {
      brewMethod: 'pour-over',
      coffeeWeightG: 18,
      waterVolumeMl: 300,
      species: 'decaf',
    };

    const result = calculateCaffeine(params);

    // 18 * 0.3 * 0.9 = 4.86 → Math.round = 5 mg
    expect(result.totalCaffeineMg).toBe(5);
    expect(result.dailyLimitPercent).toBeLessThan(2);
    expect(result.equivalentCups).toBeLessThanOrEqual(0.1);
  });

  // --- All 8 brew methods ---

  it('All 8 brew methods produce results > 0 and < 1000 for 18g Arabica', () => {
    const brewMethods: BrewMethod[] = [
      'espresso',
      'pour-over',
      'french-press',
      'aeropress',
      'moka-pot',
      'cold-brew',
      'turkish',
      'instant',
    ];

    for (const method of brewMethods) {
      const params: BrewingParameters = {
        brewMethod: method,
        coffeeWeightG: 18,
        waterVolumeMl: 300,
        species: 'arabica',
      };

      const result = calculateCaffeine(params);

      expect(
        result.totalCaffeineMg,
        `${method}: expected > 0, got ${result.totalCaffeineMg}`,
      ).toBeGreaterThan(0);

      expect(
        result.totalCaffeineMg,
        `${method}: expected < 1000, got ${result.totalCaffeineMg}`,
      ).toBeLessThan(1000);
    }
  });

  // --- Derived values ---

  it('Daily limit percent = totalCaffeineMg / 400 * 100', () => {
    const params: BrewingParameters = {
      brewMethod: 'instant',
      coffeeWeightG: 18,
      waterVolumeMl: 300,
      species: 'arabica',
    };

    const result = calculateCaffeine(params);

    // Instant has η=1.0, so total = 18 * 12 = 216 mg
    // 216/400*100 = 54.0%
    const expectedPct = (result.totalCaffeineMg / DAILY_SAFE_LIMIT_MG) * 100;
    expect(result.dailyLimitPercent).toBeCloseTo(expectedPct, 1);
  });

  it('Equivalent cups = totalCaffeineMg / 95 (rounded to 1 decimal)', () => {
    const params: BrewingParameters = {
      brewMethod: 'instant',
      coffeeWeightG: 18,
      waterVolumeMl: 300,
      species: 'arabica',
    };

    const result = calculateCaffeine(params);

    // 216 / 95 = 2.273... ≈ 2.3
    expect(result.equivalentCups).toBeCloseTo(2.3, 1);
  });

  // --- Altitude + Processing interaction ---

  it('High altitude + natural processing applies both adjustments', () => {
    const params: BrewingParameters = {
      brewMethod: 'pour-over',
      coffeeWeightG: 18,
      waterVolumeMl: 300,
      species: 'arabica',
      processingMethod: 'natural',
      altitude: 'high',
    };

    const result = calculateCaffeine(params);

    // base = 216, processing = 1.03, altitude = 0.95
    // C_adj = 216 * 1.03 * 0.95 = 211.356
    // η = 0.90 (pour-over base, no grind/temp adjustments)
    // C_cup = 211.356 * 0.90 = 190.22
    expectWithinTolerance(result.totalCaffeineMg, 190.22, 'totalCaffeineMg');

    expect(result.breakdown.processingAdjustment).toBe(1.03);
    expect(result.breakdown.altitudeAdjustment).toBe(0.95);
  });

  // --- Temperature edge cases ---

  it('Medium-low temperature (80-84°C) reduces extraction', () => {
    const params: BrewingParameters = {
      brewMethod: 'pour-over',
      coffeeWeightG: 18,
      waterVolumeMl: 300,
      species: 'arabica',
      waterTemperatureC: 80,
    };

    const result = calculateCaffeine(params);

    expect(result.breakdown.temperatureAdjustment).toBe(0.92);
    expect(result.totalCaffeineMg).toBeLessThan(194);
  });

  it('Boiling temperature (>96°C) slightly increases extraction', () => {
    const params: BrewingParameters = {
      brewMethod: 'pour-over',
      coffeeWeightG: 18,
      waterVolumeMl: 300,
      species: 'arabica',
      waterTemperatureC: 98,
    };

    const result = calculateCaffeine(params);

    expect(result.breakdown.temperatureAdjustment).toBe(1.02);
    expect(result.totalCaffeineMg).toBeGreaterThan(194);
  });
});

// ---------------------------------------------------------------------------
// buildBreakdown function test
// ---------------------------------------------------------------------------

describe('buildBreakdown', () => {
  it('returns a CaffeineBreakdown with all provided values', () => {
    const breakdown = buildBreakdown(216, 1.0, 1.0, 1.0, 0.9, 1.0, 1.0, 0.9);

    expect(breakdown).toEqual({
      baseCaffeineMg: 216,
      roastAdjustment: 1.0,
      processingAdjustment: 1.0,
      altitudeAdjustment: 1.0,
      baseEfficiency: 0.9,
      grindAdjustment: 1.0,
      temperatureAdjustment: 1.0,
      finalEfficiency: 0.9,
    });
  });
});

// ---------------------------------------------------------------------------
// Brand data integrity tests
// ---------------------------------------------------------------------------

describe('brandData integrity', () => {
  it('all entries have required fields', async () => {
    const { default: brandData } = await import('../data/brandData');
    for (const d of brandData) {
      expect(d.brand).toBeTruthy();
      expect(d.name).toBeTruthy();
      expect(d.size).toBeTruthy();
      expect(d.volumeMl).toBeGreaterThan(0);
      expect(d.caffeineMg).toBeGreaterThanOrEqual(0);
      expect(d.source).toBeTruthy();
      expect(d.lastUpdated).toMatch(/^\d{4}-\d{2}$/);
    }
  });

  it('no duplicate brand+name+size combinations', async () => {
    const { default: brandData } = await import('../data/brandData');
    const keys = brandData.map((d) => `${d.brand}|${d.name}|${d.size}`);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);
  });

  it('caffeine density is within plausible range (0.01–6 mg/mL)', async () => {
    const { default: brandData } = await import('../data/brandData');
    for (const d of brandData) {
      const density = d.caffeineMg / d.volumeMl;
      expect(density).toBeGreaterThanOrEqual(0.01);
      expect(density).toBeLessThanOrEqual(6);
    }
  });
});

// ---------------------------------------------------------------------------
// Temperature boundary tests
// ---------------------------------------------------------------------------

describe('temperature boundary values', () => {
  it('handles 70–79°C tier (70°C → 0.88)', () => {
    const result = calculateCaffeine({
      brewMethod: 'pour-over',
      coffeeWeightG: 18,
      waterVolumeMl: 300,
      species: 'arabica',
      waterTemperatureC: 70,
    });
    expect(result.breakdown.temperatureAdjustment).toBe(0.88);
  });

  it('handles maximum temperature (100°C → 1.02) correctly', () => {
    const result = calculateCaffeine({
      brewMethod: 'pour-over',
      coffeeWeightG: 18,
      waterVolumeMl: 300,
      species: 'arabica',
      waterTemperatureC: 100,
    });
    expect(result.breakdown.temperatureAdjustment).toBe(1.02);
  });

  it('handles below-minimum temperature (<70°C → 0.85) gracefully', () => {
    const result = calculateCaffeine({
      brewMethod: 'pour-over',
      coffeeWeightG: 18,
      waterVolumeMl: 300,
      species: 'arabica',
      waterTemperatureC: 69,
    });
    expect(result.breakdown.temperatureAdjustment).toBe(0.85);
    expect(result.totalCaffeineMg).toBeGreaterThan(0);
  });

  it('handles above-maximum temperature (>96°C → 1.02) gracefully', () => {
    const result = calculateCaffeine({
      brewMethod: 'pour-over',
      coffeeWeightG: 18,
      waterVolumeMl: 300,
      species: 'arabica',
      waterTemperatureC: 110,
    });
    expect(result.breakdown.temperatureAdjustment).toBe(1.02);
    expect(result.totalCaffeineMg).toBeGreaterThan(0);
  });
});
