import type { ExtensionContext, Webview } from 'vscode'

export { }
declare global {
  /**
   * fix code hint
   */
  type UnionType<T> = T | (string & {})

  namespace NodeJS {
    interface ProcessEnv {
      /**
       * Node.js environment
       */
      NODE_ENV: UnionType<'development' | 'production'>
      /**
       * `[vite serve]` The url of the vite dev server.
       */
      VITE_DEV_SERVER_URL?: string
      /**
       * `[vite build]` All js files in the dist directory, excluding index.js. It's to be a json string.
       */
      VITE_WEBVIEW_DIST?: string
    }
  }

  interface WebviewHtmlOptions {
    /**
     * `[vite serve]` The url of the vite dev server. Please use `process.env.VITE_DEV_SERVER_URL`
     */
    serverUrl?: string
    /**
     * `[vite build]` The Webview instance of the extension.
     */
    webview: Webview
    /**
     * `[vite build]` The ExtensionContext instance of the extension.
     */
    context: ExtensionContext
    /**
     * `[vite build]` vite build.rollupOptions.input name. Default is `index`.
     */
    inputName?: string
    /**
     * `[vite build]` Inject code into the afterbegin of the head element.
     */
    injectCode?: string
  }

  /**
   * Gets the html of webview
   */
  function __getWebviewHtml__(options?: WebviewHtmlOptions): string
}
