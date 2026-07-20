import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import polyfills from 'rollup-plugin-polyfill-node';
import inject from '@rollup/plugin-inject';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/verifier-iife.js',
      format: 'iife',
      name: 'Verifier',
      generatedCode: 'es2015',
      interop: 'auto',
      inlineDynamicImports: true
    }
  ],
  plugins: [
    {
      name: 'strip-node-protocol',
      resolveId (id) {
        if (id.startsWith('node:')) {
          return this.resolve(id.slice(5));
        }
      }
    },
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs({ defaultIsModuleExports: true }),
    polyfills(),
    inject({
      Buffer: ['buffer', 'Buffer'],
      process: ['process', 'default']
    }),
    typescript({
      include: ['src/**/*.ts'],
      exclude: ['node_modules/**']
    }),
    json(),
    terser()
  ]
};
