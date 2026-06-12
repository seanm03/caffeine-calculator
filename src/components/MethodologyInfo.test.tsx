import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MethodologyInfo from '@/components/MethodologyInfo';
import { assertA11y } from '@/test/axe';

describe('MethodologyInfo', () => {
  it('renders the calculation methodology heading', () => {
    render(<MethodologyInfo />);
    expect(screen.getByText(/how we calculate caffeine/i)).toBeInTheDocument();
  });

  it('renders scientific references', () => {
    render(<MethodologyInfo />);
    // Should display at least one author name
    expect(screen.getByText(/spiro/i)).toBeInTheDocument();
  });

  it('renders the brew method efficiencies table', () => {
    render(<MethodologyInfo />);
    expect(screen.getByText(/brew methods & extraction efficiency/i)).toBeInTheDocument();
    expect(screen.getByText('Filter Immersion')).toBeInTheDocument();
    expect(screen.getByText(/paper-filtered immersion/i)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<MethodologyInfo />);
    await assertA11y(container);
  });
});
