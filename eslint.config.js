import antfu from '@antfu/eslint-config'

export default antfu(
  {
    formatters: true,
    svelte: true,
    typescript: true,
  },
  {
    // Without `files`, they are general rules for all files
    rules: {
      'n/prefer-global/process': 'off',
      'no-control-regex': 'off',
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'off',
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    },
    ignores: [
      '**/.sveltekit',
    ],
  },
)
