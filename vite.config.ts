import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@life/core/engine': path.resolve(__dirname, 'packages/core/src/data/lifeosEngine.ts'),
      '@life/core/types': path.resolve(__dirname, 'packages/core/src/types/lifeos.ts'),
      '@life/core/finance': path.resolve(__dirname, 'packages/core/src/data/finance.ts'),
      '@life/core/health': path.resolve(__dirname, 'packages/core/src/data/health.ts'),
      '@life/core/housing': path.resolve(__dirname, 'packages/core/src/data/housing.ts'),
      '@life/core/growth': path.resolve(__dirname, 'packages/core/src/data/growth.ts'),
      '@life/core/onboarding': path.resolve(__dirname, 'packages/core/src/data/onboarding.ts'),
      '@life/core/gambits': path.resolve(__dirname, 'packages/core/src/data/gambits.ts'),
      '@life/core/weeklyRecap': path.resolve(__dirname, 'packages/core/src/data/weeklyRecap.ts'),
      '@life/core': path.resolve(__dirname, 'packages/core/src/index.ts'),
      '@life/phone/components': path.resolve(__dirname, 'apps/phone/src/components'),
      '@life/phone': path.resolve(__dirname, 'apps/phone/src/index.ts'),
      '@life/web': path.resolve(__dirname, 'apps/web/src/index.ts'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: { react: ['react', 'react-dom', 'react/jsx-runtime'] },
      },
    },
  },
});
