import type json from '@iconify-json/lucide/icons.json'
import type { VariantProps } from 'cls-variant'
import type { Accessor, FlowProps } from 'solid-js'

import { createRef } from '@solid-hooks/core'
import { clsv, clsvDefault } from 'cls-variant'
import { Show } from 'solid-js'

import { debounce } from '../../extension/debounce'
import { useOperate } from '../state/action'
import { useSettings } from '../state/editorSettings'
import { generateBlob, saveToLocal } from '../utils/image'
import { vscode } from '../utils/vscode'

const buttonClass = clsvDefault(
  clsv(
    'b-none p-(x-3 y-2) m-(x-2 y-4) rounded-2 transition',
    {
      variant: {
        primary: 'bg-$vscode-button-background c-$vscode-button-foreground hover:bg-$vscode-button-hoverBackground',
        secondary: 'bg-$vscode-button-secondaryBackground c-$vscode-button-secondaryForeground hover:bg-$vscode-button-secondaryHoverBackground',
      },
    },
  ),
  { variant: 'primary' },
)

interface ButtonProps {
  onClick?: () => any
  class?: string
  title?: string
}

function Button(props: VariantProps<typeof buttonClass> & FlowProps<ButtonProps>) {
  return (
    <button
      class={buttonClass({ variant: props.variant })}
      onClick={() => props.onClick?.()}
      title={props.title}
    >
      {props.children}
    </button>
  )
}

function TextWithPrefixIcon(props: { icon: `i-lucide-${keyof typeof json['icons']}`, text: string }) {
  return (
    <div class="flex flex-row leading-normal">
      <i class={`${props.icon} mr-1.2`} />
      {props.text}
    </div>
  )
}

export default function ActionPanel(props: { codeblockRef: Accessor<HTMLDivElement | undefined> }) {
  const [settings, { togglePlain }] = useSettings()
  const isCopying = createRef(false)
  const isSaving = createRef(false)
  const [operate, { copy, showFlashing }] = useOperate()
  const debounceOffSaving = debounce(() => isSaving(false), 750)
  const saveFn = async () => {
    isSaving(true)
    showFlashing()
    await saveToLocal(settings().format, props.codeblockRef()!, operate().title, settings().scale)
    debounceOffSaving()
  }

  const copyFn = async () => {
    isCopying(true)
    // eslint-disable-next-line solid/reactivity
    await copy(() => {
      showFlashing()
      return generateBlob(settings().format, props.codeblockRef()!, settings().scale)
    })
    isCopying(false)
  }

  const showSettingsFn = () => vscode.sendToMain({ type: 'show-settings' })

  return (
    <div class="flex w-fit m-(x-auto y-0) relative font-$vscode-editor-font-family select-none hover:b-$vscode-focusBorder *:transition">
      <Button onClick={copyFn} title={`Copy as ${settings().format}`}>
        <Show when={!isCopying()} fallback={<TextWithPrefixIcon icon="i-lucide-loader" text="Copying" />}>
          <Show when={!operate.isCopied()} fallback={<TextWithPrefixIcon icon="i-lucide-check" text="Copied" />}>
            <TextWithPrefixIcon icon="i-lucide-copy" text="Copy" />
          </Show>
        </Show>
      </Button>

      <Button onClick={saveFn} title={`Save as ${settings().format}`}>
        <Show when={!isSaving()} fallback={<TextWithPrefixIcon icon="i-lucide-ellipsis" text="Saving" />}>
          <TextWithPrefixIcon icon="i-lucide-download" text="Save" />
        </Show>
      </Button>

      <Button variant="secondary" class="hidden mini:inline-block" onClick={showSettingsFn}>
        <TextWithPrefixIcon icon="i-lucide-settings" text="Settings" />
      </Button>

      <Button variant="secondary" class="hidden mini:inline-block" onClick={() => togglePlain()}>
        <TextWithPrefixIcon
          icon={settings().plain ? 'i-lucide-square-check-big' : 'i-lucide-square'}
          text="Plain Style"
        />
      </Button>
    </div>
  )
}
