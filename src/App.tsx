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
  useCssVar('bg', () => config.background)
  useCssVar('padding', () => config.containerPadding)
  useCssVar('radius', () => config.roundedCorners)
  useCssVar('liga', () => config.fontLigatures)
  useCssVar('tab', () => `${config.tabSize}`)

  return (
    <>
      <div max-w="full" overflow-x="scroll">
        <div ref={codeBlock} class="w-fit m-(y-0 x-auto b-6)">
          <CodeBlock />
        </div>
      </div>
      <ActionPanel
        $save={format => saveToLocal(format, codeBlock, config.scale)}
        $copy={format => copyToClipboard(format, codeBlock, config.scale)}
      />
    </>
  )
}
