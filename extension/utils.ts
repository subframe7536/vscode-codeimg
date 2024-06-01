import type { ExtensionContext, Uri, Webview } from 'vscode'
import { window, workspace } from 'vscode'
import type { Config } from '../types/config'
import type { BasicSettings } from '../types/msg'
import { EXTENSION_NAME_LOWER } from './constant'

export function setupHtml(webview: Webview, context: ExtensionContext) {
  return process.env.VITE_DEV_SERVER_URL
    ? __getWebviewHtml__(process.env.VITE_DEV_SERVER_URL)
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
    await config.update(key, value)
  }
}

let lastUsedImageUri: Uri | undefined

export async function saveImage(data: string) {
  const uri = await window.showSaveDialog({
    filters: { Images: ['png'] },
    defaultUri: lastUsedImageUri,
  })
  lastUsedImageUri = uri
  uri && await workspace.fs.writeFile(uri, Uint8Array.from(atob(data), c => c.charCodeAt(0)))
}

export function getConfig() {
  const editorSettings = getSettings('editor', ['fontLigatures', 'tabSize']) as BasicSettings
  const editor = window.activeTextEditor

  const tabSize = editor?.options.tabSize
  if (tabSize && tabSize !== 'auto') {
    editorSettings.tabSize = tabSize as number
  }

  const extensionSettings = getSettings(EXTENSION_NAME_LOWER, [
    'background',
    'boxShadow',
    'containerPadding',
    'roundedCorners',
    'showWindowControls',
    'showWindowTitle',
    'scale',
    'showLineNumbers',
  ] satisfies (keyof Config)[]) as Config

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
