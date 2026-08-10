import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TabBar from '@/components/TabBar';
import { assertA11y } from '@/test/axe';
import type { Tab } from '@/hooks/useHashTab';

const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: 'calculator', label: 'Calculator', emoji: '🧮' },
  { key: 'brands', label: 'Brand Reference', emoji: '🏷️' },
  { key: 'tracker', label: 'Tracker', emoji: '📊' },
];

describe('TabBar', () => {
  it('renders all tabs', () => {
    render(<TabBar tabs={TABS} activeTab="calculator" onTabChange={() => {}} />);
    expect(screen.getByText('Calculator')).toBeInTheDocument();
    expect(screen.getByText('Brand Reference')).toBeInTheDocument();
    expect(screen.getByText('Tracker')).toBeInTheDocument();
  });

  it('renders as a tablist', () => {
    render(<TabBar tabs={TABS} activeTab="calculator" onTabChange={() => {}} />);
    expect(screen.getByRole('tablist', { name: 'Content sections' })).toBeInTheDocument();
  });

  it('marks the active tab as selected', () => {
    render(<TabBar tabs={TABS} activeTab="calculator" onTabChange={() => {}} />);
    const activeTab = screen.getByRole('tab', { name: /calculator/i });
    expect(activeTab).toHaveAttribute('aria-selected', 'true');
  });

  it('marks inactive tabs as not selected', () => {
    render(<TabBar tabs={TABS} activeTab="calculator" onTabChange={() => {}} />);
    const inactiveTab = screen.getByRole('tab', { name: /brand reference/i });
    expect(inactiveTab).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onTabChange with the tab key when a tab is clicked', () => {
    const onTabChange = vi.fn();
    render(<TabBar tabs={TABS} activeTab="calculator" onTabChange={onTabChange} />);
    fireEvent.click(screen.getByRole('tab', { name: /brand reference/i }));
    expect(onTabChange).toHaveBeenCalledTimes(1);
    expect(onTabChange).toHaveBeenCalledWith('brands');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<TabBar tabs={TABS} activeTab="calculator" onTabChange={() => {}} />);
    await assertA11y(container);
  });
});
