import { Component, type ReactNode } from 'react';
import { reportErrorWithComponentStack } from '@/utils/errorReporting';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary — Catches render-phase errors and displays a fallback UI
 * instead of letting the whole app crash.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ErrorBoundary]', error.message, errorInfo.componentStack);
    reportErrorWithComponentStack(error, errorInfo.componentStack ?? undefined);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="card max-w-lg mx-auto mt-8 p-6 text-center" role="alert">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
            Something went wrong
          </h2>
          <p className="text-coffee-600 dark:text-coffee-200 text-sm mb-4">
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="btn-coffee"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
