export type TtsBusyBehavior = 'wait' | 'skip' | 'queue'

export type TtsSettings = {
  selectedVoice: string
  ttsSpeed: number
  busyBehavior: TtsBusyBehavior
}

const STORAGE_KEY = 'podone:tts-settings'
const EVENT_NAME = 'podone:tts-settings'

// Legacy: older versions stored TTS fields inside audio-settings.
const LEGACY_AUDIO_STORAGE_KEY = 'podone:audio-settings'

type PartialTtsSettings = Partial<TtsSettings>

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function parseTtsSettings(data: unknown): PartialTtsSettings | null {
  if (!data || typeof data !== 'object') return null
  const maybe = data as PartialTtsSettings

  const out: PartialTtsSettings = {}
  if (typeof maybe.selectedVoice === 'string') out.selectedVoice = maybe.selectedVoice
  if (typeof maybe.ttsSpeed === 'number' && Number.isFinite(maybe.ttsSpeed))
    out.ttsSpeed = maybe.ttsSpeed
  if (
    maybe.busyBehavior === 'wait' ||
    maybe.busyBehavior === 'skip' ||
    maybe.busyBehavior === 'queue'
  ) {
    out.busyBehavior = maybe.busyBehavior
  }

  return out
}

function mergeTtsSettings(defaults: TtsSettings, partial: PartialTtsSettings): TtsSettings {
  return {
    selectedVoice: partial.selectedVoice ?? defaults.selectedVoice,
    ttsSpeed: partial.ttsSpeed ?? defaults.ttsSpeed,
    busyBehavior: partial.busyBehavior ?? defaults.busyBehavior
  }
}

function loadLegacyFromAudioSettings(defaults: TtsSettings): TtsSettings | null {
  if (!isBrowser()) return null
  try {
    const raw = window.localStorage.getItem(LEGACY_AUDIO_STORAGE_KEY)
    if (!raw) return null
    const parsed = parseTtsSettings(JSON.parse(raw))
    if (!parsed) return null
    return mergeTtsSettings(defaults, parsed)
  } catch {
    return null
  }
}

export function loadTtsSettings(defaults: TtsSettings): TtsSettings {
  if (!isBrowser()) return defaults

  // Prefer the dedicated key.
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = parseTtsSettings(JSON.parse(raw))
      if (parsed) return mergeTtsSettings(defaults, parsed)
    }
  } catch {
    // ignore
  }

  // Fallback to legacy combined storage.
  const legacy = loadLegacyFromAudioSettings(defaults)
  if (legacy) {
    // Best-effort migrate.
    persistTtsSettings(legacy)
    return legacy
  }

  return defaults
}

let cachedRaw: string | null = null
let cachedSettings: TtsSettings | null = null

export function getTtsSettingsSnapshot(defaults: TtsSettings): TtsSettings {
  if (!isBrowser()) return defaults

  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    raw = null
  }

  if (raw === cachedRaw && cachedSettings) return cachedSettings
  cachedRaw = raw

  if (raw) {
    try {
      const parsed = parseTtsSettings(JSON.parse(raw))
      if (parsed) {
        cachedSettings = mergeTtsSettings(defaults, parsed)
        return cachedSettings
      }
    } catch {
      // ignore
    }
  }

  const legacy = loadLegacyFromAudioSettings(defaults)
  if (legacy) {
    cachedSettings = legacy
    return cachedSettings
  }

  cachedSettings = defaults
  return cachedSettings
}

export function getTtsSettingsServerSnapshot(defaults: TtsSettings): TtsSettings {
  return defaults
}

export function persistTtsSettings(settings: TtsSettings): void {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // ignore
  }

  // same-tab update
  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: settings }))
  } catch {
    // ignore
  }
}

export function subscribeTtsSettings(
  defaults: TtsSettings,
  handler: (settings: TtsSettings) => void
): () => void {
  if (!isBrowser()) return () => {}

  const onStorage = (event: StorageEvent): void => {
    if (event.key !== STORAGE_KEY) return
    if (!event.newValue) return
    try {
      const parsed = parseTtsSettings(JSON.parse(event.newValue))
      if (!parsed) return
      handler(mergeTtsSettings(defaults, parsed))
    } catch {
      // ignore
    }
  }

  const onCustom = (event: Event): void => {
    const custom = event as CustomEvent
    const parsed = parseTtsSettings(custom.detail)
    if (!parsed) return
    handler(mergeTtsSettings(defaults, parsed))
  }

  window.addEventListener('storage', onStorage)
  window.addEventListener(EVENT_NAME, onCustom)

  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(EVENT_NAME, onCustom)
  }
}

export function subscribeTtsSettingsStore(
  defaults: TtsSettings,
  onStoreChange: () => void
): () => void {
  return subscribeTtsSettings(defaults, () => {
    onStoreChange()
  })
}
