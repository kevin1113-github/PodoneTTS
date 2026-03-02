export type UiMessage = {
  kind: 'info' | 'warning' | 'error' | 'success'
  title?: string
  message: string
  dismissible?: boolean
} | null
