// 하늘의 c·d — 스펙 §6.3: 실제 구체 + 위상 라이팅(광원=항성 방향) + 거리 기반 각크기
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { Group, Mesh } from "three";
import { PLANETS, type PlanetData } from "../data/teegarden";
import { planetAppearanceFrom } from "../sim/planetVis";
import {
  horizontalToScenePos,
  inertialDirToHorizontal,
  planetDirectionFrom,
} from "../sim/skyCoords"; // (라벨 가시성 판정에도 재사용)
import { useSettingsStore } from "../state/settingsStore";
import { useTimeStore } from "../state/timeStore";
import { DOME_R } from "./SurfaceScene";
import { planetColor } from "./planetColors";

const b = PLANETS[0];
const PLANET_DIST = DOME_R * 0.97; // 항성 디스크(0.98)보다 안쪽 — 합 때 renderOrder로 엄폐

export default function PlanetInSky({ planet }: { planet: PlanetData }) {
  const group = useRef<Group>(null);
  const sphere = useRef<Mesh>(null);
  const showLabels = useSettingsStore((s) => s.showLabels);
  const observer = useSettingsStore((s) => s.observer);
  // 라벨 갱신용 — 0.01일 단위로만 재렌더 (60fps 재렌더 방지)
  const jdCoarse = useTimeStore((s) => Math.round(s.simTimeJD * 100) / 100);
  const app = planetAppearanceFrom(b, planet, jdCoarse);
  // 수평선 아래면 라벨 숨김 (M7-3) — 위치는 나침반 바가 ▼로 안내
  const aboveHorizon =
    inertialDirToHorizontal(planetDirectionFrom(b, planet, jdCoarse), b, jdCoarse, observer)
      .altitudeRad > -0.005;

  useFrame(() => {
    if (!group.current || !sphere.current) return;
    const jd = useTimeStore.getState().simTimeJD;
    const obs = useSettingsStore.getState().observer;
    const dir = planetDirectionFrom(b, planet, jd);
    const h = inertialDirToHorizontal(dir, b, jd, obs);
    const [x, y, z] = horizontalToScenePos(h, PLANET_DIST);
    group.current.position.set(x, y, z);
    // 각지름 → 구 반지름 (관측 각크기 보존)
    const a = planetAppearanceFrom(b, planet, jd);
    sphere.current.scale.setScalar(PLANET_DIST * Math.sin(a.angularDiameterRad / 2));
  });

  return (
    <group ref={group}>
      {/* renderOrder 1.5: 별(1) 위, 항성 디스크(2) 아래 — 합 시 항성 뒤로 사라짐 */}
      <mesh ref={sphere} renderOrder={1.5}>
        <sphereGeometry args={[1, 32, 16]} />
        {/* 위상 라이팅(광원=3034K 항성색) × 행성별 추정 색 [가정] — 각크기는 물리값 그대로 */}
        <meshStandardMaterial color={planetColor(planet.name)} roughness={0.95} />
      </mesh>
      {showLabels && aboveHorizon && (
        <Html style={{ pointerEvents: "none" }} center distanceFactor={60}>
          {/* 리더선 + 라벨 — 천체와 시각적으로 연결 (M7-3) */}
          <div style={{ transform: "translateY(-30px)", textAlign: "center" }}>
            <div
              style={{
                color: "#c9cdd6",
                fontFamily: "sans-serif",
                fontSize: 10,
                whiteSpace: "nowrap",
                textShadow: "0 0 4px #000",
              }}
            >
              {planet.name} · V {app.vMag.toFixed(1)} ·{" "}
              {((app.angularDiameterRad * 180 * 60) / Math.PI).toFixed(1)}′ · 위상{" "}
              {(app.phaseFraction * 100).toFixed(0)}% [유도]
            </div>
            <div
              style={{
                width: 1,
                height: 14,
                margin: "2px auto 0",
                background: "rgba(201, 205, 214, 0.55)",
              }}
            />
          </div>
        </Html>
      )}
    </group>
  );
}
