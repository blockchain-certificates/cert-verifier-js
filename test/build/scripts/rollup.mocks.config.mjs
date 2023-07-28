import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';

// run manually this script
export default {
  input: 'test/build/mocks/FakeXmlHttpRequest.js',
  output: [
    {
      file: 'test/build/mocks/FakeXmlHttpRequest.iife.js',
      format: 'iife',
      name: 'mockXHR',
      generatedCode: 'es2015'
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
