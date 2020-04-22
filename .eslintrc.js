module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'standard-with-typescript',
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    project: './tsconfig.json'
  },
  rules: {
    'semi': 'off',
    '@typescript-eslint/semi': ['error', 'always'],
    '@typescript-eslint/no-empty-function': ['error', { 'allow': ['arrowFunctions'] }],
    '@typescript-eslint/member-delimiter-style': ['error', { 'multiline': { 'delimiter': 'semi', 'requireLast': true }}]
  }
};
