import { playAudioToDevice } from '@renderer/lib/media/playAudioToDevice'
import type { PlaybackRef } from '@renderer/lib/media/stopPlayback'

export async function playToDeviceWithRef(params: {
  playbackRef: { current: PlaybackRef }
  audioUrl: string
  deviceId: string
  kind: 'output' | 'feedback'
}): Promise<HTMLAudioElement> {
  const currentAudio =
    params.kind === 'output'
      ? params.playbackRef.current.outputAudio
      : params.playbackRef.current.feedbackAudio

  const audio = await playAudioToDevice({
    audio: currentAudio ?? null,
    audioUrl: params.audioUrl,
    deviceId: params.deviceId
  })

  if (params.kind === 'output') {
    params.playbackRef.current.outputAudio = audio
  } else {
    params.playbackRef.current.feedbackAudio = audio
  }

  return audio
}
