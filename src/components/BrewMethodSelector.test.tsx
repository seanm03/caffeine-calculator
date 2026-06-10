import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BrewMethodSelector from '@/components/BrewMethodSelector';

describe('BrewMethodSelector', () => {
  it('renders all 8 brew methods', () => {
    render(<BrewMethodSelector value="pour-over" onChange={() => {}} />);
    expect(screen.getByText('Espresso')).toBeInTheDocument();
    expect(screen.getByText('Pour Over')).toBeInTheDocument();
    expect(screen.getByText('French Press')).toBeInTheDocument();
    expect(screen.getByText('Aeropress')).toBeInTheDocument();
    expect(screen.getByText('Moka Pot')).toBeInTheDocument();
    expect(screen.getByText('Cold Brew')).toBeInTheDocument();
    expect(screen.getByText('Turkish')).toBeInTheDocument();
    expect(screen.getByText('Instant')).toBeInTheDocument();
  });

  it('renders as a radiogroup', () => {
    render(<BrewMethodSelector value="pour-over" onChange={() => {}} />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('renders 8 radio buttons', () => {
    render(<BrewMethodSelector value="pour-over" onChange={() => {}} />);
    expect(screen.getAllByRole('radio')).toHaveLength(8);
  });

  it('marks the selected brew method as checked', () => {
    render(<BrewMethodSelector value="espresso" onChange={() => {}} />);
    const espresso = screen.getByRole('radio', { name: 'Espresso' });
    expect(espresso).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onChange when a brew method is clicked', () => {
    const onChange = vi.fn();
    render(<BrewMethodSelector value="pour-over" onChange={onChange} />);
    fireEvent.click(screen.getByText('Turkish'));
    expect(onChange).toHaveBeenCalledWith('turkish');
  });

  it('navigates with ArrowRight key', () => {
    const onChange = vi.fn();
    render(<BrewMethodSelector value="espresso" onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('pour-over');
  });

  it('navigates with ArrowDown key', () => {
    const onChange = vi.fn();
    render(<BrewMethodSelector value="espresso" onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowDown' });
    expect(onChange).toHaveBeenCalledWith('pour-over');
  });

  it('navigates with ArrowLeft key', () => {
    const onChange = vi.fn();
    render(<BrewMethodSelector value="pour-over" onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith('espresso');
  });

  it('supports Home key to jump to first method', () => {
    const onChange = vi.fn();
    render(<BrewMethodSelector value="instant" onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'Home' });
    expect(onChange).toHaveBeenCalledWith('espresso');
  });

  it('supports End key to jump to last method', () => {
    const onChange = vi.fn();
    render(<BrewMethodSelector value="espresso" onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'End' });
    expect(onChange).toHaveBeenCalledWith('instant');
  });

  it('renders with aria-label on radiogroup', () => {
    render(<BrewMethodSelector value="pour-over" onChange={() => {}} />);
    expect(screen.getByRole('radiogroup', { name: 'Brew Method' })).toBeInTheDocument();
  });
});
