import { useSyncExternalStore } from 'react'

import { Panel } from '@renderer/components/Panel'
import { DEFAULT_TTS_SETTINGS } from '@renderer/lib/constants/settings'
import {
  getTtsSettingsServerSnapshot,
  getTtsSettingsSnapshot,
  persistTtsSettings,
  subscribeTtsSettingsStore,
  TtsBusyBehavior,
  TtsSettings
} from '@renderer/lib/storage/ttsSettings'
import { Card } from '../components/Card'
import { SelectBox } from '../components/SelectBox'
import { CustomButton } from '../components/CustomButton'
import { ButtonStyleOptions } from '@renderer/components/ButtonStyle'
import { NumberInputWithSlider } from '@renderer/components/NumberInputWithSlider'

export function TtsSettingsTab(): React.JSX.Element {
  const settings: TtsSettings = useSyncExternalStore(
    (onStoreChange) => subscribeTtsSettingsStore(DEFAULT_TTS_SETTINGS, onStoreChange),
    () => getTtsSettingsSnapshot(DEFAULT_TTS_SETTINGS),
    () => getTtsSettingsServerSnapshot(DEFAULT_TTS_SETTINGS)
  )

  const onReset = (): void => {
    if (confirm('TTS 설정을 기본값으로 되돌리시겠습니까?')) {
      persistTtsSettings(DEFAULT_TTS_SETTINGS)
    }
  }

  return (
    <>
      <Panel title="TTS">
        <Card description="이미 TTS가 재생 중일 때 새 재생 요청을 어떻게 처리할지 선택합니다.">
          <SelectBox
            label="재생 중 동작"
            options={[
              {
                label: '입력 대기',
                value: 'wait',
                description: '재생이 끝날 때까지 새 요청을 받지 않습니다.'
              },
              {
                label: '재생중인 TTS 스킵',
                value: 'skip',
                description: '현재 재생을 중지하고 새 요청을 즉시 재생합니다.'
              },
              {
                label: '끝나고 이어서 재생',
                value: 'queue',
                description: '새 요청을 대기열에 넣고, 현재 재생이 끝난 뒤 이어서 재생합니다.'
              }
            ]}
            value={settings.busyBehavior}
            onChange={(value) => {
              const busyBehavior = value as TtsBusyBehavior
              persistTtsSettings({ ...settings, busyBehavior })
            }}
          />
        </Card>

        <Card description="상황에 맞는 목소리를 선택하세요.">
          <SelectBox
            label="음성"
            options={[
              { label: '서현(여)', value: 'SeoHyeonNeural' },
              { label: '선히(여)', value: 'SunHiNeural' },
              { label: '인준(남)', value: 'InJoonNeural' },
              { label: '현수(남)', value: 'HyunsuNeural' },
              { label: '봉진(남)', value: 'BongJinNeural' },
              { label: '국민(남)', value: 'GookMinNeural' },
              { label: '지민(여)', value: 'JiMinNeural' },
              { label: '순복(여)', value: 'SoonBokNeural' },
              { label: '유진(여)', value: 'YuJinNeural' },
              { label: '현수(남) (다국어 지원)', value: 'HyunsuMultilingualNeural' }
            ]}
            value={settings.selectedVoice}
            onChange={(value) => {
              persistTtsSettings({ ...settings, selectedVoice: value })
            }}
          />
        </Card>

        <Card description="값이 클수록 더 빠르게 읽습니다.">
          <NumberInputWithSlider
            label="속도"
            value={settings.ttsSpeed}
            min={0}
            max={100}
            onChange={(v) => {
              const value = Math.min(100, Math.max(0, Math.round(v)))
              persistTtsSettings({
                ...settings,
                ttsSpeed: value
              })
            }}
          />
        </Card>

        <Card description="TTS 설정을 기본값으로 되돌립니다.">
          <div className="w-full flex justify-end -mx-2">
            <CustomButton
              label="TTS 설정 초기화"
              buttonStyle={ButtonStyleOptions.NONE}
              onClick={onReset}
            />
          </div>
        </Card>
      </Panel>
    </>
  )
}
