import { subfLint } from '@subf/config/oxlint'

export default subfLint({
  solid: true,
  unocss: true,
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      rules: {
        'uno/order': [
          'warn',
          {
            unoFunctions: ['cls', 'cn', 'cva'],
            unoVariables: ['^cls', 'classNames?$'],
          },
        ],
      },
    },
  ],
  options: {
    typeAware: true,
  },
})
