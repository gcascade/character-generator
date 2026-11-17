/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const fromRoot = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  base: '/character-generator/',
  plugins: [react()],
  resolve: {
    alias: {
      '@Test': fromRoot('./test'),
      '@Components': fromRoot('./src/components'),
      '@Contexts': fromRoot('./src/contexts'),
      '@Types': fromRoot('./src/types'),
      '@Ai': fromRoot('./src/ai'),
    },
  },
  server: {
    open: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
    mockReset: true,
  },
});
