export async function setAudioSinkId(
  audio: HTMLAudioElement,
  deviceId: string | undefined
): Promise<void> {
  const sinkId = deviceId || 'default'
  // 일부 브라우저/환경에서 setSinkId 지원이 제한될 수 있음
  const maybeSetSinkId = (
    audio as HTMLAudioElement & {
      setSinkId?: (sinkId: string) => Promise<void>
    }
  ).setSinkId

  if (typeof maybeSetSinkId === 'function') {
    try {
      await maybeSetSinkId.call(audio, sinkId)
    } catch (error) {
      console.error('오디오 출력 장치 설정 중 오류:', error)
    }
  }
}
