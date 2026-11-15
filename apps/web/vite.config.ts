import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

const rootDir = path.resolve(__dirname, '../..');

export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: path.join(rootDir, 'public'),
  resolve: {
    alias: {
      '@life/core/engine': path.join(rootDir, 'packages/core/src/data/lifeosEngine.ts'),
      '@life/core/types': path.join(rootDir, 'packages/core/src/types/lifeos.ts'),
      '@life/core/finance': path.join(rootDir, 'packages/core/src/data/finance.ts'),
      '@life/core/health': path.join(rootDir, 'packages/core/src/data/health.ts'),
      '@life/core/housing': path.join(rootDir, 'packages/core/src/data/housing.ts'),
      '@life/core/growth': path.join(rootDir, 'packages/core/src/data/growth.ts'),
      '@life/core/onboarding': path.join(rootDir, 'packages/core/src/data/onboarding.ts'),
      '@life/core/gambits': path.join(rootDir, 'packages/core/src/data/gambits.ts'),
      '@life/core/weeklyRecap': path.join(rootDir, 'packages/core/src/data/weeklyRecap.ts'),
      '@life/core': path.join(rootDir, 'packages/core/src/index.ts'),
      '@life/phone/components': path.join(rootDir, 'apps/phone/src/components'),
      '@life/phone': path.join(rootDir, 'apps/phone/src/index.ts'),
      '@life/web': path.join(rootDir, 'apps/web/src/index.ts'),
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
