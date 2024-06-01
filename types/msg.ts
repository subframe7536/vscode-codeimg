import type { Config } from './config'

export type BasicSettings = {
  fontLigatures: string
  tabSize: number
}

export type AppConfig = Config & BasicSettings

export type MsgMain2Renderer = {
  type: 'update-code'
  data: string
} | {
  type: 'get-config'
  data: AppConfig
} | {
  type: 'change-theme'
  data: 'dark' | 'light'
}

export type Recordify<T extends Record<'type' | 'data', any>> = {
  [K in T['type']]: Extract<T, { type: K }>['data']
}

export type MsgRenderer2Main = {
  type: 'save-img'
  data: string
} | {
  type: 'set-config'
  data: Partial<Config>
}
