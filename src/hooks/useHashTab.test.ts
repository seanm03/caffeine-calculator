/**
 * Tests for the useHashTab hook.
 *
 * Validates hash-based tab routing: initial tab from hash, tab switching via
 * hashchange events, setActiveTab updates the URL hash, and cleanup behavior.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useHashTab, TABS } from '@/hooks/useHashTab';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Set window.location.hash without triggering a hashchange event. */
function setHashSilently(hash: string) {
  // Overwrite the hash directly without dispatching an event
  window.location.hash = hash;
}

/** Dispatch a real hashchange event (jsdom supports HashChangeEvent). */
function dispatchHashChange() {
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('useHashTab', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  afterEach(() => {
    window.location.hash = '';
  });

  // -----------------------------------------------------------------------
  // Initial state
  // -----------------------------------------------------------------------

  it('defaults to "calculator" tab when no hash is present', () => {
    const { result } = renderHook(() => useHashTab());
    expect(result.current.activeTab).toBe('calculator');
  });

  it('reads the active tab from the URL hash on init', () => {
    setHashSilently('brands');
    const { result } = renderHook(() => useHashTab());
    expect(result.current.activeTab).toBe('brands');
  });

  it('defaults to "calculator" for an invalid hash value', () => {
    setHashSilently('nonexistent-tab');
    const { result } = renderHook(() => useHashTab());
    expect(result.current.activeTab).toBe('calculator');
  });

  it('defaults to "calculator" for an empty hash', () => {
    setHashSilently('');
    const { result } = renderHook(() => useHashTab());
    expect(result.current.activeTab).toBe('calculator');
  });

  // -----------------------------------------------------------------------
  // TABS export
  // -----------------------------------------------------------------------

  it('exports all 4 tabs with correct structure', () => {
    expect(TABS).toHaveLength(4);
    expect(TABS.map((t) => t.key)).toEqual([
      'calculator',
      'brands',
      'methodology',
      'tracker',
    ]);
    TABS.forEach((t) => {
      expect(t).toHaveProperty('key');
      expect(t).toHaveProperty('label');
      expect(t).toHaveProperty('emoji');
      expect(typeof t.key).toBe('string');
      expect(typeof t.label).toBe('string');
      expect(typeof t.emoji).toBe('string');
    });
  });

  // -----------------------------------------------------------------------
  // setActiveTab
  // -----------------------------------------------------------------------

  it('setActiveTab updates the URL hash', () => {
    const { result } = renderHook(() => useHashTab());
    act(() => {
      result.current.setActiveTab('methodology');
    });
    expect(window.location.hash).toBe('#methodology');
  });

  it('setActiveTab triggers a hashchange that updates the active tab state', async () => {
    const { result } = renderHook(() => useHashTab());
    expect(result.current.activeTab).toBe('calculator');

    act(() => {
      result.current.setActiveTab('tracker');
    });

    // setActiveTab sets window.location.hash, which fires hashchange;
    // the listener updates state asynchronously inside act
    await waitFor(() => {
      expect(result.current.activeTab).toBe('tracker');
    });
  });

  // -----------------------------------------------------------------------
  // hashchange events
  // -----------------------------------------------------------------------

  it('responds to hashchange events', async () => {
    const { result } = renderHook(() => useHashTab());
    expect(result.current.activeTab).toBe('calculator');

    act(() => {
      setHashSilently('brands');
      dispatchHashChange();
    });

    await waitFor(() => {
      expect(result.current.activeTab).toBe('brands');
    });
  });

  it('falls back to default on hashchange with invalid hash', async () => {
    setHashSilently('calculator');
    const { result } = renderHook(() => useHashTab());

    act(() => {
      setHashSilently('bogus-tab');
      dispatchHashChange();
    });

    await waitFor(() => {
      expect(result.current.activeTab).toBe('calculator');
    });
  });

  // -----------------------------------------------------------------------
  // Cleanup
  // -----------------------------------------------------------------------

  it('removes the hashchange listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useHashTab());

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('hashchange', expect.any(Function));
    removeSpy.mockRestore();
  });

  // -----------------------------------------------------------------------
  // Returned values
  // -----------------------------------------------------------------------

  it('returns the TABS array from the hook', () => {
    const { result } = renderHook(() => useHashTab());
    expect(result.current.tabs).toBe(TABS);
  });

  it('setActiveTab is referentially stable across renders', () => {
    const { result, rerender } = renderHook(() => useHashTab());
    const first = result.current.setActiveTab;
    rerender();
    expect(result.current.setActiveTab).toBe(first);
  });
});
