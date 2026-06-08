import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DrinkLogTimeline from './DrinkLogTimeline';

describe('DrinkLogTimeline', () => {
  const mockEntries = [
    { id: '1', timestamp: new Date().toISOString(), caffeineMg: 100, drinkName: 'Morning Coffee' },
    { id: '2', timestamp: new Date().toISOString(), caffeineMg: 50, drinkName: 'Afternoon Espresso' },
  ];

  it('renders entries with drink names', () => {
    render(<DrinkLogTimeline entries={mockEntries} onRemove={() => {}} />);
    expect(screen.getByText('Morning Coffee')).toBeInTheDocument();
    expect(screen.getByText('Afternoon Espresso')).toBeInTheDocument();
  });

  it('shows empty state when no entries', () => {
    render(<DrinkLogTimeline entries={[]} onRemove={() => {}} />);
    expect(screen.getByText(/no drinks logged yet/i)).toBeInTheDocument();
  });

  it('displays caffeine amount for each entry', () => {
    render(<DrinkLogTimeline entries={mockEntries} onRemove={() => {}} />);
    expect(screen.getByText('100 mg')).toBeInTheDocument();
    expect(screen.getByText('50 mg')).toBeInTheDocument();
  });
});
