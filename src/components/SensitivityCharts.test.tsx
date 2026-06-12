import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SensitivityCharts, { SensitivityChartTooltip } from '@/components/SensitivityCharts';
import { assertA11y } from '@/test/axe';
import { WeightG, VolumeMl } from '@/types/branded';
import type { BrewingParameters } from '@/types';

// ── SensitivityChartTooltip unit tests ─────────────────────────────────────

describe('SensitivityChartTooltip', () => {
  it('returns null when not active', () => {
    const result = SensitivityChartTooltip({ active: false, payload: [], label: 'Test' });
    expect(result).toBeNull();
  });

  it('returns null when payload is empty', () => {
    const result = SensitivityChartTooltip({ active: true, payload: [], label: 'Test' });
    expect(result).toBeNull();
  });

  it('returns null when payload is undefined', () => {
    const result = SensitivityChartTooltip({ active: true, label: 'Test' });
    expect(result).toBeNull();
  });

  it('renders tooltip with single payload entry', () => {
    const result = SensitivityChartTooltip({
      active: true,
      payload: [{ value: 250, name: 'Caffeine', color: '#c67b4b' }],
      label: 'Pour-Over',
    });

    expect(result).not.toBeNull();
    // The tooltip is a React element — verify it renders correctly
    const { container } = render(<>{result}</>);
    expect(container.textContent).toContain('Pour-Over');
    expect(container.textContent).toContain('250 mg');
  });

  it('renders tooltip with multiple payload entries', () => {
    const result = SensitivityChartTooltip({
      active: true,
      payload: [
        { value: 200, name: 'Arabica', color: '#c67b4b' },
        { value: 350, name: 'Robusta', color: '#8b5e3c' },
      ],
      label: 'Espresso',
    });

    const { container } = render(<>{result}</>);
    expect(container.textContent).toContain('200 mg');
    expect(container.textContent).toContain('350 mg');
    expect(container.textContent).toContain('Espresso');
  });
});

// ── SensitivityCharts component tests ──────────────────────────────────────

describe('SensitivityCharts', () => {
  const defaultParams: BrewingParameters = {
    brewMethod: 'pour-over',
    coffeeWeightG: WeightG(18),
    waterVolumeMl: VolumeMl(300),
    species: 'arabica',
  };

  // ── Brew method bar chart ──────────────────────────────────
  it('renders brew method comparison chart heading', () => {
    render(<SensitivityCharts currentParams={defaultParams} />);
    expect(screen.getByText('Caffeine by Brew Method')).toBeInTheDocument();
  });

  it('renders brew method bar chart description', () => {
    render(<SensitivityCharts currentParams={defaultParams} />);
    expect(screen.getByText(/comparing all 9 methods/i)).toBeInTheDocument();
  });

  // ── Coffee weight line chart ───────────────────────────────
  it('renders caffeine vs weight heading', () => {
    render(<SensitivityCharts currentParams={defaultParams} />);
    expect(screen.getByText(/how caffeine scales/i)).toBeInTheDocument();
  });

  // ── Radar chart ────────────────────────────────────────────
  it('renders radar chart heading', () => {
    render(<SensitivityCharts currentParams={defaultParams} />);
    expect(screen.getByText(/parameter contribution weights/i)).toBeInTheDocument();
  });

  it('renders radar chart with parameter labels', () => {
    render(<SensitivityCharts currentParams={defaultParams} />);
    // The radar chart description gives context
    expect(screen.getByText(/how each parameter multiplier affects/i)).toBeInTheDocument();
  });

  // ── Heatmap ────────────────────────────────────────────────
  it('renders heatmap heading', () => {
    render(<SensitivityCharts currentParams={defaultParams} />);
    expect(screen.getByText(/grind × temperature interaction/i)).toBeInTheDocument();
  });

  it('renders heatmap description text', () => {
    render(<SensitivityCharts currentParams={defaultParams} />);
    expect(screen.getByText(/caffeine \(mg\) across all grind size/i)).toBeInTheDocument();
  });

  it('renders heatmap table with grind rows and temperature columns', () => {
    render(<SensitivityCharts currentParams={defaultParams} />);
    const table = screen.getByRole('table', { name: /grind size and temperature interaction/i });
    expect(table).toBeInTheDocument();

    // Check grind size row labels
    expect(within(table).getByText('Extra Fine')).toBeInTheDocument();
    expect(within(table).getByText('Fine')).toBeInTheDocument();
    expect(within(table).getByText('Medium')).toBeInTheDocument();
    expect(within(table).getByText('Coarse')).toBeInTheDocument();
    expect(within(table).getByText('Extra Coarse')).toBeInTheDocument();

    // Check temperature column headers
    expect(within(table).getByText('70°C')).toBeInTheDocument();
    expect(within(table).getByText('100°C')).toBeInTheDocument();
  });

  it('renders heatmap cells with caffeine values', () => {
    const { container } = render(<SensitivityCharts currentParams={defaultParams} />);
    const table = screen.getByRole('table', { name: /grind size and temperature interaction/i });

    // Each cell should have a numeric caffeine value and a title attribute
    const cells = table.querySelectorAll('td[title]');
    expect(cells.length).toBeGreaterThan(0);

    // Each cell's title should follow the pattern "Grind at Temp°C: N mg"
    const firstCell = cells[0];
    expect(firstCell.getAttribute('title')).toMatch(/\d+ mg$/);
    expect(firstCell.textContent).toMatch(/^\d+$/);
    expect(container).toBeTruthy();
  });

  it('renders color gradient legend for heatmap', () => {
    render(<SensitivityCharts currentParams={defaultParams} />);
    // The heatmap footer has min/max labels with mg values.
    // Use getAllByText since both min and max labels end with " mg"
    const mgLabels = screen.getAllByText(/^\d+ mg$/);
    expect(mgLabels.length).toBeGreaterThanOrEqual(2);
  });

  // ── Decaf affects all views ────────────────────────────────
  it('renders with decaf params without error', () => {
    const decafParams: BrewingParameters = { ...defaultParams, isDecaf: true };
    const { container } = render(<SensitivityCharts currentParams={decafParams} />);
    // All four section headings should render
    expect(screen.getByText('Caffeine by Brew Method')).toBeInTheDocument();
    expect(screen.getByText(/how caffeine scales/i)).toBeInTheDocument();
    expect(screen.getByText(/parameter contribution weights/i)).toBeInTheDocument();
    expect(screen.getByText(/grind × temperature interaction/i)).toBeInTheDocument();
    expect(container).toBeTruthy();
  });

  // ── Compact mode ───────────────────────────────────────────
  it('renders in compact mode without error', () => {
    render(<SensitivityCharts currentParams={defaultParams} compact />);
    expect(screen.getByText('Caffeine by Brew Method')).toBeInTheDocument();
  });

  // ── Robust params exercise full calculation pipeline ──────
  it('renders with robusta params', () => {
    const robustaParams: BrewingParameters = {
      ...defaultParams,
      species: 'robusta',
    };
    const { container } = render(<SensitivityCharts currentParams={robustaParams} />);
    expect(screen.getByText('Caffeine by Brew Method')).toBeInTheDocument();
    expect(container).toBeTruthy();
  });

  it('renders with blend params', () => {
    const blendParams: BrewingParameters = {
      ...defaultParams,
      species: 'blend',
      robustaPercent: 30,
    };
    const { container } = render(<SensitivityCharts currentParams={blendParams} />);
    expect(screen.getByText('Caffeine by Brew Method')).toBeInTheDocument();
    expect(container).toBeTruthy();
  });

  it('renders with advanced parameters set', () => {
    const params: BrewingParameters = {
      ...defaultParams,
      roastLevel: 'dark',
      grindSize: 'extra-fine',
      processingMethod: 'natural',
      altitude: 'high',
    };
    const { container } = render(<SensitivityCharts currentParams={params} />);
    expect(screen.getByText('Caffeine by Brew Method')).toBeInTheDocument();
    expect(container).toBeTruthy();
  });

  // ── Accessibility ──────────────────────────────────────────
  it('has no accessibility violations', async () => {
    const { container } = render(<SensitivityCharts currentParams={defaultParams} />);
    await assertA11y(container);
  });

  it('has no accessibility violations in compact mode', async () => {
    const { container } = render(<SensitivityCharts currentParams={defaultParams} compact />);
    await assertA11y(container);
  });
});
