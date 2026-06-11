// 배경 천구 테스트 — M3-3 DoD: 별 ~9k개 로드 + 좌표 파이프라인 일관성
import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { EPOCH_JD, PLANETS } from "../data/teegarden";
import {
  horizontalToScenePos,
  inertialDirToHorizontal,
  observerFrame,
  starDirectionFromPlanet,
  type Observer,
  type Vec3,
} from "./skyCoords";

const b = PLANETS[0];

describe("public/stars.json (HYG v3, V≤6.5)", () => {
  const rows: [number, number, number, number][] = JSON.parse(
    readFileSync("public/stars.json", "utf8"),
  );

  it("별 개수 ~9k (8,000–10,000)", () => {
    expect(rows.length).toBeGreaterThan(8000);
    expect(rows.length).toBeLessThan(10000);
  });

  it("필드 범위: ra 0–24h, dec ±90°, mag ≤ 6.5", () => {
    for (const [ra, dec, mag] of rows) {
      expect(ra).toBeGreaterThanOrEqual(0);
      expect(ra).toBeLessThan(24);
      expect(Math.abs(dec)).toBeLessThanOrEqual(90);
      expect(mag).toBeLessThanOrEqual(6.5);
    }
  });

  it("태양(Sol, mag −26.7)은 카탈로그에서 제외됨", () => {
    expect(rows.every(([, , mag]) => mag > -20)).toBe(true);
  });
});

describe("일주운동 그룹 회전 = 지평좌표 파이프라인과 동치", () => {
  it("씬 = [east; up; −north]·관성방향 이 horizontalToScenePos와 일치", () => {
    const obs: Observer = { latitudeDeg: 15, longitudeDeg: 90 };
    for (const dt of [0, 1.234, 3.7]) {
      const jd = EPOCH_JD + dt;
      const f = observerFrame(b, jd, obs);
      const d = starDirectionFromPlanet(b, jd);
      // 행렬 곱 (행 기저)
      const viaMatrix: Vec3 = [
        f.east[0] * d[0] + f.east[1] * d[1] + f.east[2] * d[2],
        f.up[0] * d[0] + f.up[1] * d[1] + f.up[2] * d[2],
        -(f.north[0] * d[0] + f.north[1] * d[1] + f.north[2] * d[2]),
      ];
      const viaPipeline = horizontalToScenePos(inertialDirToHorizontal(d, b, jd, obs), 1);
      for (let k = 0; k < 3; k++) {
        expect(viaMatrix[k]).toBeCloseTo(viaPipeline[k], 10);
      }
    }
  });
});
