import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import polyfills from 'rollup-plugin-polyfill-node';
import globals from 'rollup-plugin-node-globals';
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  input: 'src/index.ts',
  output: [
    {
      dir: 'dist/verifier',
      format: 'cjs',
      name: 'Verifier'
    },
    {
      dir: 'dist/verifier-es',
      format: 'es',
      name: 'Verifier'
    }
  ],
  plugins: [
    resolve({
      browser: true,
      mainFields: ['module', 'import', 'main'],
      preferBuiltins: false,
      extensions: ['.js', '.json']
    }),
    typescript({
      include: ['src/**/*.ts'],
      exclude: ['node_modules/**']
    }),
    commonjs(),
    json(),
    globals(),
    polyfills(),
    visualizer({
      filename: 'bundle-esm-stats.html',
      title: 'Cert-Verifier-JS bundle stats',
      template: 'sunburst',
      open: true,
      gzipSize: true
    })
  ]
};
