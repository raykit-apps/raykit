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
      'no-console': 'off',
      'n/prefer-global/process': 'off',
      'no-control-regex': 'off',
    },
  },
)
