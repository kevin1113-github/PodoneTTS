import type { ReactNode } from 'react'

type Props = {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export function Card({ title, description, children, className }: Props): React.JSX.Element {
  return (
    <section className={className ?? 'pt-2 border-t-2 border-gray-800 bg-gray-900 text-gray-100'}>
      {title ? (
        <div className="group relative inline-block">
          <h2 className={'text-lg font-bold' + (description ? ' cursor-help' : '')}>{title}</h2>
          {description && (
            <div className="invisible absolute z-50 left-full top-0.5 -translate-y-0.5 w-max ml-2 group-hover:visible px-3 py-1 text-xs text-white bg-gray-700 rounded shadow-lg">
              {description.split('\n').map((line, index, arr) => (
                <span key={index}>
                  {line}
                  {index < arr.length - 1 && <br />}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 items-start">{children}</div>
    </section>
  )
}
