/**
 * `modern-screenshot` normally inlines every computed property of every node
 * (about 350 per node). On a long snippet, which easily contains thousands of
 * nodes, that becomes the main cost of generating an image, so only the
 * properties that can affect the appearance of the snippet are passed as
 * `includeStyleProperties`.
 *
 * The list is read from the live stylesheets instead of being hard coded. A
 * hand written whitelist fails silently: a property missing from it is simply
 * not inlined, and the node falls back to its initial value inside the
 * `<foreignObject>` — no error, just a wrong image. Reading the stylesheets
 * keeps the list in sync with whatever CSS the page actually has.
 */

/**
 * Shorthands whose longhands cannot be derived from the shorthand name, because
 * they do not start with `<shorthand>-`
 */
const EXTRA_LONGHANDS: Record<string, string[]> = {
  gap: ['row-gap', 'column-gap'],
  inset: ['top', 'right', 'bottom', 'left'],
  'inset-block': ['inset-block-start', 'inset-block-end'],
  'inset-inline': ['inset-inline-start', 'inset-inline-end'],
  columns: ['column-width', 'column-count'],
  'place-items': ['align-items', 'justify-items'],
  'place-content': ['align-content', 'justify-content'],
  'place-self': ['align-self', 'justify-self'],
  // `white-space` became a shorthand of these, none of which is prefixed by it
  'white-space': ['white-space-collapse', 'text-wrap-mode', 'text-wrap-style'],
}

/**
 * Names the CSSOM reports for a declaration, which are not the names the
 * computed style exposes
 */
const ALIASES: Record<string, string> = {
  'background-position-x': 'background-position',
  'background-position-y': 'background-position',
  'mask-position-x': 'mask-position',
  'mask-position-y': 'mask-position',
  '-webkit-mask-position-x': '-webkit-mask-position',
  '-webkit-mask-position-y': '-webkit-mask-position',
}

/**
 * The syntax highlighted html copied from the editor carries these in its
 * inline `style` attribute, so they never show up in a stylesheet
 */
const INLINE_STYLE_PROPERTIES = [
  'color',
  'background-color',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'line-height',
  'white-space',
  'tab-size',
  'text-align',
  'padding',
  'margin',
  'overflow',
  'overflow-wrap',
  'word-break',
]

let cache: string[] | undefined

/**
 * Custom properties are not enumerated by `getComputedStyle`, so the capture
 * never inlined them in the first place — they only matter through the
 * longhand that references them, which already holds the resolved value.
 * Keeping just this one, since the icons are drawn with it
 */
const KEEP_CUSTOM_PROPERTIES = new Set(['--un-icon'])

function collectFromRules(rules: CSSRuleList, into: Set<string>) {
  for (let i = 0; i < rules.length; i++) {
    const rule = rules.item(i)
    if (!rule) {
      continue
    }
    const declaration = (rule as CSSStyleRule).style
    if (declaration) {
      for (let j = 0; j < declaration.length; j++) {
        const name = declaration.item(j)
        if (name.startsWith('--') && !KEEP_CUSTOM_PROPERTIES.has(name)) {
          continue
        }
        into.add(name)
      }
    }
    // `@media`, `@supports`, `@layer` and friends wrap further rules
    const nested = (rule as CSSGroupingRule).cssRules
    if (nested) {
      collectFromRules(nested, into)
    }
  }
}

/**
 * Every property that the capture has to inline, resolved from the stylesheets
 * currently loaded in the webview. Computed styles are always longhands, so
 * shorthands are expanded to the matching longhands.
 */
export function getStyleProperties() {
  if (cache) {
    return cache
  }

  const declared = new Set(INLINE_STYLE_PROPERTIES)
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      collectFromRules(sheet.cssRules, declared)
    } catch {
      // cross origin stylesheet, its rules are not readable
    }
  }

  // a detached element may not report the full property list, so mount it
  const probe = document.createElement('div')
  probe.setAttribute('style', 'position: absolute; visibility: hidden; pointer-events: none')
  document.body.appendChild(probe)
  const computed = getComputedStyle(probe)
  const longhands: string[] = []
  for (let i = 0; i < computed.length; i++) {
    longhands.push(computed.item(i))
  }
  probe.remove()

  const longhandSet = new Set(longhands)
  const properties = new Set<string>()
  for (const name of declared) {
    const target = name.startsWith('--') || longhandSet.has(name) ? name : (ALIASES[name] ?? name)
    properties.add(target)
    for (const longhand of longhands) {
      if (longhand === target || longhand.startsWith(`${target}-`)) {
        properties.add(longhand)
      }
    }
    for (const longhand of EXTRA_LONGHANDS[target] ?? []) {
      properties.add(longhand)
    }
  }

  cache = [...properties]
  return cache
}
