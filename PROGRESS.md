# PROGRESS — Teegarden System Sim

> 이 파일이 세션 간 **유일한 인수인계 채널**이다. 매 세션 시작 시 읽고, 종료 시 갱신한다.
> 규칙: NOW에는 항상 태스크 1개만. HANDOFF NOTE는 누적하지 않고 **덮어쓴다**.

---

## NOW (이번 세션 태스크 — 항상 1개)

- [ ] **M5-1** M왜성 대기산란 스카이 셰이더 (스펙 §6.5): 3034K 플랑크 입력, 파장샘플 Rayleigh+Mie, 프리셋 3종(1bar/0.1bar/무대기)
  - DoD: 터미네이터 영구 박명 그라데이션 시각 확인, quality 4/8/16 샘플 옵션

## NEXT (위에서부터 순서대로 NOW로 승격)

> 공통 규칙: **각 마일스톤 M{n}의 마지막 태스크에는 CLAUDE.md 'Git/배포 규약'의 dev→main 머지(=자동 배포)와 `gh run watch` 성공 확인까지 포함**된다.
- [ ] **M5-2** 플레어 시스템 (스펙 §6.2): 푸아송 λ=0.026/일, 130–600초 라이프사이클, 항성 핫스팟 + 하늘색 10,000K 시프트
  - DoD: 디버그 트리거 버튼 + 자동 발생 로그
- [ ] **M5-3** 광학 캘리브레이션: 등급→HDR 변환 유틸(기준 항성 V−22.3), selective bloom(항성/플레어/c·d만), ACES 톤매핑 (스펙 §7.4-7.5)
  - DoD: c 충 장면에서 원반 질감 유지(점광원 글레어 금지) 시각 검수
- [ ] **M6-1** 지형·연출: 저폴리 지평선, 도시 인공조명(§5.1 근거), 야간면 방향 구름/번개 (스펙 §6.6)
- [ ] **M6-2** Assumptions 패널(스펙 §8 목록 그대로) + 천체 라벨/교육 오버레이 + 설정(관측자 위도/터미네이터 선택, 후보행성 토글)
- [ ] **M6-3** 성능 패스: 60fps@1080p 확인, 모바일 quality 프리셋, 코드 정리 (스펙 §7.5)

## DONE

- [x] **M4-2** 이벤트 예측기 + 가시성 캘린더 (M4 마감): nextConjunctionJd/nextOccultation(이분 탐색) + EventCalendar HUD(점프 버튼·시민시각 병기). 예측 = 실측 1분 이내 검증. release: M4 배포 (2026-06-11)
- [x] **M4-1** c/d 하늘 객체: planetVis.ts(위상각·조명률·각지름·등급, §6.3 공식 그대로) + PlanetInSky(위상 라이팅 구체) + StarLight. §10 테스트 6 포함 §6.3 표 6지점 + 위상 범위 검증 10건 통과 (commit bee3df8, 2026-06-11)
- [x] **M3-3** 배경 천구 (M3 마감): prepStars.ts(HYG v3.8 → 8,920개) + CelestialSphere(Points 셰이더 별필드, B−V 색, 그룹 회전 일주운동) + 태양 마커·라벨 토글. release: M3 배포 (commit e69f7ff → main 1dbbc8a, 2026-06-11)
- [x] **M3-2** 거대 항성 디스크: starSurface 셰이더(2차 limb darkening + fbm 쌀알무늬 + 몸체고정 흑점 3개 + 채층 글로우 림) + GiantStar 컴포넌트(칭동 고도·각크기 반영). §10 테스트 2·5 통과 (commit fe19619, 2026-06-11)
- [x] **M3-1** 천구좌표 유틸 `src/sim/skyCoords.ts`(지평좌표/RA·Dec/관측자 파라미터) + SurfaceScene 스캐폴드(돔·지면·항성 플레이스홀더) + ModeSwitch + settingsStore. DoD 테스트 8건 통과 (commit 151319b, 2026-06-11)
- [x] **M2-3** 시민 시계 위젯 (M2 마감): SVG 원형 24시민시 다이얼 + 칭동 고도 게이지(완전일출 눈금·항성 마커) + 주간 5칸 바 + 일출/c충/d충 카운트다운. release: M2 배포 (commit d1edb5f → main b4a9c54, 2026-06-11)
- [x] **M2-2** 시민시간 변환 모듈 `src/sim/civicTime.ts`: 칭동 일출 앵커(WEEK_ZERO_JD) + jdToCivic(week/civicDay/시분초) + HUD 시민시각 표시. §10 테스트 7·8 + 경계값 11건 (commit 1f903e7, 2026-06-11)
- [x] **M2-1** 시간 스토어+컨트롤러: zustand 스토어(§3.2 적분 공식) + HUD(재생/일시정지·로그 속도·스크럽·충 점프 버튼) + JD↔UTC 변환, 테스트 11건 추가 (commit ffd6aad, 2026-06-11)
- [x] **M1-4** 첫 배포 (M1 마감): dev→main 머지(release: M1, d2e3ac0) → Pages 수동 활성화 후 Actions 성공 → https://jinsoo-96.github.io/teegarden-sim/ 라이브 확인 → README에 URL 기록 (commit 3b22825, 2026-06-11)
- [x] **M1-3** System View 기본: SystemScene(항성+행성3+케플러 궤도선+OrbitControls, 반경 과장/True scale 토글) + §10 테스트 3·4 통과 (commit 9ca6f93, 2026-06-11)
- [x] **M1-2** 케플러 엔진 `src/sim/kepler.ts`: solveKepler(NR, 1e-10) + propagate + librationOffsetRad. §10 테스트 1·7·8 통과 (commit e9e8715, 2026-06-11)
- [x] **M1-1** 프로젝트 스캐폴드: Vite+React+TS + §7.1 스택 + vitest, 스펙 §2 → `src/data/teegarden.ts` 추출 생성, 상수 무결성 테스트 4개 통과 (commit 342dc31, 2026-06-11)
- [x] **M0-1** GitHub 저장소·브랜치·배포 골격: git init → 초기 커밋 → `Jinsoo-96/teegarden-sim` public 생성 → main/dev 푸시 (initial commit, 2026-06-11)

## DECISIONS (스펙에 없어서 내린 결정 — 1줄씩 누적)

- `2026-06-11 M0-1: .gitignore에 files.zip 추가 — 이유: 원본 zip은 로컬 백업용, 내용물은 이미 저장소 경로에 배치됨`
- `2026-06-11 M1-1: 최신 안정판 채택 — Vite 8 / React 19 / three 0.184(=r160+ 충족) / vitest 4. 타입 전용 @types/three 추가. §2 상수는 awk로 스펙 코드블록에서 기계 추출(수기 금지 규칙 준수)`
- `2026-06-11 M1-2: meanLongitudeAtEpochDeg를 평균근점이각 M0로 사용(근점 경도 0 가정) — 스펙 §3.1 의사코드 M=M0+n·Δt를 그대로 따름. 연 길이는 율리우스년 365.25d`
- `2026-06-11 M1-3: 행성 반경 배율 ×80 채택 — 스펙 §7.3 예시 ×400은 행성(0.017AU)이 과장 항성(×8=0.0045AU)보다 커져 부적절. True scale 토글은 leva 패널 제공`
- `2026-06-11 M1-3: §10 테스트 3·4 회합주기는 연속 충 11회 간격의 평균으로 측정 — b의 e=0.03 중심차로 개별 간격이 ±0.1일 자연 요동(물리 현상)하므로 평균이 올바른 측정. 기준값·허용오차는 표 그대로`
- `2026-06-11 M1-3: teegarden.ts에 UNITS(kmPerAU, starRadiusKm=83480, earthRadiusKm) 추가 — 불변 규칙 1에 따른 상수화 (R★ km값은 스펙 §1.1 출처)`
- `2026-06-11 M2-2: 칭동 고도 부호 규약 — 저녁 터미네이터(기본 관측자) 고도 = +librationOffsetRad. 칭동 일출 = 고도가 +각반지름을 상향 통과(스펙 §5.2 "완전히 떠오르는 순간" 그대로). 아침 터미네이터는 부호 반전으로 M3-1에서 처리`
- `2026-06-11 M3-1: 자전각 규약 Λ = M + π(등속), 행성 경도 동쪽 양수 — 이 조합에서 저녁 터미네이터(+90°) 항성 고도가 librationOffsetRad와 해석적으로 정확히 일치(테스트로 검증). RA/Dec→관성계는 직접 매핑(α→xz각, δ→y) [가정: 행성계-천구 정렬 미관측이라 임의]`
- `2026-06-11 M3-2: 흑점 3개 고정 배치(스펙 "2–4개" 범위 내 중간값), 셰이더는 .frag 파일 대신 TS 문자열 모듈(src/shaders/)로 관리 — vite 플러그인 추가 없이 §7.1 스택 유지. 항성 디스크 = 빌보드 평면(r=1 림, 1.3까지 채층 글로우)`
- `2026-06-11 M3-3: HYG는 v3 최신판 v3.8 사용(스펙 "v3" 충족). 원본 CSV는 미커밋(CC BY-SA 원본 대신 산출 stars.json 232KB만), B−V→색은 Ballesteros 온도식+간이 팔레트 근사. 은하수 텍스처는 보류(§6.4 "또는" 옵션 — 별필드로 충분). tsconfig.app types에 node 추가(테스트의 node:fs 때문)`
- `2026-06-11 M4-2: 엄폐 지속시간 실계산 c≈2.2h/d≈1.3h — 스펙 §6.3의 ~1.4h/~1.0h는 시차 투영 인자(a_p/(a_b+a_p)) 생략 근사로 판단(2.47°÷회합각속도=1.42h와 정확히 일치). 시뮬레이션 기하가 정확하므로 실계산 채택, 스펙 무수정. 엄폐 판정 = 행성 중심 각거리 < 항성 각반지름`

## KNOWN ISSUES

- deploy.yml의 paths 필터에 `.github/workflows/deploy.yml` 자신이 포함되어 있어, **deploy.yml을 추가/수정하는 main 푸시는 Actions를 발동시킴** (M0-1 초기 푸시에서 발동 → package.json 없어 즉시 실패 → 해당 런은 삭제 처리). M1-1 이후 package.json이 생기면 정상 동작하므로 구조 변경 불필요.
- `configure-pages`의 `enablement: true`는 GITHUB_TOKEN 권한 부족으로 실패함("Resource not accessible by integration") → M1-4에서 `gh api repos/.../pages -X POST -f build_type=workflow`로 수동 활성화 완료. 이후 배포는 정상 — 재발 시 같은 명령 사용.
- GitHub Actions Node 20 deprecation 경고 → M1-4에서 dev의 deploy.yml 액션 메이저 업그레이드(checkout/setup-node@v6, configure-pages@v6, upload-pages-artifact@v5, deploy-pages@v5). **main에는 M2 릴리스 때 반영됨** — 그 전까지 main 배포는 구버전으로 동작(2026-09-16까지는 문제없음).

## HANDOFF NOTE (마지막 세션이 덮어쓰는 인수인계 — 항상 최신 1개만)

- 마지막 작업 파일/함수: `src/sim/events.ts`(nextConjunctionJd/nextOccultation) + `src/components/EventCalendar.tsx`
- 어디까지 했나: **M4 마일스톤 완료** — c·d 하늘 객체 + 이벤트 예측기 + 가시성 캘린더 라이브 배포(release: M4)
- 다음 세션 첫 행동: M5-1 수행 — 스펙 §6.5 읽고 skyScattering 셰이더: 돔 BackSide 구에 3034K 플랑크 분포(8–16 파장 샘플) → 파장별 Rayleigh(λ⁻⁴)+Mie 단일산란 → XYZ→sRGB. uniform: sunDir(항성 씬 방향), atmosPreset(1bar/0.1bar/무대기), sampleCount(4/8/16). leva 프리셋 토글
- 주의사항/함정: 항성 씬 방향은 GiantStar와 동일 파이프라인(starDirectionFromPlanet→horizontal→scene) 재사용. 배경 <color>와 지면색은 셰이더 돔으로 대체/조화 필요. 별필드(renderOrder 1)가 하늘 돔 위에 보이려면 돔 renderOrder 0 + depthWrite false. CIE XYZ 적분은 단순 3밴드 근사도 허용(시각 확인이 DoD — 정밀 테스트 없음)
- 테스트 상태: 66 passed / 0 failed (+ events 합/엄폐 4)
