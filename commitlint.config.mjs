export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-empty': [2, 'never'],
    'scope-case': [2, 'always', ['pascal-case', 'camel-case', 'lower-case', 'upper-case']],
    'header-max-length': [0, 'always', 96]
  }
};
