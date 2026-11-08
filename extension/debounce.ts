export function debounce(fn: (...args: any[]) => any, delay: number) {
  let timer: NodeJS.Timeout | null
  return (...args: any[]) => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => fn(...args), delay)
  }
}
