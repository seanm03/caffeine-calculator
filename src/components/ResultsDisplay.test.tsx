import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResultsDisplay from '@/components/ResultsDisplay';
import { CaffeineLogProvider } from '@/hooks/useCaffeineLog';
import { UnitProvider } from '@/hooks/useUnits';
import { assertA11y } from '@/test/axe';
import { CaffeineMg, WeightG, VolumeMl } from '@/types/branded';
import type { CaffeineResult } from '@/types';

const mockResult: CaffeineResult = {
  totalCaffeineMg: CaffeineMg(180),
  dailyLimitPercent: 45,
  equivalentCups: 1.9,
  breakdown: {
    baseCaffeineMg: CaffeineMg(216),
    roastAdjustment: 1.0,
    processingAdjustment: 1.0,
    altitudeAdjustment: 1.0,
    baseEfficiency: 0.9,
    grindAdjustment: 1.0,
    temperatureAdjustment: 1.0,
    finalEfficiency: 0.9,
  },
};

function renderDisplay(result: CaffeineResult | null = mockResult) {
  return render(
    <UnitProvider>
      <CaffeineLogProvider>
        <ResultsDisplay result={result} coffeeWeightG={WeightG(18)} waterVolumeMl={VolumeMl(300)} brewMethod="pour-over" />
      </CaffeineLogProvider>
    </UnitProvider>,
  );
}

describe('ResultsDisplay', () => {
  it('renders caffeine amount in mg', () => {
    renderDisplay();
    expect(screen.getByText('180')).toBeInTheDocument();
    expect(screen.getByText('mg')).toBeInTheDocument();
  });

  it('shows equivalent cups', () => {
    renderDisplay();
    expect(screen.getByText(/1.9 standard cups/)).toBeInTheDocument();
  });

  it('renders the SVG gauge', () => {
    renderDisplay();
    // The gauge is hidden from accessibility but present
    const gauge = document.querySelector('svg[aria-hidden="true"]');
    expect(gauge).toBeInTheDocument();
  });

  it('shows empty state when result is null', () => {
    renderDisplay(null);
    expect(screen.getByText(/enter parameters to calculate/i)).toBeInTheDocument();
  });

  it('shows the "Log This Drink" button', () => {
    renderDisplay();
    expect(screen.getByRole('button', { name: /log this drink/i })).toBeInTheDocument();
  });

  it('renders zero caffeine correctly', () => {
    const zeroResult: CaffeineResult = {
      totalCaffeineMg: CaffeineMg(0),
      dailyLimitPercent: 0,
      equivalentCups: 0,
      breakdown: {
        baseCaffeineMg: CaffeineMg(0),
        roastAdjustment: 1.0,
        processingAdjustment: 1.0,
        altitudeAdjustment: 1.0,
        baseEfficiency: 0.9,
        grindAdjustment: 1.0,
        temperatureAdjustment: 1.0,
        finalEfficiency: 0.9,
      },
    };
    renderDisplay(zeroResult);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('has no accessibility violations with results', async () => {
    const { container } = renderDisplay();
    await assertA11y(container);
  });

  it('has no accessibility violations in empty state', async () => {
    const { container } = renderDisplay(null);
    await assertA11y(container);
  });

  // ── Exceeds-limit state ─────────────────────────────────────────
  it('shows an alert when caffeine exceeds the daily limit', () => {
    const overLimit: CaffeineResult = {
      ...mockResult,
      totalCaffeineMg: CaffeineMg(450),
      dailyLimitPercent: 112,
    };
    renderDisplay(overLimit);
    expect(screen.getByRole('alert')).toHaveTextContent(/exceeds the recommended daily limit/i);
  });

  it('does not show the limit alert when within the daily limit', () => {
    renderDisplay();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // ── Zone color thresholds (zoneColor) ───────────────────────────
  it.each([
    [45, 'text-green-600'],
    [70, 'text-yellow-600'],
    [95, 'text-orange-600'],
    [125, 'text-red-600'],
  ])('colors the caffeine total %i%% in the %s zone', (pct, cls) => {
    const result: CaffeineResult = { ...mockResult, dailyLimitPercent: pct };
    const { container } = renderDisplay(result);
    const total = container.querySelector('span.font-extrabold');
    expect(total).toHaveClass(cls);
  });

  // ── Equivalent cups text states ─────────────────────────────────
  it('shows "Less than 0.1 standard cups" for tiny amounts', () => {
    const result: CaffeineResult = { ...mockResult, equivalentCups: 0.05 };
    renderDisplay(result);
    expect(screen.getByText(/less than 0.1 standard cups/i)).toBeInTheDocument();
  });

  it('uses singular "cup" when equivalentCups equals one', () => {
    const result: CaffeineResult = { ...mockResult, equivalentCups: 1 };
    renderDisplay(result);
    expect(screen.getByText(/1\.0 standard cup(?!s)/)).toBeInTheDocument();
  });

  // ── Imperial unit display ───────────────────────────────────────
  it('shows imperial equivalents when the unit system is imperial', () => {
    localStorage.setItem('coffee-calc-units', 'imperial');
    renderDisplay();
    expect(screen.getByText(/oz coffee/)).toBeInTheDocument();
    expect(screen.getByText(/fl oz water/)).toBeInTheDocument();
  });

  it('omits imperial equivalents in the metric unit system', () => {
    localStorage.setItem('coffee-calc-units', 'metric');
    renderDisplay();
    expect(screen.queryByText(/oz coffee/)).not.toBeInTheDocument();
  });

  // ── Log This Drink interaction + feedback ───────────────────────
  it('shows "Logged!" feedback after clicking Log This Drink', () => {
    renderDisplay();
    fireEvent.click(screen.getByRole('button', { name: /log this drink/i }));
    expect(screen.getByText('Logged!')).toBeInTheDocument();
  });

  it('clears the "Logged!" feedback after the 2s timer', () => {
    vi.useFakeTimers();
    try {
      renderDisplay();
      fireEvent.click(screen.getByRole('button', { name: /log this drink/i }));
      expect(screen.getByText('Logged!')).toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(screen.queryByText('Logged!')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  // ── Number-change animation effect ──────────────────────────────
  it('re-renders with an updated caffeine total', () => {
    const { rerender } = renderDisplay();
    expect(screen.getByText('180')).toBeInTheDocument();

    const updated: CaffeineResult = {
      ...mockResult,
      totalCaffeineMg: CaffeineMg(240),
      dailyLimitPercent: 60,
    };
    rerender(
      <UnitProvider>
        <CaffeineLogProvider>
          <ResultsDisplay
            result={updated}
            coffeeWeightG={WeightG(18)}
            waterVolumeMl={VolumeMl(300)}
            brewMethod="pour-over"
          />
        </CaffeineLogProvider>
      </UnitProvider>,
    );
    expect(screen.getByText('240')).toBeInTheDocument();
  });
});
