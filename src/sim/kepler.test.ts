// 스펙 §10 검증 테스트 1(a값)·7(시민일)·8(칭동 위상 복귀) — 약화·삭제 금지 (CLAUDE.md 불변 규칙 2)
import { describe, it, expect } from "vitest";
import { PLANETS, STAR, CIVIC_TIME, EPOCH_JD } from "../data/teegarden";
import {
  semiMajorAxisFromPeriod,
  solveKepler,
  propagate,
  librationOffsetRad,
} from "./kepler";

const b = PLANETS[0];

describe("§10 테스트 1 — 케플러 제3법칙: P=4.90634d, M★=0.097 → a", () => {
  it("b: a = 0.0259–0.0260 AU (허용오차 0.5%)", () => {
    const a = semiMajorAxisFromPeriod(b.periodDays, STAR.massMsun);
    expect(a).toBeGreaterThan(0.0259 * 0.995);
    expect(a).toBeLessThan(0.026 * 1.005);
    expect(Math.abs(a - b.semiMajorAxisAU) / b.semiMajorAxisAU).toBeLessThan(0.005);
  });

  it("b/c/d 모두 발표 a값과 케플러 일관성 < 0.5% (스펙 §1.3)", () => {
    for (const p of PLANETS) {
      const a = semiMajorAxisFromPeriod(p.periodDays, STAR.massMsun);
      expect(Math.abs(a - p.semiMajorAxisAU) / p.semiMajorAxisAU).toBeLessThan(0.005);
    }
  });
});

describe("solveKepler — 뉴턴-랩슨 수렴 (허용오차 1e-10)", () => {
  it("E − e·sinE = M 잔차 < 1e-10 (e=0, 0.03, 0.09 × M 16지점)", () => {
    for (const e of [0, 0.03, 0.09]) {
      for (let k = 0; k < 16; k++) {
        const M = (k / 16) * 2 * Math.PI;
        const E = solveKepler(M, e);
        expect(Math.abs(E - e * Math.sin(E) - M)).toBeLessThan(1e-10);
      }
    }
  });
});

describe("§10 테스트 7 — 시민일 길이", () => {
  it("시민일 = P_b·24/5 (정의 항등식, 정확) ≈ 23.55 h", () => {
    expect(CIVIC_TIME.civicDayHours).toBe((b.periodDays * 24) / 5);
    expect(CIVIC_TIME.civicDayHours).toBeCloseTo(23.55, 2);
  });
});

describe("§10 테스트 8 — 1 시민주(5 시민일 = 1 공전) 후 칭동 위상 복귀", () => {
  it("칭동 오프셋 차이 < 1e-6", () => {
    const jd0 = EPOCH_JD + 1.234; // 임의 시점
    const l0 = librationOffsetRad(b, jd0);
    const l1 = librationOffsetRad(b, jd0 + b.periodDays);
    expect(Math.abs(l1 - l0)).toBeLessThan(1e-6);
  });

  it("궤도 위치(posAU)도 1주기 후 복귀", () => {
    const s0 = propagate(b, EPOCH_JD + 2.5);
    const s1 = propagate(b, EPOCH_JD + 2.5 + b.periodDays);
    expect(s1.posAU[0]).toBeCloseTo(s0.posAU[0], 9);
    expect(s1.posAU[2]).toBeCloseTo(s0.posAU[2], 9);
  });

  it("칭동 진폭이 ≈ ±2e rad 스케일 (sanity — 정밀 검증은 M3-2 §10 테스트 5)", () => {
    let maxAbs = 0;
    for (let k = 0; k <= 100; k++) {
      const off = librationOffsetRad(b, EPOCH_JD + (k / 100) * b.periodDays);
      maxAbs = Math.max(maxAbs, Math.abs(off));
    }
    // 2e = 0.06 rad ≈ 3.44° — 10% 여유로 상·하한만 확인
    expect(maxAbs).toBeGreaterThan(0.06 * 0.9);
    expect(maxAbs).toBeLessThan(0.06 * 1.1);
  });
});
