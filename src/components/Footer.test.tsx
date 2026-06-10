import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Footer from '@/components/Footer';
import { assertA11y } from '@/test/axe';

describe('Footer', () => {
  it('renders the data source note', () => {
    render(<Footer />);
    expect(screen.getByText(/data sourced from peer-reviewed research/i)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Footer />);
    await assertA11y(container);
  });
});
