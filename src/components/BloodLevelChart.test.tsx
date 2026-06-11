import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BloodLevelChart from '@/components/BloodLevelChart';
import { assertA11y } from '@/test/axe';
import { Hours, CaffeineMg } from '@/types/branded';
import type { CaffeineLogEntry } from '@/types';

describe('BloodLevelChart', () => {
  it('renders chart with entries', () => {
    const entries: CaffeineLogEntry[] = [
      { id: '1', timestamp: new Date().toISOString(), caffeineMg: CaffeineMg(100) },
    ];
    const { container } = render(
      <BloodLevelChart entries={entries} halfLifeHours={Hours(5)} />
    );
    expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
  });

  it('renders empty state when no entries', () => {
    const { container } = render(
      <BloodLevelChart entries={[]} halfLifeHours={Hours(5)} />
    );
    expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
  });

  it('has no accessibility violations with entries', async () => {
    const entries: CaffeineLogEntry[] = [
      { id: '1', timestamp: new Date().toISOString(), caffeineMg: CaffeineMg(100) },
    ];
    const { container } = render(
      <BloodLevelChart entries={entries} halfLifeHours={Hours(5)} />
    );
    await assertA11y(container);
  });

  it('has no accessibility violations when empty', async () => {
    const { container } = render(
      <BloodLevelChart entries={[]} halfLifeHours={Hours(5)} />
    );
    await assertA11y(container);
  });
});
