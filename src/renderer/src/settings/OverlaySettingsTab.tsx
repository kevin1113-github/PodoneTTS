import { Link } from 'react-router'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'

import { ChatBubble } from '@renderer/components/ChatBubble'
import { postOverlayMessage } from '@renderer/lib/overlay/broadcast'
import {
  addOverlaySettingsPreset,
  deleteOverlaySettingsPreset,
  getOverlaySettingsPresetsServerSnapshot,
  getOverlaySettingsPresetsSnapshot,
  subscribeOverlaySettingsPresetsStore,
  type OverlaySettingsPreset
} from '@renderer/lib/storage/presets'
import {
  DEFAULT_OVERLAY_SETTINGS,
  persistOverlaySettings,
  getOverlaySettingsServerSnapshot,
  getOverlaySettingsSnapshot,
  subscribeOverlaySettingsStore,
  type OverlaySettings
} from '@renderer/lib/storage/overlaySettings'
import { Panel } from '../components/Panel'
import { Card } from '../components/Card'
import { CustomButton } from '../components/CustomButton'
import { SelectBox } from '../components/SelectBox'
import { ColorPicker } from '../components/ColorPicker'
import { Preset } from '../components/Preset'
import { ButtonStyleOptions } from '@renderer/components/ButtonStyle'
import { NumberInputWithSlider } from '@renderer/components/NumberInputWithSlider'

export function OverlaySettingsTab(): React.JSX.Element {
  const settings: OverlaySettings = useSyncExternalStore(
    subscribeOverlaySettingsStore,
    getOverlaySettingsSnapshot,
    getOverlaySettingsServerSnapshot
  )

  const presets: OverlaySettingsPreset[] = useSyncExternalStore(
    subscribeOverlaySettingsPresetsStore,
    getOverlaySettingsPresetsSnapshot,
    getOverlaySettingsPresetsServerSnapshot
  )

  const [presetNameDraft, setPresetNameDraft] = useState<string>('')

  const bubbleTransparencyPct = useMemo(() => {
    return Math.round(settings.bubbleTransparencyPct)
  }, [settings.bubbleTransparencyPct])

  const textSizePx = useMemo(() => {
    return Math.round(settings.textSizePx)
  }, [settings.textSizePx])

  const bubbleGapPx = useMemo(() => {
    return Math.round(settings.bubbleGapPx)
  }, [settings.bubbleGapPx])

  const TEST_MESSAGES = useMemo(
    () => [
      '짧은 문장 테스트.',
      '긴 문장 랩(wrap) 테스트: 말풍선 너비/패딩/폰트 크기에 따라 줄바꿈이 자연스럽게 되는지 확인해보세요.',
      '줄바꿈 테스트:\n첫째 줄\n둘째 줄\n셋째 줄',
      '특수문자 테스트: !@#$%^&*()_+-=[]{};:\'"\\|,.<>/?',
      '숫자/단위 테스트: 0, 1, 12, 1234, 56.78px / 3.5s / 1920×1080',
      '혼합 언어 테스트: Hello world / 한글 ABC xyz',
      '긴 단어 테스트: SupercalifragilisticexpialidociousSupercalifragilisticexpialidocious',
      'TTL 테스트: 설정한 시간이 지나면 사라져야 합니다.'
    ],
    []
  )

  const [isTestSending, setIsTestSending] = useState(false)
  const testIntervalRef = useRef<number | null>(null)
  const testIndexRef = useRef(0)

  const stopTestMessages = (): void => {
    if (testIntervalRef.current != null) {
      window.clearInterval(testIntervalRef.current)
      testIntervalRef.current = null
    }
    setIsTestSending(false)
  }

  const startTestMessages = (): void => {
    stopTestMessages()
    setIsTestSending(true)

    const sendNext = (): void => {
      const idx = testIndexRef.current % TEST_MESSAGES.length
      testIndexRef.current += 1
      postOverlayMessage(TEST_MESSAGES[idx] ?? '이것은 테스트 채팅입니다.')
    }

    sendNext()
    testIntervalRef.current = window.setInterval(sendNext, 1500)
  }

  useEffect(() => {
    return () => {
      if (testIntervalRef.current != null) {
        window.clearInterval(testIntervalRef.current)
        testIntervalRef.current = null
      }
    }
  }, [])

  const onReset = (): void => {
    if (confirm('말풍선 설정을 기본값으로 되돌리시겠습니까?')) {
      persistOverlaySettings(DEFAULT_OVERLAY_SETTINGS)
    }
  }

  return (
    <>
      <Panel title="말풍선">
        <Card>
          <div className="w-full flex justify-start px-2 gap-2">
            <Link to="/overlay" target="_blank" className="">
              <CustomButton label="TTS 채팅 열기" buttonStyle={ButtonStyleOptions.NONE} />
            </Link>
            <CustomButton
              label={isTestSending ? '테스트 중지' : '테스트 시작'}
              buttonStyle={ButtonStyleOptions.NONE}
              onClick={() => {
                if (isTestSending) stopTestMessages()
                else startTestMessages()
              }}
            />
          </div>
        </Card>

        <Card description="말풍선이 화면에서 정렬되는 위치입니다.">
          <SelectBox
            label="정렬"
            options={[
              { label: '왼쪽', value: 'left' },
              { label: '가운데', value: 'center' },
              { label: '오른쪽', value: 'right' }
            ]}
            value={settings.align}
            onChange={(v) => {
              const value = v as OverlaySettings['align']
              persistOverlaySettings({ ...settings, align: value })
            }}
          />
        </Card>

        <Card description="말풍선의 모양을 설정합니다.">
          <NumberInputWithSlider
            label="말풍선 라운드 값 (px)"
            value={Math.round(settings.bubbleRadiusPx)}
            min={0}
            max={200}
            step={1}
            onChange={(v) => {
              const value = Math.max(0, Math.min(200, Math.floor(v)))
              persistOverlaySettings({ ...settings, bubbleRadiusPx: value })
            }}
          />
          <ColorPicker
            label="말풍선 배경 색상"
            value={settings.bubbleColor || DEFAULT_OVERLAY_SETTINGS.bubbleColor}
            onChange={(v) => {
              persistOverlaySettings({
                ...settings,
                bubbleColor: v
              })
            }}
          />
          <NumberInputWithSlider
            label="말풍선 배경 투명도 (%)"
            value={bubbleTransparencyPct}
            min={0}
            max={100}
            step={1}
            onChange={(v) => {
              const value = Math.max(0, Math.min(100, Math.floor(v)))
              persistOverlaySettings({
                ...settings,
                bubbleTransparencyPct: value
              })
            }}
          />
        </Card>

        <Card description="일정 시간이 지난 메시지는 자동으로 삭제됩니다. (0초로 설정하면 삭제하지 않습니다)">
          <NumberInputWithSlider
            label="메시지 유효기간 (초)"
            value={settings.messageTtlMs / 1000}
            min={0}
            max={60}
            step={0.2}
            onChange={(v) => {
              const value = Math.min(60, Math.max(0, v))
              const ms = value * 1000
              persistOverlaySettings({ ...settings, messageTtlMs: ms })
            }}
          />
        </Card>

        <Card description="텍스트 크기/색상/폰트를 설정합니다.">
          <NumberInputWithSlider
            label="텍스트 크기 (px)"
            value={textSizePx}
            min={8}
            max={96}
            step={1}
            onChange={(v) => {
              const value = Math.min(96, Math.max(8, Math.floor(v)))
              persistOverlaySettings({ ...settings, textSizePx: value })
            }}
          />

          <SelectBox
            label="텍스트 폰트"
            options={[
              {
                label: 'System',
                value: 'system',
                style: {
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif'
                }
              },
              {
                label: 'Noto Sans KR',
                value: 'Noto Sans KR',
                style: { fontFamily: '"Noto Sans KR", sans-serif' }
              },
              { label: 'Jua (기본)', value: 'Jua', style: { fontFamily: '"Jua", sans-serif' } },
              {
                label: 'Noto Serif KR',
                value: 'Noto Serif KR',
                style: { fontFamily: '"Noto Serif KR", serif' }
              },
              {
                label: 'Gamja Flower',
                value: 'Gamja Flower',
                style: { fontFamily: '"Gamja Flower", sans-serif' }
              }
            ]}
            value={settings.textFont}
            onChange={(v) => {
              persistOverlaySettings({ ...settings, textFont: v })
            }}
          />

          <ColorPicker
            label="텍스트 색상"
            value={settings.textColor || DEFAULT_OVERLAY_SETTINGS.textColor}
            onChange={(v) => {
              persistOverlaySettings({
                ...settings,
                textColor: v
              })
            }}
          />
        </Card>

        <Card description={`말풍선과 말풍선 사이의 세로 간격입니다.`}>
          <NumberInputWithSlider
            label="말풍선 간격 (px)"
            value={bubbleGapPx}
            min={0}
            max={200}
            step={1}
            onChange={(v) => {
              const value = Math.max(0, Math.min(200, Math.floor(v)))
              persistOverlaySettings({ ...settings, bubbleGapPx: value })
            }}
          />
        </Card>

        <Card title="미리보기">
          <div className="p-2 w-full hover:bg-gray-800 rounded-md">
            <ChatBubble settings={settings} text="말풍선 미리보기입니다." />
          </div>
        </Card>

        <Card
          title="말풍선 설정 저장/불러오기"
          description={`현재 말풍선 설정을 저장하고\n나중에 다시 불러올 수 있습니다.`}
        >
          <div className="w-full p-2 flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                className="border border-gray-700 rounded-md p-2 bg-gray-950 text-gray-100 grow"
                type="text"
                placeholder="저장 할 이름을 입력하세요"
                value={presetNameDraft}
                onChange={(e) => setPresetNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return
                  const name = presetNameDraft.trim()
                  if (!name) return
                  addOverlaySettingsPreset(name, settings)
                  setPresetNameDraft('')
                }}
              />
              <CustomButton
                label="현재 설정 저장"
                buttonStyle={ButtonStyleOptions.NONE}
                disabled={presetNameDraft.trim().length === 0}
                onClick={() => {
                  const name = presetNameDraft.trim()
                  if (!name) return
                  addOverlaySettingsPreset(name, settings)
                  setPresetNameDraft('')
                }}
              />
            </div>
            <div className="flex flex-col gap-2 w-full">
              {presets.length === 0 ? (
                <div className="text-sm opacity-50">저장된 말풍선이 없습니다.</div>
              ) : (
                presets.map((preset) => (
                  <Preset
                    key={preset.id}
                    preset={preset}
                    loadHandler={() => {
                      persistOverlaySettings(preset.settings)
                    }}
                    deleteHandler={() => {
                      deleteOverlaySettingsPreset(preset.id)
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </Card>

        <Card description="말풍선 설정을 기본값으로 되돌립니다.">
          <div className="w-full flex justify-end -mx-2">
            <CustomButton
              label="말풍선 설정 초기화"
              buttonStyle={ButtonStyleOptions.NONE}
              onClick={onReset}
            />
          </div>
        </Card>
      </Panel>
    </>
  )
}
