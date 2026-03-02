import { Link } from 'react-router'

import { OverlaySettingsTab } from '@renderer/settings/OverlaySettingsTab'
import { AudioSettingsTab } from '@renderer/settings/AudioSettingsTab'
import { TtsSettingsTab } from '@renderer/settings/TtsSettingsTab'
import { Suspense } from 'react'
import { CustomButton } from './components/CustomButton'
import { ButtonStyleOptions } from './components/ButtonStyle'
import { Panel } from './components/Panel'
import { DEFAULT_AUDIO_SETTINGS, DEFAULT_TTS_SETTINGS } from './lib/constants/settings'
import { persistAudioSettings } from './lib/storage/audioSettings'
import { persistOverlaySettings, DEFAULT_OVERLAY_SETTINGS } from './lib/storage/overlaySettings'
import { persistTtsSettings } from './lib/storage/ttsSettings'

export default function Settings(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <main className="p-4">
          <div className="text-sm text-gray-300">설정 로딩 중…</div>
        </main>
      }
    >
      <main className="p-4 flex flex-col gap-6">
        <header className="flex justify-between">
          <h1 className="text-2xl font-bold">설정</h1>
          <Link to="/">
            <CustomButton label="홈" buttonStyle={ButtonStyleOptions.NONE} />
          </Link>
        </header>
        <AudioSettingsTab />
        <TtsSettingsTab />
        <OverlaySettingsTab />
        <Panel title="모든 설정 초기화">
          <CustomButton
            label="모든 설정 초기화"
            buttonStyle={ButtonStyleOptions.NEGATIVE}
            onClick={() => {
              if (confirm('모든 설정을 기본값으로 되돌리시겠습니까?')) {
                persistAudioSettings(DEFAULT_AUDIO_SETTINGS)
                persistTtsSettings(DEFAULT_TTS_SETTINGS)
                persistOverlaySettings(DEFAULT_OVERLAY_SETTINGS)
              }
            }}
          />
        </Panel>
      </main>
    </Suspense>
  )
}
