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
      // Stage 10: 99/96/99/99 — raised after Coverage Stage 10
      // (MethodologyInfo reference-link branches, caffeineCalculator
      // invalid-input branches, caffeineMetabolism dead-code removal +
      // bedtime projection + input-validation guards, SensitivityCharts
      // flat-heatmap branch + dead `?? 0` guard removal). All four targets
      // now 100% branches. Prior stage: 97/93/97/98.
      thresholds: { statements: 99, branches: 96, functions: 99, lines: 99 },
    },
  },
});
