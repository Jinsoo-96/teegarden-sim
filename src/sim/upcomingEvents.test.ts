// 회귀 테스트 — 2026-06-11 프로덕션 크래시(React #301 무한 재렌더)
// 불변식: upcoming* 가 반환하는 모든 이벤트 시각은 엄밀히 jd보다 미래여야 한다
import { describe, it, expect } from "vitest";
import { EPOCH_JD, PLANETS } from "../data/teegarden";
import { nextOccultation, nextOppositionJd } from "./events";
import { upcomingBasics, upcomingCalendar, upcomingOccultation } from "./upcomingEvents";

const [b, c] = PLANETS;

function assertAllFuture(jd: number) {
  for (const e of upcomingCalendar(jd)) {
    expect(e.jd).toBeGreaterThan(jd);
  }
  const basics = upcomingBasics(jd);
  expect(basics.sunrise).toBeGreaterThan(jd);
  expect(basics.cOpp).toBeGreaterThan(jd);
  expect(basics.dOpp).toBeGreaterThan(jd);
}

describe("불변식: 모든 이벤트 시각 > jd (무한 재렌더 방지)", () => {
  it("엄폐 진행 중(크래시 재현 시나리오)에도 미래 이벤트만 반환", () => {
    const w = nextOccultation(b, c, EPOCH_JD);
    // 엄폐 한가운데 — 버그 당시 startJd ≤ jd가 그대로 반환돼 루프 발생
    assertAllFuture(w.midJd);
    // 엄폐 시작 직후·종료 직전 경계
    assertAllFuture(w.startJd + 1e-7);
    assertAllFuture(w.endJd - 1e-7);
    // 진행 중일 땐 다음 회합의 엄폐를 가리켜야 함
    const next = upcomingOccultation(c, w.midJd);
    expect(next.startJd).toBeGreaterThan(w.endJd);
  });

  it("이벤트 시각에 정확히 점프해도(충 점프 버튼) 미래만 반환", () => {
    const opp = nextOppositionJd(b, c, EPOCH_JD);
    assertAllFuture(opp); // jd == 충 시각 그 자체
  });

  it("일반 시점 광역 스캔 (0–30일, 0.25일 간격)", () => {
    for (let k = 0; k <= 120; k++) {
      assertAllFuture(EPOCH_JD + k * 0.25);
    }
  });
});
