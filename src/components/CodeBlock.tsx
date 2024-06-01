import { For, Show, createMemo, createSignal } from 'solid-js'
import { useWindowListener } from '@solid-hooks/core/web'
import { vscode } from '../utils/vscode'
import { useConfig } from '../state/editorSettings'

function getClipboardHtml(transfer: DataTransfer | null) {
  if (transfer) {
    const html = transfer.getData('text/html')
    if (html) {
      const template = document.createElement('template')
      template.innerHTML = html
      return template.content
    }
  }
}

function useSelectionCode() {
  const [lines, setLines] = createSignal<Element[]>([])
  const [style, setStyle] = createSignal('')
  const [title, setTitle] = createSignal('')

  const config = useConfig()

  let hasPermission = false
  vscode.listen('update-code', async (t) => {
    document.execCommand('paste')
    setTitle(t)

    try {
      if (!hasPermission) {
        await navigator.permissions.query({ name: 'clipboard-write' as any })
        hasPermission = true
      }
      await navigator.clipboard.writeText('')
    } catch (ignore) { }
  })
  useWindowListener('paste', (e) => {
    e.preventDefault()
    const data = getClipboardHtml(e.clipboardData)
    if (data) {
      const root = data.querySelector('div')
      if (root) {
        setStyle(root.style.cssText)
        setLines(Array.from(root.querySelectorAll(':scope > *')))
      }
    }
  })

  return [
    // eslint-disable-next-line solid/reactivity
    createMemo(() => lines()),
    // eslint-disable-next-line solid/reactivity
    createMemo(() => style()),
    // eslint-disable-next-line solid/reactivity
    createMemo(() => config.showWindowTitle ? title() : ' '),
  ] as const
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
  const [lines, style, title] = useSelectionCode()
  const config = useConfig()
  const boxShadow = createMemo(() => {
    switch (config.boxShadow) {
      case 'small':
        return 'sm'
      case 'medium':
        return 'lg'
      case 'large':
        return '2xl'
    }
  })
  return (
    <div class="config-style-(bg padding radius liga tab) w-fit">
      <div class={`shadow-${boxShadow()} shadow-(gray-600 op-50) config-style-radius`}>
        <div
          style={style()}
          class="w-fit min-w-80 p-(t-2 r-7 b-4 l-3) relative config-style-radius glass-border"
        >
          <Show when={config.showWindowControls}>
            <div
              class="size-3.5 m-(l-8 block-2) bg-#ffbd2e absolute rounded-full before:(content-empty size-3.5 right-6 bg-#ff544d pos-absolute rounded-full) after:(content-empty size-3.5 left-6 bg-#28c93f pos-absolute rounded-full)"
            />
          </Show>
          <Show when={config.showWindowTitle || config.showWindowControls}>
            <div class="w-full text-center title-size">{title()}</div>
          </Show>
          <div class="m-t-2" un-children="flex-(~ row)">
            <For each={lines()}>
              {(line, idx) => <CodeLine line={line} index={idx()} />}
            </For>
          </div>
        </div>
      </div>
    </div>
  )
}
