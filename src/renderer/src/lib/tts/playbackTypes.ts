import type { PlaybackRef } from '@renderer/lib/media/stopPlayback'
import type { TtsSettings } from '@renderer/lib/storage/ttsSettings'
import type { UiMessage } from '@renderer/lib/ui/uiMessage'

export type WaitForPlaybackEndParams = {
  outputAudio: HTMLAudioElement
  feedbackAudio: HTMLAudioElement | null
  audioUrl: string
  expectedEnds: number
}

export type CreateAudioBlobParams = {
  text: string
  voiceName: string
  speed: number
  setIsSubmitting: (value: boolean) => void
  onUiMessage: (message: UiMessage) => void
}

export type PlayAudioFromBlobParams = {
  audioBlob: Blob
  outputDeviceId: string
  feedbackDeviceId: string
  feedbackDeviceAllowed: boolean
  busyBehavior: TtsSettings['busyBehavior']
  playbackRef: { current: PlaybackRef }
  setIsPlaying: (value: boolean) => void
  onUiMessage: (message: UiMessage) => void
  onClearInput?: () => void
  onFocusInput?: () => void
}

export type RunTtsPlaybackParams = {
  text: string
  voiceName: string
  speed: number
  outputDeviceId: string
  feedbackDeviceId: string
  feedbackDeviceAllowed: boolean
  busyBehavior: TtsSettings['busyBehavior']
  playbackRef: { current: PlaybackRef }
  setIsSubmitting: (value: boolean) => void
  setIsPlaying: (value: boolean) => void
  onUiMessage: (message: UiMessage) => void
  onClearInput?: () => void
  onFocusInput?: () => void
}
