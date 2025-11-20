import { defineEslintConfig } from '@subframe7536/eslint-config'

export default defineEslintConfig({
  type: 'app',
  ignoreAll: 'config.mjs',
  overrideRules: {
    'style/operator-linebreak': ['error', 'before', { overrides: { '=': 'after' } }],
  },
})
