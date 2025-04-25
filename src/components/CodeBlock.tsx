import { createArray, createRef } from '@solid-hooks/core'
import { useCssVar, usePaste } from '@solid-hooks/core/web'
import { cls } from 'cls-variant'
import { createMemo, For, Show } from 'solid-js'

import { useOperate } from '../state/action'
import { useSettings } from '../state/editorSettings'
import { vscode } from '../utils/vscode'

function parseHTML(html: string) {
  const template = document.createElement('template')
  template.innerHTML = html
  return template.content
}

function normalizeLastChildWhitespace<E extends Element>(el: E): E {
  const lastChild = el.lastElementChild
  if (lastChild) {
    const textContent = lastChild.textContent
    if (textContent) {
      lastChild.textContent = textContent.trimEnd()
    }
  }
  return el
}

type RowType = 0 | 1 | 2 | 3

export default function CodeBlock() {
  const lines = createRef<Element[]>([])
  const style = createRef('')
  const isTerminal = createRef(false)

  const highlightArray = createRef(createArray([] as RowType[]))

  const [settings] = useSettings()
  const [operate] = useOperate()

  useCssVar('bg', () => settings().background)
  useCssVar('padding', () => settings.targetContainerPadding())
  useCssVar('radius', () => settings.targetRoundedCorners())
  useCssVar(
    'liga',
    () => {
      const liga = settings().fontLigatures
      return typeof liga === 'string'
        ? liga
        : liga
          ? '"calt", "liga"'
          : 'none'
    },
  )
  useCssVar('tab', () => `${settings().tabSize}`)

  const paste = usePaste({
    onPaste: (data, mime) => {
      if (mime === 'text/html') {
        const root = parseHTML(data as string)?.querySelector('div')
        if (root) {
          let cssText = root.style.cssText.replace(/background-color:[^;]*;/g, '')
          if (isTerminal()) {
            cssText = cssText.replace('rgb(0, 0, 0)', 'var(--vscode-terminal-foreground)') + [
              `font-family: ${settings().terminalFontFamily}`,
              `font-size: ${settings().terminalFontSize}`,
              `font-weight: var(--vscode-editor-font-weight)`,
              `white-space: pre; line-height: ${settings().terminalLineHeight}`,
            ].join(';')
          }
          style(cssText)
          const els = Array.from(root.querySelectorAll(':scope > *'))
          if (els.length) {
            lines(els.map(e => normalizeLastChildWhitespace(e)))
          }
        }
      }
    },
    legacy: true,
  })

  vscode.listen('get-config', data => settings.$patch(data))
  vscode.listen('update-code', async ({ title: t, isTerminal: is }) => {
    operate.$patch({ title: t || ' ' })
    isTerminal(is)
    await paste()
    highlightArray([])
  })

  const boxShadow = createMemo(() => {
    switch (settings.targetBoxShadow()) {
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

    const showLineNumbers = createMemo(() => settings().showLineNumbers && !isTerminal())
    return (
      <div
        class={cls(
          `flex-(~ row) p-r-3`,
          !showLineNumbers() && 'm-l-2.5',
          bg(),
          roundTop(),
          roundBottom(),
        )}
      >
        <Show when={showLineNumbers()}>
          <div
            class={cls(
              'text-right p-r-4 m-r-1 w-6 cursor-pointer whitespace-nowrap select-none',
              lineNumberColor(),
            )}
            // eslint-disable-next-line solid/reactivity
            onClick={() => highlightArray((arr) => {
              arr[props.index] = ((arr[props.index] ?? 0) + 1) % 4 as RowType
            })}
          >
            {lineNumber()}
          </div>
        </Show>
        {props.line}
      </div>
    )
  }

  const hasLines = createMemo(() => lines().length > 0)
  return (
    <div class={cls('config-style-(bg padding liga tab) w-fit', operate().flashing && 'flash')}>
      <div class={`shadow-${boxShadow()} shadow-(gray-600 op-50) config-style-radius`}>
        <div
          style={style()}
          class={cls(
            'w-fit min-w-80 p-(t-2 b-5 inline-3) bg-$vscode-editor-background relative config-style-radius',
            settings.targetBorder() && 'glass-border',
          )}
        >
          <Show when={settings.targetShowWindowControls()}>
            <div
              class={cls(
                'size-3.5 m-(l-8 block-2) absolute rounded-full before:(content-empty size-3.5 right-6 pos-absolute rounded-full) after:(content-empty size-3.5 left-6 pos-absolute rounded-full)',
                settings().windowControlsColor
                  ? 'bg-#ffbd2e before:bg-#ff544d after:bg-#28c93f'
                  : 'bg-$vscode-editor-inactiveSelectionBackground before:bg-$vscode-editor-inactiveSelectionBackground after:bg-$vscode-editor-inactiveSelectionBackground',
              )}
            />
          </Show>
          <Show
            when={
              hasLines() && (
                settings.targetShowWindowTitle() || settings.targetShowWindowControls()
              )
            }
          >
            <div class={cls('w-full text-center title-size select-none h-5 leading-loose')}>
              {settings.targetShowWindowTitle() ? operate().title : ' '}
            </div>
          </Show>
          <Show
            when={hasLines()}
            fallback={(
              <div class="p-8 mt-6 flex flex-col items-center gap-4 *:font-$vscode-editor-font-family">
                <div class="leading-loose">
                  Change your selection in editor
                </div>
                <div class="leading-none">or</div>
                <button
                  title="Make sure you have selected some text in active terminal"
                  class="rounded-lg p-(x-4 y-2) b-0 bg-$vscode-foreground transition hover:op-80"
                  onClick={() => vscode.sendToMain({ type: 'capture-terminal' })}
                >
                  Capture Terminal
                </button>
              </div>
            )}
          >
            <div class={cls('mt-2', hasLines() && 'mt-5')}>
              <For each={lines()}>
                {(line, idx) => <CodeLine index={idx() + 1} line={line} />}
              </For>
            </div>
          </Show>
        </div>
      </div>
    </div>
  )
}
