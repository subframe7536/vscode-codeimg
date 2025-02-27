import type { AppConfig } from '../../config/msg'

import { createContextProvider } from '@solid-hooks/core'
import { createStore, reconcile } from 'solid-js/store'

import { scopedConfigs } from '../../config/generated/meta'
import { vscode } from '../utils/vscode'

export const [ConfigProvider, useConfig] = createContextProvider(() => {
  const [config, setConfig] = createStore<AppConfig>({
    fontLigatures: '"calt"',
    tabSize: 2,
    terminalFontSize: '14px',
    terminalFontFamily: 'var(--vscode-editor-font-family)',
    ...scopedConfigs.defaults,
  })
  vscode.listen('get-config', data => setConfig(reconcile(data)))
  return config
})
