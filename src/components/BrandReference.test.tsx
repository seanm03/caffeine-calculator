import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BrandReference from '@/components/BrandReference';
import { assertA11y } from '@/test/axe';

describe('BrandReference', () => {
  it('renders the search input', () => {
    render(<BrandReference />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('renders the table with brand data', () => {
    render(<BrandReference />);
    // At least one brand name should appear in the table
    expect(screen.getByText('Brand')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<BrandReference />);
    await assertA11y(container);
  });
});
