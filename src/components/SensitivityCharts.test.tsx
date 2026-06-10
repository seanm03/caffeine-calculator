import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SensitivityCharts from '@/components/SensitivityCharts';
import { assertA11y } from '@/test/axe';
import type { BrewingParameters } from '@/types';

describe('SensitivityCharts', () => {
  const defaultParams: BrewingParameters = {
    brewMethod: 'pour-over',
    coffeeWeightG: 18,
    waterVolumeMl: 300,
    species: 'arabica',
  };

  it('renders brew method comparison chart heading', () => {
    render(<SensitivityCharts currentParams={defaultParams} />);
    expect(screen.getByText('Caffeine by Brew Method')).toBeInTheDocument();
  });

  it('renders caffeine vs weight heading', () => {
    render(<SensitivityCharts currentParams={defaultParams} />);
    expect(screen.getByText(/how caffeine scales/i)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SensitivityCharts currentParams={defaultParams} />);
    await assertA11y(container);
  });
});
