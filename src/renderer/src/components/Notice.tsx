import { tw } from '@renderer/lib/constants/settings'
import { useState, type ReactNode } from 'react'

type Kind = 'info' | 'warning' | 'error' | 'success'

const styles: Record<Kind, string> = {
  info: tw`border border-blue-200 bg-blue-50 text-blue-900`,
  warning: tw`border border-yellow-200 bg-yellow-50 text-yellow-900`,
  error: tw`border border-red-200 bg-red-50 text-red-900`,
  success: tw`border border-green-200 bg-green-50 text-green-900`
}

type Props = {
  kind: Kind
  title?: string
  children: ReactNode
  className?: string
  role?: 'status' | 'alert'
  dismissible?: boolean
  onDismiss?: () => void
}

export function Notice({
  kind,
  title,
  children,
  className,
  role,
  dismissible,
  onDismiss
}: Props): React.JSX.Element | null {
  const [isDismissed, setIsDismissed] = useState(false)
  if (isDismissed) return null

  return (
    <div
      className={(className ? className + ' ' : '') + 'p-2 rounded-md text-sm ' + styles[kind]}
      role={role ?? (kind === 'error' ? 'alert' : 'status')}
    >
      {title || dismissible ? (
        <div className="flex items-start justify-between gap-3">
          {title ? <div className="font-semibold mb-1">{title}</div> : <div />}
          {dismissible ? (
            <button
              type="button"
              aria-label="닫기"
              className="-m-1 p-1 rounded opacity-60 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsDismissed(true)
                onDismiss?.()
              }}
            >
              ×
            </button>
          ) : null}
        </div>
      ) : null}
      <div className="whitespace-pre-wrap wrap-break-word">{children}</div>
    </div>
  )
}
