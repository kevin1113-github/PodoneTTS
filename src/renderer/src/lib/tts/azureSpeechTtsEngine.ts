import * as sdk from 'microsoft-cognitiveservices-speech-sdk'

import { TtsError } from './errors'
import { quickLanguageDetect } from './languageDetect'
import type { TtsEngine, TtsSynthesisOptions } from './types'

const DEFAULT_VOICE_NAME = 'SeoHyeonNeural'

function getRequiredEnv(name: string): string {
  const value = import.meta.env[name]
  if (!value) {
    throw new TtsError({
      message: `Missing required env var: ${name}`,
      code: 'CONFIG_MISSING',
      status: 500
    })
  }
  return value
}

function resolveLanguageAndVoice(
  text: string,
  voiceName?: string
): { language: string; voice: string } {
  const requestedVoiceName = voiceName ?? DEFAULT_VOICE_NAME

  const detectedLanguage =
    requestedVoiceName === 'HyunsuMultilingualNeural' ? 'ko' : quickLanguageDetect(text)

  switch (detectedLanguage) {
    case 'ko': {
      const language = 'ko-KR'
      return { language, voice: `${language}-${requestedVoiceName}` }
    }
    case 'ja': {
      const language = 'ja-JP'
      return { language, voice: `${language}-AoiNeural` }
    }
    case 'en': {
      const language = 'en-US'
      return { language, voice: `${language}-AnaNeural` }
    }
    default: {
      const language = 'ko-KR'
      return { language, voice: `${language}-${requestedVoiceName}` }
    }
  }
}

function buildSsml(params: {
  text: string
  language: string
  voice: string
  speed: number
}): string {
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${params.language}">
        <voice name="${params.voice}">
          <prosody rate="+${params.speed}%">${params.text}</prosody>
        </voice>
      </speak>`
}

async function speakSsml(
  speechConfig: sdk.SpeechConfig,
  ssml: string
): Promise<sdk.SpeechSynthesisResult> {
  const stream = sdk.AudioOutputStream.createPullStream()
  const audioConfig = sdk.AudioConfig.fromStreamOutput(stream)
  const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig)

  return new Promise<sdk.SpeechSynthesisResult>((resolve, reject) => {
    synthesizer.speakSsmlAsync(
      ssml,
      (result) => {
        console.log('TTS synthesis completed.', result.audioData.byteLength)
        synthesizer.close()
        resolve(result)
      },
      (error) => {
        synthesizer.close()
        reject(error)
      }
    )
  })
}

export function createAzureSpeechTtsEngine(): TtsEngine {
  const speechKey = getRequiredEnv('VITE_SPEECH_KEY')
  const speechRegion = getRequiredEnv('VITE_SPEECH_REGION')

  return {
    async synthesize(text: string, options: TtsSynthesisOptions) {
      if (!text.trim()) {
        throw new TtsError({
          message: 'text is empty',
          code: 'INVALID_INPUT',
          status: 400
        })
      }

      const { language, voice } = resolveLanguageAndVoice(text, options.voiceName)

      console.log(`🗣️  TTS: ${text.substring(0, 50)}... (${language}, ${voice})`)

      const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion)

      // speechConfig.speechSynthesisOutputFormat =
      //   sdk.SpeechSynthesisOutputFormat.Ogg24Khz16BitMonoOpus
      speechConfig.speechSynthesisOutputFormat =
        sdk.SpeechSynthesisOutputFormat.Audio48Khz96KBitRateMonoMp3
      speechConfig.speechSynthesisLanguage = language
      speechConfig.speechSynthesisVoiceName = voice

      const ssml = buildSsml({
        text,
        language,
        voice,
        speed: options.speed
      })

      const result = await speakSsml(speechConfig, ssml)

      if (result.errorDetails) {
        const errorDetails = result.errorDetails

        // 가능한 범위에서만 명확히 분기 (SDK error string 기반)
        const isRateLimit =
          errorDetails.includes('429') ||
          errorDetails.toLowerCase().includes('too many') ||
          errorDetails.toLowerCase().includes('rate')

        throw new TtsError({
          message: errorDetails,
          code: isRateLimit ? 'RATE_LIMIT' : 'UPSTREAM',
          status: isRateLimit ? 429 : 502
        })
      }

      const audioData = result.audioData

      if (!audioData || audioData.byteLength <= 0) {
        throw new TtsError({
          message: 'TTS audioData is empty',
          code: 'UPSTREAM',
          status: 502
        })
      }

      return new Uint8Array(audioData)
    }
  }
}
