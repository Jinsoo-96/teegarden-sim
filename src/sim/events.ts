// 이벤트 탐색 — 충/합/엄폐 예측 (§3.2 점프 버튼, §6.3 캘린더)
// 칭동 일출은 civicTime.findLibrationSunrise 사용
import type { PlanetData } from "../data/teegarden";
import { propagate } from "./kepler";
import { starAngularRadiusRad } from "./civicTime";

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

// 하강 0 교차 탐색 공통 루틴 (부호 변화 감지 + 이분법, 정밀도 ~1e-12일)
function findDescendingZero(f: (jd: number) => number, fromJd: number, label: string): number {
  const step = 0.02;
  let tPrev = fromJd;
  let fPrev = f(tPrev);
  // 탐색 상한 60일: 최장 회합주기(b–c 8.6일)의 7배 — 항상 그 안에 존재
  for (let t = fromJd + step; t < fromJd + 60; t += step) {
    const fCur = f(t);
    if (fPrev > 0 && fCur <= 0 && Math.abs(fCur - fPrev) < Math.PI) {
      let lo = tPrev;
      let hi = t;
      for (let i = 0; i < 60; i++) {
        const mid = (lo + hi) / 2;
        if (f(mid) > 0) lo = mid;
        else hi = mid;
      }
      return (lo + hi) / 2;
    }
    tPrev = t;
    fPrev = fCur;
  }
  throw new Error(`60일 내 ${label}을(를) 찾지 못함 — 궤도 파라미터 확인 필요`);
}

// fromJd 직후 첫 충 시각 (Δλ = 0 하강 교차)
export function nextOppositionJd(
  inner: PlanetData,
  outer: PlanetData,
  fromJd: number,
): number {
  return findDescendingZero((jd) => deltaLongitudeRad(inner, outer, jd), fromJd, "충");
}

// fromJd 직후 첫 합 시각 (Δλ = π, 즉 wrap(Δλ−π) = 0 하강 교차)
export function nextConjunctionJd(
  inner: PlanetData,
  outer: PlanetData,
  fromJd: number,
): number {
  return findDescendingZero(
    (jd) => wrapPi(deltaLongitudeRad(inner, outer, jd) - Math.PI),
    fromJd,
    "합",
  );
}

// b에서 본 항성–대상 행성 겉보기 각거리 (이각)
export function apparentSeparationFromStarRad(
  observer: PlanetData,
  target: PlanetData,
  jd: number,
): number {
  const po = propagate(observer, jd).posAU;
  const pt = propagate(target, jd).posAU;
  const s = [-po[0], -po[1], -po[2]];
  const t = [pt[0] - po[0], pt[1] - po[1], pt[2] - po[2]];
  const cosE =
    (s[0] * t[0] + s[1] * t[1] + s[2] * t[2]) /
    (Math.hypot(s[0], s[1], s[2]) * Math.hypot(t[0], t[1], t[2]));
  return Math.acos(Math.min(1, Math.max(-1, cosE)));
}

export interface OccultationWindow {
  startJd: number; // 행성 중심이 항성 디스크 림 안으로 진입
  midJd: number; // 합 (최소 각거리)
  endJd: number;
  durationHours: number;
}

// fromJd 이후 다음 엄폐 구간 — 공면 가정이라 매 합마다 발생 (§6.3)
// 판정: 행성 중심 각거리 < 항성 각반지름 (관측자 = b 전제 — starAngularRadiusRad가 b 기준)
export function nextOccultation(
  observer: PlanetData,
  target: PlanetData,
  fromJd: number,
): OccultationWindow {
  const conj = nextConjunctionJd(observer, target, fromJd);
  const f = (jd: number) => apparentSeparationFromStarRad(observer, target, jd) - starAngularRadiusRad(jd);
  // 합 시점엔 f<0 (디스크 안). 양쪽 경계를 이분 탐색 (±0.5일이면 충분히 바깥)
  const bisect = (lo0: number, hi0: number, insideAtHi: boolean): number => {
    let lo = lo0;
    let hi = hi0;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      const inside = f(mid) < 0;
      if (inside === insideAtHi) hi = mid;
      else lo = mid;
    }
    return (lo + hi) / 2;
  };
  const startJd = bisect(conj - 0.5, conj, true); // 바깥→안 경계
  const endJd = bisect(conj + 0.5, conj, true); // (역방향) 안→바깥 경계
  return { startJd, midJd: conj, endJd, durationHours: (endJd - startJd) * 24 };
}
