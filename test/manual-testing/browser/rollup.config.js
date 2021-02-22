import serve from 'rollup-plugin-serve';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript';
import livereload from 'rollup-plugin-livereload';
import replace from 'rollup-plugin-re';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import fs from 'fs';

const BUILD_OUTPUT_FOLDER = 'test/manual-testing/browser';

export default [
  {
    input: `${BUILD_OUTPUT_FOLDER}/index.js`,
    output: [
      {
        file: `${BUILD_OUTPUT_FOLDER}/index-iife.js`,
        format: 'iife',
        name: 'ManualTest'
      }
    ],
    plugins: [
      replace({
        patterns: [
          {
            match: /jsonld.js/,
            test: 'global = window;',
            replace: ''
          },
          {
            match: /jsonld.js/,
            test: 'global = self;',
            replace: ''
          },
          {
            match: /jsonld.js/,
            test: 'global = $;',
            replace: ''
          },
          // fix jsonld|jsonldjs is not defined
          {
            match: /jsonld.js/,
            test: 'if(typeof jsonld === \'undefined\') {',
            replace: 'if(typeof window.jsonld === \'undefined\') {'
          },
          {
            match: /jsonld.js/,
            test: 'jsonld = jsonldjs = factory;',
            replace: 'window.jsonld = window.jsonldjs = factory;'
          },
          {
            test: 'var version = \'\'',
            replace: 'var version = \'11.0.0\''
          }
        ]
      }),
      commonjs({
        namedExports: {
          debug: ['debug'],
          'bitcoinjs-lib': ['bitcoin'],
          jsonld: ['jsonld']
        }
      }),
      json(),
      globals(),
      builtins(),
      typescript(),
      resolve({
        browser: true,
        preferBuiltins: true,
        extensions: ['.js', '.json']
      }),
      serve({
        contentBase: [BUILD_OUTPUT_FOLDER, 'test/manual-testing/fixtures', 'dist'],
        host: '0.0.0.0',
        port: 8081,
        open: true,
        https: {
          cert: fs.readFileSync(`${BUILD_OUTPUT_FOLDER}/https-cert/cert.pem`),
          key: fs.readFileSync(`${BUILD_OUTPUT_FOLDER}/https-cert/key.pem`)
        }
      }),
      livereload({
        watch: [BUILD_OUTPUT_FOLDER, 'dist']
      })
    ]
  }
];
