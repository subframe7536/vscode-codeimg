import type { ConfigShorthandTypeMap } from '../config/generated/meta'
import type { AppConfig, EditorSettings, SaveImgMsgData, TerminalSettings } from '../config/msg'
import type { ExtensionContext, Webview } from 'vscode'

import { env, UIKind, Uri, window, workspace } from 'vscode'

import { scopedConfigs } from '../config/generated/meta'

export const isDesktop = env.uiKind === UIKind.Desktop

export const DEV_SERVER = process.env.VITE_DEV_SERVER_URL
export function setupHtml(webview: Webview, context: ExtensionContext) {
  return __getWebviewHtml__({
    serverUrl: DEV_SERVER,
    webview,
    context,
    injectCode: `<script>window.__isDesktop__=${isDesktop}</script>`,
  })
}

function getSettings(scope: string, keys: string[]) {
  const settings = workspace.getConfiguration(scope)
  return keys.reduce((acc, k) => {
    acc[k] = settings.get(k)
    return acc
  }, {} as any)
}

export async function updateSettings(settings: Partial<ConfigShorthandTypeMap>) {
  const config = workspace.getConfiguration()
  for (const [key, value] of Object.entries(settings)) {
    await config.update(`${scopedConfigs.scope}.${key}`, value)
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

export function getConfig(): AppConfig {
  const editorSettings = getSettings('editor', ['fontLigatures', 'tabSize']) as EditorSettings
  const terminalSettings = getSettings('terminal.integrated', ['fontSize', 'fontFamily']) as TerminalSettings
  const editor = window.activeTextEditor

  const tabSize = editor?.options.tabSize
  if (tabSize && tabSize !== 'auto') {
    editorSettings.tabSize = tabSize as number
  }

  const extensionSettings = getSettings(scopedConfigs.scope, Object.keys(scopedConfigs.defaults))

  return {
    terminalFontFamily: terminalSettings.fontFamily || 'var(--vscode-editor-font-family)',
    terminalFontSize: terminalSettings.fontSize,
    ...editorSettings,
    ...extensionSettings,
  }
}
