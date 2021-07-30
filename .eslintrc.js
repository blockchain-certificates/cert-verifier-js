module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint'
  ],
  extends: [
    'standard-with-typescript',
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parserOptions: {
    project: './tsconfig.json'
  },
  rules: {
    semi: 'off',
    '@typescript-eslint/semi': ['error', 'always'],
    '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],
    '@typescript-eslint/member-delimiter-style': ['error', { multiline: { delimiter: 'semi', requireLast: true } }],
    '@typescript-eslint/interface-name-prefix': [0],
    '@typescript-eslint/strict-boolean-expressions': [0],
    '@typescript-eslint/no-explicit-any': [0], // remove one day, maybe. This is early days so we have some anys.
    '@typescript-eslint/restrict-plus-operands': [0], // when this rule functions correctly, we can remove it. It
    // does not pick up the correct type when returning from a JS function
    '@typescript-eslint/no-inferrable-types': 'off'
  },
  env: {
    jest: true
  }
};
