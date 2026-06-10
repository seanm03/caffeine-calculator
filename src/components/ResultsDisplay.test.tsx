import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ResultsDisplay from '@/components/ResultsDisplay';
import { CaffeineLogProvider } from '@/hooks/useCaffeineLog';
import { UnitProvider } from '@/hooks/useUnits';
import { assertA11y } from '@/test/axe';
import type { CaffeineResult } from '@/types';

const mockResult: CaffeineResult = {
  totalCaffeineMg: 180,
  dailyLimitPercent: 45,
  equivalentCups: 1.9,
  breakdown: {
    baseCaffeineMg: 216,
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
        <ResultsDisplay result={result} coffeeWeightG={18} waterVolumeMl={300} brewMethod="pour-over" />
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
      totalCaffeineMg: 0,
      dailyLimitPercent: 0,
      equivalentCups: 0,
      breakdown: {
        baseCaffeineMg: 0,
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
});
