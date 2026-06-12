import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    globals: true,
    // jsdom v25+ (downgraded to ^25.0.1 for Node 20.10 ESM compatibility)
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
      // Stage 4/5: 90/80/83/80. Funcs at 83% — remaining gaps in Recharts SVG
      // callbacks (CustomTooltip, tickFormatters) and hook/provider internals
      // that require browser-level rendering not available in jsdom.
      thresholds: { statements: 90, branches: 80, functions: 83, lines: 80 },
    },
  },
});
