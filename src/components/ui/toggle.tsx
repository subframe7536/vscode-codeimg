import { cls } from 'cls-variant'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  class?: string
  text: string
}

export function ToggleSwitch(props: ToggleSwitchProps) {
  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    props.onChange?.(target.checked)
  }

  return (
    <label class="relative inline-flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        checked={props.checked}
        onChange={handleChange}
        disabled={props.disabled}
        class="peer sr-only"
        aria-label="Toggle switch"
      />
      <div
        class={cls(
          `relative h-6 w-11 rounded-full transition-colors duration-300 ease-in-out`,
          `peer-disabled:cursor-not-allowed`,
          props.disabled ? 'opacity-50' : 'opacity-100',
          props.checked
            ? 'bg-$vscode-button-secondaryBackground'
            : 'bg-gray-300',
        )}
      >
        <div
          class={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ease-in-out
            ${props.checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </div>
      <div>
        {props.text}
      </div>
    </label>
  )
}
