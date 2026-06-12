import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DrinkLogTimeline from '@/components/DrinkLogTimeline';
import { assertA11y } from '@/test/axe';
import { CaffeineMg, WeightG, VolumeMl } from '@/types/branded';
import type { CaffeineLogEntry } from '@/types';

describe('DrinkLogTimeline', () => {
  const mockEntries: CaffeineLogEntry[] = [
    { id: '1', timestamp: new Date().toISOString(), caffeineMg: CaffeineMg(100), drinkName: 'Morning Coffee' },
    { id: '2', timestamp: new Date().toISOString(), caffeineMg: CaffeineMg(50), drinkName: 'Afternoon Espresso' },
  ];

  function renderTimeline(overrides: Record<string, unknown> = {}) {
    const props = {
      entries: mockEntries,
      onRemove: vi.fn(),
      onUpdate: vi.fn(),
      ...overrides,
    };
    return {
      ...render(<DrinkLogTimeline {...props} />),
      props,
    };
  }

  it('renders entries with drink names', () => {
    renderTimeline();
    expect(screen.getByText('Morning Coffee')).toBeInTheDocument();
    expect(screen.getByText('Afternoon Espresso')).toBeInTheDocument();
  });

  it('shows empty state when no entries', () => {
    renderTimeline({ entries: [] });
    expect(screen.getByText(/no drinks logged yet/i)).toBeInTheDocument();
  });

  it('displays caffeine amount for each entry', () => {
    renderTimeline();
    expect(screen.getByText('100 mg')).toBeInTheDocument();
    expect(screen.getByText('50 mg')).toBeInTheDocument();
  });

  it('has no accessibility violations with entries', async () => {
    const { container } = renderTimeline();
    await assertA11y(container);
  });

  it('has no accessibility violations when empty', async () => {
    const { container } = renderTimeline({ entries: [] });
    await assertA11y(container);
  });

  // ── Interaction coverage ──────────────────────────────────
  it('enters time editing mode when time button is clicked', () => {
    renderTimeline();
    const timeButtons = screen.getAllByRole('button', { name: /edit time/i });
    fireEvent.click(timeButtons[0]);
    // A time input should appear for editing
    expect(screen.getByLabelText(/edit drink time/i)).toBeInTheDocument();
  });

  it('calls onRemove when delete button is clicked', () => {
    const { props } = renderTimeline();
    const deleteButtons = screen.getAllByRole('button', { name: /remove/i });
    fireEvent.click(deleteButtons[0]);
    expect(props.onRemove).toHaveBeenCalledWith('1');
  });

  it('displays brew method label when entry has brew method', () => {
    const entriesWithBrew: CaffeineLogEntry[] = [
      { id: '1', timestamp: new Date().toISOString(), caffeineMg: CaffeineMg(100), brewMethod: 'pour-over' },
    ];
    renderTimeline({ entries: entriesWithBrew });
    const pourOverElements = screen.getAllByText('Pour Over');
    expect(pourOverElements.length).toBeGreaterThanOrEqual(1);
  });

  it('shows entry details for coffee weight and water volume', () => {
    const detailedEntries: CaffeineLogEntry[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        caffeineMg: CaffeineMg(100),
        coffeeWeightG: WeightG(18),
        waterVolumeMl: VolumeMl(300),
      },
    ];
    renderTimeline({ entries: detailedEntries });
    expect(screen.getByText('18g')).toBeInTheDocument();
    expect(screen.getByText('300ml')).toBeInTheDocument();
  });

  it('shows entry notes when present', () => {
    const entryWithNotes: CaffeineLogEntry[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        caffeineMg: CaffeineMg(100),
        notes: 'Tasted great!',
      },
    ];
    renderTimeline({ entries: entryWithNotes });
    expect(screen.getByText('Tasted great!')).toBeInTheDocument();
  });
});
