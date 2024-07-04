import { type Accessor, Show } from 'solid-js'
import { generateBlob, saveToLocal } from '../utils/image'
import { useConfig } from '../state/editorSettings'
import { vscode } from '../utils/vscode'
import { useAction } from '../state/action'

function TextWithPrefixIcon(props: { icon: string, text: string }) {
  return (
    <div class="flex-(~ row content-center)">
      <i class={`${props.icon} mr-1.2`} />
      <span class="leading-4.8 inline-block">{props.text}</span>
    </div>
  )
}

export default function ActionPanel(props: { codeblockRef: Accessor<HTMLDivElement | undefined> }) {
  const config = useConfig()
  const { copy, isCopied, title, showFlashing } = useAction()
  const saveFn = () => {
    showFlashing()
    saveToLocal(config.format, props.codeblockRef()!, title(), config.scale)
  }
  // eslint-disable-next-line solid/reactivity
  const copyFn = () => copy(() => {
    showFlashing()
    return generateBlob(config.format, props.codeblockRef()!, config.scale)
  })

  const showSettingsFn = () => vscode.sendToMain({ type: 'show-settings' })

  return (
    <div
      class="rounded-2 w-fit m-(x-auto y-0) font-$vscode-editor-font-family select-none transition-(all ease-out duration-200) b-20 hover:border-$vscode-focusBorder"
    >
      <button
        class="bg-gray-1 b-(2 solid gray-3) p-(x-3 y-2) m-(x-2 y-4) c-gray-7 rounded-2 hover:bg-gray-2 dark:(bg-gray-8 c-gray-1 hover:bg-gray-6 b-gray-5)"
        onClick={copyFn}
      >
        <Show when={!isCopied()} fallback={<TextWithPrefixIcon icon="i-lucide-check" text="Copied" />}>
          <TextWithPrefixIcon icon="i-lucide-copy" text="Copy" />
        </Show>
      </button>
      <button
        class="bg-gray-2 b-(2 solid gray-3) p-(x-3 y-2) m-(x-2 y-4) c-gray-8 rounded-2 hover:bg-gray-3 dark:(bg-gray-9 c-gray-2 hover:bg-gray-7 b-gray-6)"
        onClick={saveFn}
      >
        <TextWithPrefixIcon icon="i-lucide-download" text="Save" />
      </button>
      <button
        class="bg-gray-2 b-(2 solid gray-3) p-(x-3 y-2) m-(x-2 y-4) c-gray-8 rounded-2 hover:bg-gray-3 dark:(bg-gray-9 c-gray-2 hover:bg-gray-7 b-gray-6)"
        onClick={showSettingsFn}
      >
        <TextWithPrefixIcon icon="i-lucide-settings" text="Settings" />
      </button>
    </div>
  )
}
