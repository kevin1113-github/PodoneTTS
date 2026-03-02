export type TtsRequestParams = {
  text: string
  voiceName: string
  speed: number
  outputDeviceId: string
  feedbackDeviceId: string
  feedbackDeviceAllowed: boolean
}

export function buildTtsRequestParams(params: {
  text: string
  selectedVoice: string
  ttsSpeed: number
  outputDeviceId: string
  feedbackDeviceId: string
  feedbackDeviceAllowed: boolean
}): TtsRequestParams {
  return {
    text: params.text,
    voiceName: params.selectedVoice,
    speed: params.ttsSpeed,
    outputDeviceId: params.outputDeviceId,
    feedbackDeviceId: params.feedbackDeviceId,
    feedbackDeviceAllowed: params.feedbackDeviceAllowed
  }
}
