import { render, screen } from '@testing-library/react';
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

  it('has no accessibility violations', async () => {
    const { container } = renderCalculator();
    await assertA11y(container);
  });
});
