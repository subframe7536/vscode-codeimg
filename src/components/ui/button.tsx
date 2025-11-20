import type { VariantProps } from 'cls-variant'
import type { FlowProps } from 'solid-js'

import { clsv, clsvDefault } from 'cls-variant'

const buttonClass = clsvDefault(
  clsv(
    'b-none p-(x-3 y-2) rounded-2 transition',
    {
      variant: {
        primary: 'bg-$vscode-button-background c-$vscode-button-foreground hover:bg-$vscode-button-hoverBackground',
        secondary: 'bg-$vscode-button-secondaryBackground c-$vscode-button-secondaryForeground hover:bg-$vscode-button-secondaryHoverBackground',
      },
    },
  ),
  { variant: 'primary' },
)

interface ButtonProps {
  onClick?: () => any
  class?: string
  title?: string
}

export function Button(props: VariantProps<typeof buttonClass> & FlowProps<ButtonProps>) {
  return (
    <button
      class={buttonClass({ variant: props.variant })}
      onClick={() => props.onClick?.()}
      title={props.title}
    >
      {props.children}
    </button>
  )
}
