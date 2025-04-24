import type { UIConfig } from '../../config/msg'

import { createContextProvider, createRef } from '@solid-hooks/core'
import { createStore } from 'solid-js/store'

import { scopedConfigs } from '../../config/generated/meta'
import { vscode } from '../utils/vscode'

export const [SettingsProvider, useSettings] = createContextProvider(() => {
  const plain = createRef(false)
  const [config, setConfig] = createStore<UIConfig>({
    fontLigatures: '"calt"',
    tabSize: 2,
    terminalFontSize: '14px',
    terminalFontFamily: 'var(--vscode-editor-font-family)',
    ...scopedConfigs.defaults,
    get targetBoxShadow() {
      return plain() ? 'none' : this.boxShadow
    },
    get targetBorder() {
      return plain() ? false : this.border
    },
    get targetContainerPadding() {
      return plain() ? '0' : this.containerPadding
    },
    get targetRoundedCorners() {
      return plain() ? '0' : this.roundedCorners
    },
    get targetShowWindowControls() {
      return plain() ? false : this.showWindowControls
    },
    get targetShowWindowTitle() {
      return plain() ? false : this.showWindowTitle
    },
  })
  vscode.listen('get-config', data => setConfig(ori => ({ ...ori, ...data })))
  return [config, plain] as const
})
