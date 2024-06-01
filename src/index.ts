import { createApp } from '@solid-hooks/core'
import { App } from './App'
import '@unocss/reset/normalize.css'
import 'uno.css'
import { ConfigProvider } from './state/editorSettings'

createApp(App)
  .use(ConfigProvider)
  .mount('#app')
