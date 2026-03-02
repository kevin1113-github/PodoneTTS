import { useEffect, useState } from 'react'

import { stopMediaStream } from '@renderer/lib/media/stopMediaStream'

export function useAudioDevices(): {
  error: string | null
  audioAllowed: boolean
  devices: MediaDeviceInfo[]
} {
  const [error, setError] = useState<string | null>(null)
  const [audioAllowed, setAudioAllowed] = useState(false)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])

  useEffect(() => {
    let isCancelled = false

    async function initialize(): Promise<void> {
      try {
        if (!navigator.mediaDevices) {
          throw new Error('MediaDevices API가 지원되지 않습니다.')
        }

        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          if (isCancelled) return

          setAudioAllowed(true)

          const detectedDevices = await navigator.mediaDevices.enumerateDevices()
          if (isCancelled) return

          setDevices(detectedDevices)
          stopMediaStream(stream)
        } catch (permissionError) {
          console.warn(
            '마이크 접근 권한이 거부되었습니다. 장치 이름이 표시되지 않을 수 있습니다.',
            permissionError
          )
          if (isCancelled) return

          setAudioAllowed(false)
          throw new Error('마이크 접근 권한이 필요합니다.')
        }
      } catch (unknownError) {
        console.error('오디오 장치를 가져오는 중 오류:', unknownError)
        if (isCancelled) return

        setError(
          unknownError instanceof Error ? unknownError.message : '알 수 없는 오류가 발생했습니다.'
        )
      }
    }

    void initialize()

    return () => {
      isCancelled = true
    }
  }, [])

  return { error, audioAllowed, devices }
}
