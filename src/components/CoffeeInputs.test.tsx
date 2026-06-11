import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CoffeeInputs from '@/components/CoffeeInputs';
import { UnitProvider } from '@/hooks/useUnits';
import { assertA11y } from '@/test/axe';
import { WeightG, VolumeMl } from '@/types/branded';

function renderInputs() {
  return render(
    <UnitProvider>
      <CoffeeInputs
        coffeeWeightG={WeightG(18)}
        onCoffeeWeightChange={() => {}}
        waterVolumeMl={VolumeMl(300)}
        onWaterVolumeChange={() => {}}
        species="arabica"
        onSpeciesChange={() => {}}
        isDecaf={false}
        onIsDecafChange={() => {}}
      />
    </UnitProvider>,
  );
}

describe('CoffeeInputs', () => {
  it('renders coffee weight input', () => {
    renderInputs();
    expect(screen.getByLabelText(/coffee weight/i)).toBeInTheDocument();
  });

  it('renders water volume input', () => {
    renderInputs();
    expect(screen.getByLabelText(/water volume/i)).toBeInTheDocument();
  });

  it('renders species selector', () => {
    renderInputs();
    expect(screen.getByText('Arabica')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderInputs();
    await assertA11y(container);
  });
});
