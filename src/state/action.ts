import { createContextProvider, createRef } from '@solid-hooks/core'
import { generateClipboardItem, useCopy } from '@solid-hooks/core/web'

export const [ActionProvider, useAction] = createContextProvider(() => {
  const isFlashing = createRef(false)
  const title = createRef('')
  const { copy, isCopied } = useCopy()
  let timer: ReturnType<typeof setTimeout>
  const showFlashing = () => {
    isFlashing(true)
    timer && clearTimeout(timer)
    timer = setTimeout(() => isFlashing(false), 750)
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
