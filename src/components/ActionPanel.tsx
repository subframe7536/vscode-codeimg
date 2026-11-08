import type json from '@iconify-json/lucide/icons.json'
import type { Accessor } from 'solid-js'

import { createRef } from '@solid-hooks/core'
import { cls } from 'cls-variant'
import { Show } from 'solid-js'

import { debounce } from '../../extension/debounce'
import { useOperate } from '../state/action'
import { useSettings } from '../state/editorSettings'
import { generateBlob, saveToLocal } from '../utils/image'
import { vscode } from '../utils/vscode'
import { Button } from './ui/button'
import { ToggleSwitch } from './ui/toggle'

function TextWithPrefixIcon(props: { class?: string, icon: `i-lucide-${keyof typeof json['icons']}`, text: string }) {
  return (
    <div class="flex flex-row leading-normal">
      <i class={cls(props.icon, 'mr-1.2', props.class)} />
      {props.text}
    </div>
  )
}

export default function ActionPanel(props: { codeblockRef: Accessor<HTMLDivElement | undefined> }) {
  const [settings, { togglePlain }] = useSettings()
  const isCopying = createRef(false)
  const isSaving = createRef(false)
  const copyFailed = createRef(false)
  const saveFailed = createRef(false)
  const [operate, { copy, setCapturing, showFlashing }] = useOperate()
  const debounceOffSaving = debounce(() => isSaving(false), 750)
  const debounceOffCopyFailed = debounce(() => copyFailed(false), 3000)
  const debounceOffSaveFailed = debounce(() => saveFailed(false), 3000)

  const saveFn = async () => {
    if (isSaving()) {
      return
    }
    isSaving(true)
    saveFailed(false)
    setCapturing(true)
    try {
      await saveToLocal(settings().format, props.codeblockRef()!, operate().title, settings().scale)
      // only flash after the image is really produced
      showFlashing()
    } catch (error) {
      console.error('[codeimg] failed to save image', error)
      saveFailed(true)
      debounceOffSaveFailed()
    } finally {
      setCapturing(false)
      debounceOffSaving()
    }
  }

  const copyFn = async () => {
    if (isCopying()) {
      return
    }
    isCopying(true)
    copyFailed(false)
    setCapturing(true)
    try {
      // eslint-disable-next-line solid/reactivity
      await copy(() => generateBlob(settings().format, props.codeblockRef()!, settings().scale))
      showFlashing()
    } catch (error) {
      console.error('[codeimg] failed to copy image', error)
      copyFailed(true)
      debounceOffCopyFailed()
    } finally {
      setCapturing(false)
      isCopying(false)
    }
  }

  const showSettingsFn = () => vscode.sendToMain({ type: 'show-settings' })

  return (
    <div class="flex w-fit m-(x-auto y-0) relative font-$vscode-editor-font-family select-none hover:b-$vscode-focusBorder gap-4">
      <Button onClick={copyFn} title={`Copy as ${settings().format}`}>
        <Show when={!isCopying()} fallback={<TextWithPrefixIcon class="animate-spin" icon="i-lucide-loader" text="Copying" />}>
          <Show when={!copyFailed()} fallback={<TextWithPrefixIcon icon="i-lucide-triangle-alert" text="Copy failed" />}>
            <Show when={!operate.isCopied()} fallback={<TextWithPrefixIcon icon="i-lucide-check" text="Copied" />}>
              <TextWithPrefixIcon icon="i-lucide-copy" text="Copy" />
            </Show>
          </Show>
        </Show>
      </Button>

      <Button onClick={saveFn} title={`Save as ${settings().format}`}>
        <Show when={!saveFailed()} fallback={<TextWithPrefixIcon icon="i-lucide-triangle-alert" text="Save failed" />}>
          <Show when={!isSaving()} fallback={<TextWithPrefixIcon class="animate-spin" icon="i-lucide-loader" text="Saving" />}>
            <TextWithPrefixIcon icon="i-lucide-download" text="Save" />
          </Show>
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
