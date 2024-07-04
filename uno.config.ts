import { defineConfig } from 'unocss/vite'
import { presetIcons, presetUno, transformerVariantGroup } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
      unit: 'rem',
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  shortcuts: [
    {
      'ui-outline': 'outline-none ring-(2 ring offset-2)',
      'flash': 'overflow-hidden pos-relative after:(animate-[move_.75s_ease-in-out] content-empty absolute -translate-x-100% bg-[linear-gradient(45deg,#fff0_40%,#fff9,#fff0_60%)] -inset-10%)',
    },
    [/ui-disable(-\d+)?$/, ([, num]) => `cursor-not-allowed opacity-${num ? num.substring(1) : 50} pointer-events-none`],
  ],
  rules: [
    [/^config-style-padding$/, () => ({ padding: 'var(--padding)' })],
    [/^config-style-bg$/, () => ({ background: 'var(--bg)' })],
    [/^config-style-radius$/, () => ({ 'border-radius': 'var(--radius)' })],
    [/^config-style-liga$/, () => ({ 'font-feature-settings': 'var(--liga)' })],
    [/^config-style-tab$/, () => ({ 'tab-size': 'var(--tab,2)' })],
    [/^title-size$/, () => ({ 'font-size': 'calc(var(--vscode-editor-font-size) * 0.75)' })],
    [/^glass-border-dark$/, () => ({ 'box-shadow': '0 0 0 1px rgba(0 0 0 / 0.1), 0 0 0 1px rgba(0 0 0 / 0.9), inset 0 0 0 1.5px rgba(255 255 255 / 0.4), 0 30px 55px 0 rgba(0 0 0 / 0.4)' })],
    [/^glass-border-light$/, () => (({ 'box-shadow': '0 0 15px rgba(0 0 0 / .2), 0 0 0 1px rgba(0 0 0 / .1), 0 0 0 1px rgb(0 0 0 / .05), inset 0 0 0 1px rgba(255 255 255 / .15), rgba(0 0 0 / 0.45) 0 25px 20px -20px' })),
    ],
  ],
  transformers: [
    transformerVariantGroup(),
  ],
  preflights: [
    {
      getCSS: () => `
        body {
          padding: 1.5rem;
          background: transparent !important;
        }
        ::selection {
          background: var(--vscode-selection-background);
        }
        @keyframes move { to { transform: translateX(100%); } }
      `,
    },
  ],
  safelist: [
    'shadow-none',
    'shadow-sm',
    'shadow-lg',
    'shadow-2xl',
    'w-48',
    'w-12',
    'h-56',
    'h-4',
  ],
})
