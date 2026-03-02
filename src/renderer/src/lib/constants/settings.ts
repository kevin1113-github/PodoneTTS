import type { AudioSettings } from '@renderer/lib/storage/audioSettings'
import type { TtsSettings } from '@renderer/lib/storage/ttsSettings'

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  outputDeviceId: '',
  feedbackDeviceId: '',
  feedbackDeviceAllowed: false
}

export const DEFAULT_TTS_SETTINGS: TtsSettings = {
  selectedVoice: 'SeoHyeonNeural',
  ttsSpeed: 30,
  busyBehavior: 'wait'
}

export const tw = String.raw
