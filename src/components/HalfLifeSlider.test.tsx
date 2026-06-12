import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HalfLifeSlider from '@/components/HalfLifeSlider';
import { assertA11y } from '@/test/axe';
import { Hours } from '@/types/branded';

describe('HalfLifeSlider', () => {
  it('renders the half-life heading', () => {
    render(<HalfLifeSlider halfLifeHours={Hours(5)} onChange={() => {}} />);
    expect(screen.getByText('Caffeine Half-Life')).toBeInTheDocument();
  });

  it('displays the current value', () => {
    render(<HalfLifeSlider halfLifeHours={Hours(5)} onChange={() => {}} />);
    expect(screen.getByText('5h')).toBeInTheDocument();
  });

  it('renders a range input with accessible label', () => {
    render(<HalfLifeSlider halfLifeHours={Hours(5)} onChange={() => {}} />);
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('aria-label', 'Caffeine half-life: 5 hours');
  });

  it('calls onChange with Hours value when slider value changes', () => {
    const onChange = vi.fn();
    render(<HalfLifeSlider halfLifeHours={Hours(5)} onChange={onChange} />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '3.5' } });
    expect(onChange).toHaveBeenCalledWith(Hours(3.5));
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<HalfLifeSlider halfLifeHours={Hours(5)} onChange={() => {}} />);
    await assertA11y(container);
  });
});
