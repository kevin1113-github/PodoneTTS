import { useMemo, useSyncExternalStore } from 'react'

import { DEFAULT_AUDIO_SETTINGS, DEFAULT_TTS_SETTINGS } from '@renderer/lib/constants/settings'
import {
  getAudioSettingsServerSnapshot,
  getAudioSettingsSnapshot,
  subscribeAudioSettingsStore,
  type AudioSettings
} from '@renderer/lib/storage/audioSettings'
import {
  getTtsSettingsServerSnapshot,
  getTtsSettingsSnapshot,
  subscribeTtsSettingsStore,
  type TtsSettings
} from '@renderer/lib/storage/ttsSettings'

export function useSettingsStore(params: { devicesLoaded: boolean }): {
  audioSettings: AudioSettings
  ttsSettings: TtsSettings
} {
  const { devicesLoaded } = params

  const audioSettings = useSyncExternalStore(
    (onStoreChange) => {
      if (!devicesLoaded) return () => {}
      return subscribeAudioSettingsStore(DEFAULT_AUDIO_SETTINGS, onStoreChange)
    },
    () =>
      devicesLoaded
        ? getAudioSettingsSnapshot(DEFAULT_AUDIO_SETTINGS)
        : getAudioSettingsServerSnapshot(DEFAULT_AUDIO_SETTINGS),
    () => getAudioSettingsServerSnapshot(DEFAULT_AUDIO_SETTINGS)
  )

  const ttsSettings = useSyncExternalStore(
    (onStoreChange) => {
      if (!devicesLoaded) return () => {}
      return subscribeTtsSettingsStore(DEFAULT_TTS_SETTINGS, onStoreChange)
    },
    () =>
      devicesLoaded
        ? getTtsSettingsSnapshot(DEFAULT_TTS_SETTINGS)
        : getTtsSettingsServerSnapshot(DEFAULT_TTS_SETTINGS),
    () => getTtsSettingsServerSnapshot(DEFAULT_TTS_SETTINGS)
  )

  return useMemo(() => ({ audioSettings, ttsSettings }), [audioSettings, ttsSettings])
}
