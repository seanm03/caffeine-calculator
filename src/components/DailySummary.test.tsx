import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DailySummary from '@/components/DailySummary';
import { assertA11y } from '@/test/axe';
import { CaffeineMg } from '@/types/branded';
import type { DailyCaffeineSummary } from '@/types';

describe('DailySummary', () => {
  const mockSummary: DailyCaffeineSummary = {
    currentLevel: CaffeineMg(150),
    totalToday: CaffeineMg(300),
    peakLevel: CaffeineMg(200),
    peakTime: new Date(),
    entryCount: 3,
  };

  it('renders current level', () => {
    render(<DailySummary summary={mockSummary} />);
    expect(screen.getByText('Current Level')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('renders total consumed', () => {
    render(<DailySummary summary={mockSummary} />);
    expect(screen.getByText('Total Today')).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument();
  });

  it('handles zero values gracefully', () => {
    const zeroSummary: DailyCaffeineSummary = {
      currentLevel: CaffeineMg(0),
      totalToday: CaffeineMg(0),
      peakLevel: CaffeineMg(0),
      peakTime: null,
      entryCount: 0,
    };
    render(<DailySummary summary={zeroSummary} />);
    expect(screen.getByText('Current Level')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(3);
  });

  // ── Zone coloring (zoneBg / zoneText branches) ─────────────────
  it.each([
    [75, 'bg-yellow-50'],
    [95, 'bg-orange-50'],
    [125, 'bg-red-50'],
  ])('colors the summary %i%% into the %s zone', (pct, cls) => {
    const summary: DailyCaffeineSummary = {
      ...mockSummary,
      currentLevel: CaffeineMg((pct / 100) * 400),
    };
    const { container } = render(<DailySummary summary={summary} />);
    const card = container.querySelector('.rounded-lg.border.p-3');
    expect(card).toHaveClass(cls);
  });

  it('renders a placeholder peak time when peakTime is null', () => {
    const summary: DailyCaffeineSummary = { ...mockSummary, peakTime: null };
    render(<DailySummary summary={summary} />);
    expect(screen.getByText(/mg at —/)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<DailySummary summary={mockSummary} />);
    await assertA11y(container);
  });

  it('has no accessibility violations with zero values', async () => {
    const zeroSummary: DailyCaffeineSummary = {
      currentLevel: CaffeineMg(0),
      totalToday: CaffeineMg(0),
      peakLevel: CaffeineMg(0),
      peakTime: null,
      entryCount: 0,
    };
    const { container } = render(<DailySummary summary={zeroSummary} />);
    await assertA11y(container);
  });
});
