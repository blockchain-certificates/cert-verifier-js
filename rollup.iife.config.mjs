import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import polyfills from 'rollup-plugin-polyfill-node';
import { terser } from 'rollup-plugin-terser';

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
    resolve({
      browser: true,
      preferBuiltins: true
    }),
    typescript(),
    commonjs(),
    json(),
    globals(),
    builtins(),
    polyfills(),
    terser()
  ]
};
