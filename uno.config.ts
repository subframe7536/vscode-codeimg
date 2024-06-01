import { defineConfig } from 'unocss/vite'
import { presetAttributify, presetIcons, presetUno, transformerVariantGroup } from 'unocss'
import presetAnimations from 'unocss-preset-animations'
import { presetShadcn } from 'unocss-preset-shadcn'

export default defineConfig({
  presets: [
    presetUno({
      dark: {
        dark: '[data-kb-theme="dark"]',
      },
    }),
    presetIcons({
      scale: 1.2,
      unit: 'rem',
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
    presetAnimations(),
    presetShadcn({
      color: 'slate',
    }),
  ],
  rules: [
    [/^config-style-padding$/, () => ({ padding: 'var(--padding)' })],
    [/^config-style-bg$/, () => ({ background: 'var(--bg)' })],
    [/^config-style-radius$/, () => ({ 'border-radius': 'var(--radius)' })],
    [/^config-style-liga$/, () => ({ 'font-feature-settings': 'var(--liga)' })],
    [/^config-style-tab$/, () => ({ 'tab-size': 'var(--tab,2)' })],
    [/^title-size$/, () => ({ 'font-size': 'calc(var(--vscode-editor-font-size) * 0.75)' })],
    [/^glass-border$/, () => ({ 'box-shadow': 'rgba(0 0 0 / 0.1) 0px 0px 0px 1px, rgba(0 0 0 / 0.9) 0px 0px 0px 1px, rgba(255 255 255 / 0.4) 0px 0px 0px 1.5px inset, rgba(0 0 0 / 0.4) 0px 30px 55px 0px' })],
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
      `,
    },
  ],
  safelist: [
    'shadow-sm',
    'shadow-lg',
    'shadow-2xl',
    'w-48',
    'w-12',
    'h-56',
    'h-4',
  ],
})
