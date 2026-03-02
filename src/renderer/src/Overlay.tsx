import { useEffect, useState, useSyncExternalStore } from 'react'

import { ChatBubble } from '@renderer/components/ChatBubble'
import { subscribeOverlayMessages, type OverlayEvent } from '@renderer/lib/overlay/broadcast'
import {
  getOverlaySettingsServerSnapshot,
  getOverlaySettingsSnapshot,
  subscribeOverlaySettingsStore,
  type OverlaySettings
} from '@renderer/lib/storage/overlaySettings'

type BubbleMessage = {
  id: string
  text: string
  createdAtMs: number
  isLeaving: boolean
  leaveStartedAtMs: number | null
}

export default function Overlay(): React.JSX.Element {
  const settings: OverlaySettings = useSyncExternalStore(
    subscribeOverlaySettingsStore,
    getOverlaySettingsSnapshot,
    getOverlaySettingsServerSnapshot
  )

  const [messages, setMessages] = useState<BubbleMessage[]>([])

  const EXIT_ANIMATION_MS = 220

  useEffect(() => {
    const unsubscribe = subscribeOverlayMessages((event: OverlayEvent) => {
      if (event.type === 'clear') {
        setMessages([])
        return
      }

      const now = Date.now()
      setMessages((prev) => [
        ...prev,
        {
          id: event.id,
          text: event.text,
          createdAtMs: now,
          isLeaving: false,
          leaveStartedAtMs: null
        }
      ])
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const ttlMs = settings.messageTtlMs
      if (ttlMs <= 0) return

      const now = Date.now()
      setMessages((prev) => {
        let changed = false

        const next = prev
          .map((m) => {
            if (m.isLeaving) return m

            const ageMs = now - m.createdAtMs
            if (ageMs < ttlMs) return m

            changed = true
            return {
              ...m,
              isLeaving: true,
              leaveStartedAtMs: now
            }
          })
          .filter((m) => {
            if (!m.isLeaving) return true
            const startedAt = m.leaveStartedAtMs ?? now
            const done = now - startedAt >= EXIT_ANIMATION_MS
            if (done) changed = true
            return !done
          })

        return changed ? next : prev
      })
    }, 100)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [settings.messageTtlMs])

  return (
    <main className="relative min-h-dvh w-full bg-transparent overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 p-[clamp(16px,2.5vw,40px)] flex flex-col pointer-events-none">
        {messages.map((m, idx) => (
          <div key={m.id} style={{ marginTop: idx === 0 ? 0 : `${settings.bubbleGapPx}px` }}>
            <ChatBubble settings={settings} text={m.text} animate isLeaving={m.isLeaving} />
          </div>
        ))}
      </div>
    </main>
  )
}
