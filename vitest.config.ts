import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
  test: {
    globals: true,
    // jsdom ^26.1.0 — DOM environment for component/integration tests
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    // Skip CSS processing — Tailwind CSS is built at build time, not needed in unit tests
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.*', 'src/test/**', 'src/vite-env.d.ts', 'src/main.tsx', 'src/types/index.ts'],
      // Stage 11: 99.5/98/99.5/99.5 — raised after Coverage Stage 11
      // (all 13 remaining uncovered branches closed: useTheme auto+OS-dark,
      // CoffeeInputs imperial branches, AdvancedOptions dead ref-guard removal
      // + non-numeric temp input, BrewMethodSelector/SegmentedControl
      // unrelated-key paths, DrinkLogForm empty-drinkName, DrinkLogTimeline
      // second-entry edit, ResultsDisplay dead `!result` guard removal,
      // useCaffeineLog dead timestamp-fallback removal). All nine target files
      // now 100% branches. Prior stage: 99/96/99/99.
      thresholds: { statements: 99.5, branches: 98, functions: 99.5, lines: 99.5 },
    },
  },
});
