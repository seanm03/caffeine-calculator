import { render, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeProvider, useTheme } from '@/hooks/useTheme';

describe('useTheme', () => {
  it('applies the saved dark theme preference', () => {
    localStorage.setItem('coffee-calc-theme', 'dark');
    render(
      <ThemeProvider>
        <div>child</div>
      </ThemeProvider>,
    );
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('falls back to auto (light) when the saved theme is invalid', () => {
    localStorage.setItem('coffee-calc-theme', 'neon');
    render(
      <ThemeProvider>
        <div>child</div>
      </ThemeProvider>,
    );
    // matchMedia mock reports matches: false → resolved theme is light
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggles the dark class when the OS preference changes in auto theme', () => {
    const listeners: Record<string, Array<(e: { matches: boolean }) => void>> = {};
    const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: (type: string, cb: (e: { matches: boolean }) => void) => {
        listeners[type] = [...(listeners[type] ?? []), cb];
      },
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    vi.stubGlobal('matchMedia', matchMediaMock);

    try {
      const { unmount } = render(
        <ThemeProvider>
          <div>child</div>
        </ThemeProvider>,
      );

      // Theme defaults to 'auto' — an OS preference change to dark applies dark mode
      act(() => {
        listeners['change']?.forEach((cb) => cb({ matches: true }));
      });
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      // OS preference back to light removes the dark class
      act(() => {
        listeners['change']?.forEach((cb) => cb({ matches: false }));
      });
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      unmount();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('ignores OS preference changes when a manual theme is applied', () => {
    localStorage.setItem('coffee-calc-theme', 'dark');
    const listeners: Record<string, Array<(e: { matches: boolean }) => void>> = {};
    const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: (type: string, cb: (e: { matches: boolean }) => void) => {
        listeners[type] = [...(listeners[type] ?? []), cb];
      },
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    vi.stubGlobal('matchMedia', matchMediaMock);

    try {
      render(
        <ThemeProvider>
          <div>child</div>
        </ThemeProvider>,
      );

      // Manual dark theme — an OS preference change to light must NOT toggle the class
      act(() => {
        listeners['change']?.forEach((cb) => cb({ matches: false }));
      });
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('throws when the hook is used outside its provider', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    let caught: Error | undefined;
    function Probe() {
      try {
        useTheme();
      } catch (e) {
        caught = e as Error;
      }
      return null;
    }
    render(<Probe />);
    expect(caught?.message).toMatch(/ThemeContext must be used within a ThemeContextProvider/i);
    errorSpy.mockRestore();
  });
});
