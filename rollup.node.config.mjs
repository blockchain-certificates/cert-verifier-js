import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: [
    {
      dir: 'dist/verifier-node',
      format: 'cjs',
      name: 'Verifier'
    }
  ],
  plugins: [
    resolve({
      preferBuiltins: true,
      mainFields: ['module', 'main'],
      dedupe: ['node-fetch']
    }),
    typescript(),
    commonjs(),
    json()
  ]
};
