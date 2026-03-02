import { playToDeviceWithRef } from '@renderer/lib/media/playToDeviceWithRef'
import { requestTtsAudio } from '@renderer/lib/tts/client'
import type {
  CreateAudioBlobParams,
  PlayAudioFromBlobParams,
  RunTtsPlaybackParams,
  WaitForPlaybackEndParams
} from '@renderer/lib/tts/playbackTypes'

function waitForPlaybackEnd(params: WaitForPlaybackEndParams): Promise<void> {
  const { outputAudio, feedbackAudio, audioUrl, expectedEnds } = params

  let remainingEnds = expectedEnds
  let revoked = false

  const revokeOnceAllEnded = (): void => {
    remainingEnds -= 1
    if (remainingEnds <= 0 && !revoked) {
      revoked = true
      URL.revokeObjectURL(audioUrl)
    }
  }

  return new Promise<void>((resolve) => {
    const onEnded = (): void => {
      revokeOnceAllEnded()
      resolveIfDone()
    }
    let endedCount = 0
    const resolveIfDone = (): void => {
      endedCount += 1
      if (endedCount >= expectedEnds) resolve()
    }
    outputAudio.addEventListener('ended', onEnded, { once: true })
    if (feedbackAudio) {
      feedbackAudio.addEventListener('ended', onEnded, { once: true })
    }
  })
}

export async function createAudioBlob(params: CreateAudioBlobParams): Promise<Blob> {
  params.setIsSubmitting(true)
  params.onUiMessage({
    kind: 'info',
    title: 'TTS 생성 중',
    message: '잠시만 기다려 주세요.',
    dismissible: true
  })

  try {
    return await requestTtsAudio({
      text: params.text,
      voiceName: params.voiceName,
      speed: params.speed
    })
  } finally {
    params.setIsSubmitting(false)
  }
}

export async function playAudioFromBlob(params: PlayAudioFromBlobParams): Promise<void> {
  if (params.busyBehavior !== 'queue') {
    params.onClearInput?.()
  }
  params.onFocusInput?.()

  const audioUrl = URL.createObjectURL(params.audioBlob)
  const shouldPlayFeedback = Boolean(params.feedbackDeviceId && params.feedbackDeviceAllowed)

  params.setIsPlaying(true)

  try {
    const outputAudio = await playToDeviceWithRef({
      playbackRef: params.playbackRef,
      audioUrl,
      deviceId: params.outputDeviceId,
      kind: 'output'
    })

    let feedbackAudio: HTMLAudioElement | null = null
    if (shouldPlayFeedback) {
      feedbackAudio = await playToDeviceWithRef({
        playbackRef: params.playbackRef,
        audioUrl,
        deviceId: params.feedbackDeviceId,
        kind: 'feedback'
      })
    }

    params.onUiMessage({
      kind: 'success',
      title: '재생 시작',
      message: shouldPlayFeedback
        ? '출력 장치와 피드백 장치로 재생을 시작했습니다.'
        : '출력 장치로 재생을 시작했습니다.',
      dismissible: true
    })

    await waitForPlaybackEnd({
      outputAudio,
      feedbackAudio,
      audioUrl,
      expectedEnds: shouldPlayFeedback ? 2 : 1
    })
  } catch (error) {
    URL.revokeObjectURL(audioUrl)
    throw error
  }
}

export async function runTtsPlayback(params: RunTtsPlaybackParams): Promise<void> {
  const audioBlob = await createAudioBlob({
    text: params.text,
    voiceName: params.voiceName,
    speed: params.speed,
    setIsSubmitting: params.setIsSubmitting,
    onUiMessage: params.onUiMessage
  })

  await playAudioFromBlob({
    audioBlob,
    outputDeviceId: params.outputDeviceId,
    feedbackDeviceId: params.feedbackDeviceId,
    feedbackDeviceAllowed: params.feedbackDeviceAllowed,
    busyBehavior: params.busyBehavior,
    playbackRef: params.playbackRef,
    setIsPlaying: params.setIsPlaying,
    onUiMessage: params.onUiMessage,
    onClearInput: params.onClearInput,
    onFocusInput: params.onFocusInput
  })
}
