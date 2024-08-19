const { defineEslintConfig } = require('@subframe7536/eslint-config')

module.exports = defineEslintConfig({
  solid: true,
  type: 'app',
  ignoreAll: 'config.mjs',
})
