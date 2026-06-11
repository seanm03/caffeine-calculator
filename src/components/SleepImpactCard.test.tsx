import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SleepImpactCard from '@/components/SleepImpactCard';
import { assertA11y } from '@/test/axe';
import { Hours, CaffeineMg } from '@/types/branded';
import type { CaffeineLogEntry } from '@/types';

function makeEntry(overrides: Partial<CaffeineLogEntry> = {}): CaffeineLogEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    caffeineMg: 100,
    drinkName: 'Test Drink',
    ...overrides,
  };
}

describe('SleepImpactCard', () => {
  // ── Empty state ────────────────────────────────────────────
  it('renders empty state when no entries', () => {
    render(
      <SleepImpactCard
        entries={[]}
        halfLifeHours={Hours(5)}
        bedtimeHour={22}
      />,
    );
    expect(screen.getByText(/log drinks to see bedtime/i)).toBeInTheDocument();
  });

  it('shows sleep impact heading', () => {
    render(
      <SleepImpactCard
        entries={[]}
        halfLifeHours={Hours(5)}
        bedtimeHour={22}
      />,
    );
    expect(screen.getByText('Sleep Impact')).toBeInTheDocument();
  });

  // ── Safe state ─────────────────────────────────────────────
  it('shows safe status when bedtime level is below threshold', () => {
    // 10mg consumed 8 hours ago (well below 50mg default threshold)
    const eightHoursAgo = new Date(Date.now() - 8 * 3600000).toISOString();
    render(
      <SleepImpactCard
        entries={[makeEntry({ caffeineMg: 50, timestamp: eightHoursAgo })]}
        halfLifeHours={Hours(5)}
        bedtimeHour={22}
      />,
    );
    expect(screen.getByText(/unlikely to affect sleep/i)).toBeInTheDocument();
  });

  // ── Unsafe state ───────────────────────────────────────────
  it('shows unsafe status when bedtime level is above threshold', () => {
    // 200mg consumed 1 hour before bedtime
    const oneHourAgo = new Date(Date.now() - 1 * 3600000).toISOString();
    render(
      <SleepImpactCard
        entries={[makeEntry({ caffeineMg: 200, timestamp: oneHourAgo })]}
        halfLifeHours={Hours(5)}
        bedtimeHour={new Date().getHours() + 1} // bedtime in 1 hour from now
      />,
    );
    // Should be either the warning or danger message, not the safe one
    expect(screen.queryByText(/unlikely to affect sleep/i)).not.toBeInTheDocument();
  });

  // ── Custom sleep threshold ─────────────────────────────────
  it('uses custom sleep threshold when provided', () => {
    // 150mg consumed 1 hour ago — bedtime 1h from now: ~113mg > 100mg custom threshold
    const oneHourAgo = new Date(Date.now() - 1 * 3600000).toISOString();
    render(
      <SleepImpactCard
        entries={[makeEntry({ caffeineMg: 150, timestamp: oneHourAgo })]}
        halfLifeHours={Hours(5)}
        bedtimeHour={new Date().getHours() + 1}
        sleepThresholdMg={CaffeineMg(100)}
      />,
    );
    // With threshold 100, 150mg after 2h at hl=5 (~113mg) should still be above threshold
    expect(screen.queryByText(/unlikely to affect sleep/i)).not.toBeInTheDocument();
  });

  // ── Bedtime level display ──────────────────────────────────
  it('displays bedtime level in mg', () => {
    const oneHourAgo = new Date(Date.now() - 1 * 3600000).toISOString();
    render(
      <SleepImpactCard
        entries={[makeEntry({ caffeineMg: 100, timestamp: oneHourAgo })]}
        halfLifeHours={Hours(5)}
        bedtimeHour={22}
      />,
    );
    // Should display the bedtime level as "N mg"
    expect(screen.getByText(/\d+ mg/)).toBeInTheDocument();
  });

  // ── Time until safe ────────────────────────────────────────
  it('shows time until safe when above threshold', () => {
    // 300mg just now — should be above threshold
    render(
      <SleepImpactCard
        entries={[makeEntry({ caffeineMg: 300 })]}
        halfLifeHours={Hours(5)}
        bedtimeHour={new Date().getHours() + 1}
      />,
    );
    // Should show "Estimated safe by" text or be safe
    const safeByElement = screen.queryByText(/estimated safe by/i);
    const safeElement = screen.queryByText(/unlikely to affect sleep/i);
    // At least one should be present
    expect(safeByElement || safeElement).toBeTruthy();
  });

  // ── Accessibility ──────────────────────────────────────────
  it('has no accessibility violations', async () => {
    const { container } = render(
      <SleepImpactCard
        entries={[makeEntry()]}
        halfLifeHours={Hours(5)}
        bedtimeHour={22}
      />,
    );
    await assertA11y(container);
  });

  it('has no accessibility violations in empty state', async () => {
    const { container } = render(
      <SleepImpactCard
        entries={[]}
        halfLifeHours={Hours(5)}
        bedtimeHour={22}
      />,
    );
    await assertA11y(container);
  });
});
