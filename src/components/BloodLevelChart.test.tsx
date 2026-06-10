import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BloodLevelChart from '@/components/BloodLevelChart';

describe('BloodLevelChart', () => {
  it('renders chart with entries', () => {
    const entries = [
      { id: '1', timestamp: new Date().toISOString(), caffeineMg: 100 },
    ];
    const { container } = render(
      <BloodLevelChart entries={entries} halfLifeHours={5} />
    );
    expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
  });

  it('renders empty state when no entries', () => {
    const { container } = render(
      <BloodLevelChart entries={[]} halfLifeHours={5} />
    );
    expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
  });
});
