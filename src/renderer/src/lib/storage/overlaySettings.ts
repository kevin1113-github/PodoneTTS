export type OverlaySettings = {
  align: 'left' | 'center' | 'right'
  messageTtlMs: number
  bubbleColor: string // "" means auto
  bubbleGapPx: number
  bubbleRadiusPx: number
  bubbleTransparencyPct: number
  textSizePx: number
  textColor: string // "" means auto
  textFont: string
}

const STORAGE_KEY = 'podone:overlay-settings'
const EVENT_NAME = 'podone:overlay-settings'

// 9d5fff 말풍선 배경 색상
export const DEFAULT_OVERLAY_SETTINGS: OverlaySettings = {
  align: 'left',
  messageTtlMs: 10_000,
  bubbleColor: '#800080',
  bubbleGapPx: 12,
  bubbleRadiusPx: 24,
  bubbleTransparencyPct: 80,
  textSizePx: 32,
  textColor: '#ffffff',
  textFont: 'Jua'
}

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function parseSettings(data: unknown): OverlaySettings | null {
  if (!data || typeof data !== 'object') return null
  const maybe = data as Partial<OverlaySettings>
  if (maybe.align !== 'left' && maybe.align !== 'center' && maybe.align !== 'right') {
    return null
  }

  const ttlCandidate = maybe.messageTtlMs
  const messageTtlMs =
    typeof ttlCandidate === 'number' && Number.isFinite(ttlCandidate) && ttlCandidate >= 0
      ? ttlCandidate
      : DEFAULT_OVERLAY_SETTINGS.messageTtlMs

  const gapCandidate = maybe.bubbleGapPx
  const bubbleGapPx =
    typeof gapCandidate === 'number' &&
    Number.isFinite(gapCandidate) &&
    gapCandidate >= -200 &&
    gapCandidate <= 200
      ? Math.round(gapCandidate)
      : DEFAULT_OVERLAY_SETTINGS.bubbleGapPx

  const radiusCandidate = maybe.bubbleRadiusPx
  const bubbleRadiusPx =
    typeof radiusCandidate === 'number' &&
    Number.isFinite(radiusCandidate) &&
    radiusCandidate >= 0 &&
    radiusCandidate <= 9999
      ? Math.round(radiusCandidate)
      : DEFAULT_OVERLAY_SETTINGS.bubbleRadiusPx

  const textSizeCandidate = (maybe as Record<string, unknown>).textSizePx
  const legacyTextScaleCandidate = (maybe as Record<string, unknown>).textScale
  const textSizePx =
    typeof textSizeCandidate === 'number' &&
    Number.isFinite(textSizeCandidate) &&
    textSizeCandidate >= 8
      ? Math.round(textSizeCandidate)
      : typeof legacyTextScaleCandidate === 'number' &&
          Number.isFinite(legacyTextScaleCandidate) &&
          legacyTextScaleCandidate > 0 &&
          legacyTextScaleCandidate <= 3
        ? Math.round(DEFAULT_OVERLAY_SETTINGS.textSizePx * legacyTextScaleCandidate)
        : DEFAULT_OVERLAY_SETTINGS.textSizePx

  const textColorCandidate = (maybe as Record<string, unknown>).textColor
  const textColor =
    typeof textColorCandidate === 'string' ? textColorCandidate : DEFAULT_OVERLAY_SETTINGS.textColor

  const bubbleColorCandidate = (maybe as Record<string, unknown>).bubbleColor
  const bubbleColor =
    typeof bubbleColorCandidate === 'string'
      ? bubbleColorCandidate
      : DEFAULT_OVERLAY_SETTINGS.bubbleColor

  const bubbleTransparencyCandidate = (maybe as Record<string, unknown>).bubbleTransparencyPct
  const bubbleTransparencyPct =
    typeof bubbleTransparencyCandidate === 'number' &&
    Number.isFinite(bubbleTransparencyCandidate) &&
    bubbleTransparencyCandidate >= 0 &&
    bubbleTransparencyCandidate <= 100
      ? Math.round(bubbleTransparencyCandidate)
      : DEFAULT_OVERLAY_SETTINGS.bubbleTransparencyPct

  const textFontCandidate = (maybe as Record<string, unknown>).textFont
  const textFont =
    typeof textFontCandidate === 'string' ? textFontCandidate : DEFAULT_OVERLAY_SETTINGS.textFont

  return {
    align: maybe.align,
    messageTtlMs,
    bubbleColor,
    bubbleGapPx,
    bubbleRadiusPx,
    bubbleTransparencyPct,
    textSizePx,
    textColor,
    textFont
  }
}

export function loadOverlaySettings(): OverlaySettings {
  if (!isBrowser()) return DEFAULT_OVERLAY_SETTINGS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_OVERLAY_SETTINGS
    const parsed = parseSettings(JSON.parse(raw))
    return parsed ?? DEFAULT_OVERLAY_SETTINGS
  } catch {
    return DEFAULT_OVERLAY_SETTINGS
  }
}

let cachedRaw: string | null = null
let cachedSettings: OverlaySettings = DEFAULT_OVERLAY_SETTINGS

export function getOverlaySettingsSnapshot(): OverlaySettings {
  if (!isBrowser()) return DEFAULT_OVERLAY_SETTINGS

  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    raw = null
  }

  if (raw === cachedRaw) return cachedSettings
  cachedRaw = raw

  if (!raw) {
    cachedSettings = DEFAULT_OVERLAY_SETTINGS
    return cachedSettings
  }

  try {
    const parsed = parseSettings(JSON.parse(raw))
    cachedSettings = parsed ?? DEFAULT_OVERLAY_SETTINGS
    return cachedSettings
  } catch {
    cachedSettings = DEFAULT_OVERLAY_SETTINGS
    return cachedSettings
  }
}

export function getOverlaySettingsServerSnapshot(): OverlaySettings {
  return DEFAULT_OVERLAY_SETTINGS
}

export function persistOverlaySettings(settings: OverlaySettings): void {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // ignore
  }

  cachedRaw = JSON.stringify(settings)
  cachedSettings = settings

  // same-tab update
  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: settings }))
  } catch {
    // ignore
  }
}

export function subscribeOverlaySettings(handler: (settings: OverlaySettings) => void): () => void {
  if (!isBrowser()) return () => {}

  const onStorage = (event: StorageEvent): void => {
    if (event.key !== STORAGE_KEY) return
    if (!event.newValue) return
    try {
      const parsed = parseSettings(JSON.parse(event.newValue))
      if (parsed) handler(parsed)
    } catch {
      // ignore
    }
  }

  const onCustom = (event: Event): void => {
    const custom = event as CustomEvent
    const parsed = parseSettings(custom.detail)
    if (parsed) handler(parsed)
  }

  window.addEventListener('storage', onStorage)
  window.addEventListener(EVENT_NAME, onCustom)

  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(EVENT_NAME, onCustom)
  }
}

export function subscribeOverlaySettingsStore(onStoreChange: () => void): () => void {
  return subscribeOverlaySettings(() => {
    onStoreChange()
  })
}

export function parseOverlaySettings(data: unknown): OverlaySettings | null {
  return parseSettings(data)
}
