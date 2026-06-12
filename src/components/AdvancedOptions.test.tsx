import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdvancedOptions from '@/components/AdvancedOptions';
import { UnitProvider } from '@/hooks/useUnits';
import { assertA11y } from '@/test/axe';
import { TemperatureC } from '@/types/branded';

function renderOptions() {
  const props = {
    brewMethod: 'pour-over' as const,
    roastLevel: 'medium' as const,
    onRoastLevelChange: vi.fn(),
    grindSize: 'medium' as const,
    onGrindSizeChange: vi.fn(),
    waterTemperatureC: TemperatureC(93),
    onWaterTemperatureChange: vi.fn(),
    processingMethod: 'washed' as const,
    onProcessingMethodChange: vi.fn(),
    altitude: 'medium' as const,
    onAltitudeChange: vi.fn(),
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

  it('has no accessibility violations in expanded state', async () => {
    const { container } = renderOptions();
    const button = screen.getByRole('button', { name: /fine-tune your estimate/i });
    fireEvent.click(button);
    await assertA11y(container);
  });
});
