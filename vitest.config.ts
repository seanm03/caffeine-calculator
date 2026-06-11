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
      exclude: ['src/**/*.test.*', 'src/test/**', 'src/vite-env.d.ts', 'src/main.tsx'],
      // Stage 1/5: Set to pass-current levels. Staged trajectory to 75/65/80/75 pre-v1.0
      thresholds: { statements: 25, branches: 25, functions: 45, lines: 25 },
    },
  },
});
