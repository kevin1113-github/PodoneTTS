export function NumberInput({
  label,
  value,
  onChange,
  disabled,
  min,
  max,
  step
}: {
  label?: string
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  min?: number
  max?: number
  step?: number
}): React.JSX.Element {
  return (
    <label className="flex-wrap flex flex-col gap-1 text-sm">
      {label && <span className="font-medium text-heading">{label}</span>}
      <input
        type="number"
        className="w-20 text-center py-2"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
      />
    </label>
  )
}
