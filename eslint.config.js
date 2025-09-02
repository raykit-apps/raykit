import antfu from '@antfu/eslint-config'

export default antfu(
  {
    formatters: true,
    react: true,
    nextjs: true,
    typescript: true,
  },
  {
    // Without `files`, they are general rules for all files
    rules: {
      'n/prefer-global/process': 'off',
      'no-control-regex': 'off',
      'toml/padding-line-between-pairs': 'off',
      'react-refresh/only-export-components': 'off',
    },
    ignores: [
      '**/crates',
      '**/.next',
      // ...globs
    ],
  },
)
