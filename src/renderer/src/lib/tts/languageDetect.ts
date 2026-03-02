// 간단한 로컬 언어 감지로 API 호출 줄이기
export function quickLanguageDetect(text: string): 'ko' | 'ja' | 'en' {
  const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/
  const japaneseRegex = /[ひらがなカタカナ]/
  const englishRegex = /[a-zA-Z]/

  if (koreanRegex.test(text)) return 'ko'
  if (japaneseRegex.test(text)) return 'ja'
  if (englishRegex.test(text)) return 'en'
  return 'ko'
}
