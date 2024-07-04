import { createApp } from '@solid-hooks/core'
import { App } from './App'
import '@unocss/reset/normalize.css'
import 'uno.css'
import { ConfigProvider } from './state/editorSettings'
import { ActionProvider } from './state/action'

createApp(App)
  .use(ConfigProvider)
  .use(ActionProvider)
  .mount('#app')
