// 스펙 §10 테스트 6 + §6.3 표 검증 — c·d의 충/구상/합 각지름·등급. 약화·삭제 금지
// 허용오차: 각지름 5%, 등급 0.3 (§10 표)
import { describe, it, expect } from "vitest";
import { EPOCH_JD, PLANETS, type PlanetData } from "../data/teegarden";
import { propagate } from "./kepler";
import { nextOppositionJd } from "./events";
import { planetAppearanceFrom } from "./planetVis";

const [b, c, d] = PLANETS;
const ARCMIN = (rad: number) => (rad * 180 * 60) / Math.PI;

// 이각(elongation): b에서 본 항성–대상 사이 각
function elongationRad(target: PlanetData, jd: number): number {
  const pb = propagate(b, jd).posAU;
  const pt = propagate(target, jd).posAU;
  const s = [-pb[0], -pb[1], -pb[2]];
  const t = [pt[0] - pb[0], pt[1] - pb[1], pt[2] - pb[2]];
  const cosE =
    (s[0] * t[0] + s[1] * t[1] + s[2] * t[2]) /
    (Math.hypot(s[0], s[1], s[2]) * Math.hypot(t[0], t[1], t[2]));
  return Math.acos(Math.min(1, Math.max(-1, cosE)));
}

// 충 직후 이각이 180°→0°로 감소 — 90° 교차(구상)와 최소점(합)을 수치 탐색
function findQuadrature(target: PlanetData, oppJd: number): number {
  let tPrev = oppJd;
  let ePrev = elongationRad(target, tPrev);
  for (let t = oppJd + 0.01; t < oppJd + 12; t += 0.01) {
    const e = elongationRad(target, t);
    if (ePrev > Math.PI / 2 && e <= Math.PI / 2) {
      let lo = tPrev;
      let hi = t;
      for (let i = 0; i < 50; i++) {
        const mid = (lo + hi) / 2;
        if (elongationRad(target, mid) > Math.PI / 2) lo = mid;
        else hi = mid;
      }
      return (lo + hi) / 2;
    }
    tPrev = t;
    ePrev = e;
  }
  throw new Error("구상 탐색 실패");
}

function findConjunction(target: PlanetData, oppJd: number): number {
  let best = oppJd;
  let min = Math.PI;
  for (let t = oppJd + 0.01; t < oppJd + 12; t += 0.005) {
    const e = elongationRad(target, t);
    if (e < min) {
      min = e;
      best = t;
    }
  }
  return best;
}

describe("§10 테스트 6 — c 충: 각지름 15.2′(±5%) / V −6.5(±0.3)", () => {
  const opp = nextOppositionJd(b, c, EPOCH_JD);
  const a = planetAppearanceFrom(b, c, opp);

  it("각지름", () => {
    expect(Math.abs(ARCMIN(a.angularDiameterRad) - 15.2) / 15.2).toBeLessThan(0.05);
  });
  it("등급", () => {
    expect(Math.abs(a.vMag - -6.5)).toBeLessThan(0.3);
  });
  it("보름 위상 (α≈0, 조명률 ≈100%)", () => {
    expect(a.phaseFraction).toBeGreaterThan(0.999);
  });
});

describe("§6.3 표 — c 구상/합", () => {
  const opp = nextOppositionJd(b, c, EPOCH_JD);

  it("구상: 8.0′(±5%) / V −5.0(±0.3) / 조명률 ≈91%", () => {
    const a = planetAppearanceFrom(b, c, findQuadrature(c, opp));
    expect(Math.abs(ARCMIN(a.angularDiameterRad) - 8.0) / 8.0).toBeLessThan(0.05);
    expect(Math.abs(a.vMag - -5.0)).toBeLessThan(0.3);
    expect(a.phaseFraction).toBeGreaterThan(0.905);
    expect(a.phaseFraction).toBeLessThan(0.925);
  });

  it("합: 4.2′(±5%) / V −3.7(±0.3)", () => {
    const a = planetAppearanceFrom(b, c, findConjunction(c, opp));
    expect(Math.abs(ARCMIN(a.angularDiameterRad) - 4.2) / 4.2).toBeLessThan(0.05);
    expect(Math.abs(a.vMag - -3.7)).toBeLessThan(0.3);
  });
});

describe("§6.3 표 — d 충/구상/합", () => {
  const opp = nextOppositionJd(b, d, EPOCH_JD);

  it("충: 5.2′(±5%) / V −3.0(±0.3)", () => {
    const a = planetAppearanceFrom(b, d, opp);
    expect(Math.abs(ARCMIN(a.angularDiameterRad) - 5.2) / 5.2).toBeLessThan(0.05);
    expect(Math.abs(a.vMag - -3.0)).toBeLessThan(0.3);
  });

  it("구상: 3.7′(±5%) / V −2.2(±0.3)", () => {
    const a = planetAppearanceFrom(b, d, findQuadrature(d, opp));
    expect(Math.abs(ARCMIN(a.angularDiameterRad) - 3.7) / 3.7).toBeLessThan(0.05);
    expect(Math.abs(a.vMag - -2.2)).toBeLessThan(0.3);
  });

  it("합: 2.6′(±5%) / V −1.5(±0.3)", () => {
    const a = planetAppearanceFrom(b, d, findConjunction(d, opp));
    expect(Math.abs(ARCMIN(a.angularDiameterRad) - 2.6) / 2.6).toBeLessThan(0.05);
    expect(Math.abs(a.vMag - -1.5)).toBeLessThan(0.3);
  });
});

describe("위상 범위 — 초승달·반달은 절대 없음 (§6.3)", () => {
  it("c: 항상 gibbous~full (조명률 ≥ 0.905, 1 회합주기 스캔)", () => {
    for (let k = 0; k <= 200; k++) {
      const a = planetAppearanceFrom(b, c, EPOCH_JD + (k / 200) * 8.7);
      expect(a.phaseFraction).toBeGreaterThan(0.905);
    }
  });
  it("d: 항상 조명률 ≥ 0.965", () => {
    for (let k = 0; k <= 200; k++) {
      const a = planetAppearanceFrom(b, d, EPOCH_JD + (k / 200) * 6.1);
      expect(a.phaseFraction).toBeGreaterThan(0.965);
    }
  });
});
