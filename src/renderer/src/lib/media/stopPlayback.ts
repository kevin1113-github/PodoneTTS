export type PlaybackRef = {
  outputAudio: HTMLAudioElement | null
  feedbackAudio: HTMLAudioElement | null
}

export function stopPlayback(ref: { current: PlaybackRef | null }): void {
  const current = ref.current
  if (!current) return

  current.outputAudio?.pause()
  current.feedbackAudio?.pause()

  ref.current = {
    outputAudio: null,
    feedbackAudio: null
  }
}
