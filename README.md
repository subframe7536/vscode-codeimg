# CodeImg

VSCode plugin that generate beautiful image for you code with your favorite font and theme

Powered by `Solid.js`

![](./resources/showcase.png)

## Settings

The CodeImg extension allows you to customize various aspects of the code snippet's appearance and behavior. Here are the available settings:

### `codeimg.background`

The background of the snippet's container.

- **Type:** `string`
- **Default:** `"linear-gradient(345deg, rgb(180 218 255) 0%, rgb(232 209 255) 100%)"`

### `codeimg.boxShadow`

The CSS box-shadow for the snippet.

- **Type:** `string`
- **Default:** `"medium"`
- **Possible Values:** `"small"`, `"medium"`, `"large"`

### `codeimg.containerPadding`

The padding for the snippet's container.

- **Type:** `string`
- **Default:** `"3rem"`

### `codeimg.debounce`

Whether to update the code snippet with debounce when the selection changes.

- **Type:** `boolean`
- **Default:** `true`

### `codeimg.roundedCorners`

Use rounded corners for the window.

- **Type:** `string`
- **Default:** `"1rem"`

### `codeimg.scale`

The scale of the screenshot.

- **Type:** `integer`
- **Default:** `2`

### `codeimg.format`

The image format for the code snippet.

- **Type:** `string`
- **Default:** `"png"`
- **Possible Values:** `"jpg"`, `"png"`, `"svg"`, `"webp"`

### `codeimg.showWindowControls`

Display OS X style window controls.

- **Type:** `boolean`
- **Default:** `true`

### `codeimg.windowControlsColor`

Add color to the window controls.

- **Type:** `boolean`
- **Default:** `true`

### `codeimg.showWindowTitle`

Display the window title with the open folder or file name.

- **Type:** `boolean`
- **Default:** `true`

### `codeimg.showLineNumbers`

Display line numbers in the code snippet.

- **Type:** `boolean`
- **Default:** `true`

## credit

- [CodeSnap-plus](https://github.com/huibizhang/CodeSnap-plus)
- [ray.so](https://ray.so)
- [CodeImage](https://codeimage.dev/)
