import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import vscode from '@tomjs/vite-plugin-vscode'
import uno from 'unocss/vite'
import cleanCss from 'vite-plugin-clean-css'

export default defineConfig({
  plugins: [
    uno(),
    solid(),
    vscode({
      extension: {
        plugins: [
          {
            name: 'fix-image-csp',
            renderChunk(code) {
              return {
                code: code.replace(
                  'default-src \'none\';',
                  'default-src \'none\'; img-src {{cspSource}} data: https:;',
                ),
              }
            },
          },
        ],
      },
    }),
    cleanCss({ level: 2 }),
  ],
})
