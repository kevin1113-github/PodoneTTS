export type PlaybackQueueRef = {
  current: string[]
}

export function enqueuePlayback(queueRef: PlaybackQueueRef, message: string): void {
  queueRef.current.push(message)
}

export function peekPlayback(queueRef: PlaybackQueueRef): string | undefined {
  return queueRef.current[0]
}

export function shiftPlayback(queueRef: PlaybackQueueRef): string | undefined {
  return queueRef.current.shift()
}

export function hasPlayback(queueRef: PlaybackQueueRef): boolean {
  return queueRef.current.length > 0
}
