import type { VariantProps } from 'cls-variant'
import type { FlowProps } from 'solid-js'

import { cls, clsv, clsvDefault } from 'cls-variant'

const buttonClass = clsvDefault(
  clsv(
    'b-none p-(x-3 y-2) rounded-2 transition cursor-pointer',
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
  disabled?: boolean
}

export function Button(props: VariantProps<typeof buttonClass> & FlowProps<ButtonProps>) {
  return (
    <button
      class={cls(buttonClass({ variant: props.variant }), props.disabled && 'ui-disable')}
      onClick={() => props.onClick?.()}
      title={props.title}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  )
}
