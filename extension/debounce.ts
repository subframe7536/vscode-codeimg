import type { Promisable } from '@subframe7536/type-utils'

export function debounce(fn: (...args: any[]) => Promisable<any>, delay: number) {
  let timer: NodeJS.Timeout | null
  return (...args: any[]) => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => fn(...args), delay)
  }
}
