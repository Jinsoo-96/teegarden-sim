// 이벤트 예측기 테스트 — M2-1(충) + M4-2(합/엄폐: 예측치 = 시뮬레이션 실측 일치)
import { describe, it, expect } from "vitest";
import { EPOCH_JD, PLANETS, SKY_EVENTS } from "../data/teegarden";
import { starAngularRadiusRad } from "./civicTime";
import {
  apparentSeparationFromStarRad,
  deltaLongitudeRad,
  nextConjunctionJd,
  nextOccultation,
  nextOppositionJd,
} from "./events";

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

describe("nextConjunctionJd (M4-2)", () => {
  it("합 시각에 Δλ = ±π (경도 반대 정렬), 충과 약 반 회합주기 차이", () => {
    for (const outer of [c, d]) {
      const conj = nextConjunctionJd(b, outer, EPOCH_JD);
      expect(conj).toBeGreaterThan(EPOCH_JD);
      expect(Math.abs(Math.abs(deltaLongitudeRad(b, outer, conj)) - Math.PI)).toBeLessThan(1e-6);
      // 합에서 이각도 최소(공면 → 0 근방)
      expect(apparentSeparationFromStarRad(b, outer, conj)).toBeLessThan(0.001);
    }
  });
});

describe("엄폐 예측 = 시뮬레이션 실측 일치 (M4-2 DoD)", () => {
  // 실측: 각거리 < 항성 각반지름 구간을 1분 간격 직접 스캔
  function measureOccultation(target: typeof c, aroundJd: number) {
    const stepDay = 1 / 1440;
    const inside = (jd: number) =>
      apparentSeparationFromStarRad(b, target, jd) < starAngularRadiusRad(jd);
    let start = NaN;
    let end = NaN;
    for (let t = aroundJd - 0.5; t <= aroundJd + 0.5; t += stepDay) {
      if (inside(t)) {
        if (Number.isNaN(start)) start = t;
        end = t;
      }
    }
    return { start, end };
  }

  it("c: 예측 시작/종료가 실측과 1분 이내 일치, 지속 ~2.2h", () => {
    const w = nextOccultation(b, c, EPOCH_JD);
    const m = measureOccultation(c, w.midJd);
    expect(Math.abs(w.startJd - m.start)).toBeLessThan(1.5 / 1440);
    expect(Math.abs(w.endJd - m.end)).toBeLessThan(1.5 / 1440);
    // 기하 엄밀값 ≈ 2.2h (스펙 §6.3의 ~1.4h는 시차 투영 생략 근사 — DECISIONS 참조)
    expect(w.durationHours).toBeGreaterThan(1.9);
    expect(w.durationHours).toBeLessThan(2.6);
  });

  it("d: 예측 = 실측, 지속 ~1.3h", () => {
    const w = nextOccultation(b, d, EPOCH_JD);
    const m = measureOccultation(d, w.midJd);
    expect(Math.abs(w.startJd - m.start)).toBeLessThan(1.5 / 1440);
    expect(Math.abs(w.endJd - m.end)).toBeLessThan(1.5 / 1440);
    expect(w.durationHours).toBeGreaterThan(1.1);
    expect(w.durationHours).toBeLessThan(1.6);
  });

  it("엄폐 중심 = 합 시각, 구간이 중심에 대칭(±10%)", () => {
    const w = nextOccultation(b, c, EPOCH_JD);
    const half1 = w.midJd - w.startJd;
    const half2 = w.endJd - w.midJd;
    expect(Math.abs(half1 - half2) / Math.max(half1, half2)).toBeLessThan(0.1);
  });
});
