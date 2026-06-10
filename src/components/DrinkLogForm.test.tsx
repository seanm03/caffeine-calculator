import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DrinkLogForm from '@/components/DrinkLogForm';

describe('DrinkLogForm', () => {
  it('renders form fields', () => {
    render(<DrinkLogForm onAdd={() => {}} />);
    expect(screen.getByLabelText(/^caffeine/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/drink name/i)).toBeInTheDocument();
  });

  it('shows validation error for empty caffeine amount on submit', () => {
    const onAdd = vi.fn();
    render(<DrinkLogForm onAdd={onAdd} />);
    fireEvent.click(screen.getByRole('button', { name: /log drink/i }));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('calls onAdd with valid data', () => {
    const onAdd = vi.fn();
    render(<DrinkLogForm onAdd={onAdd} />);
    fireEvent.change(screen.getByLabelText(/^caffeine/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/drink name/i), { target: { value: 'Test Coffee' } });
    fireEvent.click(screen.getByRole('button', { name: /log drink/i }));
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ caffeineMg: 100, drinkName: 'Test Coffee' })
    );
  });

  it('does not submit with negative caffeine value', () => {
    const onAdd = vi.fn();
    render(<DrinkLogForm onAdd={onAdd} />);
    fireEvent.change(screen.getByLabelText(/^caffeine/i), { target: { value: '-5' } });
    fireEvent.click(screen.getByRole('button', { name: /log drink/i }));
    expect(onAdd).not.toHaveBeenCalled();
  });
});
