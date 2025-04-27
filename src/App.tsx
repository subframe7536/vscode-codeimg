import { createRef } from '@solid-hooks/core'
import { useColorMode } from '@solid-hooks/core/web'
import { cls } from 'cls-variant'

import ActionPanel from './components/ActionPanel'
import CodeBlock from './components/CodeBlock'
import { useOperate } from './state/action'
import { useSettings } from './state/editorSettings'
import { vscode } from './utils/vscode'

export function App() {
  const codeblock = createRef<HTMLDivElement>()
  const [, setMode] = useColorMode({
    initialMode: document.body.getAttribute('data-vscode-theme-kind') === 'vscode-dark' ? 'dark' : 'light',
  })
  vscode.listen('change-theme', setMode)
  const [settings] = useSettings()
  const [operate] = useOperate()

  return (
    <>
      <ActionPanel codeblockRef={codeblock} />
      <div class="max-w-full overflow-x-scroll">
        <div
          ref={codeblock}
          class={cls(
            'w-fit m-(x-auto b-6)',
            !operate().flashing && 'bg-pattern',
            settings().plain ? 'my-0' : 'my-4',
          )}
        >
          <CodeBlock />
        </div>
      </div>
    </>
  )
}
