import { parseOverlaySettings, type OverlaySettings } from '@renderer/lib/storage/overlaySettings'

export type OverlaySettingsPreset = {
  id: string
  name: string
  createdAtMs: number
  settings: OverlaySettings
}

const SERVER_SNAPSHOT: OverlaySettingsPreset[] = []

const STORAGE_KEY = 'podone:overlay-settings-presets'
const EVENT_NAME = 'podone:overlay-settings-presets'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function parsePresets(data: unknown): OverlaySettingsPreset[] {
  if (!Array.isArray(data)) return []

  const out: OverlaySettingsPreset[] = []
  for (const item of data) {
    if (!item || typeof item !== 'object') continue
    const record = item as Record<string, unknown>

    const id = typeof record.id === 'string' ? record.id : ''
    const name = typeof record.name === 'string' ? record.name : ''
    const createdAtMs =
      typeof record.createdAtMs === 'number' && Number.isFinite(record.createdAtMs)
        ? record.createdAtMs
        : 0

    const settings = parseOverlaySettings(record.settings)
    if (!id || !name || !settings) continue

    out.push({ id, name, createdAtMs, settings })
  }

  return out
}

let cachedRaw: string | null = null
let cachedPresets: OverlaySettingsPreset[] = []

export function getOverlaySettingsPresetsSnapshot(): OverlaySettingsPreset[] {
  if (!isBrowser()) return []

  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    raw = null
  }

  if (raw === cachedRaw) return cachedPresets
  cachedRaw = raw

  if (!raw) {
    cachedPresets = []
    return cachedPresets
  }

  try {
    cachedPresets = parsePresets(JSON.parse(raw))
    return cachedPresets
  } catch {
    cachedPresets = []
    return cachedPresets
  }
}

export function getOverlaySettingsPresetsServerSnapshot(): OverlaySettingsPreset[] {
  return SERVER_SNAPSHOT
}

export function persistOverlaySettingsPresets(presets: OverlaySettingsPreset[]): void {
  if (!isBrowser()) return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
  } catch {
    // ignore
  }

  cachedRaw = JSON.stringify(presets)
  cachedPresets = presets

  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: presets }))
  } catch {
    // ignore
  }
}

export function subscribeOverlaySettingsPresets(
  handler: (presets: OverlaySettingsPreset[]) => void
) {
  if (!isBrowser()) return () => {}

  const onStorage = (event: StorageEvent): void => {
    if (event.key !== STORAGE_KEY) return
    if (!event.newValue) {
      handler([])
      return
    }

    try {
      handler(parsePresets(JSON.parse(event.newValue)))
    } catch {
      // ignore
    }
  }

  const onCustom = (event: Event): void => {
    const custom = event as CustomEvent
    handler(parsePresets(custom.detail))
  }

  window.addEventListener('storage', onStorage)
  window.addEventListener(EVENT_NAME, onCustom)

  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(EVENT_NAME, onCustom)
  }
}

export function subscribeOverlaySettingsPresetsStore(onStoreChange: () => void): () => void {
  return subscribeOverlaySettingsPresets(() => {
    onStoreChange()
  })
}

export function addOverlaySettingsPreset(name: string, settings: OverlaySettings): void {
  const trimmed = name.trim()
  if (!trimmed) return

  const next: OverlaySettingsPreset[] = [
    {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: trimmed,
      createdAtMs: Date.now(),
      settings
    },
    ...getOverlaySettingsPresetsSnapshot()
  ]

  persistOverlaySettingsPresets(next)
}

export function deleteOverlaySettingsPreset(id: string): void {
  const next = getOverlaySettingsPresetsSnapshot().filter((p) => p.id !== id)
  persistOverlaySettingsPresets(next)
}
