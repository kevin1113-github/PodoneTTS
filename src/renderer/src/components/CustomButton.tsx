import { tw } from '@renderer/lib/constants/settings'
import { ButtonStyle, ButtonStyleOptions } from './ButtonStyle'

const buttonStyles: Record<ButtonStyle, string> = {
  primary: tw`shrink-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed`,
  secondary: tw`shrink-0 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed`,
  // negative: tw`shrink-0 px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 disabled:opacity-60 disabled:cursor-not-allowed`,
  negative: tw`shrink-0 px-4 py-2 border border-red-600 rounded-md hover:bg-red-600 text-red-600 font-bold hover:text-white disabled:opacity-60 disabled:cursor-not-allowed`,
  none: tw`shrink-0 px-4 py-2 border border-gray-700 rounded-md hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed`,
  fullLeft: tw`w-full p-2 cursor-pointer text-left hover:bg-gray-800 rounded-md text-white disabled:opacity-60 disabled:cursor-not-allowed`,
  fullRight: tw`w-full p-2 cursor-pointer text-right hover:bg-gray-800 rounded-md disabled:opacity-60 disabled:cursor-not-allowed`
}

export function CustomButton({
  label,
  onClick,
  buttonStyle,
  disabled
}: {
  label: string
  onClick?: () => void
  buttonStyle: ButtonStyle
  disabled?: boolean
}): React.JSX.Element {
  let className: string

  switch (buttonStyle) {
    case ButtonStyleOptions.PRIMARY:
      className = buttonStyles.primary
      break
    case ButtonStyleOptions.SECONDARY:
      className = buttonStyles.secondary
      break
    case ButtonStyleOptions.NEGATIVE:
      className = buttonStyles.negative
      break
    case ButtonStyleOptions.NONE:
      className = buttonStyles.none
      break
    case ButtonStyleOptions.FULL_LEFT:
      className = buttonStyles.fullLeft
      break
    case ButtonStyleOptions.FULL_RIGHT:
      className = buttonStyles.fullRight
      break
    default:
      className = ''
  }

  return (
    <button type="button" className={className} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  )
}
