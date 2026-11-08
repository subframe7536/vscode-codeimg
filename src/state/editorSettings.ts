import { createMemo, createRoot } from 'solid-js'
import { createStore, produce } from 'solid-js/store'

import { scopedConfigs } from '../../config/generated/meta'
import type { AppConfig } from '../../config/msg'

type SettingsData = AppConfig & { plain: boolean }

export const useSettings = createRoot(() => {
  const [state, setState] = createStore<SettingsData>({
    plain: false,
    fontLigatures: '"calt"',
    tabSize: 2,
    terminalFontSize: '14px',
    terminalFontFamily: 'var(--vscode-editor-font-family)',
    ...scopedConfigs.defaults,
  })

  const targetBoxShadow = createMemo(() => (state.plain ? 'none' : state.boxShadow))
  const targetBorder = createMemo(() => (state.plain ? false : state.border))
  const targetContainerPadding = createMemo(() => (state.plain ? '0' : state.containerPadding))
  const targetRoundedCorners = createMemo(() => (state.plain ? '0' : state.roundedCorners))
  const targetShowWindowControls = createMemo(() =>
    state.plain ? false : state.showWindowControls,
  )
  const targetShowWindowTitle = createMemo(() => (state.plain ? false : state.showWindowTitle))

  const accessor = Object.assign(() => state, {
    targetBoxShadow,
    targetBorder,
    targetContainerPadding,
    targetRoundedCorners,
    targetShowWindowControls,
    targetShowWindowTitle,
    $patch: (patch: Partial<SettingsData> | ((draft: SettingsData) => void)) => {
      setState(typeof patch === 'function' ? produce(patch) : patch)
    },
  })

  const actions = {
    togglePlain: (checked: boolean) => {
      setState('plain', checked)
    },
  }

  return () => [accessor, actions] as const
})
