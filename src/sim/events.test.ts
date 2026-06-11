// 이벤트 점프(다음 충 탐색) 테스트 — M2-1
import { describe, it, expect } from "vitest";
import { EPOCH_JD, PLANETS, SKY_EVENTS } from "../data/teegarden";
import { deltaLongitudeRad, nextOppositionJd } from "./events";

const [b, c, d] = PLANETS;

describe("nextOppositionJd", () => {
  it("fromJd 이후의 시각을 반환하고, 그 시각에 경도 정렬(|Δλ|<1e-6)", () => {
    for (const outer of [c, d]) {
      const t = nextOppositionJd(b, outer, EPOCH_JD);
      expect(t).toBeGreaterThan(EPOCH_JD);
      expect(Math.abs(deltaLongitudeRad(b, outer, t))).toBeLessThan(1e-6);
    }
  });

  it("연속 호출 간격이 회합주기 근방 (중심차 요동 ±0.2일 허용)", () => {
    const t1 = nextOppositionJd(b, c, EPOCH_JD);
    const t2 = nextOppositionJd(b, c, t1 + 0.01);
    expect(Math.abs(t2 - t1 - SKY_EVENTS.cOppositionPeriodDays)).toBeLessThan(0.2);

    const u1 = nextOppositionJd(b, d, EPOCH_JD);
    const u2 = nextOppositionJd(b, d, u1 + 0.01);
    expect(Math.abs(u2 - u1 - SKY_EVENTS.dOppositionPeriodDays)).toBeLessThan(0.2);
  });
});
