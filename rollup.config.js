import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from 'rollup-plugin-json';
import typescript from 'rollup-plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/verifier.js',
      format: 'cjs',
      name: 'Verifier'
    },
    {
      file: 'dist/verifier-es.js',
      format: 'es',
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
    terser()
  ]
};
