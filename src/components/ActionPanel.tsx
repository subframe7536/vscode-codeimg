import type json from '@iconify-json/lucide/icons.json'
import type { Accessor } from 'solid-js'

import { createRef } from '@solid-hooks/core'
import { Show } from 'solid-js'

import { debounce } from '../../extension/debounce'
import { useOperate } from '../state/action'
import { useSettings } from '../state/editorSettings'
import { generateBlob, saveToLocal } from '../utils/image'
import { vscode } from '../utils/vscode'
import { Button } from './ui/button'
import { ToggleSwitch } from './ui/toggle'

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
    <div class="flex w-fit m-(x-auto y-0) relative font-$vscode-editor-font-family select-none hover:b-$vscode-focusBorder gap-4">
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

      <ToggleSwitch
        class="hidden mini:inline-block"
        checked={settings().plain}
        onChange={togglePlain}
        text="Plain Style"
      />
    </div>
  )
}
