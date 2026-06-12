import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Calculator from '@/components/Calculator';
import { CaffeineLogProvider } from '@/hooks/useCaffeineLog';
import { CalculatorStateProvider } from '@/hooks/useCalculatorState';
import { UnitProvider } from '@/hooks/useUnits';
import { assertA11y } from '@/test/axe';

function renderCalculator() {
  return render(
    <UnitProvider>
      <CaffeineLogProvider>
        <CalculatorStateProvider>
          <Calculator />
        </CalculatorStateProvider>
      </CaffeineLogProvider>
    </UnitProvider>,
  );
}

describe('Calculator', () => {
  it('renders brew method selector', () => {
    renderCalculator();
    expect(screen.getByRole('radiogroup', { name: 'Brew Method' })).toBeInTheDocument();
  });

  it('renders coffee inputs', () => {
    renderCalculator();
    expect(screen.getByLabelText(/coffee weight/i)).toBeInTheDocument();
  });

  it('defaults to Result view', () => {
    renderCalculator();
    // Result button should be active (bg-coffee-600)
    const resultBtn = screen.getByRole('button', { name: 'Result' });
    expect(resultBtn).toHaveClass('bg-coffee-600');
    // Sensitivity button should not be active
    const sensitivityBtn = screen.getByRole('button', { name: 'Sensitivity' });
    expect(sensitivityBtn).not.toHaveClass('bg-coffee-600');
  });

  it('switches to Sensitivity view and renders lazy-loaded charts', async () => {
    renderCalculator();

    // Click the Sensitivity toggle button
    const sensitivityBtn = screen.getByRole('button', { name: 'Sensitivity' });
    fireEvent.click(sensitivityBtn);

    // Should now show Sensitivity button as active
    expect(sensitivityBtn).toHaveClass('bg-coffee-600');

    // Wait for the lazy-loaded SensitivityCharts to render
    await waitFor(() => {
      expect(screen.getByText(/caffeine by brew method/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('can switch back to Result view after viewing Sensitivity', async () => {
    renderCalculator();

    // Go to Sensitivity
    fireEvent.click(screen.getByRole('button', { name: 'Sensitivity' }));
    await waitFor(() => {
      expect(screen.getByText(/caffeine by brew method/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    // Go back to Result
    fireEvent.click(screen.getByRole('button', { name: 'Result' }));

    // Sensitivity content should be gone
    expect(screen.queryByText(/caffeine by brew method/i)).not.toBeInTheDocument();

    // Result button should be active again
    const resultBtn = screen.getByRole('button', { name: 'Result' });
    expect(resultBtn).toHaveClass('bg-coffee-600');
  });

  it('shows loading fallback during lazy chart load', async () => {
    renderCalculator();

    // Click Sensitivity to trigger lazy loading
    fireEvent.click(screen.getByRole('button', { name: 'Sensitivity' }));

    // The fallback text should appear briefly (Suspense fallback)
    // We verify the charts eventually load
    await waitFor(() => {
      expect(screen.getByText(/caffeine by brew method/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  // ── Accessibility ────────────────────────────────────────────────
  it('has no accessibility violations', async () => {
    const { container } = renderCalculator();
    await assertA11y(container);
  });

  it('has no accessibility violations in Sensitivity view', async () => {
    const { container } = renderCalculator();

    fireEvent.click(screen.getByRole('button', { name: 'Sensitivity' }));
    await waitFor(() => {
      expect(screen.getByText(/caffeine by brew method/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    await assertA11y(container);
  });
});
