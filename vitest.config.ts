import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage'
    }
  }
});
