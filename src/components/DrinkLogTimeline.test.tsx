import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DrinkLogTimeline from '@/components/DrinkLogTimeline';
import { assertA11y } from '@/test/axe';

describe('DrinkLogTimeline', () => {
  const mockEntries = [
    { id: '1', timestamp: new Date().toISOString(), caffeineMg: 100, drinkName: 'Morning Coffee' },
    { id: '2', timestamp: new Date().toISOString(), caffeineMg: 50, drinkName: 'Afternoon Espresso' },
  ];

  const defaultProps = {
    onRemove: () => {},
    onUpdate: () => {},
  };

  it('renders entries with drink names', () => {
    render(<DrinkLogTimeline entries={mockEntries} {...defaultProps} />);
    expect(screen.getByText('Morning Coffee')).toBeInTheDocument();
    expect(screen.getByText('Afternoon Espresso')).toBeInTheDocument();
  });

  it('shows empty state when no entries', () => {
    render(<DrinkLogTimeline entries={[]} {...defaultProps} />);
    expect(screen.getByText(/no drinks logged yet/i)).toBeInTheDocument();
  });

  it('displays caffeine amount for each entry', () => {
    render(<DrinkLogTimeline entries={mockEntries} {...defaultProps} />);
    expect(screen.getByText('100 mg')).toBeInTheDocument();
    expect(screen.getByText('50 mg')).toBeInTheDocument();
  });

  it('has no accessibility violations with entries', async () => {
    const { container } = render(<DrinkLogTimeline entries={mockEntries} {...defaultProps} />);
    await assertA11y(container);
  });

  it('has no accessibility violations when empty', async () => {
    const { container } = render(<DrinkLogTimeline entries={[]} {...defaultProps} />);
    await assertA11y(container);
  });
});
