import type { Disposable, ExtensionContext, Selection, WebviewPanel } from 'vscode'
import { ColorThemeKind, ViewColumn, commands, window, workspace } from 'vscode'
import type { MsgMain2Renderer, MsgRenderer2Main } from '../types/msg'
import { DEV_SERVER, getConfig, saveImage, setupHtml, updateSettings } from './utils'
import { EXTENSION_NAME, EXTENSION_NAME_LOWER } from './constant'

let webviewPanel: WebviewPanel | undefined
const _disposables: Disposable[] = []

export async function sendToWebview(message: MsgMain2Renderer) {
  await webviewPanel?.webview.postMessage(message)
}

async function handleSelection(selections: readonly Selection[] | undefined = window.activeTextEditor?.selections) {
  if (selections?.length === 1 && !selections[0].isEmpty) {
    await commands.executeCommand('editor.action.clipboardCopyWithSyntaxHighlightingAction')
    await sendToWebview({
      type: 'update-code',
      data: window.activeTextEditor?.document.uri.path.split('/').pop() ?? '',
    })
  }
}

export function render(context: ExtensionContext): VoidFunction {
  if (webviewPanel) {
    webviewPanel.reveal(ViewColumn.Beside)
  } else {
    webviewPanel = window.createWebviewPanel(
      EXTENSION_NAME,
      EXTENSION_NAME,
      { viewColumn: ViewColumn.Beside, preserveFocus: true },
      { enableScripts: true },
    )

    webviewPanel.onDidDispose(() => {
      webviewPanel?.dispose()
      webviewPanel = undefined

      // Dispose of all disposables (i.e. commands) for the current webview panel
      while (_disposables.length) {
        const disposable = _disposables.pop()
        if (disposable) {
          disposable.dispose()
        }
      }
    }, null, _disposables)

    webviewPanel.webview.html = setupHtml(webviewPanel.webview, context)
    _disposables.push(
      webviewPanel.webview.onDidReceiveMessage(
        async (message: MsgRenderer2Main) => {
          switch (message.type) {
            case 'save-img':
              await saveImage(message.data)
              break
            case 'set-config':
              await updateSettings(message.data)
              break
          }
        },
        undefined,
        _disposables,
      ),
    )
    sendToWebview({ type: 'get-config', data: getConfig() })
  }

  _disposables.push(
    bindThemeChange(),
    bindSelectionEvents(),
    bindConfigurationEvents(),
  )

  return webviewPanel.dispose
}

function bindThemeChange() {
  return window.onDidChangeActiveColorTheme(
    ({ kind }) => {
      let data: 'dark' | 'light'
      switch (kind) {
        case ColorThemeKind.HighContrast:
        case ColorThemeKind.Dark:
          data = 'dark'
          break
        case ColorThemeKind.HighContrastLight:
        case ColorThemeKind.Light:
          data = 'light'
          break
      }
      // handleSelection()
      sendToWebview({ type: 'change-theme', data })
    },
  )
}
function bindSelectionEvents() {
  handleSelection()
  DEV_SERVER && setImmediate(() => setTimeout(() => handleSelection(), 1000))
  return window.onDidChangeTextEditorSelection(
    e => handleSelection(e.selections),
  )
}

function bindConfigurationEvents() {
  return workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration(EXTENSION_NAME_LOWER) || e.affectsConfiguration('editor')) {
      sendToWebview({ type: 'get-config', data: getConfig() })
    }
  })
}
