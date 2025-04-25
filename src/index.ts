import { createApp } from '@solid-hooks/core'
import { GlobalStateProvider } from '@solid-hooks/state'

import { App } from './App'

import '@unocss/reset/normalize.css'
import 'uno.css'

createApp(App)
  .use(GlobalStateProvider)
  .mount('#app')
