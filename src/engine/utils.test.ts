import { describe, it, expect } from 'vitest';
import {
  isValidNumber,
  isValidDate,
  isValidArray,
  isNonEmptyString,
  clampNumber,
} from '@/engine/utils';

describe('engine utils validation helpers', () => {
  it('isValidNumber accepts finite numbers only', () => {
    expect(isValidNumber(5)).toBe(true);
    expect(isValidNumber(0)).toBe(true);
    expect(isValidNumber(NaN)).toBe(false);
    expect(isValidNumber(Infinity)).toBe(false);
    expect(isValidNumber('5')).toBe(false);
    expect(isValidNumber(null)).toBe(false);
  });

  it('isValidDate accepts valid Date objects only', () => {
    expect(isValidDate(new Date())).toBe(true);
    expect(isValidDate(new Date('not-a-date'))).toBe(false);
    expect(isValidDate('2026-01-01')).toBe(false);
    expect(isValidDate(null)).toBe(false);
  });

  it('isValidArray accepts arrays only', () => {
    expect(isValidArray([])).toBe(true);
    expect(isValidArray([1, 2])).toBe(true);
    expect(isValidArray({ length: 0 })).toBe(false);
    expect(isValidArray(null)).toBe(false);
  });

  it('isNonEmptyString accepts non-whitespace strings and rejects empty/whitespace', () => {
    expect(isNonEmptyString('coffee')).toBe(true);
    expect(isNonEmptyString('')).toBe(false);
    expect(isNonEmptyString('   ')).toBe(false);
    expect(isNonEmptyString(5)).toBe(false);
  });

  it('clampNumber clamps to range and falls back on invalid input', () => {
    expect(clampNumber(5, 0, 10, 0)).toBe(5);
    expect(clampNumber(-5, 0, 10, 0)).toBe(0);
    expect(clampNumber(15, 0, 10, 0)).toBe(10);
    expect(clampNumber(NaN, 0, 10, 7)).toBe(7);
    expect(clampNumber('abc', 0, 10, 7)).toBe(7);
  });
});
