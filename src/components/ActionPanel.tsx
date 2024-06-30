import { type defineEmits, useEmits } from '@solid-hooks/core'

function TextWithPrefixIcon(props: { icon: string, text: string }) {
  return (
    <div class="flex-(~ row content-center)">
      <i class={`${props.icon} mr-1.2`} />
      <span class="leading-4.8 inline-block">{props.text}</span>
    </div>
  )
}

type ActionPanelProps = defineEmits<{
  save: VoidFunction
  copy: VoidFunction
}>

export default function ActionPanel(props: ActionPanelProps) {
  const emit = useEmits(props)

  return (
    <div
      class="rounded-2 w-fit m-(x-auto y-0) font-$vscode-editor-font-family select-none transition-(all ease-out duration-200) b-20 hover:border-$vscode-focusBorder"
    >
      <button
        class="bg-gray-1 b-(2 solid gray-3) p-(x-3 y-2) m-(x-2 y-4) c-gray-7 rounded-2 hover:bg-gray-2 dark:(bg-gray-8 c-gray-1 hover:bg-gray-6 b-gray-5)"
        onClick={() => emit('copy')}
      >
        <TextWithPrefixIcon icon="i-lucide-copy" text="Copy" />
      </button>
      <button
        class="bg-gray-2 b-(2 solid gray-3) p-(x-3 y-2) m-(x-2 y-4) c-gray-8 rounded-2 hover:bg-gray-3 dark:(bg-gray-9 c-gray-2 hover:bg-gray-7 b-gray-6)"
        onClick={() => emit('save')}
      >
        <TextWithPrefixIcon icon="i-lucide-download" text="Save" />
      </button>
    </div>
  )
}
