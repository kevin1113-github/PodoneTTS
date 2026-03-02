export function SelectBox(props: {
  label: string
  options: { label: string; value: string; description?: string; style?: React.CSSProperties }[]
  value: string
  defaultValue?: { label: string; description?: string; style?: React.CSSProperties }
  onChange: (value: string) => void
  disabled?: boolean
  disableDescription?: string
}): React.JSX.Element {
  const { label, options, defaultValue, onChange, disabled = false, disableDescription } = props
  const value = props.value || 'defaultValue'
  return (
    <div
      className="flex flex-col w-full cursor-pointer hover:bg-gray-800 rounded-md px-2 aria-disabled:opacity-50"
      tabIndex={disabled ? -1 : 0}
      onClick={(e) => {
        if (disabled) return
        const details = e.currentTarget.querySelector('details')
        if (details) {
          if (details.open) {
            details.removeAttribute('open')
          } else {
            details.setAttribute('open', '')
            e.currentTarget.focus()
          }
        }
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          const details = e.currentTarget.querySelector('details')
          if (details && details.open) {
            details.removeAttribute('open')
          }
        }
      }}
      aria-disabled={disabled}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium basis-1/2 select-none">{label}</span>
        <details
          className="relative basis-1/2 min-w-0"
          onClick={(e) => {
            e.preventDefault()
          }}
        >
          <summary
            className="list-none cursor-pointer p-2 text-gray-100 text-right select-none"
            style={value ? options.find((option) => option.value === value)?.style : undefined}
          >
            <div className="flex items-center justify-end">
              <span className="w-full overflow-hidden whitespace-nowrap text-ellipsis">
                {options.find((option) => option.value === value)?.label || defaultValue?.label}
              </span>
              <span className="ml-2 inline-block text-gray-400">▼</span>
            </div>
          </summary>
          <div className="absolute right-0 mt-1 w-[200%] rounded-md border border-gray-700 bg-gray-950 shadow-lg z-10">
            {defaultValue && (
              <button
                key="defaultValue"
                type="button"
                className="w-full text-right px-2 py-1 text-gray-100 hover:bg-gray-800 opacity-50"
                style={defaultValue.style}
                disabled
              >
                {defaultValue.label}
              </button>
            )}
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className="w-full text-right px-2 py-1 text-gray-100 hover:bg-gray-800"
                onClick={() => {
                  onChange(option.value)
                }}
                style={option.style}
              >
                {option.label}
              </button>
            ))}
          </div>
        </details>
      </div>
      {(() => {
        const option = disabled
          ? { description: disableDescription }
          : (options.find((option) => option.value === value) ??
            (value === 'defaultValue' ? defaultValue : null))
        if (!option || !option.description) {
          return null
        }
        console.log(value, option)
        return <span className="text-sm text-gray-200 pb-2 opacity-50">{option.description}</span>
      })()}
    </div>
  )
}
