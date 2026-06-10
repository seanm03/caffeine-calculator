/**
 * errorReporting — Lightweight front-end error reporting service.
 *
 * Sends error events to a configurable beacon endpoint in the background
 * using `navigator.sendBeacon`. Degrades gracefully when the API is
 * unavailable (cross-origin, restricted context, etc.).
 *
 * ## Usage
 *
 * ```typescript
 * import { reportError } from '@/utils/errorReporting';
 *
 * reportError(error, { component: 'MyComponent', context: 'render-phase' });
 * ```
 *
 * ## Configuration
 *
 * Set `import.meta.env.VITE_ERROR_REPORTING_ENDPOINT` to a POST endpoint
 * that accepts a JSON body with the shape `ErrorReportPayload`.
 * The feature is disabled by default — no data is transmitted unless an
 * endpoint URL is configured.
 *
 * ## Why sendBeacon?
 *
 * - Non-blocking — does not delay the main thread during crash recovery
 * - Reliable on page unload (unlike `fetch` / `XMLHttpRequest`)
 * - Minimal payload — only what ErrorBoundary captures
 */

const ENDPOINT = import.meta.env.VITE_ERROR_REPORTING_ENDPOINT as string | undefined;
const ENABLED = typeof ENDPOINT === 'string' && ENDPOINT.length > 0;

// ── Types ───────────────────────────────────────────────────────────────────

export interface ErrorReportPayload {
  /** Error message */
  message: string;
  /** Error name (e.g., TypeError, ReferenceError) */
  name: string;
  /** Stack trace, if available */
  stack?: string;
  /** Component stack from React ErrorInfo, if available */
  componentStack?: string;
  /** URL of the page where the error occurred */
  url: string;
  /** User-agent string */
  userAgent: string;
  /** Timestamp in ISO 8601 format */
  timestamp: string;
  /** Optional extra context */
  extra?: Record<string, unknown>;
}

// ── Report function ─────────────────────────────────────────────────────────

/**
 * Report an error to the configured monitoring endpoint.
 *
 * In development, the payload is logged to the console instead of sent.
 * In production, it is dispatched via `navigator.sendBeacon` (or `fetch`
 * as a fallback for older browsers).
 */
export function reportError(
  error: Error,
  extra?: Record<string, unknown>,
): void {
  if (!ENABLED) {
    // Silent no-op when no endpoint is configured
    return;
  }

  const payload: ErrorReportPayload = {
    message: error.message,
    name: error.name,
    stack: error.stack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    extra,
  };

  try {
    const blob = new Blob([JSON.stringify(payload)], {
      type: 'application/json',
    });

    if (typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(ENDPOINT, blob);
    } else {
      // Fallback for environments without sendBeacon
      fetch(ENDPOINT, {
        method: 'POST',
        body: blob,
        keepalive: true,
      }).catch(() => {
        // Swallow — reporting should never throw
      });
    }
  } catch {
    // Swallow — reporting must not interfere with error recovery
  }
}

/**
 * Report an error with a component stack trace from React's ErrorInfo.
 * Convenience wrapper for use inside componentDidCatch.
 */
export function reportErrorWithComponentStack(
  error: Error,
  componentStack?: string,
  extra?: Record<string, unknown>,
): void {
  reportError(error, {
    ...extra,
    ...(componentStack ? { componentStack } : {}),
  });
}
