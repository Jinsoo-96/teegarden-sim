// 케플러 전파 엔진 — 스펙 §3.1
// 단위계: AU / day / M☉, 시간은 JD(율리우스일). G = 4π²·AU³/(yr²·M☉) (스펙 §2 주석)
// 공면(coplanar) 가정 [가정]: y-up 기준 황도면 = xz 평면

import { EPOCH_JD, type PlanetData } from "../data/teegarden";

export const DAYS_PER_YEAR = 365.25; // 율리우스년

const TWO_PI = Math.PI * 2;

export interface OrbitalState {
  posAU: [number, number, number]; // 항성 중심, y-up, 황도면 = xz
  trueAnomaly: number; // ν [rad]
  meanAnomaly: number; // M [rad, 0–2π) — 칭동(§4)·시민시간(§5) 파생용
  eccentricAnomaly: number; // E [rad]
  radiusAU: number; // r = a(1 − e·cosE)
}

// 케플러 제3법칙: G=4π² 단위계에서 a³ = M★·P_yr² (§10 테스트 1의 근거)
export function semiMajorAxisFromPeriod(
  periodDays: number,
  starMassMsun: number,
): number {
  const pYr = periodDays / DAYS_PER_YEAR;
  return Math.cbrt(starMassMsun * pYr * pYr);
}

// 케플러 방정식 E − e·sinE = M — 뉴턴-랩슨, 허용오차 1e-10 (e<0.1이라 4회 내 수렴)
export function solveKepler(M: number, e: number): number {
  let E = M;
  for (let i = 0; i < 12; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-10) break;
  }
  return E;
}

// 평균근점이각 M = M0 + n·(jd − epoch), n = 2π/P — [0, 2π) 정규화
// meanLongitudeAtEpochDeg를 M0로 사용 (근점 경도 0 가정 — DECISIONS 참조)
export function meanAnomaly(planet: PlanetData, jd: number): number {
  const n = TWO_PI / planet.periodDays;
  const M0 = (planet.meanLongitudeAtEpochDeg * Math.PI) / 180;
  const M = (M0 + n * (jd - EPOCH_JD)) % TWO_PI;
  return M < 0 ? M + TWO_PI : M;
}

export function propagate(planet: PlanetData, jd: number): OrbitalState {
  const e = planet.eccentricity;
  const M = meanAnomaly(planet, jd);
  const E = solveKepler(M, e);
  // ν = 2·atan2(√(1+e)·sin(E/2), √(1−e)·cos(E/2))
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2),
  );
  const r = planet.semiMajorAxisAU * (1 - e * Math.cos(E));
  return {
    posAU: [r * Math.cos(nu), 0, r * Math.sin(nu)],
    trueAnomaly: nu,
    meanAnomaly: M,
    eccentricAnomaly: E,
    radiusAU: r,
  };
}

// 광학 칭동(§4): 항성의 행성 기준 경도 오프셋 = −(ν − M) [rad]
// e≪1에서 ν−M ≈ 2e·sinM → 진폭 ≈ ±2e rad (b: ±3.44°)
export function librationOffsetRad(planet: PlanetData, jd: number): number {
  const s = propagate(planet, jd);
  let d = s.trueAnomaly - s.meanAnomaly;
  // (−π, π] 정규화 (atan2의 ν는 (−π,π], M은 [0,2π)라 2π 차이 보정 필요)
  while (d > Math.PI) d -= TWO_PI;
  while (d <= -Math.PI) d += TWO_PI;
  return -d;
}
