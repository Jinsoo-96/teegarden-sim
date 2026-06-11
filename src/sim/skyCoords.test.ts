// 천구좌표 변환 테스트 — M3-1 DoD: 항성 방향 = 수평선, 반항성 = 반대 수평선
import { describe, it, expect } from "vitest";
import { EPOCH_JD, PLANETS } from "../data/teegarden";
import { librationOffsetRad } from "./kepler";
import {
  inertialDirToHorizontal,
  raDecToInertialDir,
  starDirectionFromPlanet,
  type Observer,
  type Vec3,
} from "./skyCoords";

const b = PLANETS[0];
const RAD2DEG = 180 / Math.PI;
// b의 M0=0 → EPOCH_JD에서 M=ν=0 (칭동 0) — 기하 검증에 최적의 시점
const JD0 = EPOCH_JD;
const evening: Observer = { latitudeDeg: 0, longitudeDeg: 90 };
const morning: Observer = { latitudeDeg: 0, longitudeDeg: -90 };

const antiStar = (jd: number): Vec3 => {
  const s = starDirectionFromPlanet(b, jd);
  return [-s[0], -s[1], -s[2]];
};

describe("DoD — 터미네이터 관측자: 항성 방향 = 수평선, 반항성 = 반대 수평선", () => {
  it("저녁 터미네이터(적도): 항성 고도 0°, 방위 = 서(270°)", () => {
    const h = inertialDirToHorizontal(starDirectionFromPlanet(b, JD0), b, JD0, evening);
    expect(Math.abs(h.altitudeRad)).toBeLessThan(1e-9);
    expect(h.azimuthRad * RAD2DEG).toBeCloseTo(270, 6);
  });

  it("반항성 방향: 고도 0°, 방위 = 동(90°) — 정반대 수평선", () => {
    const h = inertialDirToHorizontal(antiStar(JD0), b, JD0, evening);
    expect(Math.abs(h.altitudeRad)).toBeLessThan(1e-9);
    expect(h.azimuthRad * RAD2DEG).toBeCloseTo(90, 6);
  });

  it("아침 터미네이터(−90°)에서도 항성은 수평선 (방위는 반대쪽)", () => {
    const h = inertialDirToHorizontal(starDirectionFromPlanet(b, JD0), b, JD0, morning);
    expect(Math.abs(h.altitudeRad)).toBeLessThan(1e-9);
    expect(h.azimuthRad * RAD2DEG).toBeCloseTo(90, 6);
  });

  it("위도 0–45° 어디서든 터미네이터에서 항성 고도 0° (터미네이터 = 대원)", () => {
    for (const lat of [0, 15, 30, 45]) {
      const obs: Observer = { latitudeDeg: lat, longitudeDeg: 90 };
      const h = inertialDirToHorizontal(starDirectionFromPlanet(b, JD0), b, JD0, obs);
      expect(Math.abs(h.altitudeRad)).toBeLessThan(1e-9);
    }
  });
});

describe("특수 지점 관측자", () => {
  it("항성직하점(경도 0): 항성 = 천정(+90°)", () => {
    const h = inertialDirToHorizontal(
      starDirectionFromPlanet(b, JD0), b, JD0,
      { latitudeDeg: 0, longitudeDeg: 0 },
    );
    expect(h.altitudeRad * RAD2DEG).toBeCloseTo(90, 6);
  });

  it("반항성점(경도 180): 항성 = 천저(−90°)", () => {
    const h = inertialDirToHorizontal(
      starDirectionFromPlanet(b, JD0), b, JD0,
      { latitudeDeg: 0, longitudeDeg: 180 },
    );
    expect(h.altitudeRad * RAD2DEG).toBeCloseTo(-90, 6);
  });
});

describe("칭동 일관성 — 저녁 터미네이터 항성 고도 = librationOffsetRad (DECISIONS 규약)", () => {
  it("임의 시점 100지점에서 일치 (오차 < 1e-9 rad)", () => {
    for (let k = 0; k < 100; k++) {
      const jd = EPOCH_JD + (k / 100) * b.periodDays;
      const h = inertialDirToHorizontal(starDirectionFromPlanet(b, jd), b, jd, evening);
      expect(Math.abs(h.altitudeRad - librationOffsetRad(b, jd))).toBeLessThan(1e-9);
    }
  });
});

describe("raDecToInertialDir (배경 천구 매핑 [가정])", () => {
  it("천구 북극(Dec +90°) = 자전축 +y, RA 0h/Dec 0° = +x", () => {
    const pole = raDecToInertialDir(0, 90);
    expect(pole[1]).toBeCloseTo(1, 9);
    const origin = raDecToInertialDir(0, 0);
    expect(origin[0]).toBeCloseTo(1, 9);
    expect(origin[1]).toBeCloseTo(0, 9);
  });
});
