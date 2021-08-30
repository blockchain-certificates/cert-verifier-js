import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from 'rollup-plugin-json';
import typescript from 'rollup-plugin-typescript';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import babel from 'rollup-plugin-babel';
import polyfills from 'rollup-plugin-polyfill-node';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/verifier-iife.js',
      format: 'iife',
      name: 'Verifier'
    }
  ],
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: true,
      extensions: ['.js', '.json']
    }),
    typescript(),
    commonjs(),
    json(),
    globals(),
    builtins(),
    polyfills(),
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true,
      presets: [['@babel/env', {
        targets: {
          ie: '11'
        },
        debug: false,
        useBuiltIns: 'usage',
        corejs: 3,
        shippedProposals: true
      }]]
    }),
    terser()
  ]
};
