import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';

// run manually this script
export default {
  input: 'test/build/mocks/FakeFetch.js',
  output: [
    {
      file: 'test/build/mocks/FakeFetch.iife.js',
      format: 'iife',
      name: 'mockFetch',
      generatedCode: 'es2015'
    },
    {
      file: 'test/build/mocks/FakeFetch.cjs',
      format: 'cjs'
    }
  ],
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: true,
      extensions: ['.js', '.json']
    }),
    typescript(),
    json()
  ]
};
