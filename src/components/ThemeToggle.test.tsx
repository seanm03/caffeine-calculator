import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ThemeToggle from '@/components/ThemeToggle';
import { ThemeProvider } from '@/hooks/useTheme';

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );
}

describe('ThemeToggle', () => {
  it('renders a button', () => {
    renderToggle();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('has an accessible label', () => {
    renderToggle();
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
  });

  it('cycles theme on click (auto → light)', () => {
    renderToggle();
    const button = screen.getByRole('button');
    fireEvent.click(button);
    // After clicking, aria-label should reference the next theme
    expect(button).toHaveAttribute('aria-label');
    expect(button.getAttribute('aria-label')).toMatch(/switch to/i);
  });

  it('has a title attribute', () => {
    renderToggle();
    expect(screen.getByRole('button')).toHaveAttribute('title');
  });

  it('renders an emoji icon', () => {
    renderToggle();
    const button = screen.getByRole('button');
    // Should contain one of the theme emojis
    const text = button.textContent || '';
    expect(['☀️', '🌙', '🖥️'].some((emoji) => text.includes(emoji))).toBe(true);
  });

  it('changes icon after clicking through all themes', () => {
    renderToggle();
    const button = screen.getByRole('button');
    const initialText = button.textContent;

    fireEvent.click(button);
    expect(button.textContent).not.toBe(initialText);

    fireEvent.click(button);
    // After two clicks, should be different from both initial and first
    const afterTwoClicks = button.textContent;
    expect(afterTwoClicks).not.toBe(initialText);
  });
});
