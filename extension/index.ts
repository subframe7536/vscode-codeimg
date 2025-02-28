import type { ExtensionContext } from 'vscode'

import { commands, StatusBarAlignment, window } from 'vscode'

import { commands as cmds, displayName } from '../config/generated/meta'
import { render } from './panel'

let dispose: VoidFunction | undefined
export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand(cmds.open, async () => {
      dispose = await render(context, 'empty')
    }),
    commands.registerCommand(cmds.generateCode, async () => {
      dispose = await render(context, 'editor')
    }),
    commands.registerCommand(cmds.generateTerminal, async () => {
      dispose = await render(context, 'terminal')
    }),
  )

  const item = window.createStatusBarItem(StatusBarAlignment.Left)
  item.command = cmds.open
  item.text = displayName
  item.show()
  context.subscriptions.push(item)
}

export function deactivate() {
  dispose?.()
}
