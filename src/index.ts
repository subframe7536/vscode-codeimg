import { createApp } from '@solid-hooks/core'

import { App } from './App'
import { ActionProvider } from './state/action'
import { ConfigProvider } from './state/editorSettings'

import '@unocss/reset/normalize.css'
import 'uno.css'

createApp(App)
  .use(ConfigProvider)
  .use(ActionProvider)
  .mount('#app')
