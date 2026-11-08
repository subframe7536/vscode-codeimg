import { generateClipboardItem, useCopy } from '@solid-hooks/core/web'
import { defineState } from '@solid-hooks/state'

import { debounce } from '../../extension/debounce'

export const useOperate = defineState('action', {
  init: {
    // capture is running, used to hide the transparent background pattern
    capturing: false,
    flashing: false,
    title: '',
  },
  getters: () => {
    const { isCopied } = useCopy()
    return { isCopied }
  },
  actions: (setState) => {
    const { copy } = useCopy()
    const debounceOffFlashing = debounce(() => setState('flashing', false), 750)
    return {
      setCapturing: (capturing: boolean) => setState('capturing', capturing),
      showFlashing: () => {
        setState('flashing', true)
        debounceOffFlashing()
      },
      copy: async (data: string | (() => Promise<Blob>)): Promise<void> => {
        // do not skip the operation silently, the caller is responsible for
        // avoiding re-entry, otherwise the user gets no feedback at all
        if (typeof data === 'string') {
          await copy(data)
          return
        }
        const blob = await data()
        await copy(generateClipboardItem(blob, blob.type))
      },
    }
  },
})

export type OperateState = ReturnType<typeof useOperate>[0]
