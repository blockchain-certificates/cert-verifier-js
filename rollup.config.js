import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import replace from 'rollup-plugin-re';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';

export default {
  input: 'lib/index.js',
  name: 'Verifier',
  output: [
    {
      file: 'verifier.js',
      format: 'cjs'
    },
    {
      file: 'verifier-es.js',
      format: 'es'
    }
  ],
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: true
    }),
    // https://github.com/rollup/rollup-plugin-commonjs/issues/166
    // fix issue with jsonld
    replace({
      patterns: [
        {
          // regexp match with resolved path
          match: /jsonld.js/,
          // string or regexp
          test: 'global = window;',
          // string or function to replaced with
          replace: '',
        },
        {
          // regexp match with resolved path
          match: /jsonld.js/,
          // string or regexp
          test: 'global = self;',
          // string or function to replaced with
          replace: '',
        },
        {
          // regexp match with resolved path
          match: /jsonld.js/,
          // string or regexp
          test: 'global = $;',
          // string or function to replaced with
          replace: '',
        }
      ]

    }),
    commonjs({
      namedExports: {
        'debug': ['debug'],
        'bitcoinjs-lib': ['bitcoin'],
        'jsonld': ['jsonld']
      }
    }),
    json(),
    builtins(),
    globals()
  ]
};
