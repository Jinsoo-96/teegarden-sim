// 이벤트 탐색 — M2-1 최소판: 다음 충(衝) 시각 (§3.2 이벤트 점프 버튼용)
// 합·엄폐·칭동일출 예측과 캘린더 확장은 M4-2에서
import type { PlanetData } from "../data/teegarden";
import { propagate } from "./kepler";

const TWO_PI = Math.PI * 2;

function wrapPi(a: number): number {
  let x = a % TWO_PI;
  if (x > Math.PI) x -= TWO_PI;
  if (x <= -Math.PI) x += TWO_PI;
  return x;
}

// Δλ = wrap(λ_outer − λ_inner). 충 = Δλ의 하강 0 교차 (내행성이 더 빠름)
export function deltaLongitudeRad(
  inner: PlanetData,
  outer: PlanetData,
  jd: number,
): number {
  const pi = propagate(inner, jd).posAU;
  const po = propagate(outer, jd).posAU;
  return wrapPi(Math.atan2(po[2], po[0]) - Math.atan2(pi[2], pi[0]));
}

// fromJd 직후 첫 충 시각 (부호 변화 감지 + 이분법, 정밀도 ~1e-12일)
export function nextOppositionJd(
  inner: PlanetData,
  outer: PlanetData,
  fromJd: number,
): number {
  const step = 0.02;
  let tPrev = fromJd;
  let dPrev = deltaLongitudeRad(inner, outer, tPrev);
  // 탐색 상한 60일: 최장 회합주기(b–c 8.6일)의 7배 — 항상 그 안에 존재
  for (let t = fromJd + step; t < fromJd + 60; t += step) {
    const d = deltaLongitudeRad(inner, outer, t);
    if (dPrev > 0 && d <= 0 && Math.abs(d - dPrev) < Math.PI) {
      let lo = tPrev;
      let hi = t;
      for (let i = 0; i < 60; i++) {
        const mid = (lo + hi) / 2;
        if (deltaLongitudeRad(inner, outer, mid) > 0) lo = mid;
        else hi = mid;
      }
      return (lo + hi) / 2;
    }
    tPrev = t;
    dPrev = d;
  }
  throw new Error("60일 내 충을 찾지 못함 — 궤도 파라미터 확인 필요");
}
