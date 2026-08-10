import { describe, it, expect } from 'vitest';
import {
  CaffeineMg,
  unwrapMg,
  Hours,
  unwrapHours,
  WeightG,
  unwrapWeightG,
  VolumeMl,
  unwrapVolumeMl,
  TemperatureC,
  unwrapTemperatureC,
  BrandName,
  DrinkName,
  Source,
  ServingSize,
} from '@/types/branded';

describe('branded types', () => {
  it('wraps and unwraps CaffeineMg', () => {
    expect(unwrapMg(CaffeineMg(120))).toBe(120);
  });

  it('wraps and unwraps Hours', () => {
    expect(unwrapHours(Hours(5))).toBe(5);
  });

  it('wraps and unwraps WeightG', () => {
    expect(unwrapWeightG(WeightG(18))).toBe(18);
  });

  it('wraps and unwraps VolumeMl', () => {
    expect(unwrapVolumeMl(VolumeMl(300))).toBe(300);
  });

  it('wraps and unwraps TemperatureC', () => {
    expect(unwrapTemperatureC(TemperatureC(93))).toBe(93);
  });

  it('constructs string branded types without altering values', () => {
    expect(BrandName('Starbucks')).toBe('Starbucks');
    expect(DrinkName('Pike Place Roast')).toBe('Pike Place Roast');
    expect(Source('Brand published nutrition')).toBe('Brand published nutrition');
    expect(ServingSize('Grande')).toBe('Grande');
  });
});
