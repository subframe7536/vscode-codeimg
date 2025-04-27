import { generateClipboardItem, useCopy } from '@solid-hooks/core/web'
import { defineState } from '@solid-hooks/state'

import { debounce } from '../../extension/debounce'

export const useOperate = defineState('action', {
  init: {
    flashing: false,
    title: '',
  },
  getters: () => {
    const { isCopied } = useCopy()
    return { isCopied }
  },
  actions: (setState, state) => {
    const { copy, isCopied } = useCopy()
    const debounceOffFlashing = debounce(() => setState('flashing', false), 750)
    return {
      showFlashing: () => {
        setState('flashing', true)
        debounceOffFlashing()
      },
      copy: async (action: () => Promise<Blob>): Promise<void> => {
        if (isCopied() || state.flashing) {
          return
        }
        const blob = await action()
        await copy(generateClipboardItem(blob, blob.type))
      },
    }
  },
})
