import antfu from '@antfu/eslint-config'

export default antfu(
  {
    formatters: true,
    typescript: true,
  },
  {
    // Without `files`, they are general rules for all files
    rules: {
      'n/prefer-global/process': 'off',
      'no-control-regex': 'off',
      'no-console': 'off',
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'off',
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/brace-style': 'off',
      'unicorn/error-message': 'off',
      'no-restricted-syntax': 'off',
      'import/no-mutable-exports': 'off',
      // '@typescript-eslint/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      // 'brace-style': ['error', '1tbs'],
      '@typescript-eslint/method-signature-style': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-namespace': 'off',
      'unicorn/no-new-array': 'off',
    },
    ignores: [
      '**/.sveltekit',
    ],
  },
)
