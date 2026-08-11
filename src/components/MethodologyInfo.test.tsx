import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MethodologyInfo from '@/components/MethodologyInfo';
import { assertA11y } from '@/test/axe';

describe('MethodologyInfo', () => {
  it('renders the calculation methodology heading', () => {
    render(<MethodologyInfo />);
    expect(screen.getByText(/how we calculate caffeine/i)).toBeInTheDocument();
  });

  it('renders scientific references', () => {
    render(<MethodologyInfo />);
    // Should display at least one author name
    expect(screen.getByText(/spiro/i)).toBeInTheDocument();
  });

  it('renders the brew method efficiencies table', () => {
    render(<MethodologyInfo />);
    expect(screen.getByText(/brew methods & extraction efficiency/i)).toBeInTheDocument();
    expect(screen.getByText('Filter Immersion')).toBeInTheDocument();
    expect(screen.getByText(/paper-filtered immersion/i)).toBeInTheDocument();
  });

  it('renders a "Read online" link for references with a link but no DOI', () => {
    render(
      <MethodologyInfo
        references={[
          { author: 'Casey, A.', year: 2022, title: 'Brewing study', link: 'https://example.com/brewing' },
          { author: 'Doe, J.', year: 2023, title: 'DOI study', doi: '10.1000/example' },
        ]}
      />,
    );
    expect(screen.getByText('Casey, A. (2022)')).toBeInTheDocument();
    expect(screen.getByText('Read online')).toBeInTheDocument();
    expect(screen.getByText('doi.org/10.1000/example')).toBeInTheDocument();
  });

  it('renders no external link when a reference has neither doi nor link', () => {
    render(
      <MethodologyInfo
        references={[{ author: 'Smith, J.', year: 2021, title: 'No links study' }]}
      />,
    );
    expect(screen.getByText('Smith, J. (2021)')).toBeInTheDocument();
    // Anchored at both ends because the DOI link text is exactly "doi.org/{doi}";
    // an unanchored /doi\.org/ could match unexpected locations (CWE-20).
    expect(screen.queryByText(/^doi\.org\/.*$/)).not.toBeInTheDocument();
    expect(screen.queryByText('Read online')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<MethodologyInfo />);
    await assertA11y(container);
  });
});
