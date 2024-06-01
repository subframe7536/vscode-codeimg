import type { WebviewApi } from 'vscode-webview'
import type { MsgMain2Renderer, MsgRenderer2Main, Recordify } from '../../types/msg'

class VSCodeAPIWrapper {
  private readonly vsCodeApi: WebviewApi<unknown> | undefined
  private readonly map: Map<string, (message: any) => void> = new Map()

  constructor() {
    if (typeof acquireVsCodeApi === 'function') {
      this.vsCodeApi = acquireVsCodeApi()
    } else {
      console.log('acquireVsCodeApi is not defined')
    }
    onmessage = ({ data }: MessageEvent<MsgMain2Renderer>) => this.map.get(data.type)?.(data.data)
  }

  public sendToMain(message: MsgRenderer2Main) {
    this.vsCodeApi?.postMessage(message)
  }

  public listen<
    R extends Recordify<MsgMain2Renderer>,
    K extends keyof R & string,
  >(
    msg: K,
    callback: (message: R[K]) => void,
  ) {
    this.map.set(msg, callback)
  }
}

// Exports class singleton to prevent multiple invocations of acquireVsCodeApi.
export const vscode = new VSCodeAPIWrapper()
