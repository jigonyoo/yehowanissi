# 음성 파일 (Vox Graeca 발음 녹음)

이 폴더에 mp3를 넣으면 사이트의 ▶ 버튼이 자동으로 재생합니다.
파일이 아직 없으면 버튼은 "음성 준비 중" 안내만 띄우고 사이트는 정상 동작합니다.
(재구성 발음은 TTS로 만들 수 없어 실제 녹음이 필요합니다 — 지곤님 목소리 또는 성우.)

## 녹음 사양(권장)
- 형식: mp3, 모노, 44.1kHz, 96~128kbps
- 각 파일 1~2초, 앞뒤 무음 최소화
- 조용한 방, 팝 필터 권장

## 1과에 필요한 파일

### letters/ — 알파벳 스물넉 자 (글자 소리 1회씩)
alpha.mp3, beta.mp3, gamma.mp3, delta.mp3, epsilon.mp3, zeta.mp3,
eta.mp3, theta.mp3, iota.mp3, kappa.mp3, lambda.mp3, mu.mp3,
nu.mp3, xi.mp3, omicron.mp3, pi.mp3, rho.mp3, sigma.mp3,
tau.mp3, upsilon.mp3, phi.mp3, chi.mp3, psi.mp3, omega.mp3

### words/ — 소리 내어 읽기 단어
logos.mp3     (λόγος · 로고스)
theos.mp3     (θεός · 테오스)
pistis.mp3    (πίστις · 삐스띠스)
christos.mp3  (Χριστός · 크리스또스)

## 확장 안내
2과부터는 letters/ 는 그대로 재사용하고, 각 과의 단어만 words/ 에 추가하면 됩니다.
파일명은 레슨 HTML의 `data-audio="../assets/audio/..."` 경로와 정확히 일치해야 합니다.
