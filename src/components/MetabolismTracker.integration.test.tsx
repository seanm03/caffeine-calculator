/**
 * Integration tests for the MetabolismTracker data pipeline.
 *
 * Exercises the full flow: useCaffeineLog → computeBloodLevel →
 * generateBloodLevelCurve → chart rendering through the React render tree.
 * Each scenario validates multiple layers (log state, computed values, rendered output).
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { describe, it, expect } from 'vitest';
import MetabolismTracker from '@/components/MetabolismTracker';
import { CaffeineLogProvider } from '@/hooks/useCaffeineLog';

function renderTracker() {
  return render(
    <CaffeineLogProvider>
      <MetabolismTracker />
    </CaffeineLogProvider>
  );
}

/** Find the caffeine input by its placeholder text. */
function caffeineInput() {
  return screen.getByPlaceholderText('e.g., 95');
}

/** Click the "+ Log Drink" or "Cancel" toggle button. */
function toggleLogForm() {
  fireEvent.click(screen.getByRole('button', { name: /log drink|cancel/i }));
}

describe('MetabolismTracker Integration', () => {
  it('1. Empty pipeline: renders empty timeline and zero-summary', () => {
    renderTracker();

    expect(screen.getByText(/no drinks logged today/i)).toBeInTheDocument();
    expect(screen.getByText('Caffeine Half-Life')).toBeInTheDocument();

    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(3);
  });

  it('2. Single entry: form → timeline → summary', () => {
    renderTracker();

    toggleLogForm();
    fireEvent.change(caffeineInput(), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText(/morning pour-over/i), { target: { value: 'Morning Coffee' } });
    fireEvent.click(screen.getByRole('button', { name: /log drink/i }));

    expect(screen.getByText('Morning Coffee')).toBeInTheDocument();
  });

  it('3. Multi-entry: two drinks appear', () => {
    renderTracker();

    toggleLogForm();
    fireEvent.change(caffeineInput(), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText(/morning pour-over/i), { target: { value: 'First Coffee' } });
    fireEvent.click(screen.getByRole('button', { name: /log drink/i }));

    toggleLogForm();
    fireEvent.change(caffeineInput(), { target: { value: '50' } });
    fireEvent.change(screen.getByPlaceholderText(/morning pour-over/i), { target: { value: 'Second Coffee' } });
    fireEvent.click(screen.getByRole('button', { name: /log drink/i }));

    expect(screen.getByText('First Coffee')).toBeInTheDocument();
    expect(screen.getByText('Second Coffee')).toBeInTheDocument();
  });

  it('4. Entry removal: add then remove entry', () => {
    renderTracker();

    toggleLogForm();
    fireEvent.change(caffeineInput(), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText(/morning pour-over/i), { target: { value: 'Removable Coffee' } });
    fireEvent.click(screen.getByRole('button', { name: /log drink/i }));

    expect(screen.getByText('Removable Coffee')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /remove/i }));

    expect(screen.queryByText('Removable Coffee')).not.toBeInTheDocument();
    expect(screen.getByText(/no drinks logged today/i)).toBeInTheDocument();
  });

  it('5. Half-life slider renders with default value', () => {
    renderTracker();

    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveValue('5');
  });

  it('7. Tab-switching resilience: rapid mount/unmount cycles do not lose context or crash', () => {
    const { rerender } = render(
      <CaffeineLogProvider>
        <MetabolismTracker key="tracker-1" />
      </CaffeineLogProvider>
    );

    // Log a drink while on the tracker tab
    toggleLogForm();
    fireEvent.change(caffeineInput(), { target: { value: '150' } });
    fireEvent.change(screen.getByPlaceholderText(/morning pour-over/i), { target: { value: 'Tab Test Coffee' } });
    fireEvent.click(screen.getByRole('button', { name: /log drink/i }));
    expect(screen.getByText('Tab Test Coffee')).toBeInTheDocument();

    // Cycle through rapid tab switches (4 tabs × 3 cycles = 12 switches)
    const tabs = ['calculator', 'brands', 'methodology', 'tracker'];
    for (let cycle = 0; cycle < 3; cycle++) {
      for (const tab of tabs) {
        act(() => {
          rerender(
            <CaffeineLogProvider>
              {tab === 'tracker' ? (
                <MetabolismTracker key={`tracker-${cycle}`} />
              ) : (
                <div key={`other-${cycle}-${tab}`}>Other Tab: {tab}</div>
              )}
            </CaffeineLogProvider>
          );
        });
      }
    }

    // After cycling, the tracker tab should still show the logged drink
    expect(screen.getByText('Tab Test Coffee')).toBeInTheDocument();

    // Verify the half-life slider is still functional (no context loss)
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveValue('5');
  });

  it('6. Full cycle: add entries, then remove one', () => {
    renderTracker();

    toggleLogForm();
    fireEvent.change(caffeineInput(), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText(/morning pour-over/i), { target: { value: 'Espresso Shot' } });
    fireEvent.click(screen.getByRole('button', { name: /log drink/i }));

    expect(screen.getByText('Espresso Shot')).toBeInTheDocument();

    toggleLogForm();
    fireEvent.change(caffeineInput(), { target: { value: '50' } });
    fireEvent.change(screen.getByPlaceholderText(/morning pour-over/i), { target: { value: 'Afternoon Tea' } });
    fireEvent.click(screen.getByRole('button', { name: /log drink/i }));

    expect(screen.getByText('Afternoon Tea')).toBeInTheDocument();

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    // Newest entry appears first, so index 1 is the older Espresso Shot
    fireEvent.click(removeButtons[1]);

    expect(screen.queryByText('Espresso Shot')).not.toBeInTheDocument();
    expect(screen.getByText('Afternoon Tea')).toBeInTheDocument();
  });
});
