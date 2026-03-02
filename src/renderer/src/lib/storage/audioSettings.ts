export type AudioSettings = {
  outputDeviceId: string
  feedbackDeviceId: string
  feedbackDeviceAllowed: boolean
}

const STORAGE_KEY = 'podone:audio-settings'
const EVENT_NAME = 'podone:audio-settings'

type PartialAudioSettings = Partial<AudioSettings>

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function parseAudioSettings(data: unknown): PartialAudioSettings | null {
  if (!data || typeof data !== 'object') return null
  const maybe = data as PartialAudioSettings

  const out: PartialAudioSettings = {}
  if (typeof maybe.outputDeviceId === 'string') out.outputDeviceId = maybe.outputDeviceId
  if (typeof maybe.feedbackDeviceId === 'string') out.feedbackDeviceId = maybe.feedbackDeviceId
  if (typeof maybe.feedbackDeviceAllowed === 'boolean')
    out.feedbackDeviceAllowed = maybe.feedbackDeviceAllowed

  return out
}

function mergeAudioSettings(defaults: AudioSettings, partial: PartialAudioSettings): AudioSettings {
  return {
    outputDeviceId: partial.outputDeviceId ?? defaults.outputDeviceId,
    feedbackDeviceId: partial.feedbackDeviceId ?? defaults.feedbackDeviceId,
    feedbackDeviceAllowed: partial.feedbackDeviceAllowed ?? defaults.feedbackDeviceAllowed
  }
}

export function loadAudioSettings(defaults: AudioSettings): AudioSettings {
  if (!isBrowser()) return defaults
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaults
    const parsed = parseAudioSettings(JSON.parse(raw))
    if (!parsed) return defaults
    return mergeAudioSettings(defaults, parsed)
  } catch {
    return defaults
  }
}

let cachedRaw: string | null = null
let cachedSettings: AudioSettings | null = null

export function getAudioSettingsSnapshot(defaults: AudioSettings): AudioSettings {
  if (!isBrowser()) return defaults

  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    raw = null
  }

  if (raw === cachedRaw && cachedSettings) return cachedSettings
  cachedRaw = raw

  if (!raw) {
    cachedSettings = defaults
    return cachedSettings
  }

  try {
    const parsed = parseAudioSettings(JSON.parse(raw))
    cachedSettings = parsed ? mergeAudioSettings(defaults, parsed) : defaults
    return cachedSettings
  } catch {
    cachedSettings = defaults
    return cachedSettings
  }
}

export function getAudioSettingsServerSnapshot(defaults: AudioSettings): AudioSettings {
  return defaults
}

export function persistAudioSettings(settings: AudioSettings): void {
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

export function subscribeAudioSettings(
  defaults: AudioSettings,
  handler: (settings: AudioSettings) => void
): () => void {
  if (!isBrowser()) return () => {}

  const onStorage = (event: StorageEvent): void => {
    if (event.key !== STORAGE_KEY) return
    if (!event.newValue) return
    try {
      const parsed = parseAudioSettings(JSON.parse(event.newValue))
      if (!parsed) return
      handler(mergeAudioSettings(defaults, parsed))
    } catch {
      // ignore
    }
  }

  const onCustom = (event: Event): void => {
    const custom = event as CustomEvent
    const parsed = parseAudioSettings(custom.detail)
    if (!parsed) return
    handler(mergeAudioSettings(defaults, parsed))
  }

  window.addEventListener('storage', onStorage)
  window.addEventListener(EVENT_NAME, onCustom)

  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(EVENT_NAME, onCustom)
  }
}

export function subscribeAudioSettingsStore(
  defaults: AudioSettings,
  onStoreChange: () => void
): () => void {
  return subscribeAudioSettings(defaults, () => {
    onStoreChange()
  })
}
