import type { ExtensionContext } from 'vscode'

import { commands } from 'vscode'

import { commands as cmds } from '../config/generated/meta'
import { render } from './panel'

let dispose: VoidFunction | undefined
export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand(cmds.generateCode, async () => {
      dispose = await render(context)
    }),
    commands.registerCommand(cmds.generateCode, async () => {
      // todo))
      dispose = await render(context)
    }),
  )
}

export function deactivate() {
  dispose?.()
}
