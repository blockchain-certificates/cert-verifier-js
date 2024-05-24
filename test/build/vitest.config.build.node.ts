import { defineConfig } from 'vite';
export default defineConfig({
  test: {
    name: 'verifier-node',
    environment: 'node',
    include: ['verifier-node.test.build.ts']
  }
});
