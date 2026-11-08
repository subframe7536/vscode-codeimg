import { domToBlob, domToJpeg, domToPng, domToWebp } from 'modern-screenshot'

import { getStyleProperties } from './styleProperties'
import { vscode } from './vscode'

export type PicFormat = 'png' | 'jpg' | 'webp'

/**
 * The canvas refuses to draw beyond these limits and silently produces an
 * empty image, so clamp the scale instead of letting the capture fail
 */
const MAX_CANVAS_SIDE = 8192
const MAX_CANVAS_AREA = 24_000_000

function getFunctionByFormat(format: PicFormat) {
  switch (format) {
    case 'png':
      return domToPng
    case 'jpg':
      return domToJpeg
    case 'webp':
      return domToWebp
  }
}

function getCaptureOptions(el: HTMLElement, scale: number) {
  const width = Math.max(el.offsetWidth, 1)
  const height = Math.max(el.offsetHeight, 1)
  const fitScale = Math.min(
    MAX_CANVAS_SIDE / width,
    MAX_CANVAS_SIDE / height,
    Math.sqrt(MAX_CANVAS_AREA / (width * height)),
  )
  return {
    scale: Math.min(scale, fitScale),
    maximumCanvasSize: MAX_CANVAS_SIDE,
    // see `utils/styleProperties.ts`
    includeStyleProperties: getStyleProperties(),
  }
}

export async function saveToLocal(format: PicFormat, el: HTMLElement, title: string, scale: number) {
  const data = await getFunctionByFormat(format)(el, getCaptureOptions(el, scale))
  vscode.sendToMain({
    type: 'save-img',
    data: {
      base64: data.substring(data.indexOf(',') + 1),
      format,
      fileName: `${title.split('.')[0] ?? 'code'}.${format}`,
    },
  })
}

export async function generateBlob(format: PicFormat, el: HTMLElement, scale: number) {
  // the blob keeps the default png type on purpose. Chromium's clipboard only
  // accepts `image/png` (`ClipboardItem.supports('image/jpeg' | 'image/webp')`
  // are both false), so handing it the configured format makes
  // `navigator.clipboard.write` reject. `format` only applies to saving
  return await domToBlob(el, getCaptureOptions(el, scale))
}
