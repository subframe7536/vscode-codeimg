import type { ScopedConfigKeyTypeMap } from './generated/meta'

export interface EditorSettings {
  fontLigatures: boolean | string
  tabSize: number | string
}

export interface TerminalSettings {
  fontSize: string
  fontFamily: string
}

export type AppConfig = ScopedConfigKeyTypeMap & EditorSettings & {
  [K in keyof TerminalSettings as `terminal${Capitalize<K>}`]: TerminalSettings[K]
}

export type MsgMain2Renderer = {
  type: 'update-code'
  data: {
    title: string
    isTerminal: boolean
    startNumber?: number
  }
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

export type SaveImgMsgData = {
  fileName: string
  format: string
  base64: string
}

export type MsgRenderer2Main =
  | {
    type: 'save-img'
    data: SaveImgMsgData
  }
  | {
    type: 'set-config'
    data: Partial<ScopedConfigKeyTypeMap>
  }
  | {
    type: 'show-settings'
    data?: undefined
  }
  | {
    type: 'capture-terminal'
    data?: undefined
  }
