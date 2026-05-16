import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

import { getE2EMaxWorkers } from './test/containers/e2e-worker-schema';

export default defineConfig({
  oxc: false,
  test: {
    environment: 'node',
    globalSetup: ['./test/global-setup-e2e.ts'],
    globals: true,
    setupFiles: ['./test/setup-e2e.ts'],
    include: ['test/e2e/**/*.e2e-spec.ts'],
    fileParallelism: true,
    hookTimeout: 120_000,
    maxWorkers: getE2EMaxWorkers(),
    passWithNoTests: true,
    testTimeout: 120_000,
  },
  plugins: [swc.vite({ module: { type: 'es6' } })],
});
