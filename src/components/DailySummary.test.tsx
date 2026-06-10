import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DailySummary from '@/components/DailySummary';
import { assertA11y } from '@/test/axe';
import type { DailyCaffeineSummary } from '@/types';

describe('DailySummary', () => {
  const mockSummary: DailyCaffeineSummary = {
    currentLevel: 150,
    totalToday: 300,
    peakLevel: 200,
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
      currentLevel: 0,
      totalToday: 0,
      peakLevel: 0,
      peakTime: null,
      entryCount: 0,
    };
    render(<DailySummary summary={zeroSummary} />);
    expect(screen.getByText('Current Level')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(3);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<DailySummary summary={mockSummary} />);
    await assertA11y(container);
  });

  it('has no accessibility violations with zero values', async () => {
    const zeroSummary: DailyCaffeineSummary = {
      currentLevel: 0,
      totalToday: 0,
      peakLevel: 0,
      peakTime: null,
      entryCount: 0,
    };
    const { container } = render(<DailySummary summary={zeroSummary} />);
    await assertA11y(container);
  });
});
