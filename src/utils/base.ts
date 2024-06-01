import { type ClassValue, clsx } from 'clsx'

export function cn(...args: ClassValue[]) {
  return clsx(...args)
}
