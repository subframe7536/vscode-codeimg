import { useColorMode, useCssVar } from '@solid-hooks/core/web'
import CodeBlock from './components/CodeBlock'
import ActionPanel from './components/ActionPanel'
import { copyToClipboard, saveToLocal } from './utils/image'
import { useConfig } from './state/editorSettings'
import { vscode } from './utils/vscode'

export function App() {
  let codeBlock: HTMLDivElement | undefined
  const [, setMode] = useColorMode({
    initialMode: document.body.getAttribute('data-vscode-theme-kind') === 'vscode-dark' ? 'dark' : 'light',
  })
  vscode.listen('change-theme', (data) => {
    setMode(data)
  })

  const config = useConfig()

  return (
    <>
      <ActionPanel
        $save={() => saveToLocal(config.format, codeBlock, config.scale)}
        $copy={() => copyToClipboard(config.format, codeBlock, config.scale)}
      />
      <div class="max-w-full overflow-x-scroll">
        <div ref={codeBlock} class="w-fit m-(y-0 x-auto b-6)">
          <CodeBlock />
        </div>
      </div>
    </>
  )
}
