import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StorageStatusBanner from '@/components/StorageStatusBanner';
import { assertA11y } from '@/test/axe';

describe('StorageStatusBanner', () => {
  it('renders unavailable state', () => {
    render(<StorageStatusBanner status="unavailable" />);
    expect(screen.getByText(/storage unavailable/i)).toBeInTheDocument();
  });

  it('renders quota full state', () => {
    render(<StorageStatusBanner status="quota_full" />);
    expect(screen.getByText('Storage full')).toBeInTheDocument();
  });

  it('renders load error state', () => {
    render(<StorageStatusBanner status="load_error" />);
    expect(screen.getByText(/could not load saved data/i)).toBeInTheDocument();
  });

  it('has no accessibility violations in unavailable state', async () => {
    const { container } = render(<StorageStatusBanner status="unavailable" />);
    await assertA11y(container);
  });

  it('has no accessibility violations in quota full state', async () => {
    const { container } = render(<StorageStatusBanner status="quota_full" />);
    await assertA11y(container);
  });

  it('has no accessibility violations in load error state', async () => {
    const { container } = render(<StorageStatusBanner status="load_error" />);
    await assertA11y(container);
  });

  // ── Dismiss behavior ──────────────────────────────────────
  it('calls onDismiss and hides the banner when the dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<StorageStatusBanner status="load_error" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/could not load saved data/i)).not.toBeInTheDocument();
  });

  it('does not render a dismiss button for persistent states', () => {
    render(<StorageStatusBanner status="unavailable" onDismiss={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
    render(<StorageStatusBanner status="quota_full" onDismiss={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
  });
});
