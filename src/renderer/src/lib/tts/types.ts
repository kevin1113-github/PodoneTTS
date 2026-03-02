export type TtsAudioContentType = 'audio/ogg'

export interface TtsRequestBody {
  text: string
  voiceName?: string
  speed?: number
}

export interface TtsSynthesisOptions {
  voiceName: string
  speed: number
}

export interface TtsEngine {
  synthesize(text: string, options: TtsSynthesisOptions): Promise<Uint8Array>
}
