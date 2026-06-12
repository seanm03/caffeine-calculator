/* eslint-disable import/order -- vi.hoisted must precede imports to intercept env resolution */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.hoisted(() => {
  vi.stubEnv('VITE_ERROR_REPORTING_ENDPOINT', 'https://errors.example.com/report');
});

import { reportError } from '@/utils/errorReporting';

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockSendBeacon = vi.fn();
const mockFetch = vi.fn();

// Mock Blob class — jsdom doesn't implement Blob.text()
class MockBlob {
  private _text: string;
  constructor(parts: BlobPart[]) {
    this._text = parts[0] as string;
  }
  text(): Promise<string> {
    return Promise.resolve(this._text);
  }
}

beforeEach(() => {
  vi.stubGlobal('Blob', MockBlob);

  vi.stubGlobal('navigator', {
    sendBeacon: mockSendBeacon,
    userAgent: 'test-agent',
  });

  vi.stubGlobal('fetch', mockFetch);

  vi.stubGlobal('window', {
    location: { href: 'https://example.com/test-page' },
  });

  mockSendBeacon.mockReturnValue(true);
  mockFetch.mockResolvedValue({ ok: true });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

// ── Helpers ────────────────────────────────────────────────────────────────

/** Parse the Blob that was passed to sendBeacon or fetch. */
async function parseBeaconBlob(callArgs: unknown[]): Promise<Record<string, unknown>> {
  const blob = callArgs[1] as MockBlob;
  const text = await blob.text();
  return JSON.parse(text);
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('reportError', () => {
  it('sends error via sendBeacon when endpoint is configured', () => {
    const error = new Error('Test failure');
    reportError(error);

    expect(mockSendBeacon).toHaveBeenCalledOnce();
    expect(mockSendBeacon).toHaveBeenCalledWith(
      'https://errors.example.com/report',
      expect.any(Blob),
    );
  });

  it('constructs correct payload with error details', async () => {
    const error = new TypeError('Something went wrong');
    error.stack = 'TypeError: Something went wrong\n    at foo (bar.ts:10:5)';

    reportError(error, { component: 'TestComponent' });

    const payload = await parseBeaconBlob(mockSendBeacon.mock.calls[0]);
    expect(payload.message).toBe('Something went wrong');
    expect(payload.name).toBe('TypeError');
    expect(payload.stack).toBe('TypeError: Something went wrong\n    at foo (bar.ts:10:5)');
    expect(payload.url).toBe('https://example.com/test-page');
    expect(payload.userAgent).toBe('test-agent');
    expect(payload.timestamp).toBeDefined();
    expect(payload.extra).toEqual({ component: 'TestComponent' });
  });

  it('includes extra context when provided', async () => {
    const error = new Error('Contextual error');

    reportError(error, { userId: 42, source: 'calculator' });

    const payload = await parseBeaconBlob(mockSendBeacon.mock.calls[0]);
    expect(payload.extra).toEqual({ userId: 42, source: 'calculator' });
  });

  it('works without extra context', async () => {
    const error = new Error('No context');

    reportError(error);

    const payload = await parseBeaconBlob(mockSendBeacon.mock.calls[0]);
    expect(payload.extra).toBeUndefined();
  });

  it('falls back to fetch when sendBeacon is not available', () => {
    vi.stubGlobal('navigator', {
      sendBeacon: undefined,
      userAgent: 'old-browser',
    });

    const error = new Error('Old browser error');
    reportError(error);

    expect(mockFetch).toHaveBeenCalledOnce();
    expect(mockFetch).toHaveBeenCalledWith(
      'https://errors.example.com/report',
      expect.objectContaining({
        method: 'POST',
        keepalive: true,
      }),
    );
  });

  it('swallows errors when sendBeacon throws', () => {
    mockSendBeacon.mockImplementation(() => {
      throw new Error('Beacon failed');
    });

    const error = new Error('Should not propagate');

    // Must not throw
    expect(() => reportError(error)).not.toThrow();
  });

  it('swallows errors when fetch throws', () => {
    vi.stubGlobal('navigator', {
      sendBeacon: undefined,
      userAgent: 'broken-browser',
    });
    mockFetch.mockRejectedValue(new Error('Network failure'));

    const error = new Error('Fetch failure');

    // Must not throw — the catch block silently swallows the rejected promise
    expect(() => reportError(error)).not.toThrow();
  });
});
