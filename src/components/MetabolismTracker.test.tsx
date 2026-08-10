import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import MetabolismTracker from '@/components/MetabolismTracker';
import { CaffeineLogProvider } from '@/hooks/useCaffeineLog';
import { assertA11y } from '@/test/axe';
import { exportEntriesToCsv } from '@/utils/csvExport';

vi.mock('@/utils/csvExport', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utils/csvExport')>();
  return { ...actual, exportEntriesToCsv: vi.fn() };
});

// Controllable storageAvailable mock so the quota/unavailable load-error
// variants can be simulated (jsdom localStorage never throws).
const { mockStorageAvailable } = vi.hoisted(() => ({
  mockStorageAvailable: vi.fn(() => ({ available: true, quotaExceeded: false })),
}));

vi.mock('@/utils/storageAvailable', () => ({
  storageAvailable: mockStorageAvailable,
}));

function renderTracker() {
  return render(
    <CaffeineLogProvider>
      <MetabolismTracker />
    </CaffeineLogProvider>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  mockStorageAvailable.mockReturnValue({ available: true, quotaExceeded: false });
});

/** Seed today's drink log in localStorage with one entry. */
function seedEntries() {
  localStorage.setItem(
    'coffee-calc-logs',
    JSON.stringify({
      version: 1,
      entries: [
        { id: 'e1', timestamp: new Date().toISOString(), caffeineMg: 100, drinkName: 'Seeded Coffee' },
      ],
    }),
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

  it('has no accessibility violations', async () => {
    const { container } = renderTracker();
    await assertA11y(container);
  });

  // ── Settings row interactions ───────────────────────────────────
  it('updates the daily safe limit from its input', () => {
    renderTracker();
    const input = screen.getByLabelText(/custom daily safe caffeine limit/i);
    fireEvent.change(input, { target: { value: '350' } });
    expect(input).toHaveValue(350);
  });

  it('updates the bedtime hour from its select', () => {
    renderTracker();
    const select = screen.getByLabelText(/bedtime hour/i);
    fireEvent.change(select, { target: { value: '21' } });
    expect(select).toHaveValue('21');
  });

  it('updates the sleep advisory threshold from its input', () => {
    renderTracker();
    const input = screen.getByLabelText(/custom sleep advisory caffeine threshold/i);
    fireEvent.change(input, { target: { value: '75' } });
    expect(input).toHaveValue(75);
  });

  // ── Log form toggle ─────────────────────────────────────────────
  it('toggles the drink log form via Log Drink / Cancel', () => {
    renderTracker();
    expect(screen.queryByLabelText(/log a caffeine drink/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /\+ log drink/i }));
    expect(screen.getByLabelText(/log a caffeine drink/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByLabelText(/log a caffeine drink/i)).not.toBeInTheDocument();
  });

  // ── Seeded entries: export + clear ──────────────────────────────
  it('exports today\'s entries to CSV', () => {
    seedEntries();
    renderTracker();
    fireEvent.click(screen.getByRole('button', { name: /export csv/i }));
    expect(exportEntriesToCsv).toHaveBeenCalledWith(expect.any(Array), 'caffeine-log');
  });

  it('clears today\'s entries when Clear today is clicked', () => {
    seedEntries();
    renderTracker();
    expect(screen.getByText('Seeded Coffee')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /clear today/i }));
    expect(screen.getByText(/no drinks logged today/i)).toBeInTheDocument();
  });

  // ── Storage load-error banner ───────────────────────────────────
  it('shows a load-error banner when persisted logs are corrupted', () => {
    localStorage.setItem('coffee-calc-logs', '{invalid json');
    renderTracker();
    expect(screen.getByText(/could not load saved data/i)).toBeInTheDocument();
  });

  it('shows the storage-full banner when the storage quota is exceeded', () => {
    mockStorageAvailable.mockReturnValue({ available: false, quotaExceeded: true });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    renderTracker();
    expect(screen.getByText('Storage full')).toBeInTheDocument();
  });

  it('shows the storage-unavailable banner when storage is not accessible', () => {
    mockStorageAvailable.mockReturnValue({ available: false, quotaExceeded: false });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    renderTracker();
    expect(screen.getByText('Storage unavailable')).toBeInTheDocument();
  });

  it('ignores non-numeric input for the daily safe limit', () => {
    renderTracker();
    const input = screen.getByLabelText(/custom daily safe caffeine limit/i);
    fireEvent.change(input, { target: { value: '350' } });
    expect(input).toHaveValue(350);
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(input).toHaveValue(350);
  });

  it('ignores non-numeric input for the sleep advisory threshold', () => {
    renderTracker();
    const input = screen.getByLabelText(/custom sleep advisory caffeine threshold/i);
    fireEvent.change(input, { target: { value: '75' } });
    expect(input).toHaveValue(75);
    fireEvent.change(input, { target: { value: 'xyz' } });
    expect(input).toHaveValue(75);
  });
});
