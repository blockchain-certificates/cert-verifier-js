export default {
  input: 'lib/index.js',
  output: [
    {
      file: 'verifier.js',
      format: 'cjs'
    },
    {
      file: 'verifier-es.js',
      format: 'es'
    }
  ]
};
