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

function trimWhiteSpace<E extends Element>(elList: E[], trim: boolean): E[] {
  const result: E[] = []

  // Find first non-empty element
  let startIndex = 0
  if (trim) {
    while (startIndex < elList.length && elList[startIndex].textContent?.trim() === '') {
      startIndex++
    }
  }

  // Find last non-empty element
  let endIndex = elList.length - 1
  if (trim) {
    while (endIndex >= startIndex && elList[endIndex].textContent?.trim() === '') {
      endIndex--
    }
  }

  // Process elements between start and end
  let indentSize = 0
  for (let i = startIndex; i <= endIndex; i++) {
    const el = elList[i]
    // Convert elements with empty trimmed text to <br/>
    if (el.textContent?.trim() === '') {
      result.push(document.createElement('br') as unknown as E)
      continue
    }
    if (trim) {
      const first = el.firstElementChild
      if (first) {
        if (i === startIndex) {
          if (first?.textContent?.trim() === '') {
            indentSize = first.textContent.length
            first.textContent = ''
          }
        } else if (first?.textContent) {
          first.textContent = first.textContent.substring(indentSize)
        }
      } else if (i === startIndex) {
        startIndex++
        continue
      }
    }
    // trim suffix whitespace
    const lastChild = el.lastElementChild
    if (lastChild) {
      const textContent = lastChild.textContent
      if (textContent) {
        lastChild.textContent = textContent.trimEnd()
      }
    }
    result.push(el)
  }
  return result
}

type RowType = 0 | 1 | 2 | 3

const isDesktop = typeof __isDesktop__ !== 'undefined' ? __isDesktop__ : true
export default function CodeBlock() {
  const lines = createRef<Element[]>([])
  const style = createRef('')
  const isTerminal = createRef(false)
  const startNumber = createRef(0)

  const highlightArray = createRef(createArray([] as RowType[]))

  const [settings] = useSettings()
  const [operate, { copy }] = useOperate()

  useCssVar('bg', () => settings().background)
  useCssVar('padding', () => settings.targetContainerPadding())
  useCssVar('radius', () => settings.targetRoundedCorners())
  useCssVar('left-num', () => {
    const num = `${startNumber() + lines().length}`.length
    if (num < 2) {
      return '0'
    }
    return `${(num - 2) * 0.25}rem`
  })
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
    legacy: isDesktop,
    listen: !isDesktop,
    onPaste: (data, mime) => {
      // todo)) support text/plain
      if (mime === 'text/html') {
        const root = parseHTML(data as string)?.querySelector('div')
        if (root) {
          style(getStyleText(root))
          const els = Array.from(root.querySelectorAll(':scope > *'))
          if (els.length) {
            lines(trimWhiteSpace(els, settings().trimPrefixWhitespaces))
          }
        }
      }
    },
  })

  function getStyleText(root: HTMLDivElement) {
    const styleObj = root.style
    styleObj.removeProperty('background-color')
    if (isTerminal()) {
      styleObj.setProperty('color', 'var(--vscode-terminal-foreground)')
      const styleMap = [
        ['color', 'var(--vscode-terminal-foreground)'],
        ['font-family', `${settings().terminalFontFamily}`],
        ['font-size', `${settings().terminalFontSize}`],
        ['font-weight', 'var(--vscode-editor-font-weight)'],
        ['white-space', 'pre'],
        ['line-height', `${settings().terminalLineHeight}`],
      ] as const
      styleMap.map(([k, v]) => styleObj.setProperty(k, v))
    }
    return styleObj.cssText
  }

  vscode.listen('get-config', data => settings.$patch(data))
  vscode.listen('update-code', async ({ title: t, isTerminal: is, startNumber: n }) => {
    operate.$patch({ title: t || ' ' })
    isTerminal(is)
    startNumber(settings().realLineNumber ? (n ?? 1) : 0)
    highlightArray([])
    await paste()
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
              'text-right pr-4 mr-1 w-6 cursor-pointer whitespace-nowrap select-none ml-$left-num',
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
      <div class={`shadow-${boxShadow()} shadow-(gray-4 op-50) config-style-radius`}>
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
                'size-3.2 top-3.6 left-3.6 absolute rounded-full cursor-pointer',
                settings().windowControlsColor
                  ? 'traffic-light-color'
                  : 'traffic-light-plain',
              )}
              onClick={() => lines([])}
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
                  <Show
                    when={isDesktop}
                    fallback={<span>Copy Code and Paste Here</span>}
                  >
                    Change Selection in Text Editor
                  </Show>
                </div>
                <div class="leading-none">or</div>
                <button
                  title="Make sure you have selected some text in active terminal"
                  class="rounded-lg p-(x-4 y-2) b-0 bg-$vscode-button-background c-$vscode-button-foreground transition hover:op-80"
                  onClick={async () => {
                    await copy('').catch(() => {})
                    vscode.sendToMain({ type: 'capture-terminal' })
                  }}
                >
                  Capture Terminal
                </button>
              </div>
            )}
          >
            <div class={cls('mt-2', hasLines() && 'mt-5')}>
              <For each={lines()}>
                {(line, idx) => <CodeLine index={startNumber() + idx() + 1} line={line} />}
              </For>
            </div>
          </Show>
        </div>
      </div>
    </div>
  )
}
