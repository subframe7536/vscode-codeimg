import { domToBlob, domToJpeg, domToPng, domToSvg, domToWebp } from 'modern-screenshot'
import { vscode } from './vscode'

export type PicFormat = 'png' | 'jpg' | 'svg' | 'webp'

function getFunctionByFormat(format: PicFormat) {
  switch (format) {
    case 'png':
      return domToPng
    case 'jpg':
      return domToJpeg
    case 'svg':
      return domToSvg
    case 'webp':
      return domToWebp
  }
}

export async function saveToLocal(format: PicFormat, el: HTMLElement, scale: number = 2) {
  const data = await getFunctionByFormat(format)(el, { scale })
  vscode.sendToMain({ type: 'save-img', data: { base64: data.substring(data.indexOf(',') + 1), format } })
}

export async function generateBlob(format: PicFormat, el: HTMLElement, scale: number = 2) {
  return await domToBlob(el, { scale, type: format })
}
