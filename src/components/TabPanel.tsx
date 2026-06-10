import type { ReactNode } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

interface TabPanelProps {
  label: string;
  card?: boolean;
  children: ReactNode;
}

/** Wraps tab content in a role="tabpanel" container and ErrorBoundary. */
export default function TabPanel({ label, card, children }: TabPanelProps) {
  return (
    <div role="tabpanel" aria-label={label}>
      <ErrorBoundary>
        {card ? <div className="card">{children}</div> : children}
      </ErrorBoundary>
    </div>
  );
}
