// 스펙 §10 테스트 3·4 — 회합주기를 "시뮬레이션에서 연속 충 간격 측정"으로 검증. 약화·삭제 금지
// 충(opposition, b 기준) = b와 외행성의 일심 경도가 일치하는 순간 (공면 가정)
import { describe, it, expect } from "vitest";
import { EPOCH_JD, PLANETS, SKY_EVENTS, type PlanetData } from "../data/teegarden";
import { propagate } from "./kepler";

const TWO_PI = Math.PI * 2;
const [b, c, d] = PLANETS;

function heliocentricLongitude(planet: PlanetData, jd: number): number {
  const { posAU } = propagate(planet, jd);
  return Math.atan2(posAU[2], posAU[0]);
}

// (−π, π] 래핑
function wrapPi(a: number): number {
  let x = a % TWO_PI;
  if (x > Math.PI) x -= TWO_PI;
  if (x <= -Math.PI) x += TWO_PI;
  return x;
}

// Δλ(t) = wrap(λ_outer − λ_inner). 내행성이 빠르므로 Δλ는 감소하며 0을 통과 = 충
function deltaLongitude(inner: PlanetData, outer: PlanetData, jd: number): number {
  return wrapPi(heliocentricLongitude(outer, jd) - heliocentricLongitude(inner, jd));
}

// 연속 충 시각들을 수치 탐색(부호 변화 감지 + 이분법 정밀화)으로 측정
function measureOppositions(
  inner: PlanetData,
  outer: PlanetData,
  count: number,
): number[] {
  const step = 0.02; // day
  const times: number[] = [];
  let tPrev = EPOCH_JD;
  let dPrev = deltaLongitude(inner, outer, tPrev);
  for (let t = tPrev + step; times.length < count && t < EPOCH_JD + 200; t += step) {
    const dCur = deltaLongitude(inner, outer, t);
    // 하강 0 교차만 충 (±π 랩 점프는 |차|>π로 배제)
    if (dPrev > 0 && dCur <= 0 && Math.abs(dCur - dPrev) < Math.PI) {
      let lo = tPrev;
      let hi = t;
      for (let i = 0; i < 60; i++) {
        const mid = (lo + hi) / 2;
        if (deltaLongitude(inner, outer, mid) > 0) lo = mid;
        else hi = mid;
      }
      times.push((lo + hi) / 2);
    }
    tPrev = t;
    dPrev = dCur;
  }
  return times;
}

function intervals(ts: number[]): number[] {
  return ts.slice(1).map((t, i) => t - ts[i]);
}

// 주의: b의 e=0.03 중심차 때문에 "개별" 충 간격은 ±0.1일가량 자연 요동한다(칭동과 동일 효과).
// 회합주기는 연속 충 간격의 평균으로 측정 — 평균에서 중심차 요동이 상쇄된다.
describe("§10 테스트 3 — b–c 회합주기 = 8.60일 (허용오차 0.05일)", () => {
  it("연속 충 11회, 간격 10개의 평균 = 8.60 ± 0.05일", () => {
    const ts = measureOppositions(b, c, 11);
    expect(ts).toHaveLength(11);
    const mean = (ts[10] - ts[0]) / 10;
    expect(Math.abs(mean - SKY_EVENTS.cOppositionPeriodDays)).toBeLessThan(0.05);
    // 개별 간격도 중심차 요동 범위(±0.2일)를 벗어나지 않아야 함 (오검출 방지)
    for (const iv of intervals(ts)) {
      expect(Math.abs(iv - SKY_EVENTS.cOppositionPeriodDays)).toBeLessThan(0.2);
    }
  });

  it("충 시각에서 경도차 ≈ 0 (정렬 검증)", () => {
    const [t0] = measureOppositions(b, c, 1);
    expect(Math.abs(deltaLongitude(b, c, t0))).toBeLessThan(1e-6);
  });
});

describe("§10 테스트 4 — b–d 회합주기 = 6.04일 (허용오차 0.05일)", () => {
  it("연속 충 11회, 간격 10개의 평균 = 6.04 ± 0.05일", () => {
    const ts = measureOppositions(b, d, 11);
    expect(ts).toHaveLength(11);
    const mean = (ts[10] - ts[0]) / 10;
    expect(Math.abs(mean - SKY_EVENTS.dOppositionPeriodDays)).toBeLessThan(0.05);
    for (const iv of intervals(ts)) {
      expect(Math.abs(iv - SKY_EVENTS.dOppositionPeriodDays)).toBeLessThan(0.2);
    }
  });
});
