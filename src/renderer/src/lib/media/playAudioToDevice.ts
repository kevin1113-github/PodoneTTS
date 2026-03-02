import { setAudioSinkId } from '@renderer/lib/media/setSinkId'

export async function playAudioToDevice(params: {
  audio: HTMLAudioElement | null
  audioUrl: string
  deviceId: string
}): Promise<HTMLAudioElement> {
  const audio = params.audio ?? new Audio(params.audioUrl)

  if (audio.src !== params.audioUrl) {
    audio.src = params.audioUrl
  }

  await setAudioSinkId(audio, params.deviceId)
  await audio.play()

  return audio
}
