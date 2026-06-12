import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '@/App';
import { assertA11y } from '@/test/axe';

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it('renders the header', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders the tab bar with navigation tabs', () => {
    render(<App />);
    // TabBar renders tabs including Calculator, Brand Reference, Methodology, Caffeine Tracker
    expect(screen.getByRole('tab', { name: /calculator/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /brand reference/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /methodology/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /tracker/i })).toBeInTheDocument();
  });

  it('renders the default Calculator tab content', () => {
    render(<App />);
    // Default tab is calculator — brew method selector should be visible
    expect(screen.getByRole('radiogroup', { name: 'Brew Method' })).toBeInTheDocument();
  });

  it('renders the footer', () => {
    render(<App />);
    // Footer component renders with tech stack note
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<App />);
    await assertA11y(container);
  });
});
