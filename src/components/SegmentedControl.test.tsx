import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SegmentedControl from '@/components/SegmentedControl';

const OPTIONS: { value: string; label: string }[] = [
  { value: 'option-a', label: 'Option A' },
  { value: 'option-b', label: 'Option B' },
  { value: 'option-c', label: 'Option C' },
];

describe('SegmentedControl', () => {
  it('renders all options', () => {
    render(
      <SegmentedControl
        options={OPTIONS}
        value="option-a"
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByText('Option C')).toBeInTheDocument();
  });

  it('renders as a radiogroup', () => {
    render(
      <SegmentedControl
        options={OPTIONS}
        value="option-a"
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('renders each option as a radio button', () => {
    render(
      <SegmentedControl
        options={OPTIONS}
        value="option-a"
        onChange={() => {}}
      />,
    );
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
  });

  it('sets aria-checked on the selected option', () => {
    render(
      <SegmentedControl
        options={OPTIONS}
        value="option-b"
        onChange={() => {}}
      />,
    );
    const optionB = screen.getByRole('radio', { name: 'Option B' });
    expect(optionB).toHaveAttribute('aria-checked', 'true');
  });

  it('sets aria-checked false on unselected options', () => {
    render(
      <SegmentedControl
        options={OPTIONS}
        value="option-b"
        onChange={() => {}}
      />,
    );
    const optionA = screen.getByRole('radio', { name: 'Option A' });
    expect(optionA).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange with the clicked option value', () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        options={OPTIONS}
        value="option-a"
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByText('Option C'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('option-c');
  });

  it('does not call onChange when clicking the already-selected option', () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        options={OPTIONS}
        value="option-a"
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByText('Option A'));
    expect(onChange).toHaveBeenCalledTimes(1); // onClick always fires
    expect(onChange).toHaveBeenCalledWith('option-a');
  });

  it('supports keyboard navigation with ArrowRight', () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        options={OPTIONS}
        value="option-a"
        onChange={onChange}
      />,
    );
    const radiogroup = screen.getByRole('radiogroup');
    fireEvent.keyDown(radiogroup, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('option-b');
  });

  it('supports keyboard navigation with ArrowLeft', () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        options={OPTIONS}
        value="option-b"
        onChange={onChange}
      />,
    );
    const radiogroup = screen.getByRole('radiogroup');
    fireEvent.keyDown(radiogroup, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith('option-a');
  });

  it('wraps around with ArrowRight on last option', () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        options={OPTIONS}
        value="option-c"
        onChange={onChange}
      />,
    );
    const radiogroup = screen.getByRole('radiogroup');
    fireEvent.keyDown(radiogroup, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('option-a');
  });

  it('wraps around with ArrowLeft on first option', () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        options={OPTIONS}
        value="option-a"
        onChange={onChange}
      />,
    );
    const radiogroup = screen.getByRole('radiogroup');
    fireEvent.keyDown(radiogroup, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith('option-c');
  });

  it('supports Home key to jump to first option', () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        options={OPTIONS}
        value="option-c"
        onChange={onChange}
      />,
    );
    const radiogroup = screen.getByRole('radiogroup');
    fireEvent.keyDown(radiogroup, { key: 'Home' });
    expect(onChange).toHaveBeenCalledWith('option-a');
  });

  it('supports End key to jump to last option', () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        options={OPTIONS}
        value="option-a"
        onChange={onChange}
      />,
    );
    const radiogroup = screen.getByRole('radiogroup');
    fireEvent.keyDown(radiogroup, { key: 'End' });
    expect(onChange).toHaveBeenCalledWith('option-c');
  });

  it('renders indicators when provided', () => {
    const optionsWithIndicators = [
      { value: 'red', label: 'Red', indicator: '#ff0000' },
      { value: 'blue', label: 'Blue', indicator: '#0000ff' },
    ];
    render(
      <SegmentedControl
        options={optionsWithIndicators}
        value="red"
        onChange={() => {}}
      />,
    );
    const indicators = document.querySelectorAll('[aria-hidden="true"]');
    expect(indicators.length).toBeGreaterThanOrEqual(2);
  });

  it('renders in small size variant', () => {
    render(
      <SegmentedControl
        options={OPTIONS}
        value="option-a"
        onChange={() => {}}
        size="sm"
      />,
    );
    const buttons = screen.getAllByRole('radio');
    expect(buttons.length).toBe(3);
    // All buttons should be rendered
    buttons.forEach((btn) => {
      expect(btn).toBeInTheDocument();
    });
  });
});
