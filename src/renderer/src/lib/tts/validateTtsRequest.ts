import type { TtsSettings } from '@renderer/lib/storage/ttsSettings'
import type { UiMessage } from '@renderer/lib/ui/uiMessage'

export type ValidationResult = {
  message: UiMessage
  shouldFocusInput: boolean
}

export function validateTtsRequest(params: {
  text: string
  devicesLoaded: boolean
  audioAllowed: boolean
  outputDeviceId: string
  isPlaying: boolean
  busyBehavior: TtsSettings['busyBehavior']
}): ValidationResult {
  const { text, devicesLoaded, audioAllowed, outputDeviceId, isPlaying, busyBehavior } = params

  if (!text) {
    return {
      message: {
        kind: 'warning',
        title: '텍스트를 입력하세요',
        message: '재생할 문장이 비어 있습니다.',
        dismissible: true
      },
      shouldFocusInput: true
    }
  }

  if (!devicesLoaded) {
    return {
      message: {
        kind: 'info',
        title: '준비 중',
        message: '권한 확인 및 설정을 불러오는 중입니다. 잠시 후 다시 시도하세요.',
        dismissible: true
      },
      shouldFocusInput: false
    }
  }

  if (!audioAllowed) {
    return {
      message: {
        kind: 'warning',
        title: '마이크 권한이 필요합니다',
        message:
          '장치 목록 및 오디오 출력을 위해 마이크 접근을 허용해야 합니다. 브라우저에서 마이크 접근을 허용한 뒤 다시 시도하세요.',
        dismissible: true
      },
      shouldFocusInput: false
    }
  }

  if (!outputDeviceId) {
    return {
      message: {
        kind: 'warning',
        title: '출력 장치가 설정되지 않았습니다',
        message: 'TTS 설정에서 오디오 출력 장치를 먼저 선택하세요.',
        dismissible: true
      },
      shouldFocusInput: false
    }
  }

  if (isPlaying && busyBehavior === 'wait') {
    return {
      message: {
        kind: 'info',
        title: '재생 중',
        message: '현재 TTS가 재생 중입니다. 끝날 때까지 잠시만 기다려 주세요.',
        dismissible: true
      },
      shouldFocusInput: false
    }
  }

  return { message: null, shouldFocusInput: false }
}
