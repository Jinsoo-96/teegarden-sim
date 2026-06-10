# Teegarden System Simulation — 작업 규약

React + Three.js(R3F) 티가든 행성계 물리 시뮬레이션.
**모든 구현의 단일 진실 공급원(SSOT): `docs/TEEGARDEN_SYSTEM_SIM_SPEC.md`**
스펙 전체를 통째로 읽지 말 것 — 현재 태스크가 가리키는 § 섹션만 Read 도구로 부분 읽기.
(주의: 이 파일에서 @ 임포트 문법으로 스펙을 참조하지 않는 이유 = 매 세션 전체 로드 방지)

## 세션 시작 프로토콜 (매 세션, 지시 없어도 수행)
1. `PROGRESS.md` 읽기 — 특히 **NOW**와 **HANDOFF NOTE**
2. `npm test` 실행으로 현재 상태 확인
3. NOW의 태스크 **딱 1개만** 수행. 완료 전 다른 태스크 시작 금지.

## 세션 종료 프로토콜
- 태스크 완료: 테스트 통과 → 커밋 `M{n}-{k}: 요약` → PROGRESS.md에서 DONE으로 이동, NEXT 맨 위를 NOW로 승격
- **컨텍스트 잔량이 ~20% 이하로 판단되면 즉시 새 작업을 멈추고 `/handoff` 절차 수행**
  (남은 컨텍스트로 "마무리"하려 들지 말 것 — 인수인계 기록이 미완성 코드보다 가치 있음)

## 불변 규칙
1. **물리 수치를 기억이나 재유도로 만들지 말 것.** 항상 `src/data/teegarden.ts` 상수만 사용.
   상수가 없으면 스펙 §1–2에서 복사해 상수로 추가 후 사용.
2. 스펙 §10 검증 테스트는 **약화·삭제 금지**. 구현과 테스트가 충돌하면 구현이 틀린 것.
3. 스펙에 없는 결정이 필요하면: 가장 단순한 안을 택하고 PROGRESS.md **DECISIONS**에 1줄 기록.
   스펙 파일 자체를 임의 수정하지 말 것.
4. 라이브러리 추가는 스펙 §7.1 스택 목록 내에서만. 그 외 추가 시 DECISIONS 기록 필수.
5. 1 커밋 = 1 태스크. 미완성은 `WIP(M{n}-{k}):` 접두사로 커밋.
6. 대답·코드 주석은 한국어, 식별자는 영어.

## Git / GitHub / 배포 규약 (gh 인증 완료 상태)
- 브랜치 역할: **`dev` = 모든 작업이 일어나는 곳**(항상 여기서 작업), **`main` = 배포 전용**.
  main 직접 커밋 금지, 두 브랜치 모두 force-push 금지.
- **모든 커밋 직후 `git push origin dev`** — 원격이 세션 간 백업이다. WIP 커밋도 반드시 푸시.
- 태스크 커밋 1개에 코드 변경 + PROGRESS.md 갱신을 **함께** 포함한다 (상태와 코드가 같은 해시에 묶이도록).
- **마일스톤 M{n}의 마지막 태스크 완료 = 배포 시점**:
  1. dev에서 `npm test` 전체 통과 확인
  2. `git checkout main && git merge dev --no-ff -m "release: M{n}" && git push origin main && git checkout dev`
  3. `gh run watch`로 Actions(빌드+테스트+Pages 배포) 성공 확인 — 실패 시 dev에서 수정 후 재머지
- main 푸시 → `.github/workflows/deploy.yml`이 GitHub Pages로 자동 배포.
  배포 URL `https://<owner>.github.io/<repo>/`는 M1-4에서 README.md 최상단에 기록하고 이후 갱신하지 않는다.
- 사용자가 "지금 배포해줘"라고 하면 마일스톤 중간이라도 위 머지 절차를 수행한다 (단, 테스트 통과 필수).

## 명령어
- dev: `npm run dev` · test: `npm test` (vitest run — 워치 모드 금지) · build: `npm run build`

## 자주 쓰는 스펙 섹션 지도
§2 데이터상수 · §3 케플러엔진/시간 · §4 조석고정·칭동 · §5 시민시간계 ·
§6.2 항성렌더 · §6.3 c·d 가시성(충/구상/합 표) · §6.5 대기산란 · §7 아키텍처 · §10 검증테이블
