import { defineConfig } from 'vite';
export default defineConfig({
  test: {
    name: 'verifier-cjs',
    environment: 'jsdom',
    include: ['verifier.test.build.ts']
  }
});
