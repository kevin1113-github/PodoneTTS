import { createAzureSpeechTtsEngine } from '@renderer/lib/tts/azureSpeechTtsEngine'
import { asTtsError } from '@renderer/lib/tts/errors'
import { parseMessage } from '@renderer/lib/tts/textNormalization'
import type { TtsEngine, TtsRequestBody } from '@renderer/lib/tts/types'

let cachedEngine: TtsEngine | null = null

function getTtsEngine(): TtsEngine {
  if (!cachedEngine) {
    cachedEngine = createAzureSpeechTtsEngine()
  }
  return cachedEngine
}

export async function requestTtsAudio(body: TtsRequestBody): Promise<Blob> {
  try {
    const normalizedText = parseMessage(body.text)
    const engine = getTtsEngine()
    console.log('TTS 요청 텍스트:', normalizedText)
    const audioData = await engine.synthesize(normalizedText, {
      voiceName: body.voiceName ?? 'SeoHyeonNeural',
      speed: body.speed ?? 30
    })

    return new Blob([new Uint8Array(audioData)], { type: 'audio/mpeg' })
  } catch (error) {
    const ttsError = asTtsError(error)
    throw new Error(`TTS 요청에 실패했습니다. ${ttsError.message} (code: ${ttsError.code})`.trim())
  }
}
