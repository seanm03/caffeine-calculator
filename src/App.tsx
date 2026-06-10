import { type ReactNode } from 'react';
import TabPanel from '@/components/TabPanel';
import TabBar from '@/components/TabBar';
import type { Tab } from '@/hooks/useHashTab';
import Header from '@/components/Header';
import Calculator from '@/components/Calculator';
import BrandReference from '@/components/BrandReference';
import MethodologyInfo from '@/components/MethodologyInfo';
import MetabolismTracker from '@/components/MetabolismTracker';
import Footer from '@/components/Footer';
import ThemeToggle from '@/components/ThemeToggle';
import UnitToggle from '@/components/UnitToggle';
import { UnitProvider, useUnits } from '@/hooks/useUnits';
import { ThemeProvider } from '@/hooks/useTheme';
import { CalculatorStateProvider } from '@/hooks/useCalculatorState';
import { CaffeineLogProvider } from '@/hooks/useCaffeineLog';
import { useHashTab } from '@/hooks/useHashTab';

// ── Tab content registry ────────────────────────────────────────────────────

const TAB_CONTENT: Record<Tab, ReactNode> = {
  calculator: (
    <TabPanel label="Calculator">
      <CalculatorStateProvider>
        <Calculator />
      </CalculatorStateProvider>
    </TabPanel>
  ),
  brands: (
    <TabPanel label="Brand Reference" card>
      <BrandReference />
    </TabPanel>
  ),
  methodology: (
    <TabPanel label="Methodology" card>
      <MethodologyInfo />
    </TabPanel>
  ),
  tracker: (
    <TabPanel label="Caffeine Tracker">
      <MetabolismTracker />
    </TabPanel>
  ),
};

// ── App content (inner, with context available) ─────────────────────────────

function AppContent() {
  const { activeTab, setActiveTab, tabs } = useHashTab();
  const { unitSystem, toggle: toggleUnits } = useUnits();

  return (
    <div className="min-h-screen bg-coffee-50 dark:bg-coffee-950 text-coffee-900 dark:text-coffee-100 flex flex-col transition-colors duration-300">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <UnitToggle unitSystem={unitSystem} onToggle={toggleUnits} />
        <ThemeToggle />
      </div>

      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        {TAB_CONTENT[activeTab]}
      </main>

      <Footer />
    </div>
  );
}

// ── App root (providers) ────────────────────────────────────────────────────

function App() {
  return (
    <ThemeProvider>
      <UnitProvider>
        <CaffeineLogProvider>
          <AppContent />
        </CaffeineLogProvider>
      </UnitProvider>
    </ThemeProvider>
  );
}

export default App;
