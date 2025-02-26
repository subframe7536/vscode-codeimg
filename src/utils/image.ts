import { domToBlob, domToJpeg, domToPng, domToWebp } from 'modern-screenshot'

import { vscode } from './vscode'

export type PicFormat = 'png' | 'jpg' | 'webp'

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

export async function saveToLocal(format: PicFormat, el: HTMLElement, title: string, scale: number) {
  const data = await getFunctionByFormat(format)(el, { scale })
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
  return await domToBlob(el, { scale, type: format })
}
