export function parseMessage(messageContent: string): string {
  messageContent = messageContent.substring(0, 200)

  // 빠른 단축어 처리
  if (messageContent == 'ㅋ') return '킥'
  else if (messageContent == 'ㅋㅋ') return '크크'
  else if (messageContent == 'ㅋㅋㅋ') return '크크크'
  else if (messageContent == 'ㅇㅇ') return '응응'
  else if (messageContent == 'ㅎㅇ') return '하이'
  else if (messageContent == 'ㅂㅇ') return '바이'
  else if (messageContent == 'ㅃㅇ') return '빠이'
  else if (messageContent == 'ㅃㅃ') return '빠빠'
  else if (messageContent == 'ㄷㄷ') return '덜덜'
  else if (messageContent == 'ㄹㅇ') return '레알'
  else if (messageContent == 'ㅇㅋ') return '오키'

  // URL 처리
  const urlReg =
    /^(file|gopher|news|nntp|telnet|https?|ftps?|sftp):\/\/([a-z0-9-]+\.)+[a-z0-9]{2,4}.*$/gi
  messageContent = messageContent.replace(urlReg, ' 링크 ')

  // 속삭임과 특수문자 제거
  const wisperReg = /\([^)]+\)/gi
  const specialCharactersReg = /[().><&"'#@:]/gi
  messageContent = messageContent.replace(wisperReg, ' ').replace(specialCharactersReg, ' ')

  // 예외 처리 (이모티콘)
  const regException = /ㅇㅅㅇ|ㅡㅅㅡ|ㅎㅅㅎ/gi
  messageContent = messageContent.replace(regException, ' ')

  // 한글 자음 모음 정리
  const regㅏ = /[ㅏ]/gi
  const regㅑ = /[ㅑ]/gi
  const regㅓ = /[ㅓ]/gi
  const regㅕ = /[ㅕ]/gi
  const regㅗ = /[ㅗ]/gi
  const regㅛ = /[ㅛ]/gi
  const regㅜ = /[ㅜ]/gi
  const regㅠ = /[ㅠ]/gi
  const regㅡ = /[ㅡ]/gi
  const regㅣ = /[ㅣ]/gi
  const regㅐ = /[ㅐ]/gi
  const regㅒ = /[ㅒ]/gi
  const regㅔ = /[ㅔ]/gi
  const regㅖ = /[ㅖ]/gi
  const regㅘ = /[ㅘ]/gi
  const regㅙ = /[ㅙ]/gi
  const regㅚ = /[ㅚ]/gi
  const regㅝ = /[ㅝ]/gi
  const regㅞ = /[ㅞ]/gi
  const regㅟ = /[ㅟ]/gi
  const regㅢ = /[ㅢ]/gi
  messageContent = messageContent
    .replace(regㅏ, '아')
    .replace(regㅑ, '야')
    .replace(regㅓ, '어')
    .replace(regㅕ, '여')
    .replace(regㅗ, '오')
    .replace(regㅛ, '요')
    .replace(regㅜ, '우')
    .replace(regㅠ, '유')
    .replace(regㅡ, '으')
    .replace(regㅣ, '이')
    .replace(regㅐ, '애')
    .replace(regㅒ, '얘')
    .replace(regㅔ, '에')
    .replace(regㅖ, '예')
    .replace(regㅘ, '와')
    .replace(regㅙ, '왜')
    .replace(regㅚ, '외')
    .replace(regㅝ, '워')
    .replace(regㅞ, '웨')
    .replace(regㅟ, '위')
    .replace(regㅢ, '의')

  // 한글 초성체를 실제 단어로 변환
  const regㄴㅇㄱ = /ㄴㅇㄱ/gi // 상상도 못한 정체!
  const regㄴㅆㄴ = /ㄴㅆㄴ/gi // 넌 씨발 눈치도 없냐?
  const regㄷㅈㄹ = /ㄷㅈㄹ/gi // 뒤질래?
  const regㄸㄹㅇ = /ㄸㄹㅇ/gi // 또라이
  const regㅅㄱㅇ = /ㅅㄱㅇ/gi // 수고요
  const regㅅㄱㄹ = /ㅅㄱㄹ/gi // 수고링
  const regㅇㅈㄹ = /ㅇㅈㄹ/gi // 이지랄
  const regㄹㅈㄷ = /ㄹㅈㄷ/gi // 레전드
  const regㅎㅇㅌ = /ㅎㅇㅌ/gi // 화이팅
  const regㅇㅇ = /ㅇㅇ/gi // 응응
  const regㄴㄴ = /ㄴㄴ/gi // 노노
  const regㅎㅇ = /ㅎㅇ/gi // 하이
  const regㅂㅇ = /ㅂㅇ/gi // 바이
  const regㅃㅇ = /ㅃㅇ/gi // 빠이
  const regㅂㅂ = /ㅂㅂ/gi // 바이바이
  const regㅃㅃ = /ㅃㅃ/gi // 빠빠
  const regㅂ2 = /ㅂ2/gi // 바이
  const regㄷㄷ = /ㄷㄷ/gi // 덜덜
  const regㄹㅇ = /ㄹㅇ/gi // 레알
  const regㅇㅋ = /ㅇㅋ/gi // 오키
  const regㄱㄷ = /ㄱㄷ/gi // 기달
  const regㄱㅅ = /ㄱㅅ/gi // 감사
  const regㅇㅈ = /ㅇㅈ/gi // 인정
  const regㅈㅅ = /ㅈㅅ/gi // 죄송
  const regㄲㅈ = /ㄲㅈ/gi // 꺼져
  const regㅈㅂ = /ㅈㅂ/gi // 제발
  const regㅈㅁ = /ㅈㅁ/gi // 잠시만
  const regㅈㄹ = /ㅈㄹ/gi // 지랄
  const regㄴㄱ = /ㄴㄱ/gi // 누구?
  const regㄴㅈ = /ㄴㅈ/gi // 노잼
  const regㄷㅈ = /ㄷㅈ/gi // 닥전
  const regㄷㅎ = /ㄷㅎ/gi // 닥후
  const regㄷㅊ = /ㄷㅊ/gi // 닥쳐
  const regㄸㅋ = /ㄸㅋ/gi // 땡큐
  const regㅁㄹ = /ㅁㄹ/gi // 몰라
  const regㅁㅊ = /ㅁㅊ/gi // 미친
  const regㅃㄹ = /ㅃㄹ/gi // 빨리
  const regㅇㅎ = /ㅇㅎ/gi // 아하
  const regㅅㅂ = /ㅅㅂ/gi // 씨발
  const regㅊㅊ = /ㅊㅊ/gi // 축축
  const regㅋ = /[ㅋ]/gi // 크
  const regㅎ = /[ㅎ]/gi // 흐
  messageContent = messageContent
    .replace(regㄴㅇㄱ, '상상도 못한 정체!')
    .replace(regㄴㅆㄴ, '넌 씨발 눈치도 없냐?')
    .replace(regㄷㅈㄹ, '뒤질래?')
    .replace(regㄸㄹㅇ, '또라이')
    .replace(regㅅㄱㅇ, '수고요')
    .replace(regㅅㄱㄹ, '수고링')
    .replace(regㅇㅈㄹ, '이지랄')
    .replace(regㄹㅈㄷ, '레전드')
    .replace(regㅎㅇㅌ, '화이팅')
    .replace(regㅇㅇ, '응응')
    .replace(regㄴㄴ, '노노')
    .replace(regㅎㅇ, '하이')
    .replace(regㅂㅇ, '바이')
    .replace(regㅃㅇ, '빠이')
    .replace(regㅂㅂ, '바이바이')
    .replace(regㅃㅃ, '빠빠')
    .replace(regㅂ2, '바이')
    .replace(regㄷㄷ, '덜덜')
    .replace(regㄹㅇ, '레알')
    .replace(regㅇㅋ, '오키')
    .replace(regㄱㄷ, '기달')
    .replace(regㄱㅅ, '감사')
    .replace(regㅇㅈ, '인정')
    .replace(regㅈㅅ, '죄송')
    .replace(regㄲㅈ, '꺼져')
    .replace(regㅈㅂ, '제발')
    .replace(regㅈㅁ, '잠시만')
    .replace(regㅈㄹ, '지랄')
    .replace(regㄴㄱ, '누구?')
    .replace(regㄴㅈ, '노잼')
    .replace(regㄷㅈ, '닥전')
    .replace(regㄷㅎ, '닥후')
    .replace(regㄷㅊ, '닥쳐')
    .replace(regㄸㅋ, '땡큐')
    .replace(regㅁㄹ, '몰라')
    .replace(regㅁㅊ, '미친')
    .replace(regㅃㄹ, '빨리')
    .replace(regㅇㅎ, '아하')
    .replace(regㅅㅂ, '씨발')
    .replace(regㅊㅊ, '축축')
    .replace(regㅋ, '크')
    .replace(regㅎ, '흐')

  return messageContent
}
