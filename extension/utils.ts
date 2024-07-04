import { type ExtensionContext, Uri, type Webview } from 'vscode'
import { window, workspace } from 'vscode'
import type { Promisable } from '@subframe7536/type-utils'
import type { Config } from '../types/config'
import type { BasicSettings, SaveImgMsgData } from '../types/msg'
import { EXTENSION_NAME_LOWER } from './constant'

export const DEV_SERVER = process.env.VITE_DEV_SERVER_URL
export function setupHtml(webview: Webview, context: ExtensionContext) {
  return DEV_SERVER
    ? __getWebviewHtml__(DEV_SERVER)
    : __getWebviewHtml__(webview, context)
}

function getSettings(section: string, keys: string[]) {
  const settings = workspace.getConfiguration(section)
  return keys.reduce((acc, k) => {
    acc[k] = settings.get(k)
    return acc
  }, {} as any)
}

export async function updateSettings(settings: Partial<Config>) {
  const config = workspace.getConfiguration()
  for (const [key, value] of Object.entries(settings)) {
    await config.update(`${EXTENSION_NAME_LOWER}.${key}`, value)
  }
}

let lastUsedImageUri: Uri | undefined

export async function saveImage(data: SaveImgMsgData) {
  if (!lastUsedImageUri) {
    const dir = workspace.workspaceFolders?.[0]?.uri.fsPath ?? ''
    lastUsedImageUri = Uri.file(`${dir}/${data.fileName}`)
  }
  const uri = await window.showSaveDialog({
    filters: { Images: [data.format] },
    defaultUri: lastUsedImageUri,
  })
  lastUsedImageUri = uri
  uri && await workspace.fs.writeFile(uri, Uint8Array.from(atob(data.base64), c => c.charCodeAt(0)))
}

export function getConfig() {
  const editorSettings = getSettings('editor', ['fontLigatures', 'tabSize']) as BasicSettings
  const editor = window.activeTextEditor

  const tabSize = editor?.options.tabSize
  if (tabSize && tabSize !== 'auto') {
    editorSettings.tabSize = tabSize as number
  }

  /// keep-sorted
  const items: (keyof Config)[] = [
    'background',
    'border',
    'boxShadow',
    'containerPadding',
    'debounce',
    'format',
    'roundedCorners',
    'scale',
    'showLineNumbers',
    'showWindowControls',
    'showWindowTitle',
    'windowControlsColor',
  ]

  const extensionSettings = getSettings(EXTENSION_NAME_LOWER, items) as Config

  let windowTitle = ''
  if (editor && extensionSettings.showWindowTitle) {
    const activeFileName = editor.document.uri.path.split('/').pop()
    windowTitle = `${workspace.name} - ${activeFileName}`
  }

  return {
    ...editorSettings,
    ...extensionSettings,
    windowTitle,
  }
}

export function debounce(fn: (...args: any[]) => Promisable<void>, delay: number) {
  let timer: NodeJS.Timeout | null
  return (...args: any[]) => {
    timer && clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function getEditorTitle(): string {
  return window.activeTextEditor?.document.uri.path.split('/').pop() ?? ''
}
