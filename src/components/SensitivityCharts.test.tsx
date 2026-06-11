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

  // ── Brew method bar chart ──────────────────────────────────
  it('renders brew method comparison chart heading', () => {
    render(<SensitivityCharts currentParams={defaultParams} />);
    expect(screen.getByText('Caffeine by Brew Method')).toBeInTheDocument();
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
