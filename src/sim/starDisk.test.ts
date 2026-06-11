// 스펙 §10 테스트 2(항성 각지름)·5(칭동 진폭) — M3-2 DoD. 약화·삭제 금지
import { describe, it, expect } from "vitest";
import { EPOCH_JD, PLANETS, UNITS } from "../data/teegarden";
import { librationOffsetRad } from "./kepler";
import { starAngularRadiusRad } from "./civicTime";

const b = PLANETS[0];
const RAD2DEG = 180 / Math.PI;

describe("§10 테스트 2 — b에서 본 항성 각지름 = 2.47° (허용오차 0.05°)", () => {
  it("장반경 a 거리 기준 각지름", () => {
    const diamDeg =
      2 * Math.asin(UNITS.starRadiusKm / UNITS.kmPerAU / b.semiMajorAxisAU) * RAD2DEG;
    expect(Math.abs(diamDeg - 2.47)).toBeLessThan(0.05);
  });

  it("궤도 1주기 평균 각지름도 허용오차 내 (starAngularRadiusRad 경유)", () => {
    const N = 200;
    let sum = 0;
    for (let k = 0; k < N; k++) {
      sum += 2 * starAngularRadiusRad(EPOCH_JD + (k / N) * b.periodDays) * RAD2DEG;
    }
    expect(Math.abs(sum / N - 2.47)).toBeLessThan(0.05);
  });

  it("e=0.03 거리 변동 범위 내 (근점 최대·원점 최소 sanity)", () => {
    const peri = 2 * starAngularRadiusRad(EPOCH_JD) * RAD2DEG; // M0=0 → epoch = 근점
    const apo = 2 * starAngularRadiusRad(EPOCH_JD + b.periodDays / 2) * RAD2DEG;
    expect(peri).toBeGreaterThan(apo);
    expect(peri / apo).toBeCloseTo((1 + b.eccentricity) / (1 - b.eccentricity), 2);
  });
});

describe("§10 테스트 5 — 칭동 고도 진폭 = ±3.44° (허용오차 0.1°)", () => {
  it("1주기 2000지점 스캔: (max−min)/2 = 3.44° ± 0.1°", () => {
    let max = -Infinity;
    let min = Infinity;
    for (let k = 0; k <= 2000; k++) {
      const off = librationOffsetRad(b, EPOCH_JD + (k / 2000) * b.periodDays) * RAD2DEG;
      max = Math.max(max, off);
      min = Math.min(min, off);
    }
    const amp = (max - min) / 2;
    expect(Math.abs(amp - 3.44)).toBeLessThan(0.1);
    // 대칭성: 진폭 중심이 0 근방 (±0.01°)
    expect(Math.abs((max + min) / 2)).toBeLessThan(0.01);
  });
});
