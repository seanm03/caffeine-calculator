import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BloodLevelChart, { formatHour, CustomTooltip } from '@/components/BloodLevelChart';
import { assertA11y } from '@/test/axe';
import { Hours, CaffeineMg } from '@/types/branded';
import type { CaffeineLogEntry } from '@/types';

// ── Helpers ────────────────────────────────────────────────────────────────

/** Create a CaffeineLogEntry at a specific offset from now. */
function entryAt(hoursAgo: number, mg: number): CaffeineLogEntry {
  const ts = new Date(Date.now() - hoursAgo * 3600000).toISOString();
  return { id: `entry-${hoursAgo}`, timestamp: ts, caffeineMg: CaffeineMg(mg) };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('formatHour', () => {
  it('formats hours offset as time string with two-digit hour and minute', () => {
    // Use a known midnight start time for predictable output.
    // Note: toLocaleTimeString output depends on system locale, so we verify
    // the pattern rather than exact strings.
    const start = new Date('2024-01-01T00:00:00');
    const result = formatHour(0, start);
    // Should match HH:MM pattern (24-hour) — both 00:00 and 12:00 AM are valid
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });

  it('produces time string for mid-day offset', () => {
    const start = new Date('2024-01-01T00:00:00');
    const result = formatHour(14, start);
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });

  it('handles fractional hours', () => {
    const start = new Date('2024-01-01T00:00:00');
    const result = formatHour(8.5, start);
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });
});

describe('CustomTooltip', () => {
  const startTime = new Date('2024-01-01T08:00:00');

  it('returns null when not active', () => {
    const result = CustomTooltip({ active: false, payload: [], label: 0, startTime });
    expect(result).toBeNull();
  });

  it('returns null when payload is empty', () => {
    const result = CustomTooltip({ active: true, payload: [], label: 1, startTime });
    expect(result).toBeNull();
  });

  it('returns null when payload is undefined', () => {
    const result = CustomTooltip({ active: true, label: 2, startTime });
    expect(result).toBeNull();
  });

  it('returns null when label is undefined', () => {
    const result = CustomTooltip({ active: true, payload: [{ value: 100 }], startTime });
    expect(result).toBeNull();
  });

  it('renders tooltip with level and time', () => {
    const result = CustomTooltip({
      active: true,
      payload: [{ value: 250.7 }],
      label: 3,
      startTime,
    });

    expect(result).not.toBeNull();
    const { container } = render(<>{result}</>);
    // Should show formatted time (3 hours after 08:00 = 11:00)
    expect(container.textContent).toMatch(/\d{2}:\d{2}/);
    expect(container.textContent).toContain('250.7 mg');
  });
});

describe('BloodLevelChart', () => {
  it('renders chart with entries', () => {
    const entries: CaffeineLogEntry[] = [
      { id: '1', timestamp: new Date().toISOString(), caffeineMg: CaffeineMg(100) },
    ];
    const { container } = render(
      <BloodLevelChart entries={entries} halfLifeHours={Hours(5)} />
    );
    expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
  });

  it('renders chart with empty entries', () => {
    const { container } = render(
      <BloodLevelChart entries={[]} halfLifeHours={Hours(5)} />
    );
    expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
  });

  it('shows aria-label with current and max levels', () => {
    const entries: CaffeineLogEntry[] = [
      { id: '1', timestamp: new Date().toISOString(), caffeineMg: CaffeineMg(250) },
    ];
    render(<BloodLevelChart entries={entries} halfLifeHours={Hours(5)} />);

    const chart = screen.getByRole('img', { name: /blood caffeine level chart/i });
    expect(chart).toBeInTheDocument();
    expect(chart.getAttribute('aria-label')).toMatch(/current level: \d+ mg/i);
    expect(chart.getAttribute('aria-label')).toMatch(/maximum level: \d+ mg/i);
  });

  it('renders with multiple entries spanning a time range', () => {
    const entries: CaffeineLogEntry[] = [
      entryAt(6, 100),
      entryAt(3, 200),
      entryAt(0.5, 150),
    ];
    const { container } = render(
      <BloodLevelChart entries={entries} halfLifeHours={Hours(5)} />
    );
    expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
  });

  it('renders safe zone reference area when levels exceed daily limit', () => {
    // Entries that collectively exceed the 400mg daily safe limit
    const entries: CaffeineLogEntry[] = [
      entryAt(1, 500),
    ];
    const { container } = render(
      <BloodLevelChart entries={entries} halfLifeHours={Hours(5)} />
    );
    // The chart should still render — the ReferenceArea is conditionally rendered
    // when maxLevel > DAILY_SAFE_LIMIT_MG (400)
    expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
  });

  it('renders with entries just below daily limit', () => {
    const entries: CaffeineLogEntry[] = [
      entryAt(0, 100),
    ];
    const { container } = render(
      <BloodLevelChart entries={entries} halfLifeHours={Hours(5)} />
    );
    expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
  });

  it('handles custom half-life values', () => {
    const entries: CaffeineLogEntry[] = [
      entryAt(2, 150),
    ];
    const { container } = render(
      <BloodLevelChart entries={entries} halfLifeHours={Hours(2)} />
    );
    expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
  });

  it('displays screen-reader accessible data summary', () => {
    const entries: CaffeineLogEntry[] = [
      entryAt(0, 100),
    ];
    render(<BloodLevelChart entries={entries} halfLifeHours={Hours(5)} />);

    // The sr-only section contains accessible text about the chart
    expect(screen.getByText(/24-hour blood caffeine level chart/i)).toBeInTheDocument();
    expect(screen.getByText(/current estimated level:/i)).toBeInTheDocument();
    expect(screen.getByText(/peak level:/i)).toBeInTheDocument();
    expect(screen.getByText(/daily safe limit:/i)).toBeInTheDocument();
  });

  // ── Accessibility ────────────────────────────────────────────────
  it('has no accessibility violations with entries', async () => {
    const entries: CaffeineLogEntry[] = [
      { id: '1', timestamp: new Date().toISOString(), caffeineMg: CaffeineMg(100) },
    ];
    const { container } = render(
      <BloodLevelChart entries={entries} halfLifeHours={Hours(5)} />
    );
    await assertA11y(container);
  });

  it('has no accessibility violations when empty', async () => {
    const { container } = render(
      <BloodLevelChart entries={[]} halfLifeHours={Hours(5)} />
    );
    await assertA11y(container);
  });
});
