import { createContextProvider, createRef } from '@solid-hooks/core'
import { generateClipboardItem, useCopy } from '@solid-hooks/core/web'

import { debounce } from '../../extension/debounce'

export const [ActionProvider, useAction] = createContextProvider(() => {
  const isFlashing = createRef(false)
  const title = createRef('')
  const { copy, isCopied } = useCopy()
  const debounceOffFlashing = debounce(() => isFlashing(false), 750)
  const showFlashing = () => {
    isFlashing(true)
    debounceOffFlashing()
  }
  return {
    title,
    isFlashing,
    showFlashing,
    isCopied,
    copy: async (action: () => Promise<Blob>): Promise<void> => {
      if (isCopied() || isFlashing()) {
        return
      }
      const blob = await action()
      await copy(generateClipboardItem(blob, blob.type))
    },
  }
})
