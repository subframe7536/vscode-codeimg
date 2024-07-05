import { useColorMode } from '@solid-hooks/core/web'
import { createRef } from '@solid-hooks/core'
import CodeBlock from './components/CodeBlock'
import ActionPanel from './components/ActionPanel'
import { vscode } from './utils/vscode'
import { useAction } from './state/action'

export function App() {
  const codeblock = createRef<HTMLDivElement>()
  const [, setMode] = useColorMode({
    initialMode: document.body.getAttribute('data-vscode-theme-kind') === 'vscode-dark' ? 'dark' : 'light',
  })
  vscode.listen('change-theme', setMode)
  const { isFlashing } = useAction()

  return (
    <>
      <ActionPanel codeblockRef={codeblock} />
      <div class="max-w-full overflow-x-scroll">
        <div ref={codeblock} class={`w-fit m-(y-0 x-auto b-6) ${isFlashing() ? '' : 'bg-pattern'}`}>
          <CodeBlock />
        </div>
      </div>
    </>
  )
}
