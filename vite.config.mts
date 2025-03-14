import vscode from '@tomjs/vite-plugin-vscode'
import uno from 'unocss/vite'
import { defineConfig } from 'vite'
import cleanCss from 'vite-plugin-clean-css'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [
    uno(),
    solid(),
    vscode({
      webview: {
        csp: `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src {{cspSource}} data: https: ; style-src {{cspSource}} 'unsafe-inline'; script-src 'nonce-{{nonce}}' 'unsafe-eval';">`,
      },
    }),
    cleanCss({
      level: {
        2: {
          restructureRules: true,
          mergeSemantically: true,
        },
      },
    }),
  ],
})
