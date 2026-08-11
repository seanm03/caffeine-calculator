---
description: "Deterministic wall-clock testing conventions using the @/test/time helper for the caffeine-calculator codebase"
applyTo: "**/*.test.{ts,tsx}"
---

# Deterministic Time Testing Conventions

Tests that depend on the wall clock are time-of-day flaky: an entry offset by one hour can cross a calendar-day boundary (the `isToday` flake), and "bedtime 1 hour from now" yields hour 24 near midnight. This codebase centralizes wall-clock control in `src/test/time.ts` so behavior is identical on any machine at any time of day.

## The @/test/time Helper

| Export | Purpose |
|--------|---------|
| `REFERENCE_NOW` | Fixed local midday reference (2026-01-15 12:00) shared by every helper |
| `mockNow()` | Freezes `new Date()` and `Date.now()` at `REFERENCE_NOW` via `vi.useFakeTimers()` + `vi.setSystemTime()` |
| `restoreNow()` | Restores the real clock via `vi.useRealTimers()`; pair with `mockNow()` in `afterEach` |
| `isoHoursAgo(h)` | ISO timestamp `h` hours before `REFERENCE_NOW` |
| `isoMinutesAgo(m)` | ISO timestamp `m` minutes before `REFERENCE_NOW` |
| `isoMinutesFromNow(m)` | ISO timestamp `m` minutes after `REFERENCE_NOW` |

## When to Use

Use these helpers in any test whose behavior depends on the current time, including:

* Components that compute values relative to `new Date()` (for example, SleepImpactCard bedtime projection, BloodLevelChart curve window)
* Engine functions that default `now` to `new Date()` (for example, `computeBloodLevel`, `computeDailySummary`, `timeUntilBelow`)
* Calendar-day "today" filtering (for example, `useCaffeineLog.todayEntries`)

Do NOT use these helpers for tests that fake timers to advance `setTimeout` (for example, "Logged!" feedback dismissal). Those tests use `vi.useFakeTimers()` directly and restore with `vi.useRealTimers()`.

## Pattern

Freeze the clock at the start of each time-sensitive test and restore it in `afterEach`:

```typescript
import { afterEach } from 'vitest';
import { isoHoursAgo, mockNow, restoreNow } from '@/test/time';

afterEach(() => {
  restoreNow();
});

it('...', () => {
  mockNow();
  const entry = makeEntry({ timestamp: isoHoursAgo(1) });
  // assertions using new Date() now resolve at REFERENCE_NOW
});
```

## Caveats

* `mockNow()` freezes `new Date()` and `Date.now()`, but explicit dates such as `new Date('2026-08-10T20:00:00')` still parse normally.
* Prefer `isoHoursAgo` / `isoMinutesAgo` over `Date.now() - n` so entry timestamps are reference-derived, not wall-clock-derived.
* Scope `mockNow()` to individual tests — do not enable fake timers for axe accessibility tests (potential axe/fake-timer interaction).
* Always restore with `restoreNow()` in `afterEach` to avoid leaking fake timers into later tests.

## Current Usage

The pattern is applied in `caffeineMetabolism.test.ts`, `SleepImpactCard.test.tsx`, `BloodLevelChart.test.tsx`, `useCaffeineLog.test.tsx`, and `DrinkLogTimeline.test.tsx`. Follow these files as reference when writing new time-dependent tests.
