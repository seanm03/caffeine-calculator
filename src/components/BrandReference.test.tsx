import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BrandReference from '@/components/BrandReference';
import { CaffeineLogProvider } from '@/hooks/useCaffeineLog';
import { assertA11y } from '@/test/axe';

function renderWithProviders(ui: React.ReactElement) {
  return render(<CaffeineLogProvider>{ui}</CaffeineLogProvider>);
}

describe('BrandReference', () => {
  it('renders the search input', () => {
    renderWithProviders(<BrandReference />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('renders the table with brand data', () => {
    renderWithProviders(<BrandReference />);
    expect(screen.getAllByText('Starbucks').length).toBeGreaterThan(0);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithProviders(<BrandReference />);
    await assertA11y(container);
  });

  // ── Quick-log button ───────────────────────────────────────
  it('renders quick-log buttons for each drink', () => {
    renderWithProviders(<BrandReference />);
    const logButtons = screen.getAllByText('+ Log');
    expect(logButtons.length).toBeGreaterThan(0);
  });

  it('shows quick-log feedback after clicking a log button', () => {
    renderWithProviders(<BrandReference />);
    const logButtons = screen.getAllByText('+ Log');
    fireEvent.click(logButtons[0]);
    // Should show "✓ Logged:" feedback
    expect(screen.getByText(/✓ logged:/i)).toBeInTheDocument();
  });

  // ── Search filtering ───────────────────────────────────────
  it('filters results when searching', async () => {
    renderWithProviders(<BrandReference />);
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'Starbucks' } });
    // Wait for debounce
    await waitFor(
      () => {
        const starbucksRows = screen.getAllByText('Starbucks');
        expect(starbucksRows.length).toBeGreaterThan(0);
      },
      { timeout: 500 },
    );
  });

  // ── Empty search state ─────────────────────────────────────
  it('shows empty message for no-match search', async () => {
    renderWithProviders(<BrandReference />);
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'zzzznonexistentdrink' } });
    await waitFor(
      () => {
        expect(screen.getByText(/no drinks match/i)).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  // ── Result count display ──────────────────────────────────
  it('shows result count', () => {
    renderWithProviders(<BrandReference />);
    expect(screen.getByText(/showing \d+ of \d+ drinks/i)).toBeInTheDocument();
  });

  // ── Sort interaction coverage ─────────────────────────────
  it('sorts by brand when column header is clicked', () => {
    renderWithProviders(<BrandReference />);
    const brandHeader = screen.getByText('Brand');
    fireEvent.click(brandHeader);
    // After sorting by brand, the header should have aria-sort set
    expect(brandHeader.closest('th')).toHaveAttribute('aria-sort', 'ascending');
  });

  // ── Branded-type search regression ────────────────────────
  it('searches correctly with branded string types (Source, BrandName, ServingSize)', async () => {
    renderWithProviders(<BrandReference />);
    const searchInput = screen.getByPlaceholderText(/search/i);

    // Search by branded BrandName — verifies .toLowerCase() works on branded strings
    fireEvent.change(searchInput, { target: { value: 'Starbucks' } });
    await waitFor(
      () => {
        expect(screen.getAllByText('Starbucks').length).toBeGreaterThan(0);
      },
      { timeout: 500 },
    );

    // Search by branded ServingSize — verifies .toLowerCase() works on branded strings
    fireEvent.change(searchInput, { target: { value: 'Grande' } });
    await waitFor(
      () => {
        expect(screen.getAllByText('Grande').length).toBeGreaterThan(0);
      },
      { timeout: 500 },
    );

    // Search by branded Source text — verifies no TypeScript narrowing issues
    fireEvent.change(searchInput, { target: { value: 'Brand published' } });
    await waitFor(
      () => {
        // Source text appears in table rows; verify results are non-empty
        expect(screen.queryByText(/no drinks match/i)).not.toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });
});
