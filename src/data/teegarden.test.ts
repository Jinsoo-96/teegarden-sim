// 상수 무결성 테스트 — 스펙 §2 스냅샷 (M1-1 DoD)
// 주의: 이 값들은 스펙 §10 검증의 전제이므로 약화·삭제 금지 (CLAUDE.md 불변 규칙 2)
import { describe, it, expect } from "vitest";
import {
  STAR,
  PLANETS,
  EPOCH_JD,
  CIVIC_TIME,
  SKY_EVENTS,
  CANDIDATE_E,
} from "./teegarden";

describe("teegarden.ts 상수 무결성 (스펙 §2)", () => {
  it("항성 파라미터 (Marfil+2021, Shan+2024, Fuhrmeister+2025)", () => {
    expect(STAR.teffK).toBe(3034);
    expect(STAR.massMsun).toBe(0.097);
    expect(STAR.radiusRsun).toBe(0.12);
    expect(STAR.luminosityLsun).toBe(7.22e-4);
    expect(STAR.rotationPeriodDays).toBe(97.56);
    expect(STAR.flare.ratePerDay).toBe(0.026);
    expect(STAR.colorSRGB).toBe("#FFBA70");
  });

  it("행성 b/c/d 궤도 요소 (Dreizler+2024)", () => {
    expect(PLANETS).toHaveLength(3);
    expect(PLANETS.map((p) => p.periodDays)).toEqual([4.90634, 11.416, 26.13]);
    expect(PLANETS.map((p) => p.semiMajorAxisAU)).toEqual([0.0259, 0.0455, 0.0791]);
    expect(PLANETS.map((p) => p.eccentricity)).toEqual([0.03, 0.0, 0.0]);
    expect(PLANETS.every((p) => p.tidallyLocked)).toBe(true);
    expect(EPOCH_JD).toBe(2460000.0);
  });

  it("시민 시간계: 시민일 23.55h, 5일 = 1궤도 (§10 테스트 7)", () => {
    expect(CIVIC_TIME.civicDaysPerOrbit).toBe(5);
    expect(CIVIC_TIME.civicDayHours).toBeCloseTo(23.55, 2);
    // 5 시민일 = 정확히 1 공전 (정의상 항등식 — 부동소수 오차만 허용)
    expect(CIVIC_TIME.civicDayHours * 5).toBeCloseTo(CIVIC_TIME.orbitHours, 10);
    expect(CIVIC_TIME.orbitHours).toBeCloseTo(4.90634 * 24, 10);
  });

  it("하늘 이벤트 주기 + 후보행성 기본 OFF", () => {
    expect(SKY_EVENTS.cOppositionPeriodDays).toBe(8.6);
    expect(SKY_EVENTS.dOppositionPeriodDays).toBe(6.04);
    expect(SKY_EVENTS.librationPeriodDays).toBe(4.90634);
    expect(SKY_EVENTS.sunFromTeegarden.vMag).toBe(2.75);
    expect(CANDIDATE_E.confirmed).toBe(false);
  });
});
