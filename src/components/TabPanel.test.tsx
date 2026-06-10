import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TabPanel from '@/components/TabPanel';
import { assertA11y } from '@/test/axe';

describe('TabPanel', () => {
  it('renders children', () => {
    render(
      <TabPanel label="Test Tab">
        <p>Panel content</p>
      </TabPanel>,
    );
    expect(screen.getByText('Panel content')).toBeInTheDocument();
  });

  it('renders as a tabpanel with accessible label', () => {
    render(
      <TabPanel label="Test Tab">
        <p>Content</p>
      </TabPanel>,
    );
    expect(screen.getByRole('tabpanel', { name: 'Test Tab' })).toBeInTheDocument();
  });

  it('wraps content in a card when card prop is true', () => {
    const { container } = render(
      <TabPanel label="Card Tab" card>
        <p>Card content</p>
      </TabPanel>,
    );
    const card = container.querySelector('.card');
    expect(card).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <TabPanel label="Test Tab">
        <p>Panel content</p>
      </TabPanel>,
    );
    await assertA11y(container);
  });

  it('has no accessibility violations with card', async () => {
    const { container } = render(
      <TabPanel label="Card Tab" card>
        <p>Card content</p>
      </TabPanel>,
    );
    await assertA11y(container);
  });
});
