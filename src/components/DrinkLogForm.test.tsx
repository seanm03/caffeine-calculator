import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DrinkLogForm from '@/components/DrinkLogForm';
import { assertA11y } from '@/test/axe';

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

  it('submits with all optional fields populated', () => {
    const onAdd = vi.fn();
    render(<DrinkLogForm onAdd={onAdd} />);
    fireEvent.change(screen.getByLabelText(/^caffeine/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/drink name/i), { target: { value: 'Test Coffee' } });
    fireEvent.change(screen.getByLabelText(/brew method/i), { target: { value: 'pour-over' } });
    fireEvent.change(screen.getByLabelText(/coffee weight/i), { target: { value: '18' } });
    fireEvent.change(screen.getByLabelText(/water volume/i), { target: { value: '300' } });
    fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: 'Morning cup' } });
    fireEvent.click(screen.getByRole('button', { name: /log drink/i }));
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        caffeineMg: 100,
        drinkName: 'Test Coffee',
        brewMethod: 'pour-over',
        coffeeWeightG: 18,
        waterVolumeMl: 300,
        notes: 'Morning cup',
      }),
    );
  });

  it('disables the submit button while caffeine is invalid', () => {
    render(<DrinkLogForm onAdd={() => {}} />);
    expect(screen.getByRole('button', { name: /log drink/i })).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/^caffeine/i), { target: { value: '100' } });
    expect(screen.getByRole('button', { name: /log drink/i })).toBeEnabled();

    fireEvent.change(screen.getByLabelText(/^caffeine/i), { target: { value: '5000' } });
    expect(screen.getByRole('button', { name: /log drink/i })).toBeDisabled();
  });

  it('ignores submit with non-numeric caffeine', () => {
    const onAdd = vi.fn();
    const { container } = render(<DrinkLogForm onAdd={onAdd} />);
    fireEvent.change(screen.getByLabelText(/^caffeine/i), { target: { value: 'abc' } });
    fireEvent.submit(container.querySelector('form')!);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('ignores submit with zero caffeine', () => {
    const onAdd = vi.fn();
    const { container } = render(<DrinkLogForm onAdd={onAdd} />);
    fireEvent.change(screen.getByLabelText(/^caffeine/i), { target: { value: '0' } });
    fireEvent.submit(container.querySelector('form')!);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('ignores submit with caffeine above the max plausible dose', () => {
    const onAdd = vi.fn();
    const { container } = render(<DrinkLogForm onAdd={onAdd} />);
    fireEvent.change(screen.getByLabelText(/^caffeine/i), { target: { value: '2500' } });
    fireEvent.submit(container.querySelector('form')!);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<DrinkLogForm onAdd={() => {}} />);
    await assertA11y(container);
  });
});
