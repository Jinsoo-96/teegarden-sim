# PROGRESS — Teegarden System Sim

> 이 파일이 세션 간 **유일한 인수인계 채널**이다. 매 세션 시작 시 읽고, 종료 시 갱신한다.
> 규칙: NOW에는 항상 태스크 1개만. HANDOFF NOTE는 누적하지 않고 **덮어쓴다**.

---

## NOW (이번 세션 태스크 — 항상 1개)

- [ ] **M1-3** System View 기본: Star + Planet×3 + 궤도선, 카메라 컨트롤 (스펙 §7.2-7.3 스케일 전략)
  - DoD: 렌더 확인 + 회합주기 자동 측정 테스트 (§10 테스트 3, 4: 8.60d / 6.04d)

## NEXT (위에서부터 순서대로 NOW로 승격)

> 공통 규칙: **각 마일스톤 M{n}의 마지막 태스크에는 CLAUDE.md 'Git/배포 규약'의 dev→main 머지(=자동 배포)와 `gh run watch` 성공 확인까지 포함**된다.
- [ ] **M1-4** 첫 배포 (M1 마감): `npm run build` 로컬 확인 → CLAUDE.md 규약대로 dev→main 머지 → `gh run watch` 성공 → `https://<owner>.github.io/teegarden-sim/` 접속해 System View 확인 → URL을 README.md 최상단에 기록 후 dev에 커밋
  - DoD: 배포 링크에서 M1-3 화면이 보임
- [ ] **M2-1** 시간 스토어+컨트롤러 (스펙 §3.2): simTimeJD, timeScale(1~1e6 로그), 재생/스크럽/이벤트 점프 버튼
  - DoD: UI 동작 + JD↔표시시간 변환 테스트
- [ ] **M2-2** 시민시간 변환 모듈 (스펙 §5.2): JD → {week#, civicDay 1-5, civicTime}, 칭동 일출 = 주 시작 앵커
  - DoD: §10 테스트 7, 8 + 경계값 테스트
- [ ] **M2-3** 시민 시계 HUD 위젯 (스펙 §5.3 + §7.6 시그니처 디자인): 원형 시계 + 칭동 고도 게이지 + 이벤트 카운트다운
  - DoD: 시각 확인, 시간 가속 시 동기화
- [ ] **M3-1** SurfaceScene 스캐폴드 + 천구좌표 유틸 `src/sim/skyCoords.ts`: 행성 지평좌표(고도/방위) ↔ 궤도면/RA·Dec 변환, 관측자(위도, 터미네이터 경도) 파라미터화
  - DoD: 좌표 변환 단위테스트 (항성 방향=수평선, 반항성=반대 수평선)
- [ ] **M3-2** 거대 항성 디스크: §6.2 셰이더(limb darkening, granulation, 흑점) + §4 칭동 고도 반영
  - DoD: §10 테스트 2(각지름 2.47°), 5(칭동 ±3.44°)
- [ ] **M3-3** 배경 천구: HYG v3 전처리 스크립트(`scripts/prepStars.ts`, V≤6.5) + Points 별필드 + 태양 마커(천칭자리, V2.75) + 4.90634일 일주운동 (스펙 §6.4)
  - DoD: 별 ~9k개 로드, 태양 라벨 토글
- [ ] **M4-1** c/d 하늘 객체: 실시간 위치·위상(항상 gibbous 91%/97%+)·등급·각크기, 표면밝기 보존 원반 렌더 (스펙 §6.3)
  - DoD: 충/구상/합 3지점 값이 §6.3 표와 일치하는 테스트 (c: 15.2′/−6.5, 8.0′/−5.0, 4.2′/−3.7)
- [ ] **M4-2** 이벤트 예측기 + 가시성 캘린더: 다음 충/합/엄폐/칭동일출 계산, HUD 캘린더, 엄폐 연출(합 시 항성 뒤 ~1.4h) (스펙 §6.3)
  - DoD: 예측치가 시뮬레이션 실측과 일치
- [ ] **M5-1** M왜성 대기산란 스카이 셰이더 (스펙 §6.5): 3034K 플랑크 입력, 파장샘플 Rayleigh+Mie, 프리셋 3종(1bar/0.1bar/무대기)
  - DoD: 터미네이터 영구 박명 그라데이션 시각 확인, quality 4/8/16 샘플 옵션
- [ ] **M5-2** 플레어 시스템 (스펙 §6.2): 푸아송 λ=0.026/일, 130–600초 라이프사이클, 항성 핫스팟 + 하늘색 10,000K 시프트
  - DoD: 디버그 트리거 버튼 + 자동 발생 로그
- [ ] **M5-3** 광학 캘리브레이션: 등급→HDR 변환 유틸(기준 항성 V−22.3), selective bloom(항성/플레어/c·d만), ACES 톤매핑 (스펙 §7.4-7.5)
  - DoD: c 충 장면에서 원반 질감 유지(점광원 글레어 금지) 시각 검수
- [ ] **M6-1** 지형·연출: 저폴리 지평선, 도시 인공조명(§5.1 근거), 야간면 방향 구름/번개 (스펙 §6.6)
- [ ] **M6-2** Assumptions 패널(스펙 §8 목록 그대로) + 천체 라벨/교육 오버레이 + 설정(관측자 위도/터미네이터 선택, 후보행성 토글)
- [ ] **M6-3** 성능 패스: 60fps@1080p 확인, 모바일 quality 프리셋, 코드 정리 (스펙 §7.5)

## DONE

- [x] **M1-2** 케플러 엔진 `src/sim/kepler.ts`: solveKepler(NR, 1e-10) + propagate + librationOffsetRad. §10 테스트 1·7·8 통과 (2026-06-11)
- [x] **M1-1** 프로젝트 스캐폴드: Vite+React+TS + §7.1 스택 + vitest, 스펙 §2 → `src/data/teegarden.ts` 추출 생성, 상수 무결성 테스트 4개 통과 (commit 342dc31, 2026-06-11)
- [x] **M0-1** GitHub 저장소·브랜치·배포 골격: git init → 초기 커밋 → `Jinsoo-96/teegarden-sim` public 생성 → main/dev 푸시 (initial commit, 2026-06-11)

## DECISIONS (스펙에 없어서 내린 결정 — 1줄씩 누적)

- `2026-06-11 M0-1: .gitignore에 files.zip 추가 — 이유: 원본 zip은 로컬 백업용, 내용물은 이미 저장소 경로에 배치됨`
- `2026-06-11 M1-1: 최신 안정판 채택 — Vite 8 / React 19 / three 0.184(=r160+ 충족) / vitest 4. 타입 전용 @types/three 추가. §2 상수는 awk로 스펙 코드블록에서 기계 추출(수기 금지 규칙 준수)`
- `2026-06-11 M1-2: meanLongitudeAtEpochDeg를 평균근점이각 M0로 사용(근점 경도 0 가정) — 스펙 §3.1 의사코드 M=M0+n·Δt를 그대로 따름. 연 길이는 율리우스년 365.25d`

## KNOWN ISSUES

- deploy.yml의 paths 필터에 `.github/workflows/deploy.yml` 자신이 포함되어 있어, **deploy.yml을 추가/수정하는 main 푸시는 Actions를 발동시킴** (M0-1 초기 푸시에서 발동 → package.json 없어 즉시 실패 → 해당 런은 삭제 처리). M1-1 이후 package.json이 생기면 정상 동작하므로 구조 변경 불필요.

## HANDOFF NOTE (마지막 세션이 덮어쓰는 인수인계 — 항상 최신 1개만)

- 마지막 작업 파일/함수: `src/sim/kepler.ts` (solveKepler / propagate / librationOffsetRad / semiMajorAxisFromPeriod)
- 어디까지 했나: M1-2 완료 — 케플러 엔진 + §10 테스트 1·7·8 전부 통과, 빌드 정상
- 다음 세션 첫 행동: M1-3 수행 — 스펙 §7.2-7.3 읽고 SystemScene(R3F Canvas + Star + Planet×3 + 궤도선 + OrbitControls) 구현, 회합주기 자동 측정 테스트(§10 테스트 3·4: 8.60d/6.04d) 작성
- 주의사항/함정: System View 스케일 = 거리 실척(AU) + 천체 반경만 과장(§7.3). 회합주기 테스트는 kepler.propagate로 b·c(or d)의 위상각 차가 0이 되는 연속 시점 간격을 수치 측정하면 됨. propagate의 trueAnomaly는 (−π,π], meanAnomaly는 [0,2π) — 각도 비교 시 정규화 주의
- 테스트 상태: 11 passed / 0 failed (상수 무결성 4 + 케플러 §10 테스트 7건)
