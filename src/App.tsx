import { useColorMode } from '@solid-hooks/core/web'
import { createRef } from '@solid-hooks/core'
import CodeBlock from './components/CodeBlock'
import ActionPanel from './components/ActionPanel'
import { vscode } from './utils/vscode'

export function App() {
  const codeblock = createRef<HTMLDivElement>()
  const [, setMode] = useColorMode({
    initialMode: document.body.getAttribute('data-vscode-theme-kind') === 'vscode-dark' ? 'dark' : 'light',
  })
  vscode.listen('change-theme', (data) => {
    setMode(data)
  })

  return (
    <>
      <ActionPanel codeblockRef={codeblock} />
      <div class="max-w-full overflow-x-scroll">
        <div ref={codeblock} class="w-fit m-(y-0 x-auto b-6)">
          <CodeBlock />
        </div>
      </div>
    </>
  )
}
