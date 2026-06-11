// 천구좌표 유틸 — 스펙 §6.1 관측자 / §7.2 SurfaceScene 기반 (M3-1)
// 관성계: y-up, 궤도면 = xz (kepler.ts와 동일)
// 행성 자전각 Λ = M + π (조석고정 등속 자전 — 케플러 부등속 ν와의 차이가 칭동 §4)
// 행성 경도: 항성직하점(평균) = 0°, 동쪽 양수. 저녁 터미네이터 = +90°, 아침 = −90° (§6.1)
// 방위각: 0 = 북(자전축), π/2 = 동, 3π/2 = 서. 저녁 터미네이터에서 항성 방위 = 서 (§6.2)
import type { PlanetData } from "../data/teegarden";
import { meanAnomaly, propagate } from "./kepler";

export type Vec3 = [number, number, number];

export interface Observer {
  latitudeDeg: number; // 0–45 권장 (§6.1)
  longitudeDeg: number; // +90 = 저녁 터미네이터(기본), −90 = 아침
}

export interface Horizontal {
  altitudeRad: number; // 고도 (수평선 0, 천정 +π/2)
  azimuthRad: number; // 방위 [0, 2π), 0=북
}

const DEG = Math.PI / 180;

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const normalize = (v: Vec3): Vec3 => {
  const n = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / n, v[1] / n, v[2] / n];
};

// 관측자 국소 기저 (관성계 표현): up(천정) / north(북) / east(동)
export function observerFrame(
  planet: PlanetData,
  jd: number,
  obs: Observer,
): { up: Vec3; north: Vec3; east: Vec3 } {
  const lam = meanAnomaly(planet, jd) + Math.PI; // 자전각 Λ
  const xb: Vec3 = [Math.cos(lam), 0, Math.sin(lam)]; // 항성직하(평균) 축
  const yb: Vec3 = [0, 1, 0]; // 자전축 (경사 0 [가정])
  const zb: Vec3 = [-Math.sin(lam), 0, Math.cos(lam)];

  const phi = obs.latitudeDeg * DEG;
  const L = obs.longitudeDeg * DEG;
  // 표면점(=천정 방향) 몸체좌표: 동쪽 양수 경도 규약 → z 성분 부호 음수
  const ub: Vec3 = [Math.cos(phi) * Math.cos(L), Math.sin(phi), -Math.cos(phi) * Math.sin(L)];
  const up = normalize([
    xb[0] * ub[0] + yb[0] * ub[1] + zb[0] * ub[2],
    xb[1] * ub[0] + yb[1] * ub[1] + zb[1] * ub[2],
    xb[2] * ub[0] + yb[2] * ub[1] + zb[2] * ub[2],
  ]);
  // 북 = 자전축을 지평면에 투영 (위도 ≤ 45°라 극 특이점 없음)
  const yProj = dot(yb, up);
  const north = normalize([yb[0] - yProj * up[0], yb[1] - yProj * up[1], yb[2] - yProj * up[2]]);
  const east = cross(north, up);
  return { up, north, east };
}

// 관성계 방향 벡터 → 지평좌표
export function inertialDirToHorizontal(
  dir: Vec3,
  planet: PlanetData,
  jd: number,
  obs: Observer,
): Horizontal {
  const { up, north, east } = observerFrame(planet, jd, obs);
  const d = normalize(dir);
  const altitudeRad = Math.asin(Math.min(1, Math.max(-1, dot(d, up))));
  let az = Math.atan2(dot(d, east), dot(d, north));
  if (az < 0) az += 2 * Math.PI;
  return { altitudeRad, azimuthRad: az };
}

// 행성 → 항성 방향 (관성계)
export function starDirectionFromPlanet(planet: PlanetData, jd: number): Vec3 {
  const p = propagate(planet, jd).posAU;
  return normalize([-p[0], -p[1], -p[2]]);
}

// 행성 from → 행성 to 방향 (관성계) — c·d 하늘 위치용 (M4-1)
export function planetDirectionFrom(from: PlanetData, to: PlanetData, jd: number): Vec3 {
  const a = propagate(from, jd).posAU;
  const b = propagate(to, jd).posAU;
  return normalize([b[0] - a[0], b[1] - a[1], b[2] - a[2]]);
}

// RA/Dec → 관성계 방향 — 배경 천구용 (M3-3)
// [가정] 행성계 궤도면과 지구 적도좌표계의 정렬은 미관측 → 가장 단순한 직접 매핑 채택 (DECISIONS)
export function raDecToInertialDir(raHours: number, decDeg: number): Vec3 {
  const ra = (raHours / 24) * 2 * Math.PI;
  const dec = decDeg * DEG;
  return [Math.cos(dec) * Math.cos(ra), Math.sin(dec), Math.cos(dec) * Math.sin(ra)];
}

// 지평좌표 → 천구돔 씬 좌표 (반경 r 고정 투영, §7.3) — 씬 축: x=동, y=상, −z=북
export function horizontalToScenePos(h: Horizontal, r: number): Vec3 {
  const c = Math.cos(h.altitudeRad);
  return [
    r * c * Math.sin(h.azimuthRad),
    r * Math.sin(h.altitudeRad),
    -r * c * Math.cos(h.azimuthRad),
  ];
}
