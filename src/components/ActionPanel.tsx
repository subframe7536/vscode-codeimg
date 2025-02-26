import type { Accessor } from 'solid-js'

import { createRef } from '@solid-hooks/core'
import { cls } from '@solid-hooks/core/web'
import { Show } from 'solid-js'

import { debounce } from '../../extension/debounce'
import { useAction } from '../state/action'
import { useConfig } from '../state/editorSettings'
import { generateBlob, saveToLocal } from '../utils/image'
import { vscode } from '../utils/vscode'

function TextWithPrefixIcon(props: { icon: string, text: string }) {
  return (
    <div class="flex-(~ row content-center)">
      <i class={cls(props.icon, 'mr-1.2')} />
      <span class="leading-4.8 inline-block">{props.text}</span>
    </div>
  )
}

export default function ActionPanel(props: { codeblockRef: Accessor<HTMLDivElement | undefined> }) {
  const config = useConfig()
  const isCopying = createRef(false)
  const isSaving = createRef(false)
  const { copy, isCopied, title, showFlashing } = useAction()
  const debounceOffSaving = debounce(() => isSaving(false), 750)
  const saveFn = async () => {
    isSaving(true)
    showFlashing()
    await saveToLocal(config.format, props.codeblockRef()!, title(), config.scale)
    debounceOffSaving()
  }

  const copyFn = async () => {
    isCopying(true)
    // eslint-disable-next-line solid/reactivity
    await copy(() => {
      showFlashing()
      return generateBlob(config.format, props.codeblockRef()!, config.scale)
    })
    isCopying(false)
  }

  const showSettingsFn = () => vscode.sendToMain({ type: 'show-settings' })

  return (
    <div
      class="rounded-2 w-fit m-(x-auto y-0) relative font-$vscode-editor-font-family select-none hover:border-$vscode-focusBorder *:transition"
    >
      <button
        class="bg-gray-1 b-(2 solid gray-3) p-(x-3 y-2) m-(x-2 y-4) c-gray-7 rounded-2 hover:bg-gray-2 dark:(bg-gray-8 c-gray-1 hover:bg-gray-6 b-gray-5)"
        onClick={copyFn}
      >
        <Show when={!isCopying()} fallback={<TextWithPrefixIcon icon="i-lucide-loader" text="Copying" />}>
          <Show when={!isCopied()} fallback={<TextWithPrefixIcon icon="i-lucide-check" text="Copied" />}>
            <TextWithPrefixIcon icon="i-lucide-copy" text="Copy" />
          </Show>
        </Show>
      </button>
      <button
        class="bg-gray-2 b-(2 solid gray-3) p-(x-3 y-2) m-(x-2 y-4) c-gray-8 rounded-2 hover:bg-gray-3 dark:(bg-gray-9 c-gray-2 hover:bg-gray-7 b-gray-6)"
        onClick={saveFn}
      >
        <Show when={!isSaving()} fallback={<TextWithPrefixIcon icon="i-lucide-ellipsis" text="Saving" />}>
          <TextWithPrefixIcon icon="i-lucide-download" text="Save" />
        </Show>
      </button>
      <button
        class="bg-gray-2 b-(2 solid gray-3) p-(x-3 y-2) m-(x-2 y-4) c-gray-8 rounded-2 hover:bg-gray-3 dark:(bg-gray-9 c-gray-2 hover:bg-gray-7 b-gray-6) hidden mini:inline-block"
        onClick={showSettingsFn}
      >
        <TextWithPrefixIcon icon="i-lucide-settings" text="Settings" />
      </button>
    </div>
  )
}
