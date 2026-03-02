import type { ReactNode } from 'react'

type Props = {
  title: string
  description?: ReactNode
  children: ReactNode
  className?: string
}

export function Panel({ title, description, children, className }: Props): React.JSX.Element {
  return (
    <section
      className={className ?? 'p-4 border border-gray-800 rounded bg-gray-900 text-gray-100'}
    >
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">{title}</h2>
          {description ? <p className="text-sm text-gray-300">{description}</p> : null}
        </div>
      </header>
      <div className="mt-2 flex flex-col gap-2">{children}</div>
    </section>
  )
}
