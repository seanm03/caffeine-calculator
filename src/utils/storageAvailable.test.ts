import { describe, it, expect, vi, beforeEach } from 'vitest';
import { storageAvailable } from '@/utils/storageAvailable';

describe('storageAvailable', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns available=true when localStorage is functional', () => {
    const result = storageAvailable();
    expect(result.available).toBe(true);
    expect(result.quotaExceeded).toBe(false);
  });

  it('returns available=false when localStorage.setItem throws', () => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => {
      throw new DOMException('QuotaExceededError', 'QuotaExceededError');
    });

    const result = storageAvailable();
    expect(result.available).toBe(false);

    Storage.prototype.setItem = originalSetItem;
  });

  it('detects QuotaExceededError when quota is reached', () => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => {
      throw new DOMException('QuotaExceededError', 'QuotaExceededError');
    });

    const result = storageAvailable();
    expect(result.quotaExceeded).toBe(false); // localStorage.length is 0 in jsdom

    Storage.prototype.setItem = originalSetItem;
  });

  it('detects Firefox NS_ERROR_DOM_QUOTA_REACHED', () => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => {
      const err = new DOMException(
        'NS_ERROR_DOM_QUOTA_REACHED',
        'NS_ERROR_DOM_QUOTA_REACHED',
      );
      throw err;
    });

    const result = storageAvailable();
    expect(result.available).toBe(false);
    expect(result.quotaExceeded).toBe(false); // localStorage.length is 0 in jsdom

    Storage.prototype.setItem = originalSetItem;
  });

  it('returns available=false for non-quota errors', () => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => {
      throw new Error('Some other error');
    });

    const result = storageAvailable();
    expect(result.available).toBe(false);
    expect(result.quotaExceeded).toBe(false);

    Storage.prototype.setItem = originalSetItem;
  });
});
