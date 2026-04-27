import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 15000,
    env: Object.fromEntries(
      Object.entries(process.env)
        .filter(([k]) => k.startsWith('BGM_'))
        .map(([k, v]) => [k, v ?? '']),
    ),
    reporters: ['verbose'],
    fileParallelism: false,
  },
});
