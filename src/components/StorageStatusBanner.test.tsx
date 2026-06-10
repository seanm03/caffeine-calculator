import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
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
});
