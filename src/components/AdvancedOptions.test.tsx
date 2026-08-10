import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdvancedOptions, { type AdvancedOptionsProps } from '@/components/AdvancedOptions';
import { UnitProvider } from '@/hooks/useUnits';
import { assertA11y } from '@/test/axe';
import { TemperatureC } from '@/types/branded';

function renderOptions(overrides: Partial<AdvancedOptionsProps> = {}) {
  const props: AdvancedOptionsProps = {
    brewMethod: 'pour-over',
    roastLevel: 'medium',
    onRoastLevelChange: vi.fn(),
    grindSize: 'medium',
    onGrindSizeChange: vi.fn(),
    waterTemperatureC: TemperatureC(93),
    onWaterTemperatureChange: vi.fn(),
    processingMethod: 'washed',
    onProcessingMethodChange: vi.fn(),
    altitude: 'medium',
    onAltitudeChange: vi.fn(),
    ...overrides,
  };
  return {
    ...render(
      <UnitProvider>
        <AdvancedOptions {...props} />
      </UnitProvider>,
    ),
    props,
  };
}

describe('AdvancedOptions', () => {
  it('renders the expand button', () => {
    renderOptions();
    expect(screen.getByRole('button', { name: /fine-tune your estimate/i })).toBeInTheDocument();
  });

  it('has no accessibility violations in collapsed state', async () => {
    const { container } = renderOptions();
    await assertA11y(container);
  });

  // ── Interaction coverage ──────────────────────────────────
  it('expands to show advanced options when button is clicked', () => {
    renderOptions();
    const button = screen.getByRole('button', { name: /fine-tune your estimate/i });
    fireEvent.click(button);
    // After expansion, the roast level segmented control should be visible
    expect(screen.getByText(/roast level/i)).toBeInTheDocument();
  });

  it('renders temperature input when expanded', () => {
    renderOptions();
    const button = screen.getByRole('button', { name: /fine-tune your estimate/i });
    fireEvent.click(button);
    expect(screen.getByLabelText(/water temperature/i)).toBeInTheDocument();
  });

  it('calls onWaterTemperatureChange when temperature input changes', () => {
    const { props } = renderOptions();
    const button = screen.getByRole('button', { name: /fine-tune your estimate/i });
    fireEvent.click(button);
    const tempInput = screen.getByLabelText(/water temperature/i);
    fireEvent.change(tempInput, { target: { value: '95' } });
    expect(props.onWaterTemperatureChange).toHaveBeenCalled();
  });

  // ── Grind-size guidance hints ─────────────────────────────────
  it('shows cold-brew hint when cold brew is paired with a finer grind', () => {
    renderOptions({ brewMethod: 'cold-brew', grindSize: 'medium' });
    fireEvent.click(screen.getByRole('button', { name: /fine-tune your estimate/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      /cold brew is typically made with extra-coarse grinds/i,
    );
  });

  it('does not show the cold-brew hint when cold brew uses extra-coarse grind', () => {
    renderOptions({ brewMethod: 'cold-brew', grindSize: 'extra-coarse' });
    fireEvent.click(screen.getByRole('button', { name: /fine-tune your estimate/i }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows espresso hint when espresso is paired with an extra-coarse grind', () => {
    renderOptions({ brewMethod: 'espresso', grindSize: 'extra-coarse' });
    fireEvent.click(screen.getByRole('button', { name: /fine-tune your estimate/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/espresso requires fine grinds/i);
  });

  it('shows french-press hint when french press is paired with an extra-fine grind', () => {
    renderOptions({ brewMethod: 'french-press', grindSize: 'extra-fine' });
    fireEvent.click(screen.getByRole('button', { name: /fine-tune your estimate/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/french press typically uses coarse grinds/i);
  });

  // ── Imperial unit branch ──────────────────────────────────────
  it('shows temperature in Fahrenheit when imperial units are active', () => {
    localStorage.setItem('coffee-calc-units', 'imperial');
    renderOptions();
    fireEvent.click(screen.getByRole('button', { name: /fine-tune your estimate/i }));
    const tempInput = screen.getByLabelText(/water temperature/i);
    // cToF(93) = 199.4°F
    expect(tempInput).toHaveValue(199.4);
    expect(screen.getByText('°F')).toBeInTheDocument();
  });

  it('converts Fahrenheit input to Celsius when changing temperature in imperial mode', () => {
    localStorage.setItem('coffee-calc-units', 'imperial');
    const { props } = renderOptions();
    fireEvent.click(screen.getByRole('button', { name: /fine-tune your estimate/i }));
    const tempInput = screen.getByLabelText(/water temperature/i);
    fireEvent.change(tempInput, { target: { value: '212' } });
    // 212°F → 100°C
    expect(props.onWaterTemperatureChange).toHaveBeenCalledWith(TemperatureC(100));
  });

  // ── Temperature edge cases ────────────────────────────────────
  it('resets temperature to 93°C when the input is cleared', () => {
    const { props } = renderOptions();
    fireEvent.click(screen.getByRole('button', { name: /fine-tune your estimate/i }));
    const tempInput = screen.getByLabelText(/water temperature/i);
    fireEvent.change(tempInput, { target: { value: '' } });
    expect(props.onWaterTemperatureChange).toHaveBeenCalledWith(TemperatureC(93));
  });

  it('does not change temperature when the value is outside the plausible range', () => {
    const { props } = renderOptions();
    fireEvent.click(screen.getByRole('button', { name: /fine-tune your estimate/i }));
    const tempInput = screen.getByLabelText(/water temperature/i);
    fireEvent.change(tempInput, { target: { value: '50' } });
    expect(props.onWaterTemperatureChange).not.toHaveBeenCalled();
  });

  it('has no accessibility violations in expanded state', async () => {
    const { container } = renderOptions();
    const button = screen.getByRole('button', { name: /fine-tune your estimate/i });
    fireEvent.click(button);
    await assertA11y(container);
  });
});
