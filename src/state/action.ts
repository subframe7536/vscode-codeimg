import { generateClipboardItem, useCopy } from '@solid-hooks/core/web'
import { createRoot } from 'solid-js'
import { createStore, produce } from 'solid-js/store'

import { debounce } from '../../extension/debounce'

interface OperateData {
  // capture is running, used to hide the transparent background pattern
  capturing: boolean
  flashing: boolean
  title: string
}

export const useOperate = createRoot(() => {
  const [state, setState] = createStore<OperateData>({
    capturing: false,
    flashing: false,
    title: '',
  })
  const { isCopied, copy: copyToClipboard } = useCopy()
  const debounceOffFlashing = debounce(() => setState('flashing', false), 750)

  const accessor = Object.assign(() => state, {
    isCopied,
    $patch: (patch: Partial<OperateData> | ((draft: OperateData) => void)) => {
      setState(typeof patch === 'function' ? produce(patch) : patch)
    },
  })

  const actions = {
    setCapturing: (capturing: boolean) => setState('capturing', capturing),
    showFlashing: () => {
      setState('flashing', true)
      debounceOffFlashing()
    },
    // the flash is an `::after` overlay on the captured element, so a capture
    // started while it is still showing would bake it into the image
    stopFlashing: () => setState('flashing', false),
    copy: async (data: string | (() => Promise<Blob>)): Promise<void> => {
      // do not skip the operation silently, the caller is responsible for
      // avoiding re-entry, otherwise the user gets no feedback at all
      if (typeof data === 'string') {
        await copyToClipboard(data)
        return
      }
      const blob = await data()
      await copyToClipboard(generateClipboardItem(blob, blob.type))
    },
  }

  return () => [accessor, actions] as const
})

export type OperateState = ReturnType<typeof useOperate>[0]
