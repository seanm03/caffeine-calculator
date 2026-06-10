import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DailySummaryError, ChartError, DrinkLogError } from '@/components/MetabolismErrorFallbacks';
import { assertA11y } from '@/test/axe';

describe('MetabolismErrorFallbacks', () => {
  describe('DailySummaryError', () => {
    it('renders error message', () => {
      render(<DailySummaryError />);
      expect(screen.getByText('Unable to load daily summary')).toBeInTheDocument();
    });

    it('has no accessibility violations', async () => {
      const { container } = render(<DailySummaryError />);
      await assertA11y(container);
    });
  });

  describe('ChartError', () => {
    it('renders error message', () => {
      render(<ChartError />);
      expect(screen.getByText('Unable to load blood level chart')).toBeInTheDocument();
    });

    it('has no accessibility violations', async () => {
      const { container } = render(<ChartError />);
      await assertA11y(container);
    });
  });

  describe('DrinkLogError', () => {
    it('renders error message', () => {
      render(<DrinkLogError />);
      expect(screen.getByText('Unable to load drink log')).toBeInTheDocument();
    });

    it('has no accessibility violations', async () => {
      const { container } = render(<DrinkLogError />);
      await assertA11y(container);
    });
  });
});
