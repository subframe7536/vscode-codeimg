import { createStore, reconcile } from 'solid-js/store'
import { createContextProvider } from '@solid-hooks/core'
import type { AppConfig } from '../../types/msg'
import { vscode } from '../utils/vscode'

export const [ConfigProvider, useConfig] = createContextProvider(() => {
  const [config, setConfig] = createStore<AppConfig>({
    background: 'linear-gradient(345deg, rgb(180 218 255) 0%, rgb(232 209 255) 100%)',
    boxShadow: 'medium',
    containerPadding: '3rem',
    fontLigatures: '"calt"',
    roundedCorners: '1rem',
    scale: 2,
    showLineNumbers: true,
    showWindowControls: true,
    showWindowTitle: true,
    tabSize: 2,
    debounce: true,
    windowControlsColor: true,
    format: 'png',
    border: true,
  })
  vscode.listen('get-config', data => setConfig(reconcile(data)))
  return config
})
