import type { AppConfig } from '../../config/msg'

import { defineState } from '@solid-hooks/state'

import { scopedConfigs } from '../../config/generated/meta'

const init: AppConfig & { plain: boolean } = {
  plain: false,
  fontLigatures: '"calt"',
  tabSize: 2,
  terminalFontSize: '14px',
  terminalFontFamily: 'var(--vscode-editor-font-family)',
  ...scopedConfigs.defaults,
}
export const useSettings = defineState('settings', {
  init,
  getters: state => ({
    targetBoxShadow() {
      return state.plain ? 'none' : state.boxShadow
    },
    targetBorder() {
      return state.plain ? false : state.border
    },
    targetContainerPadding() {
      return state.plain ? '0' : state.containerPadding
    },
    targetRoundedCorners() {
      return state.plain ? '0' : state.roundedCorners
    },
    targetShowWindowControls() {
      return state.plain ? false : state.showWindowControls
    },
    targetShowWindowTitle() {
      return state.plain ? false : state.showWindowTitle
    },
  }),
  actions: setState => ({
    togglePlain: () => {
      setState('plain', prev => !prev)
    },
  }),
})
