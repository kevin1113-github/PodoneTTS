import { NumberInput } from './NumberInput'
import { Slider } from './Slider'

export function NumberInputWithSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  disabled
}: {
  label?: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  disabled?: boolean
}): React.JSX.Element {
  return (
    <div
      onClick={(e) => {
        const numberField: HTMLInputElement | null =
          e.currentTarget.querySelector('input[type="number"]')
        if (numberField) {
          numberField.focus()
        }
      }}
      className="flex items-center w-full gap-2 cursor-pointer hover:bg-gray-800 rounded-md px-2"
    >
      {label && <span className="font-medium text-heading flex-1">{label}</span>}
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        disabled={disabled}
      />
      <NumberInput
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  )
}
