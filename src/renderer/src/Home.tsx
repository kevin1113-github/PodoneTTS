import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'

import { useAudioDevices } from '@renderer/hooks/useAudioDevices'
import { useSettingsStore } from '@renderer/hooks/useSettingsStore'
import { useTtsPlayback } from '@renderer/hooks/useTtsPlayback'
import type { UiMessage } from '@renderer/lib/ui/uiMessage'

import { Notice } from '@renderer/components/Notice'
import { Panel } from '@renderer/components/Panel'
import { CustomButton } from './components/CustomButton'
import { ButtonStyleOptions } from './components/ButtonStyle'

export default function Home(): React.JSX.Element {
  const isDebug = import.meta.env.DEV

  const { audioAllowed, devices, error: audioDeviceError } = useAudioDevices()

  const devicesLoaded = audioAllowed || Boolean(audioDeviceError)
  const { audioSettings, ttsSettings } = useSettingsStore({ devicesLoaded })

  // Audio settings
  const outputDeviceId = audioSettings.outputDeviceId
  const feedbackDeviceId = audioSettings.feedbackDeviceId
  const feedbackDeviceAllowed = audioSettings.feedbackDeviceAllowed
  // TTS settings
  const selectedVoice = ttsSettings.selectedVoice
  const ttsSpeed = ttsSettings.ttsSpeed
  const busyBehavior = ttsSettings.busyBehavior

  const ttsInputRef = useRef<HTMLTextAreaElement>(null)

  const [ttsText, setTtsText] = useState<string>('')
  const [uiMessage, setUiMessage] = useState<UiMessage>(null)

  const { isSubmitting, isPlaying, submitTtsRequest, enqueuePlayback } = useTtsPlayback({
    devicesLoaded,
    audioAllowed,
    outputDeviceId,
    feedbackDeviceId,
    feedbackDeviceAllowed,
    selectedVoice,
    ttsSpeed,
    busyBehavior,
    onUiMessage: (message) => setUiMessage(message),
    onClearInput: () => setTtsText(''),
    onFocusInput: () => ttsInputRef.current?.focus()
  })

  const audioOutputDevices = useMemo(() => {
    return devices.filter((device) => device.kind === 'audiooutput')
  }, [devices])

  const selectedOutputDevice = useMemo(() => {
    if (!outputDeviceId) return null
    return audioOutputDevices.find((device) => device.deviceId === outputDeviceId) ?? null
  }, [audioOutputDevices, outputDeviceId])

  const selectedFeedbackDevice = useMemo(() => {
    if (!feedbackDeviceId) return null
    return audioOutputDevices.find((device) => device.deviceId === feedbackDeviceId) ?? null
  }, [audioOutputDevices, feedbackDeviceId])

  function formatDeviceLabel(params: { deviceId: string; device: MediaDeviceInfo | null }): string {
    if (!devicesLoaded) return '설정 불러오는 중...'
    if (!params.deviceId) return '미설정'
    if (params.device?.label) return params.device.label
    return `알 수 없음 (${params.deviceId})`
  }

  useEffect(() => {
    if (!devicesLoaded) return
    if (isDebug) {
      console.log('설정 불러옴:', {
        outputDeviceId: audioSettings.outputDeviceId,
        feedbackDeviceId: audioSettings.feedbackDeviceId,
        feedbackDeviceAllowed: audioSettings.feedbackDeviceAllowed,
        voice: ttsSettings.selectedVoice,
        speed: ttsSettings.ttsSpeed,
        busyBehavior: ttsSettings.busyBehavior
      })
    }
  }, [
    devicesLoaded,
    isDebug,
    audioSettings.outputDeviceId,
    audioSettings.feedbackDeviceId,
    audioSettings.feedbackDeviceAllowed,
    ttsSettings.selectedVoice,
    ttsSettings.ttsSpeed,
    ttsSettings.busyBehavior
  ])

  function enterSubmit(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (busyBehavior === 'queue') {
        enqueuePlayback(ttsText.trim())
        setTtsText('')
      } else {
        void submitTtsRequest(ttsText.trim())
      }
    }
  }

  const trimmedText = ttsText.trim()
  const submitDisabledReason = (() => {
    if (!devicesLoaded) return '권한 확인 및 설정을 불러오는 중입니다.'
    if (!audioAllowed) return '마이크 권한이 필요합니다.'
    if (!outputDeviceId) return '출력 장치가 설정되지 않았습니다.'
    if (isSubmitting) return 'TTS를 생성하는 중입니다.'
    if (isPlaying && busyBehavior === 'wait')
      return 'TTS가 재생 중입니다. 끝날 때까지 기다려 주세요.'
    if (!trimmedText) return '읽을 문장을 입력하세요.'
    return null
  })()
  const canSubmit = submitDisabledReason === null

  return (
    <main className="p-4 flex flex-col gap-6">
      {/* 메인 헤더 */}
      <header className="flex justify-between">
        <h1 className="text-2xl font-bold">포도네 TTS</h1>
        <div className="flex gap-2">
          <Link to="/overlay" target="_blank">
            <CustomButton label="TTS 채팅 열기" buttonStyle={ButtonStyleOptions.NONE} />
          </Link>
          <Link to="/settings">
            <CustomButton label="설정" buttonStyle={ButtonStyleOptions.NONE} />
          </Link>
        </div>
      </header>

      {/* 알 수 없는 오디오 장치 오류 */}
      {audioDeviceError ? (
        <Notice kind="warning" title="오디오 장치를 가져오지 못했습니다" role="alert">
          {audioDeviceError}
        </Notice>
      ) : null}

      {/* 권한 확인 및 설정 불러오는 중 */}
      {!devicesLoaded ? (
        <Notice kind="info" title="준비 중">
          마이크 권한 확인 및 저장된 설정을 불러오는 중입니다.
        </Notice>
      ) : null}

      {/* 마이크 권한 필요 */}
      {devicesLoaded && !audioAllowed ? (
        <Notice kind="warning" title="마이크 권한이 필요합니다" role="alert">
          장치 목록을 가져오려면 마이크 접근을 허용해야 합니다. 브라우저 권한을 허용한 뒤 다시
          시도하세요.
        </Notice>
      ) : null}

      {/* 빠른 실행 */}
      <Panel title="빠른 실행" description="Enter: 재생, Shift+Enter: 줄바꿈">
        <textarea
          id="ttsInput"
          ref={ttsInputRef}
          className="min-h-40 border border-gray-700 rounded-md p-2 bg-gray-950 text-gray-100"
          placeholder="여기에 텍스트를 입력하세요"
          value={ttsText}
          onChange={(e) => {
            setTtsText(e.target.value)
            if (uiMessage?.kind === 'error') setUiMessage(null)
          }}
          onKeyDown={enterSubmit}
          autoFocus
        />
        <div className="flex items-center justify-between flex-wrap gap-2">
          {submitDisabledReason ? (
            <div className="text-sm">
              <OptionLabel label="재생 불가" value={submitDisabledReason} />
            </div>
          ) : null}
          <div className="flex items-center gap-4 ml-auto">
            <p className="text-xs text-gray-400 shrink-0">
              {trimmedText.length.toLocaleString()} 자
            </p>
            {busyBehavior === 'queue' ? (
              <CustomButton
                label="재생"
                onClick={() => {
                  enqueuePlayback(trimmedText)
                  setTtsText('')
                }}
                disabled={!canSubmit}
                buttonStyle={ButtonStyleOptions.PRIMARY}
              ></CustomButton>
            ) : (
              <CustomButton
                label={isSubmitting ? '생성 중...' : '재생'}
                onClick={() => {
                  submitTtsRequest(trimmedText)
                }}
                disabled={!canSubmit}
                buttonStyle={ButtonStyleOptions.PRIMARY}
              />
            )}
          </div>
        </div>

        {uiMessage ? (
          <Notice kind={uiMessage.kind} title={uiMessage.title} dismissible={uiMessage.dismissible}>
            {uiMessage.message}
          </Notice>
        ) : null}
      </Panel>

      {/* 출력 및 피드백 장치, 음성, 속도 정보 */}
      <div className="flex flex-col gap-2">
        <div className="text-sm">
          <OptionLabel
            label="출력"
            value={formatDeviceLabel({ deviceId: outputDeviceId, device: selectedOutputDevice })}
          />
          <br />
          <OptionLabel
            label="피드백"
            value={
              feedbackDeviceAllowed
                ? formatDeviceLabel({ deviceId: feedbackDeviceId, device: selectedFeedbackDevice })
                : 'OFF'
            }
          />
          <br />
          <OptionLabel label="음성" value={selectedVoice} />
          <span> · </span>
          <OptionLabel label="속도" value={ttsSpeed.toString()} />
        </div>
        <div className="text-xs text-gray-600">
          <p>오디오 장치 목록은 브라우저 및 권한 설정에 따라 다를 수 있습니다.</p>
          <p>장치 이름이 표시되지 않으면, 브라우저의 마이크 접근 권한을 확인하세요.</p>
        </div>
      </div>
    </main>
  )
}

function OptionLabel(params: {
  label: string
  value: string
  labelClassName?: string
  valueClassName?: string
}): React.JSX.Element {
  const { label, value, labelClassName, valueClassName } = params
  return (
    <>
      <span className={(labelClassName ?? '') + ' font-light text-gray-500'}>{label}: </span>
      <span className={(valueClassName ?? '') + ' font-medium text-gray-400'}>{value}</span>
    </>
  )
}
