import type { TtsSettings } from '@renderer/lib/storage/ttsSettings'
import {
  hasPlayback,
  peekPlayback,
  shiftPlayback,
  type PlaybackQueueRef
} from '@renderer/lib/tts/playbackQueue'
import type { UiMessage } from '@renderer/lib/ui/uiMessage'

export async function handlePlaybackQueue(params: {
  busyBehavior: TtsSettings['busyBehavior']
  playbackChainRef: PlaybackQueueRef
  submitTtsRequest: (text: string) => Promise<void>
}): Promise<void> {
  if (params.busyBehavior !== 'queue') return

  shiftPlayback(params.playbackChainRef)
  if (hasPlayback(params.playbackChainRef)) {
    const nextText = peekPlayback(params.playbackChainRef)
    if (nextText) {
      await params.submitTtsRequest(nextText)
    }
  }
}

export function reportTtsError(params: {
  error: unknown
  onUiMessage: (message: UiMessage) => void
}): void {
  console.error('TTS 실행 중 오류:', params.error)
  params.onUiMessage({
    kind: 'error',
    title: 'TTS 요청 실패',
    message: params.error instanceof Error ? params.error.message : 'TTS 요청에 실패했습니다.',
    dismissible: true
  })
}
