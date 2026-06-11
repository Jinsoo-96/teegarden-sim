// 시민시간 모듈 테스트 — §10 테스트 7(시민일)·8(칭동 위상 복귀) + 경계값 (M2-2 DoD)
import { describe, it, expect } from "vitest";
import { CIVIC_TIME, PLANETS } from "../data/teegarden";
import {
  WEEK_ZERO_JD,
  findLibrationSunrise,
  jdToCivic,
  formatCivic,
  librationAltitudeRad,
  starAngularRadiusRad,
} from "./civicTime";

const P = PLANETS[0].periodDays;
const CIVIC_DAY_JD = P / CIVIC_TIME.civicDaysPerOrbit;

describe("주 시작 앵커 = 칭동 일출 (§5.2)", () => {
  it("앵커 시각에 고도 = +각반지름 (완전히 떠오른 순간, 오차 <1e-9 rad)", () => {
    const diff = librationAltitudeRad(WEEK_ZERO_JD) - starAngularRadiusRad(WEEK_ZERO_JD);
    expect(Math.abs(diff)).toBeLessThan(1e-9);
  });

  it("앵커 직후 고도 상승 중 (일출이지 일몰이 아님)", () => {
    expect(librationAltitudeRad(WEEK_ZERO_JD + 0.05)).toBeGreaterThan(
      librationAltitudeRad(WEEK_ZERO_JD),
    );
  });

  it("다음 일출은 정확히 +P (칭동 주기 = 공전주기)", () => {
    const next = findLibrationSunrise(WEEK_ZERO_JD + 0.1);
    expect(Math.abs(next - (WEEK_ZERO_JD + P))).toBeLessThan(1e-6);
  });
});

describe("§10 테스트 7 — 시민일 길이 23.55 h", () => {
  it("시민일 경계 간격 = P/5 (정확) ≈ 23.55 h", () => {
    expect(CIVIC_DAY_JD * 24).toBeCloseTo(23.55, 2);
    // 연속 시민일 시작점의 시민시각이 모두 D{k} 00:00
    for (let k = 0; k < 5; k++) {
      const c = jdToCivic(WEEK_ZERO_JD + k * CIVIC_DAY_JD + 1e-9);
      expect(c.civicDay).toBe(k + 1);
      expect(c.hour).toBe(0);
      expect(c.minute).toBe(0);
    }
  });
});

describe("§10 테스트 8 — 1 시민주(5일) 후 칭동 위상 복귀", () => {
  it("주 시작마다 칭동 고도 동일 (오차 <1e-6 rad)", () => {
    const a0 = librationAltitudeRad(WEEK_ZERO_JD);
    for (const k of [1, 2, 10, 52]) {
      expect(Math.abs(librationAltitudeRad(WEEK_ZERO_JD + k * P) - a0)).toBeLessThan(1e-6);
    }
  });

  it("1주 후 시민시각도 동일 위상 (W+1 D1 00:00)", () => {
    const c = jdToCivic(WEEK_ZERO_JD + P + 1e-9);
    expect(c.week).toBe(1);
    expect(c.civicDay).toBe(1);
    expect(c.hour).toBe(0);
  });
});

describe("경계값", () => {
  it("앵커 시각 = W0 D1 00:00:00", () => {
    expect(formatCivic(jdToCivic(WEEK_ZERO_JD))).toBe("W0 D1 00:00:00");
  });

  it("앵커 직전 = 전 주(W−1) D5 심야", () => {
    const c = jdToCivic(WEEK_ZERO_JD - 1e-7);
    expect(c.week).toBe(-1);
    expect(c.civicDay).toBe(5);
    expect(c.hour).toBe(23);
  });

  it("시민일 경계 직전 = D1 23:59:59", () => {
    const c = jdToCivic(WEEK_ZERO_JD + CIVIC_DAY_JD - 1e-7);
    expect(c.civicDay).toBe(1);
    expect(c.hour).toBe(23);
    expect(c.minute).toBe(59);
  });

  it("civicDay는 항상 1–5, hour는 0–23 (1000지점 스캔)", () => {
    for (let i = 0; i < 1000; i++) {
      const c = jdToCivic(WEEK_ZERO_JD + (i / 1000) * 3 * P - P);
      expect(c.civicDay).toBeGreaterThanOrEqual(1);
      expect(c.civicDay).toBeLessThanOrEqual(5);
      expect(c.hour).toBeGreaterThanOrEqual(0);
      expect(c.hour).toBeLessThanOrEqual(23);
    }
  });

  it("주 번호 진행: W0+7.3P → week 7", () => {
    expect(jdToCivic(WEEK_ZERO_JD + 7.3 * P).week).toBe(7);
  });
});
