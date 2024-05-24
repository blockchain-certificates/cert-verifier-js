import { defineConfig } from 'vite';
export default defineConfig({
  test: {
    name: 'verifier-es',
    environment: 'jsdom',
    include: ['verifier-es.test.build.ts']
  }
});
