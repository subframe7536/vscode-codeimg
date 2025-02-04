import type { Config } from '../types/config'
import type { BasicSettings, SaveImgMsgData } from '../types/msg'
import { env, type ExtensionContext, Uri, type Webview } from 'vscode'
import { window, workspace } from 'vscode'
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

let lastDir: string | undefined

export async function saveImage(data: SaveImgMsgData) {
  if (!lastDir) {
    lastDir = workspace.workspaceFolders?.[0]?.uri.fsPath ?? ''
  }
  const uri = await window.showSaveDialog({
    filters: { Images: [data.format] },
    defaultUri: Uri.file(`${lastDir}/${data.fileName}`),
  })
  if (uri) {
    await workspace.fs.writeFile(
      uri,
      Uint8Array.from(atob(data.base64), c => c.charCodeAt(0)),
    )
    lastDir = uri.fsPath.split('/').slice(0, -1).join('/')
    window.showInformationMessage('Image saved successfully 🚀', 'Open')
      .then(value => value === 'Open' && env.openExternal(uri))
  }
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

export function getEditorTitle(): string {
  return window.activeTextEditor?.document.uri.path.split('/').pop() ?? ''
}
