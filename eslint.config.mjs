import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['lib/', 'dist/', 'coverage/']
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        'args': 'none',
        'caughtErrors': 'none'
      }],
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-undef': 'off'
    }
  }
);
