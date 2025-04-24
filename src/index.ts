import { createApp } from '@solid-hooks/core'

import { App } from './App'
import { ActionProvider } from './state/action'
import { SettingsProvider } from './state/editorSettings'

import '@unocss/reset/normalize.css'
import 'uno.css'

createApp(App)
  .use(SettingsProvider)
  .use(ActionProvider)
  .mount('#app')
