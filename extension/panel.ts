import type { MsgMain2Renderer, MsgRenderer2Main } from '../config/msg'
import type { Disposable, ExtensionContext, Selection, WebviewPanel } from 'vscode'

import { ColorThemeKind, commands, ViewColumn, window, workspace } from 'vscode'

import { displayName, extensionId, name } from '../config/generated/meta'
import { debounce } from './debounce'
import { getConfig, saveImage, setupHtml, updateSettings } from './utils'

let webviewPanel: WebviewPanel | undefined
const _disposables: Disposable[] = []

export async function sendToWebview(message: MsgMain2Renderer) {
  await webviewPanel?.webview.postMessage(message)
}

export async function copyTerminalSelectionCode() {
  const terminal = window.activeTerminal
  if (terminal) {
    await commands.executeCommand('workbench.action.terminal.copySelectionAsHtml')
    await sendToWebview({
      type: 'update-code',
      data: {
        title: terminal.name,
        isTerminal: true,
      },
    })
  }
}

async function copyEditorSelectionCode(selections: readonly Selection[] | undefined = window.activeTextEditor?.selections) {
  if (selections?.length === 1 && !selections[0].isEmpty) {
    await commands.executeCommand('editor.action.clipboardCopyWithSyntaxHighlightingAction')
    await sendToWebview({
      type: 'update-code',
      data: {
        title: window.activeTextEditor?.document.uri.path.split('/').pop() ?? '',
        isTerminal: false,
      },
    })
  }
}

export async function render(context: ExtensionContext, type: 'editor' | 'terminal'): Promise<VoidFunction> {
  let selectionDispose: Disposable

  if (webviewPanel) {
    webviewPanel.reveal(ViewColumn.Beside, true)
  } else {
    webviewPanel = window.createWebviewPanel(
      displayName,
      displayName,
      { viewColumn: ViewColumn.Beside, preserveFocus: true },
      { enableScripts: true },
    )

    webviewPanel.onDidDispose(() => {
      webviewPanel?.dispose()
      webviewPanel = undefined

      selectionDispose.dispose()
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
      webviewPanel.onDidChangeViewState(async () => {
        if (webviewPanel?.visible) {
          await sendToWebview({ type: 'get-config', data: getConfig() })
        }
      }),
      webviewPanel.webview.onDidReceiveMessage(
        async (message: MsgRenderer2Main) => {
          switch (message.type) {
            case 'save-img':
              await saveImage(message.data)
              break
            case 'set-config':
              await updateSettings(message.data)
              if (message.data.debounce !== undefined) {
                selectionDispose.dispose()
                selectionDispose = await bindSelectionEvents(message.data.debounce)
              }
              break
            case 'show-settings':
              await commands.executeCommand('workbench.action.openSettings', `@ext:${extensionId}`)
          }
        },
        undefined,
        _disposables,
      ),
    )
  }

  await sendToWebview({ type: 'get-config', data: getConfig() })

  switch (type) {
    case 'editor':
      await copyEditorSelectionCode()
      break
    case 'terminal':
      await copyTerminalSelectionCode()
      break
  }

  selectionDispose = await bindSelectionEvents()

  _disposables.push(
    bindThemeChange(),
    bindConfigurationEvents(),
  )

  return webviewPanel.dispose
}

function bindThemeChange() {
  return window.onDidChangeActiveColorTheme(
    async ({ kind }) => {
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
      await sendToWebview({ type: 'change-theme', data })
    },
  )
}

async function bindSelectionEvents(useDebounce = true) {
  return window.onDidChangeTextEditorSelection(
    useDebounce
      ? debounce(async e => await copyEditorSelectionCode(e.selections), 250)
      : e => copyEditorSelectionCode(e.selections),
  )
}

function bindConfigurationEvents() {
  return workspace.onDidChangeConfiguration(async (e) => {
    if (e.affectsConfiguration(name) || e.affectsConfiguration('editor')) {
      await sendToWebview({ type: 'get-config', data: getConfig() })
    }
  })
}
