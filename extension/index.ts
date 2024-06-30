import type { ExtensionContext } from 'vscode'
import { commands } from 'vscode'
import { contributes } from '../package.json'
import { render } from './panel'

let dispose: VoidFunction | undefined
export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand(contributes.commands[0].command, async () => {
      dispose = await render(context)
    }),
  )
}

export function deactivate() {
  dispose?.()
}
