import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import UnitToggle from '@/components/UnitToggle';
import { assertA11y } from '@/test/axe';

describe('UnitToggle', () => {
  it('renders a button', () => {
    render(<UnitToggle unitSystem="metric" onToggle={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows metric label for metric system', () => {
    render(<UnitToggle unitSystem="metric" onToggle={() => {}} />);
    expect(screen.getByText('Metric')).toBeInTheDocument();
  });

  it('shows imperial label for imperial system', () => {
    render(<UnitToggle unitSystem="imperial" onToggle={() => {}} />);
    expect(screen.getByText('Imperial')).toBeInTheDocument();
  });

  it('has an accessible label', () => {
    render(<UnitToggle unitSystem="metric" onToggle={() => {}} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<UnitToggle unitSystem="metric" onToggle={() => {}} />);
    await assertA11y(container);
  });
});
