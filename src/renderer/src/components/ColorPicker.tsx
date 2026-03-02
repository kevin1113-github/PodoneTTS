export function ColorPicker({
  label,
  value,
  onChange,
  disabled
}: {
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}): React.JSX.Element {
  return (
    <label className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-800 rounded-md p-2">
      <span className="select-none text-md font-medium text-heading">{label}</span>
      <input
        type="color"
        className="w-12 h-6 p-0 b-0 m-0 rounded-md border-0 bg-transparent cursor-pointer"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </label>
  )
}
