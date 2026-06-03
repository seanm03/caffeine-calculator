import { useState } from 'react';
import Header from './components/Header';
import Calculator from './components/Calculator';
import BrandReference from './components/BrandReference';
import MethodologyInfo from './components/MethodologyInfo';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';
import UnitToggle from './components/UnitToggle';
import ErrorBoundary from './components/ErrorBoundary';
import { UnitProvider, useUnits } from './hooks/useUnits';
import { CalculatorStateProvider } from './hooks/useCalculatorState';

type Tab = 'calculator' | 'brands' | 'methodology';

const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: 'calculator', label: 'Calculator', emoji: '☕' },
  { key: 'brands', label: 'Brand Reference', emoji: '🏷️' },
  { key: 'methodology', label: 'Methodology', emoji: '📚' },
];

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('calculator');
  const { unitSystem, toggle: toggleUnits } = useUnits();

  return (
    <div className="min-h-screen bg-coffee-50 dark:bg-coffee-950 text-coffee-900 dark:text-coffee-100 flex flex-col transition-colors duration-300">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <UnitToggle unitSystem={unitSystem} onToggle={toggleUnits} />
        <ThemeToggle />
      </div>
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        {/* Tab bar */}
        <nav
          className="flex border-b border-coffee-200 dark:border-coffee-800"
          role="tablist"
          aria-label="Content sections"
        >
          {TABS.map(({ key, label, emoji }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(key)}
                className={`
                  flex-1 sm:flex-none px-4 sm:px-6 py-3 text-sm font-medium
                  transition-colors duration-200 relative
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-coffee-400
                  focus-visible:ring-inset rounded-t-lg
                  ${
                    isActive
                      ? 'text-coffee-800 dark:text-coffee-100'
                      : 'text-coffee-500 dark:text-coffee-300 hover:text-coffee-700 dark:hover:text-coffee-100'
                  }
                `}
              >
                <span className="hidden sm:inline mr-1.5" aria-hidden="true">
                  {emoji}
                </span>
                {label}
                {/* Active underline indicator */}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-coffee-500 dark:bg-coffee-300 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Tab panels */}
        {activeTab === 'calculator' && (
          <div role="tabpanel" aria-label="Calculator">
            <ErrorBoundary>
              <CalculatorStateProvider>
                <Calculator />
              </CalculatorStateProvider>
            </ErrorBoundary>
          </div>
        )}
        {activeTab === 'brands' && (
          <div role="tabpanel" aria-label="Brand Reference">
            <ErrorBoundary>
              <div className="card">
                <BrandReference />
              </div>
            </ErrorBoundary>
          </div>
        )}
        {activeTab === 'methodology' && (
          <div role="tabpanel" aria-label="Methodology">
            <ErrorBoundary>
              <div className="card">
                <MethodologyInfo />
              </div>
            </ErrorBoundary>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <UnitProvider>
      <AppContent />
    </UnitProvider>
  );
}

export default App;
