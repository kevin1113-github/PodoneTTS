import { useRef, useState } from 'react'

import { stopPlayback, type PlaybackRef } from '@renderer/lib/media/stopPlayback'
import { postOverlayMessage } from '@renderer/lib/overlay/broadcast'
import type { TtsSettings } from '@renderer/lib/storage/ttsSettings'
import { runTtsPlayback } from '@renderer/lib/tts/playbackHelpers'
import { handlePlaybackQueue, reportTtsError } from '@renderer/lib/tts/playbackFlow'
import {
  enqueuePlayback as enqueuePlaybackItem,
  peekPlayback,
  type PlaybackQueueRef
} from '@renderer/lib/tts/playbackQueue'
import { buildTtsRequestParams } from '@renderer/lib/tts/requestParams'
import { validateTtsRequest } from '@renderer/lib/tts/validateTtsRequest'
import type { UiMessage } from '@renderer/lib/ui/uiMessage'

export type UseTtsPlaybackParams = {
  devicesLoaded: boolean
  audioAllowed: boolean
  outputDeviceId: string
  feedbackDeviceId: string
  feedbackDeviceAllowed: boolean
  selectedVoice: string
  ttsSpeed: number
  busyBehavior: TtsSettings['busyBehavior']
  onUiMessage: (message: UiMessage) => void
  onClearInput?: () => void
  onFocusInput?: () => void
}

export function useTtsPlayback(params: UseTtsPlaybackParams): {
  isSubmitting: boolean
  isPlaying: boolean
  submitTtsRequest: (text: string) => Promise<void>
  enqueuePlayback: (message: string) => void
  stopCurrentPlayback: (reason?: string) => void
} {
  const {
    devicesLoaded,
    audioAllowed,
    outputDeviceId,
    feedbackDeviceId,
    feedbackDeviceAllowed,
    selectedVoice,
    ttsSpeed,
    busyBehavior,
    onUiMessage,
    onClearInput,
    onFocusInput
  } = params

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const playbackRef = useRef<PlaybackRef>({
    outputAudio: null,
    feedbackAudio: null
  })

  const playbackChainRef = useRef<string[]>([]) as PlaybackQueueRef

  function stopCurrentPlayback(reason?: string): void {
    stopPlayback(playbackRef)
    setIsPlaying(false)

    if (reason) {
      onUiMessage({ kind: 'info', title: '재생 중지', message: reason, dismissible: true })
    }
  }

  function enqueuePlayback(message: string): void {
    enqueuePlaybackItem(playbackChainRef, message)

    if (!isPlaying) {
      const nextText = peekPlayback(playbackChainRef)
      if (nextText) {
        void submitTtsRequest(nextText)
      }
    }
    onUiMessage({
      kind: 'success',
      title: '대기열에 추가됨',
      message: '현재 재생이 끝난 뒤 이어서 재생됩니다.',
      dismissible: true
    })
  }

  async function submitTtsRequest(text: string): Promise<void> {
    if (isSubmitting) return

    const validation = validateTtsRequest({
      text,
      devicesLoaded,
      audioAllowed,
      outputDeviceId,
      isPlaying,
      busyBehavior
    })

    if (validation.message) {
      onUiMessage(validation.message)
      if (validation.shouldFocusInput) {
        onFocusInput?.()
      }
      return
    }

    const request = buildTtsRequestParams({
      text,
      selectedVoice,
      ttsSpeed,
      outputDeviceId,
      feedbackDeviceId,
      feedbackDeviceAllowed
    })

    postOverlayMessage(request.text)

    if (isPlaying && busyBehavior === 'skip') {
      stopCurrentPlayback('새 요청으로 현재 재생을 스킵했습니다.')
    }

    try {
      await runTtsPlayback({
        text: request.text,
        voiceName: request.voiceName,
        speed: request.speed,
        outputDeviceId: request.outputDeviceId,
        feedbackDeviceId: request.feedbackDeviceId,
        feedbackDeviceAllowed: request.feedbackDeviceAllowed,
        busyBehavior,
        playbackRef,
        setIsSubmitting,
        setIsPlaying,
        onUiMessage,
        onClearInput,
        onFocusInput
      })
    } catch (submitError) {
      reportTtsError({ error: submitError, onUiMessage })
    } finally {
      playbackRef.current = {
        outputAudio: null,
        feedbackAudio: null
      }
      setIsPlaying(false)

      await handlePlaybackQueue({
        busyBehavior,
        playbackChainRef,
        submitTtsRequest
      })
    }
  }

  return {
    isSubmitting,
    isPlaying,
    submitTtsRequest,
    enqueuePlayback,
    stopCurrentPlayback
  }
}
