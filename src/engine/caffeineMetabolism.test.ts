/**
 * Tests for the caffeine metabolism engine.
 *
 * Validates the one-compartment pharmacokinetic model against expected
 * decay behavior, superposition, edge cases, and curve generation.
 */

import { describe, it, expect } from 'vitest';
import {
  computeBloodLevel,
  generateBloodLevelCurve,
  computeDailySummary,
  timeUntilBelow,
} from './caffeineMetabolism';
import type { CaffeineLogEntry } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEntry(
  id: string,
  timestamp: Date,
  caffeineMg: number,
): CaffeineLogEntry {
  return {
    id,
    timestamp: timestamp.toISOString(),
    caffeineMg,
  };
}

function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 3600000);
}

function hoursFromNow(h: number): Date {
  return new Date(Date.now() + h * 3600000);
}

// ---------------------------------------------------------------------------
// computeBloodLevel tests
// ---------------------------------------------------------------------------

describe('computeBloodLevel', () => {
  it('returns 0 for empty doses array', () => {
    const now = new Date();
    expect(computeBloodLevel([], now)).toBe(0);
  });

  it('returns full dose at time of consumption (t=0)', () => {
    const now = new Date();
    const doses = [makeEntry('1', now, 100)];
    const level = computeBloodLevel(doses, now);
    expect(level).toBeCloseTo(100, 0);
  });

  it('returns ~50mg after one half-life (5h default)', () => {
    const doseTime = hoursAgo(5);
    const doses = [makeEntry('1', doseTime, 100)];
    const level = computeBloodLevel(doses, new Date());
    // After exactly one half-life, factor = 2^(-5/5) = 0.5
    // So 100 * 0.5 = 50
    expect(level).toBeCloseTo(50, 0);
  });

  it('returns ~25mg after two half-lives (10h default)', () => {
    const doseTime = hoursAgo(10);
    const doses = [makeEntry('1', doseTime, 100)];
    const level = computeBloodLevel(doses, new Date());
    // After two half-lives, factor = 2^(-10/5) = 0.25
    expect(level).toBeCloseTo(25, 0);
  });

  it('handles custom half-life (2 hours)', () => {
    const doseTime = hoursAgo(2);
    const doses = [makeEntry('1', doseTime, 100)];
    const level = computeBloodLevel(doses, new Date(), 2);
    // After exactly one half-life with halfLife=2h: factor = 2^(-2/2) = 0.5
    expect(level).toBeCloseTo(50, 0);
  });

  it('handles custom half-life (10 hours)', () => {
    const doseTime = hoursAgo(5);
    const doses = [makeEntry('1', doseTime, 100)];
    const level = computeBloodLevel(doses, new Date(), 10);
    // After 5h with 10h half-life: factor = 2^(-5/10) = 2^-0.5 ≈ 0.707
    expect(level).toBeCloseTo(70.71, 0);
  });

  it('clamps half-life to min 2h', () => {
    const doseTime = hoursAgo(2);
    const doses = [makeEntry('1', doseTime, 100)];
    const level = computeBloodLevel(doses, new Date(), 0.5); // below min
    expect(level).toBeCloseTo(50, 0); // clamped to 2h, 2^(-2/2)=0.5
  });

  it('clamps half-life to max 12h', () => {
    const doseTime = hoursAgo(6);
    const doses = [makeEntry('1', doseTime, 100)];
    const level = computeBloodLevel(doses, new Date(), 24); // above max
    // clamped to 12h: factor = 2^(-6/12) = 2^-0.5 ≈ 0.707
    expect(level).toBeCloseTo(70.71, 0);
  });

  it('handles superposition of multiple doses', () => {
    // Two 100mg doses: one at t=-4h, one at t=-1h, default 5h half-life
    const dose1 = makeEntry('1', hoursAgo(4), 100);
    const dose2 = makeEntry('2', hoursAgo(1), 100);
    const level = computeBloodLevel([dose1, dose2], new Date());
    // dose1: 100 * 2^(-4/5) ≈ 100 * 0.5743 ≈ 57.43
    // dose2: 100 * 2^(-1/5) ≈ 100 * 0.8706 ≈ 87.06
    // total ≈ 144.49
    expect(level).toBeCloseTo(144.49, 0);
  });

  it('skips future doses', () => {
    const pastDose = makeEntry('1', hoursAgo(2), 100);
    const futureDose = makeEntry('2', hoursFromNow(2), 200);
    const level = computeBloodLevel([pastDose, futureDose], new Date());
    // Only the past dose should count: 100 * 2^(-2/5) ≈ 75.79
    expect(level).toBeCloseTo(75.79, 0);
  });

  it('handles three doses with different amounts', () => {
    const d1 = makeEntry('1', hoursAgo(6), 80);
    const d2 = makeEntry('2', hoursAgo(3), 120);
    const d3 = makeEntry('3', hoursAgo(0.5), 60);
    const level = computeBloodLevel([d1, d2, d3], new Date());
    // d1: 80 * 2^(-6/5) ≈ 80 * 0.4353 ≈ 34.82
    // d2: 120 * 2^(-3/5) ≈ 120 * 0.6598 ≈ 79.17
    // d3: 60 * 2^(-0.5/5) ≈ 60 * 0.9330 ≈ 55.98
    // total ≈ 169.97
    expect(level).toBeCloseTo(169.97, 0);
  });
});

// ---------------------------------------------------------------------------
// generateBloodLevelCurve tests
// ---------------------------------------------------------------------------

describe('generateBloodLevelCurve', () => {
  it('returns points for empty doses (zero-level curve)', () => {
    const curve = generateBloodLevelCurve([]);
    expect(curve.length).toBeGreaterThan(0);
    expect(curve.every((p) => p.caffeineMg === 0)).toBe(true);
  });

  it('returns correct number of sampling points for 24h window', () => {
    const dose = makeEntry('1', hoursAgo(2), 100);
    const curve = generateBloodLevelCurve([dose]);
    // 24h / 0.25h interval + 1 = 97 points (plus the start point)
    expect(curve.length).toBeGreaterThanOrEqual(96);
    expect(curve.length).toBeLessThanOrEqual(100);
  });

  it('first point is at the earliest dose time', () => {
    const dose = makeEntry('1', hoursAgo(2), 100);
    const curve = generateBloodLevelCurve([dose]);
    expect(curve[0].hoursSinceStart).toBe(0);
  });

  it('curve values decay monotonically for a single dose', () => {
    const dose = makeEntry('1', hoursAgo(2), 100);
    const curve = generateBloodLevelCurve([dose]);

    // Find the peak (should be at the dose time, since it's only one dose)
    const peakIdx = curve.findIndex(
      (p) => Math.abs(p.hoursSinceStart - 2) < 0.01,
    );
    expect(peakIdx).toBeGreaterThanOrEqual(0);

    // After the dose, values should be non-increasing
    if (peakIdx >= 0) {
      let prev = curve[peakIdx].caffeineMg;
      for (let i = peakIdx + 1; i < curve.length; i++) {
        expect(curve[i].caffeineMg).toBeLessThanOrEqual(prev + 0.01);
        prev = curve[i].caffeineMg;
      }
    }
  });

  it('respects custom half-life in curve generation', () => {
    const dose = makeEntry('1', hoursAgo(3), 100);
    const curveFast = generateBloodLevelCurve([dose], 3); // fast metabolism
    const curveSlow = generateBloodLevelCurve([dose], 10); // slow metabolism

    // Find a point ~6h after the dose for both curves
    const idx = curveFast.findIndex(
      (p) => Math.abs(p.hoursSinceStart - (3 + 6)) < 0.1,
    );
    const idx2 = curveSlow.findIndex(
      (p) => Math.abs(p.hoursSinceStart - (3 + 6)) < 0.1,
    );

    if (idx >= 0 && idx2 >= 0) {
      // Fast metabolism should have lower level than slow metabolism at same elapsed time
      expect(curveFast[idx].caffeineMg).toBeLessThan(curveSlow[idx2].caffeineMg);
    }
  });
});

// ---------------------------------------------------------------------------
// computeDailySummary tests
// ---------------------------------------------------------------------------

describe('computeDailySummary', () => {
  it('returns zero totals for empty entries', () => {
    const summary = computeDailySummary([]);
    expect(summary.currentLevel).toBe(0);
    expect(summary.totalToday).toBe(0);
    expect(summary.peakLevel).toBe(0);
    expect(summary.peakTime).toBeNull();
  });

  it('computes totalToday as sum of all entry amounts', () => {
    const entries = [
      makeEntry('1', hoursAgo(3), 100),
      makeEntry('2', hoursAgo(1), 200),
      makeEntry('3', hoursAgo(0.5), 50),
    ];
    const summary = computeDailySummary(entries);
    expect(summary.totalToday).toBe(350);
  });

  it('computes currentLevel via computeBloodLevel', () => {
    const dose = makeEntry('1', hoursAgo(5), 100);
    const summary = computeDailySummary([dose]);
    // After 5h with 5h half-life: 100 * 0.5 = 50
    expect(summary.currentLevel).toBeCloseTo(50, 0);
  });
});

// ---------------------------------------------------------------------------
// timeUntilBelow tests
// ---------------------------------------------------------------------------

describe('timeUntilBelow', () => {
  it('returns null for empty entries', () => {
    expect(timeUntilBelow([])).toBeNull();
  });

  it('returns null when already below threshold', () => {
    const dose = makeEntry('1', hoursAgo(20), 10);
    expect(timeUntilBelow([dose])).toBeNull();
  });

  it('returns a future date when above threshold', () => {
    const dose = makeEntry('1', hoursAgo(1), 400);
    const result = timeUntilBelow([dose]);
    expect(result).not.toBeNull();
    expect(result!.getTime()).toBeGreaterThan(Date.now());
  });

  it('respects custom threshold', () => {
    const dose = makeEntry('1', hoursAgo(1), 100);
    // Currently ~87mg, should drop below 50mg eventually
    const below50 = timeUntilBelow([dose], 5, 50);
    expect(below50).not.toBeNull();
    // Should already be below 200mg
    const below200 = timeUntilBelow([dose], 5, 200);
    expect(below200).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Edge Case & Input Validation Tests
// ---------------------------------------------------------------------------

describe('computeBloodLevel — edge cases', () => {
  it('handles NaN halfLife by falling back to default', () => {
    const dose = makeEntry('1', hoursAgo(5), 100);
    const level = computeBloodLevel([dose], new Date(), NaN);
    // Should clamp to default 5h: 100 * 2^(-5/5) = 50
    expect(level).toBeCloseTo(50, 0);
  });

  it('handles Infinity halfLife by falling back to default', () => {
    const dose = makeEntry('1', hoursAgo(5), 100);
    const level = computeBloodLevel([dose], new Date(), Infinity);
    // Should clamp to default 5h
    expect(level).toBeCloseTo(50, 0);
  });

  it('handles negative halfLife by falling back to default', () => {
    const dose = makeEntry('1', hoursAgo(5), 100);
    const level = computeBloodLevel([dose], new Date(), -1);
    // Should clamp to default 5h
    expect(level).toBeCloseTo(50, 0);
  });

  it('handles zero halfLife by falling back to default', () => {
    const dose = makeEntry('1', hoursAgo(5), 100);
    const level = computeBloodLevel([dose], new Date(), 0);
    // Should clamp to default 5h
    expect(level).toBeCloseTo(50, 0);
  });

  it('handles NaN dose amount by skipping the entry', () => {
    const entry: CaffeineLogEntry = {
      id: '1',
      timestamp: hoursAgo(5).toISOString(),
      caffeineMg: NaN,
    };
    const level = computeBloodLevel([entry], new Date());
    expect(level).toBe(0);
  });

  it('handles negative dose amount by skipping the entry', () => {
    const entry = makeEntry('1', hoursAgo(5), -100);
    const level = computeBloodLevel([entry], new Date());
    expect(level).toBe(0);
  });

  it('handles Infinity dose amount by skipping the entry', () => {
    const entry: CaffeineLogEntry = {
      id: '1',
      timestamp: hoursAgo(5).toISOString(),
      caffeineMg: Infinity,
    };
    const level = computeBloodLevel([entry], new Date());
    expect(level).toBe(0);
  });

  it('handles invalid timestamp by skipping the entry', () => {
    const entry: CaffeineLogEntry = {
      id: '1',
      timestamp: 'not-a-date',
      caffeineMg: 100,
    };
    const level = computeBloodLevel([entry], new Date());
    expect(level).toBe(0);
  });

  it('handles nullish entry by skipping gracefully', () => {
    const level = computeBloodLevel([null as unknown as CaffeineLogEntry], new Date());
    expect(level).toBe(0);
  });

  it('handles invalid targetTime by returning 0', () => {
    const dose = makeEntry('1', hoursAgo(2), 100);
    const level = computeBloodLevel([dose], new Date('invalid'));
    expect(level).toBe(0);
  });

  it('handles null doses by returning 0', () => {
    const level = computeBloodLevel(null as unknown as readonly CaffeineLogEntry[], new Date());
    expect(level).toBe(0);
  });

  it('handles concurrent doses (same timestamp)', () => {
    const now = new Date();
    const dose1 = makeEntry('1', now, 100);
    const dose2 = makeEntry('2', now, 150);
    const level = computeBloodLevel([dose1, dose2], now);
    // Both at t=0, full amounts: 100 + 150 = 250
    expect(level).toBeCloseTo(250, 0);
  });

  it('handles extreme dose (2000mg)', () => {
    const dose = makeEntry('1', hoursAgo(0), 2000);
    const level = computeBloodLevel([dose], new Date());
    expect(level).toBeCloseTo(2000, 0);
  });

  it('returns effectively zero after many half-lives (24h tail)', () => {
    const dose = makeEntry('1', hoursAgo(24), 400);
    const level = computeBloodLevel([dose], new Date());
    // After 24h with 5h half-life: 400 * 2^(-24/5) = 400 * 2^-4.8 ≈ 400 * 0.036 ≈ 14.3 mg
    // This represents ~3.6% remaining — should be low but not exactly zero
    expect(level).toBeLessThan(15);
    expect(level).toBeGreaterThan(13);
  });

  it('returns ~0 after 120h (5 days) due to elapsed-time guard', () => {
    const dose = makeEntry('1', hoursAgo(120), 400);
    const level = computeBloodLevel([dose], new Date());
    // At or beyond 120h threshold — level should be negligible (< 0.001 mg)
    expect(level).toBeLessThan(0.001);
  });
});

describe('generateBloodLevelCurve — edge cases', () => {
  it('handles null doses by returning empty curve', () => {
    const curve = generateBloodLevelCurve(null as unknown as readonly CaffeineLogEntry[]);
    expect(curve.length).toBeGreaterThan(0);
    expect(curve.every((p) => p.caffeineMg === 0)).toBe(true);
  });

  it('handles NaN halfLife by clamping to default', () => {
    const dose = makeEntry('1', hoursAgo(2), 100);
    const curve = generateBloodLevelCurve([dose], NaN);
    expect(curve.length).toBeGreaterThan(0);
    // Should still have meaningful values
    expect(curve.some((p) => p.caffeineMg > 0)).toBe(true);
  });

  it('handles negative windowHours by using default', () => {
    const dose = makeEntry('1', hoursAgo(2), 100);
    const curve = generateBloodLevelCurve([dose], 5, -1);
    // Should still return a curve of default length
    expect(curve.length).toBeGreaterThan(0);
  });

  it('handles NaN windowHours by using default', () => {
    const dose = makeEntry('1', hoursAgo(2), 100);
    const curve = generateBloodLevelCurve([dose], 5, NaN);
    expect(curve.length).toBeGreaterThan(0);
  });

  it('caps windowHours at 168 (1 week)', () => {
    const dose = makeEntry('1', hoursAgo(2), 100);
    const curve = generateBloodLevelCurve([dose], 5, 336); // 2 weeks
    // Should be capped to 168h: 168 / 0.25 + 1 ≈ 673 points
    expect(curve.length).toBeLessThanOrEqual(700);
  });

  it('handles single entry with very large dose', () => {
    const dose = makeEntry('1', hoursAgo(0), 2000);
    const curve = generateBloodLevelCurve([dose]);
    expect(curve.length).toBeGreaterThan(0);
    // First point (at dose time) should be 2000
    expect(curve[0].caffeineMg).toBeCloseTo(2000, 0);
  });

  it('handles entries with invalid timestamps gracefully', () => {
    const valid = makeEntry('1', hoursAgo(2), 100);
    const invalid: CaffeineLogEntry = {
      id: '2',
      timestamp: 'bad-date',
      caffeineMg: 200,
    };
    const curve = generateBloodLevelCurve([valid, invalid]);
    expect(curve.length).toBeGreaterThan(0);
    // Curve should still generate based on valid entries
    expect(curve[0].caffeineMg).toBeGreaterThan(0);
  });
});

describe('computeDailySummary — edge cases', () => {
  it('handles null entries by returning zero summary', () => {
    const summary = computeDailySummary(null as unknown as readonly CaffeineLogEntry[]);
    expect(summary.currentLevel).toBe(0);
    expect(summary.totalToday).toBe(0);
    expect(summary.peakLevel).toBe(0);
    expect(summary.peakTime).toBeNull();
  });

  it('handles NaN halfLife', () => {
    const dose = makeEntry('1', hoursAgo(5), 100);
    const summary = computeDailySummary([dose], NaN);
    expect(summary.currentLevel).toBeCloseTo(50, 0);
  });

  it('handles invalid now date by defaulting to new Date()', () => {
    const dose = makeEntry('1', hoursAgo(5), 100);
    const summary = computeDailySummary([dose], 5, new Date('invalid'));
    expect(summary.totalToday).toBe(100);
  });

  it('skips entries with NaN caffeineMg in totalToday', () => {
    const valid = makeEntry('1', hoursAgo(3), 100);
    const invalid: CaffeineLogEntry = {
      id: '2',
      timestamp: hoursAgo(1).toISOString(),
      caffeineMg: NaN,
    };
    const summary = computeDailySummary([valid, invalid]);
    expect(summary.totalToday).toBe(100);
  });

  it('handles concurrent doses for peak detection', () => {
    const now = new Date();
    const dose1 = makeEntry('1', now, 100);
    const dose2 = makeEntry('2', now, 200);
    const summary = computeDailySummary([dose1, dose2], 5, now);
    expect(summary.totalToday).toBe(300);
    expect(summary.peakLevel).toBeGreaterThanOrEqual(300);
  });
});

describe('timeUntilBelow — edge cases', () => {
  it('handles null entries by returning null', () => {
    expect(timeUntilBelow(null as unknown as readonly CaffeineLogEntry[])).toBeNull();
  });

  it('handles NaN threshold by returning null', () => {
    const dose = makeEntry('1', hoursAgo(1), 100);
    expect(timeUntilBelow([dose], 5, NaN)).toBeNull();
  });

  it('handles negative threshold by returning null', () => {
    const dose = makeEntry('1', hoursAgo(1), 100);
    expect(timeUntilBelow([dose], 5, -1)).toBeNull();
  });

  it('handles invalid now date by returning null', () => {
    const dose = makeEntry('1', hoursAgo(1), 100);
    expect(timeUntilBelow([dose], 5, 50, new Date('invalid'))).toBeNull();
  });

  it('handles extreme dose for timeUntilBelow projection', () => {
    const dose = makeEntry('1', hoursAgo(0), 2000);
    const result = timeUntilBelow([dose], 5, 50);
    expect(result).not.toBeNull();
    // Should take multiple half-lives to drop from 2000 to 50
    // 2000 * 2^(-t/5) = 50 → 2^(-t/5) = 0.025 → -t/5 = log2(0.025) → t ≈ 28.3h
    expect(result!.getTime()).toBeGreaterThan(Date.now() + 24 * 3600000);
  });
});
