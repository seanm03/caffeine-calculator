import { type ReactNode } from 'react';
import BrandReference from '@/components/BrandReference';
import Calculator from '@/components/Calculator';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import MetabolismTracker from '@/components/MetabolismTracker';
import MethodologyInfo from '@/components/MethodologyInfo';
import TabBar from '@/components/TabBar';
import TabPanel from '@/components/TabPanel';
import ThemeToggle from '@/components/ThemeToggle';
import UnitToggle from '@/components/UnitToggle';
import { CaffeineLogProvider } from '@/hooks/useCaffeineLog';
import { CalculatorStateProvider } from '@/hooks/useCalculatorState';
import { useHashTab } from '@/hooks/useHashTab';
import { ThemeProvider } from '@/hooks/useTheme';
import { UnitProvider, useUnits } from '@/hooks/useUnits';
import type { Tab } from '@/hooks/useHashTab';

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

      <main className="flex-1 max-w-2xl lg:max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
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
