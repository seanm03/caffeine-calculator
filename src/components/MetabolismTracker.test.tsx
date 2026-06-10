import { render, screen } from '@testing-library/react';
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

describe('MetabolismTracker', () => {
  it('renders the half-life section heading', () => {
    renderTracker();
    expect(screen.getByText('Caffeine Half-Life')).toBeInTheDocument();
  });

  it('shows empty state when no drinks logged', () => {
    renderTracker();
    expect(screen.getByText(/no drinks logged today/i)).toBeInTheDocument();
  });

  it('renders the daily summary section', () => {
    renderTracker();
    expect(screen.getByText('Current Level')).toBeInTheDocument();
  });

  it('renders the blood level chart heading', () => {
    renderTracker();
    expect(screen.getByText('24-Hour Blood Caffeine Level')).toBeInTheDocument();
  });
});
