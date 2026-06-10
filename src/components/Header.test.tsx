import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Header from '@/components/Header';
import { assertA11y } from '@/test/axe';

describe('Header', () => {
  it('renders the app title', () => {
    render(<Header />);
    expect(screen.getByText(/coffee caffeine calculator/i)).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    render(<Header />);
    expect(screen.getByText(/science-based caffeine estimates/i)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Header />);
    await assertA11y(container);
  });
});
