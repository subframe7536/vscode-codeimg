import { createRef, type defineEmits, useEmits } from '@solid-hooks/core'
import { For } from 'solid-js'
import type { ParseFunction } from '@subframe7536/type-utils'
import type { PicFormat } from '../utils/image'
import { cn } from '../utils/base'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'

function TextWithPrefixIcon(props: { icon: string, text: string }) {
  return (
    <div class="flex-(~ row content-center)">
      <i class={`${props.icon} mr-1.5`} />
      <span class="line-height-relaxed inline-block">{props.text}</span>
    </div>
  )
}

type ActionPanelProps = defineEmits<{
  save: ParseFunction<[format: PicFormat], Promise<void>>
  copy: ParseFunction<[format: PicFormat], Promise<void>>
}>

export default function ActionPanel(props: ActionPanelProps) {
  const format = createRef<PicFormat>('png')

  const emit = useEmits(props)

  const formatConfig = [
    ['png', 'i-lucide-book-image'],
    ['jpg', 'i-lucide-file-image'],
    ['svg', 'i-lucide-code-xml'],
    ['webp', 'i-lucide-earth'],
  ] as const

  return (
    <div
      class="rounded-2 w-fit p-(x-3 y-2) m-(x-auto y-0) font-$vscode-editor-font-family bg-$vscode-editorWidget-background text-$vscode-editor-foreground select-none transition-(all ease-out duration-200) hover:border-$vscode-focusBorder"
    >
      <div class="op-50 m-y-2 font-bold">Format</div>
      <div class="w-48 grid-(~ cols-2 gap-.5)">
        <For each={formatConfig}>
          {item => (
            <div
              class={cn(
                format() === item[0]
                  ? 'b-$vscode-focusBorder bg-$vscode-editor-inactiveSelectionBackground'
                  : 'b-transparent bg-transparent',
                'b-(2 solid) rounded-2 p-(x-2 y-1) m-y-.5',
                'hover:(b-$vscode-focusBorder)',
              )}
              onClick={() => format(item[0])}
            >
              <TextWithPrefixIcon icon={item[1]} text={item[0].toUpperCase()} />
            </div>
          )}
        </For>
      </div>
      <div>
        <button
          class="bg-$vscode-editorWidget-background m-(t-3 x-1) p-(x-2 y-1) text-$vscode-editor-foreground border-none rounded-2"
          onClick={() => emit('copy', format())}
        >
          <TextWithPrefixIcon icon="i-lucide-copy" text="Copy" />
        </button>
        <button
          class="bg-$vscode-editorWidget-secondaryBackground m-(t-3 x-1) p-(x-2 y-1) text-$vscode-editor-secondaryForeground border-none rounded-2"
          onClick={() => emit('save', format())}
        >
          <TextWithPrefixIcon icon="i-lucide-download" text="Save" />
        </button>
      </div>
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove your data
              from our servers.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
