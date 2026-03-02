export function Slider({
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
    <label className="flex-1 flex flex-col gap-1">
      {label && <span>{label}</span>}
      <input
        type="range"
        className="w-full h-full accent-white rounded-lg appearance-none cursor-pointer"
        style={{
          background: (() => {
            const slice = (value - min) / (max - min)
            return `linear-gradient(to right, #4160a3 0%, #4160a3 calc((100% - 16px) * ${slice} + 8px), #1f2e4e calc((100% - 16px) * ${slice} + 8px), #1f2e4e 100%)`
          })()
        }}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          onChange(Number(e.target.value))
        }}
        disabled={disabled}
      />
    </label>
  )
}
