import { OverlaySettingsPreset } from '@renderer/lib/storage/presets'
import { CustomButton } from './CustomButton'
import { ButtonStyleOptions } from './ButtonStyle'

export function Preset({
  preset,
  loadHandler,
  deleteHandler
}: {
  preset: OverlaySettingsPreset
  loadHandler: () => void
  deleteHandler: () => void
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-between p-2 border border-gray-700 rounded-md hover:bg-gray-800 has-[button:hover]:bg-transparent!">
      <h3 className="text-lg font-bold text-gray-100 px-2">{preset.name}</h3>
      <div className="flex gap-2">
        <CustomButton
          label="불러오기"
          onClick={loadHandler}
          buttonStyle={ButtonStyleOptions.NONE}
        />
        <CustomButton
          label="삭제"
          onClick={deleteHandler}
          buttonStyle={ButtonStyleOptions.NEGATIVE}
        />
      </div>
    </div>
  )
}
