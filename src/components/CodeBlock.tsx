import { createArray, createRef } from '@solid-hooks/core'
import { cls, useCssVar, usePaste } from '@solid-hooks/core/web'
import { createMemo, For, Show } from 'solid-js'

import { useAction } from '../state/action'
import { useConfig } from '../state/editorSettings'
import { vscode } from '../utils/vscode'

function parseHTML(html: string) {
  const template = document.createElement('template')
  template.innerHTML = html
  return template.content
}

export default function CodeBlock() {
  const lines = createRef<Element[]>([])
  const style = createRef('')
  const highlightArray = createRef(createArray([] as (0 | 1 | 2 | 3)[]))

  const config = useConfig()
  const { title, isFlashing } = useAction()

  useCssVar('bg', () => config.background)
  useCssVar('padding', () => config.containerPadding)
  useCssVar('radius', () => config.roundedCorners)
  useCssVar(
    'liga',
    () => typeof config.fontLigatures === 'string'
      ? config.fontLigatures
      : config.fontLigatures
        ? '"calt", "liga"'
        : 'none',
  )
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

  vscode.listen('update-code', async (t) => {
    title(t || ' ')
    await paste()
    highlightArray([])
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

  function CodeLine(props: { index: number, line: Element }) {
    const bgStatus = createMemo(() => highlightArray()[props.index])
    const bg = createMemo(() => {
      switch (bgStatus()) {
        case 1:
          return 'bg-$vscode-editor-wordHighlightStrongBackground'
        case 2:
          return 'bg-$vscode-inlineChatDiff-inserted'
        case 3:
          return 'bg-$vscode-inlineChatDiff-removed'
        default:
          return ''
      }
    })
    const lineNumber = createMemo(() => {
      switch (bgStatus()) {
        case 2:
          return '+'
        case 3:
          return '-'
        default:
          return props.index
      }
    })
    const roundBottom = createMemo(() => bgStatus() && highlightArray()[props.index + 1] ? 'rounded-b-0' : 'rounded-b-2')
    const roundTop = createMemo(() => bgStatus() && highlightArray()[props.index - 1] ? 'rounded-t-0' : 'rounded-t-2')
    const lineNumberColor = createMemo(() => bgStatus() && highlightArray()[props.index]
      ? 'color-$vscode-editorLineNumber-activeForeground'
      : 'color-$vscode-editorLineNumber-foreground hover:color-$vscode-editorLineNumber-activeForeground',
    )

    return (
      <div
        class={cls(
          `flex-(~ row) p-r-3`,
          !config.showLineNumbers && 'm-l-2.5',
          bg(),
          roundTop(),
          roundBottom(),
        )}
      >
        <Show when={config.showLineNumbers}>
          <div
            class={cls(
              'text-right p-r-4 m-r-1 w-6 cursor-pointer whitespace-nowrap select-none',
              lineNumberColor(),
            )}
            // eslint-disable-next-line solid/reactivity
            onClick={() => highlightArray((arr) => {
              arr[props.index] = ((arr[props.index] ?? 0) + 1) % 4 as 0 | 1 | 2 | 3
            })}
          >
            {lineNumber()}
          </div>
        </Show>
        {props.line}
      </div>
    )
  }

  return (
    <div class={cls('config-style-(bg padding liga tab) w-fit', isFlashing() && 'flash')}>
      <div class={`shadow-${boxShadow()} shadow-(gray-600 op-50) config-style-radius`}>
        <div
          style={style()}
          class={cls(
            'w-fit min-w-80 p-(t-2 b-4 inline-3) bg-$vscode-editor-background relative config-style-radius',
            config.border && 'glass-border',
          )}
        >
          <Show when={config.showWindowControls}>
            <div
              class={cls(
                'size-3.5 m-(l-8 block-2) absolute rounded-full before:(content-empty size-3.5 right-6 pos-absolute rounded-full) after:(content-empty size-3.5 left-6 pos-absolute rounded-full)',
                config.windowControlsColor
                  ? 'bg-#ffbd2e before:bg-#ff544d after:bg-#28c93f'
                  : 'bg-$vscode-editor-inactiveSelectionBackground before:bg-$vscode-editor-inactiveSelectionBackground after:bg-$vscode-editor-inactiveSelectionBackground',
              )}
            />
          </Show>
          <Show when={config.showWindowTitle || config.showWindowControls}>
            <div class="w-full text-center title-size select-none">
              {config.showWindowTitle ? title() : ' '}
            </div>
          </Show>
          <div class={cls('mt-2', lines().length === 0 && 'mt-5')}>
            <For each={lines()}>
              {(line, idx) => <CodeLine index={idx() + 1} line={line} />}
            </For>
          </div>
        </div>
      </div>
    </div>
  )
}
