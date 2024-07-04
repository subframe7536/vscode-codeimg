import { For, Show, createMemo } from 'solid-js'
import { useCssVar, usePaste } from '@solid-hooks/core/web'
import { createRef } from '@solid-hooks/core'
import { vscode } from '../utils/vscode'
import { useConfig } from '../state/editorSettings'
import { useAction } from '../state/action'

function parseHTML(html: string) {
  const template = document.createElement('template')
  template.innerHTML = html
  return template.content
}

function CodeLine(props: { line: Element, index: number }) {
  const config = useConfig()
  return (
    <div class={!config.showLineNumbers ? 'ml-2.5' : ''}>
      <Show when={config.showLineNumbers}>
        <div class="text-right m-r-5 w-6 color-$vscode-editorLineNumber-foreground whitespace-nowrap select-none">
          {props.index + 1}
        </div>
      </Show>
      {props.line}
    </div>
  )
}

export default function CodeBlock() {
  const lines = createRef<Element[]>([])
  const style = createRef('')

  const config = useConfig()
  const { title, isFlashing: isCoping } = useAction()

  useCssVar('bg', () => config.background)
  useCssVar('padding', () => config.containerPadding)
  useCssVar('radius', () => config.roundedCorners)
  useCssVar('liga', () => config.fontLigatures)
  useCssVar('tab', () => `${config.tabSize}`)

  const paste = usePaste({
    onPaste: (data, mime) => {
      if (mime === 'text/html') {
        const root = parseHTML(data as string)?.querySelector('div')
        if (root) {
          style(root.style.cssText.replace(/background-color:[^;]*;/g, ''))
          const els = Array.from(root.querySelectorAll(':scope > *'))
          if (els.length) {
            lines(els)
          }
        }
      }
    },
    legacy: true,
  })

  vscode.listen('update-code', (t) => {
    title(t || ' ')
    void paste()
  })

  const boxShadow = createMemo(() => {
    switch (config.boxShadow) {
      case 'none':
        return 'none'
      case 'small':
        return 'sm'
      case 'medium':
        return 'lg'
      case 'large':
        return '2xl'
    }
  })
  return (
    <div class={`config-style-(bg padding liga tab radius) w-fit ${isCoping() ? 'flash' : ''}`}>
      <div class={`shadow-${boxShadow()} shadow-(gray-600 op-50) config-style-radius`}>
        <div
          style={style()}
          class={`w-fit min-w-80 p-(t-2 r-7 b-4 l-3) bg-$vscode-editor-background relative config-style-radius ${config.border ? 'glass-border-light dark:glass-border-dark' : ''}`}
        >
          <Show when={config.showWindowControls}>
            <div
              class={`size-3.5 m-(l-8 block-2) absolute rounded-full before:(content-empty size-3.5 right-6 pos-absolute rounded-full) after:(content-empty size-3.5 left-6 pos-absolute rounded-full) ${config.windowControlsColor ? 'bg-#ffbd2e before:bg-#ff544d after:bg-#28c93f' : 'bg-$vscode-editor-inactiveSelectionBackground before:bg-$vscode-editor-inactiveSelectionBackground after:bg-$vscode-editor-inactiveSelectionBackground'}`}
            />
          </Show>
          <Show when={config.showWindowTitle || config.showWindowControls}>
            <div class="w-full text-center title-size select-none">{config.showWindowTitle ? title() : ' '}</div>
          </Show>
          <div class={`mt-2 *:flex-(~ row) ${lines().length === 0 ? 'mt-6' : ''}`}>
            <For each={lines()}>
              {(line, idx) => <CodeLine line={line} index={idx()} />}
            </For>
          </div>
        </div>
      </div>
    </div>
  )
}
