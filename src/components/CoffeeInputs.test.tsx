import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CoffeeInputs from '@/components/CoffeeInputs';
import { UnitProvider } from '@/hooks/useUnits';
import { assertA11y } from '@/test/axe';
import { WeightG, VolumeMl } from '@/types/branded';

function renderInputs(overrides: Record<string, unknown> = {}) {
  const props = {
    coffeeWeightG: WeightG(18),
    onCoffeeWeightChange: vi.fn(),
    waterVolumeMl: VolumeMl(300),
    onWaterVolumeChange: vi.fn(),
    species: 'arabica' as const,
    onSpeciesChange: vi.fn(),
    isDecaf: false,
    onIsDecafChange: vi.fn(),
    robustaPercent: 50,
    onRobustaPercentChange: vi.fn(),
    ...overrides,
  };
  return {
    ...render(
      <UnitProvider>
        <CoffeeInputs {...props} />
      </UnitProvider>,
    ),
    props,
  };
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

  // ── Interaction coverage ──────────────────────────────────
  it('calls onCoffeeWeightChange when weight input changes', () => {
    const { props } = renderInputs();
    const input = screen.getByLabelText(/coffee weight/i);
    fireEvent.change(input, { target: { value: '20' } });
    expect(props.onCoffeeWeightChange).toHaveBeenCalled();
  });

  it('calls onWaterVolumeChange when volume input changes', () => {
    const { props } = renderInputs();
    const input = screen.getByLabelText(/water volume/i);
    fireEvent.change(input, { target: { value: '250' } });
    expect(props.onWaterVolumeChange).toHaveBeenCalled();
  });

  it('calls onIsDecafChange when decaf checkbox toggled', () => {
    const { props } = renderInputs();
    const checkbox = screen.getByLabelText(/decaf/i);
    fireEvent.click(checkbox);
    expect(props.onIsDecafChange).toHaveBeenCalledWith(true);
  });

  it('shows robusta slider when blend species selected', () => {
    renderInputs({ species: 'blend' });
    expect(screen.getByLabelText(/robusta in blend/i)).toBeInTheDocument();
  });

  it('calls onRobustaPercentChange when robusta slider changes', () => {
    const { props } = renderInputs({ species: 'blend' });
    const slider = screen.getByLabelText(/robusta in blend/i);
    fireEvent.change(slider, { target: { value: '75' } });
    expect(props.onRobustaPercentChange).toHaveBeenCalled();
  });

  it('displays water-to-coffee ratio', () => {
    renderInputs();
    expect(screen.getByText(/water-to-coffee ratio/i)).toBeInTheDocument();
  });
});
