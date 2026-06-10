import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorBoundary from '@/components/ErrorBoundary';
import { assertA11y } from '@/test/axe';

/** Component that throws on render for testing ErrorBoundary. */
function BrokenComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test explosion');
  }
  return <p>Everything is fine</p>;
}

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <p>Safe content</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('renders default fallback UI when a child throws', () => {
    // Suppress expected console.error from ErrorBoundary
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    spy.mockRestore();
  });

  it('displays the error message in fallback UI', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Test explosion')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('renders custom fallback when provided', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary fallback={<p>Custom error UI</p>}>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('resets error state when Try again is clicked but recatches persistent errors', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Click "Try again" — error state clears but BrokenComponent still throws
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    // ErrorBoundary will catch again; confirm fallback re-appears
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    spy.mockRestore();
  });

  it('has role alert on the fallback', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('has no accessibility violations when rendering children', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(
      <ErrorBoundary>
        <p>Safe content</p>
      </ErrorBoundary>,
    );
    await assertA11y(container);
    spy.mockRestore();
  });

  it('has no accessibility violations in error fallback state', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    await assertA11y(container);
    spy.mockRestore();
  });
});
