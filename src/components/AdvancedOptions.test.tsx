import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AdvancedOptions from '@/components/AdvancedOptions';
import { UnitProvider } from '@/hooks/useUnits';
import { assertA11y } from '@/test/axe';

function renderOptions() {
  return render(
    <UnitProvider>
      <AdvancedOptions
        roastLevel="medium"
        onRoastLevelChange={() => {}}
        grindSize="medium"
        onGrindSizeChange={() => {}}
        waterTemperatureC={93}
        onWaterTemperatureChange={() => {}}
        processingMethod="washed"
        onProcessingMethodChange={() => {}}
        altitude="medium"
        onAltitudeChange={() => {}}
      />
    </UnitProvider>,
  );
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
});
