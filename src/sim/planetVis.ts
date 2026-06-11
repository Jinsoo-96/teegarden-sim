// c·d 하늘 가시성 — 스펙 §6.3: 위상각·위상률·각지름·겉보기등급
// 등급 공식(§6.3 구현 노트 그대로): m = m_star_from_b + 2.5·log10(1/(A_g·Φ(α)·(R_p/Δ)²·(a_b/a_p)²))
import { UNITS, VIS, type PlanetData } from "../data/teegarden";
import { propagate } from "./kepler";

export interface PlanetAppearance {
  deltaAU: number; // 관측 행성–대상 행성 거리 Δ
  phaseAngleRad: number; // 위상각 α (항성–대상–관측자)
  phaseFraction: number; // 조명률 (1+cosα)/2 — c는 항상 ≥0.91, d는 ≥0.97 (§6.3)
  angularDiameterRad: number; // 각지름 2·asin(R/Δ)
  vMag: number; // 겉보기등급
}

// 램버트 위상함수 Φ(α) = (sinα + (π−α)cosα)/π
export function lambertPhase(alphaRad: number): number {
  return (Math.sin(alphaRad) + (Math.PI - alphaRad) * Math.cos(alphaRad)) / Math.PI;
}

export function planetAppearanceFrom(
  observer: PlanetData,
  target: PlanetData,
  jd: number,
): PlanetAppearance {
  const po = propagate(observer, jd).posAU;
  const pt = propagate(target, jd).posAU;
  // 대상→관측자, 대상→항성 벡터
  const toObs = [po[0] - pt[0], po[1] - pt[1], po[2] - pt[2]];
  const delta = Math.hypot(toObs[0], toObs[1], toObs[2]);
  const rT = Math.hypot(pt[0], pt[1], pt[2]);
  const cosA =
    (-(pt[0] * toObs[0] + pt[1] * toObs[1] + pt[2] * toObs[2])) / (rT * delta);
  const alpha = Math.acos(Math.min(1, Math.max(-1, cosA)));

  const radiusAU = (target.assumedRadiusEarth * UNITS.earthRadiusKm) / UNITS.kmPerAU;
  const ratio =
    VIS.geometricAlbedo *
    lambertPhase(alpha) *
    (radiusAU / delta) ** 2 *
    (observer.semiMajorAxisAU / target.semiMajorAxisAU) ** 2;

  return {
    deltaAU: delta,
    phaseAngleRad: alpha,
    phaseFraction: (1 + Math.cos(alpha)) / 2,
    angularDiameterRad: 2 * Math.asin(radiusAU / delta),
    vMag: VIS.starVmagFromB - 2.5 * Math.log10(ratio),
  };
}
