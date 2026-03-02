export type OverlayChatMessage = {
  type: 'chat'
  id: string
  text: string
  ts: number
}

export type OverlayClearEvent = {
  type: 'clear'
  ts: number
}

export type OverlayEvent = OverlayChatMessage | OverlayClearEvent

const CHANNEL_NAME = 'podone-overlay'
const STORAGE_KEY = '__podone_overlay_message__'
const EVENT_NAME = 'podone:overlay-message'

type OverlayEventHandler = (event: OverlayEvent) => void

type Unsubscribe = () => void

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function parseMessage(data: unknown): OverlayEvent | null {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>

  const type = record.type
  if (type === 'clear') {
    const ts = record.ts
    if (typeof ts !== 'number') return null
    return { type: 'clear', ts }
  }

  // chat event (supports legacy payload without "type")
  const id = record.id
  const text = record.text
  const ts = record.ts
  if (typeof id !== 'string') return null
  if (typeof text !== 'string') return null
  if (typeof ts !== 'number') return null
  return { type: 'chat', id, text, ts }
}

export function postOverlayMessage(text: string): void {
  if (!isBrowser()) return
  const trimmed = text.trim()
  if (!trimmed) return

  const message: OverlayChatMessage = {
    type: 'chat',
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text: trimmed,
    ts: Date.now()
  }

  // 1) Preferred: BroadcastChannel
  try {
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME)
      channel.postMessage(message)
      channel.close()
    }
  } catch {
    // ignore
  }

  //   // 2) Fallbacks: storage event (other tabs) + custom event (same tab)
  //   try {
  //     window.localStorage.setItem(STORAGE_KEY, JSON.stringify(message));
  //   } catch {
  //     // ignore
  //   }

  //   try {
  //     window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: message }));
  //   } catch {
  //     // ignore
  //   }
}

export function postOverlayClear(): void {
  if (!isBrowser()) return

  const event: OverlayClearEvent = {
    type: 'clear',
    ts: Date.now()
  }

  try {
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME)
      channel.postMessage(event)
      channel.close()
    }
  } catch {
    // ignore
  }
}

export function subscribeOverlayMessages(handler: OverlayEventHandler): Unsubscribe {
  if (!isBrowser()) return () => {}

  const unsubscribers: Unsubscribe[] = []

  // 1) Preferred: BroadcastChannel
  try {
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME)
      const onMessage = (event: MessageEvent): void => {
        const parsed = parseMessage(event.data)
        if (parsed) handler(parsed)
      }
      channel.addEventListener('message', onMessage)
      unsubscribers.push(() => {
        channel.removeEventListener('message', onMessage)
        channel.close()
      })
    }
  } catch {
    // ignore
  }

  // 2) storage event (other tabs)
  const onStorage = (event: StorageEvent): void => {
    if (event.key !== STORAGE_KEY) return
    if (!event.newValue) return
    try {
      const parsed = parseMessage(JSON.parse(event.newValue))
      if (parsed) handler(parsed)
    } catch {
      // ignore
    }
  }
  window.addEventListener('storage', onStorage)
  unsubscribers.push(() => window.removeEventListener('storage', onStorage))

  // 3) custom event (same tab)
  const onCustom = (event: Event): void => {
    const custom = event as CustomEvent
    const parsed = parseMessage(custom.detail)
    if (parsed) handler(parsed)
  }
  window.addEventListener(EVENT_NAME, onCustom)
  unsubscribers.push(() => window.removeEventListener(EVENT_NAME, onCustom))

  return () => {
    for (const unsub of unsubscribers) unsub()
  }
}
