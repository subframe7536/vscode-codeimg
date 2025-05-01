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
      copy: async (data: string | (() => Promise<Blob>)): Promise<void> => {
        if (isCopied() || state.flashing) {
          return
        }
        if (typeof data === 'string') {
          return await copy(data)
        }
        const blob = await data()
        await copy(generateClipboardItem(blob, blob.type))
      },
    }
  },
})
