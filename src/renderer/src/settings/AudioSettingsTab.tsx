import { useMemo, useSyncExternalStore } from 'react'

import { Notice } from '@renderer/components/Notice'
import { Panel } from '@renderer/components/Panel'
import { useAudioDevices } from '@renderer/hooks/useAudioDevices'
import { DEFAULT_AUDIO_SETTINGS } from '@renderer/lib/constants/settings'
import {
  AudioSettings,
  getAudioSettingsServerSnapshot,
  getAudioSettingsSnapshot,
  persistAudioSettings,
  subscribeAudioSettingsStore
} from '@renderer/lib/storage/audioSettings'
import { Card } from '../components/Card'
import { Toggle } from '../components/Toggle'
import { SelectBox } from '../components/SelectBox'
import { CustomButton } from '../components/CustomButton'
import { ButtonStyleOptions } from '@renderer/components/ButtonStyle'

export type AudioDeviceInfo = {
  deviceId: string
  kind: string
  label: string
}

export function AudioSettingsTab(): React.JSX.Element {
  const { error, audioAllowed, devices } = useAudioDevices()

  const settings: AudioSettings = useSyncExternalStore(
    (onStoreChange) => subscribeAudioSettingsStore(DEFAULT_AUDIO_SETTINGS, onStoreChange),
    () => getAudioSettingsSnapshot(DEFAULT_AUDIO_SETTINGS),
    () => getAudioSettingsServerSnapshot(DEFAULT_AUDIO_SETTINGS)
  )

  const onReset = (): void => {
    if (confirm('오디오 설정을 기본값으로 되돌리시겠습니까?')) {
      persistAudioSettings(DEFAULT_AUDIO_SETTINGS)
    }
  }

  const audioOutputDevices = useMemo(() => {
    return devices.filter((device) => device.kind === 'audiooutput')
  }, [devices])

  return (
    <>
      {error ? (
        <Notice kind="error" title="오디오 장치 오류" role="alert">
          {error}
        </Notice>
      ) : null}

      {!audioAllowed ? (
        <Notice kind="warning" title="마이크 권한이 필요합니다" role="alert">
          장치 목록을 가져오려면 마이크 접근을 허용한 뒤 새로고침하세요. (TTS 음성/속도는 권한
          없이도 저장됩니다.)
        </Notice>
      ) : null}
      <Panel title="오디오">
        <Card description="TTS가 재생될 기본 출력 장치입니다.">
          <SelectBox
            label="기본 출력 장치"
            options={
              audioOutputDevices.length
                ? audioOutputDevices.map((device) => ({
                    label: device.label || `오디오 출력 장치 ${device.deviceId}`,
                    value: device.deviceId
                  }))
                : []
            }
            value={settings.outputDeviceId}
            defaultValue={{
              label: '장치를 선택하세요',
              description: '아직 출력 장치가 선택되지 않았습니다.'
            }}
            onChange={(value) => {
              persistAudioSettings({
                ...settings,
                outputDeviceId: value
              })
            }}
            disabled={!audioAllowed || audioOutputDevices.length === 0}
          />
          {/* {!outputDevice || !settings.outputDeviceId ? (
            <div className="text-sm text-gray-200">아직 출력 장치가 선택되지 않았습니다.</div>
          ) : null} */}
        </Card>

        <Card description="필요 시 다른 출력 장치로 동일한 TTS를 동시에 재생합니다.">
          <Toggle
            label="피드백 출력 사용"
            checked={settings.feedbackDeviceAllowed}
            onChange={(checked) => {
              persistAudioSettings({
                ...settings,
                feedbackDeviceAllowed: checked
              })
            }}
          />
          <SelectBox
            label="피드백 출력 장치"
            options={
              audioOutputDevices.length
                ? audioOutputDevices.map((device) => ({
                    label: device.label || `오디오 출력 장치 ${device.deviceId}`,
                    value: device.deviceId
                  }))
                : []
            }
            value={settings.feedbackDeviceId}
            defaultValue={{
              label: '장치를 선택하세요',
              description: '아직 피드백 장치가 선택되지 않았습니다.'
            }}
            onChange={(value) => {
              persistAudioSettings({
                ...settings,
                feedbackDeviceId: value
              })
            }}
            disabled={
              !audioAllowed || !settings.feedbackDeviceAllowed || audioOutputDevices.length === 0
            }
            disableDescription="피드백 출력을 사용하지 않습니다."
          />
        </Card>

        <Card description="오디오 설정을 기본값으로 되돌립니다.">
          <div className="w-full flex justify-end -mx-2">
            <CustomButton
              label="오디오 설정 초기화"
              buttonStyle={ButtonStyleOptions.NONE}
              onClick={onReset}
            />
          </div>
        </Card>
      </Panel>
    </>
  )
}
