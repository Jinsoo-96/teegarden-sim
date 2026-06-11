// 하늘의 c·d — 스펙 §6.3: 실제 구체 + 위상 라이팅(광원=항성 방향) + 거리 기반 각크기
// 등급→HDR 변환·표면밝기 캘리브레이션은 M5-3 (여기선 기하·위상만 정확히)
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { PLANETS, type PlanetData } from "../data/teegarden";
import { planetAppearanceFrom } from "../sim/planetVis";
import {
  horizontalToScenePos,
  inertialDirToHorizontal,
  planetDirectionFrom,
} from "../sim/skyCoords";
import { useSettingsStore } from "../state/settingsStore";
import { useTimeStore } from "../state/timeStore";
import { DOME_R } from "./SurfaceScene";

const b = PLANETS[0];
const PLANET_DIST = DOME_R * 0.97; // 항성 디스크(0.98)보다 안쪽 — 합 때 renderOrder로 엄폐

export default function PlanetInSky({ planet }: { planet: PlanetData }) {
  const ref = useRef<Mesh>(null);
  useFrame(() => {
    if (!ref.current) return;
    const jd = useTimeStore.getState().simTimeJD;
    const obs = useSettingsStore.getState().observer;
    const dir = planetDirectionFrom(b, planet, jd);
    const h = inertialDirToHorizontal(dir, b, jd, obs);
    const [x, y, z] = horizontalToScenePos(h, PLANET_DIST);
    ref.current.position.set(x, y, z);
    // 각지름 → 구 반지름 (관측 각크기 보존)
    const app = planetAppearanceFrom(b, planet, jd);
    ref.current.scale.setScalar(PLANET_DIST * Math.sin(app.angularDiameterRad / 2));
  });
  return (
    // renderOrder 1.5: 별(1) 위, 항성 디스크(2) 아래 — 합 시 항성 뒤로 사라짐
    <mesh ref={ref} renderOrder={1.5}>
      <sphereGeometry args={[1, 32, 16]} />
      {/* 위상 라이팅: SurfaceScene의 항성 방향 directionalLight가 비춤 */}
      <meshStandardMaterial color="#b8aa98" roughness={0.95} />
    </mesh>
  );
}
