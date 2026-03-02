import { type CSSProperties } from 'react'

import type { OverlaySettings } from '@renderer/lib/storage/overlaySettings'
import { DEFAULT_OVERLAY_SETTINGS } from '@renderer/lib/storage/overlaySettings'

type Props = {
  settings: OverlaySettings
  text: string
  animate?: boolean
  isLeaving?: boolean
}

export function ChatBubble({
  settings,
  text,
  animate = false,
  isLeaving = false
}: Props): React.JSX.Element {
  const bubbleRadiusPx = settings.bubbleRadiusPx

  const hasCustomTextColor = settings.textColor.length > 0
  const hasCustomBubbleColor = settings.bubbleColor.length > 0

  const transparencyPct = Math.max(0, Math.min(100, settings.bubbleTransparencyPct))

  let customBubbleColorWithAlpha: string | null = null
  if (hasCustomBubbleColor) {
    const hex = settings.bubbleColor.replace('#', '')
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      const a = transparencyPct / 100
      customBubbleColorWithAlpha = `rgba(${r}, ${g}, ${b}, ${a})`
    } else if (hex.length === 3) {
      const r = parseInt(hex.charAt(0) + hex.charAt(0), 16)
      const g = parseInt(hex.charAt(1) + hex.charAt(1), 16)
      const b = parseInt(hex.charAt(2) + hex.charAt(2), 16)
      const a = transparencyPct / 100
      customBubbleColorWithAlpha = `rgba(${r}, ${g}, ${b}, ${a})`
    }
  }

  let fontFamily = ''
  switch (settings.textFont) {
    case 'system':
      fontFamily =
        '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif'
      break
    case 'Noto Sans KR':
      fontFamily = '"Noto Sans KR", sans-serif'
      break
    case 'Jua':
      fontFamily = '"Jua", sans-serif'
      break
    case 'Noto Serif KR':
      fontFamily = '"Noto Serif KR", serif'
      break
    case 'Gamja Flower':
      fontFamily = '"Gamja Flower", sans-serif'
      break
  }

  const bubbleStyle = (() => {
    const base = {
      fontFamily,
      ...(hasCustomTextColor
        ? { color: settings.textColor }
        : { color: DEFAULT_OVERLAY_SETTINGS.textColor }),
      ...(hasCustomBubbleColor
        ? { backgroundColor: customBubbleColorWithAlpha }
        : { backgroundColor: DEFAULT_OVERLAY_SETTINGS.bubbleColor })
    } as unknown as CSSProperties
    return base
  })()

  // const padTop = 18
  // const padRight = 24
  // const padBottom = 18
  // const padLeft = 24

  // const padTopPos = Math.max(0, padTop)
  // const padRightPos = Math.max(0, padRight)
  // const padBottomPos = Math.max(0, padBottom)
  // const padLeftPos = Math.max(0, padLeft)

  // const padTopNeg = Math.min(0, padTop)
  // const padRightNeg = Math.min(0, padRight)
  // const padBottomNeg = Math.min(0, padBottom)
  // const padLeftNeg = Math.min(0, padLeft)

  const justifyClass =
    settings.align === 'left'
      ? 'flex justify-start'
      : settings.align === 'center'
        ? 'flex justify-center'
        : 'flex justify-end'

  const animationClass = animate
    ? `${isLeaving ? 'animate-overlay-bubble-out' : 'animate-overlay-bubble-in'} motion-reduce:animate-none `
    : ''

  const baseSurfaceClass = 'bg-gray-950/90'

  const style = {
    ...bubbleStyle,
    borderRadius: `${bubbleRadiusPx}px`
  } as CSSProperties

  return (
    <div className={justifyClass}>
      <div
        className={`${animationClass}max-w-[min(92vw,1100px)] shadow-lg ${baseSurfaceClass}`}
        style={style}
      >
        <div
          className="py-4 px-6"
          // style={{
          //   padding: `${padTopPos}px ${padRightPos}px ${padBottomPos}px ${padLeftPos}px`,
          //   margin: `${padTopNeg}px ${padRightNeg}px ${padBottomNeg}px ${padLeftNeg}px`
          // }}
        >
          <div
            className="whitespace-pre-wrap wrap-break-word leading-[1.35]"
            style={{ fontSize: `${settings.textSizePx}px` }}
          >
            {text}
          </div>
        </div>
      </div>
    </div>
  )
}
