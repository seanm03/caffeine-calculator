import '@testing-library/jest-dom/vitest';
// vitest-axe/extend-expect augments Vi.Assertion with toHaveNoViolations
import 'vitest-axe/extend-expect';
import React from 'react';
import { afterEach, expect, vi } from 'vitest';

// ── vitest-axe matchers ─────────────────────────────────────────────
// Import toHaveNoViolations from the dist JS directly because the package's
// root matchers.d.ts re-exports types only (export type *).
const { toHaveNoViolations } = await import('vitest-axe/dist/matchers.js');
expect.extend({ toHaveNoViolations });

// ── localStorage cleanup ──────────────────────────────────────────
afterEach(() => {
  localStorage.clear();
});

// ── window.matchMedia mock ─────────────────────────────────────────
// Required by components that check prefers-color-scheme (e.g., ThemeToggle).
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ── Mock scrollIntoView ────────────────────────────────────────────
// jsdom does not implement Element.prototype.scrollIntoView.
Element.prototype.scrollIntoView = vi.fn();

// ── Mock HTMLCanvasElement.getContext ──────────────────────────────
// axe-core internally checks canvas elements for icon-ligature detection
// (color contrast rule). jsdom does not implement getContext.
HTMLCanvasElement.prototype.getContext = vi.fn() as typeof HTMLCanvasElement.prototype.getContext;

// ── Suppress console.error for ErrorBoundary test messages ─────────
// ErrorBoundary tests intentionally trigger render errors; this keeps
// test output clean while still surfacing unexpected errors.
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes('ReactDOM.render')) return;
  if (typeof args[0] === 'string' && args[0].includes('act(...)')) return;
  originalConsoleError.call(console, ...args);
};

// ── Recharts ResponsiveContainer mock ──────────────────────────────
// jsdom has no layout engine, so the real ResponsiveContainer's
// ResizeObserver-based sizing never fires. Delegate to the real component
// with fixed numeric dimensions instead of a plain div: the real component
// then supplies width/height through Recharts' context, so chart axes render
// their ticks and axis tickFormatters become coverable in tests.
// Uses React.createElement instead of JSX because this file is .ts (not .tsx).
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>();
  return {
    ...actual,
    ResponsiveContainer: (props: React.ComponentProps<typeof actual.ResponsiveContainer>) =>
      React.createElement(actual.ResponsiveContainer, { ...props, width: 500, height: 300 }),
  };
});
