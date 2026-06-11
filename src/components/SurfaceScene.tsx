// Surface View — 스펙 §6.1 관측자 / §7.3 각도 좌표 투영
// M3-2: 거대 항성 셰이더 디스크(GiantStar). 별 배경은 M3-3, 대기 산란은 M5-1
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { DirectionalLight } from "three";
import GiantStar from "./GiantStar";
import CelestialSphere from "./CelestialSphere";
import PlanetInSky from "./PlanetInSky";
import SkyDome from "./SkyDome";
import FlareSystem from "./FlareSystem";
import { PLANETS } from "../data/teegarden";
import {
  horizontalToScenePos,
  inertialDirToHorizontal,
  starDirectionFromPlanet,
} from "../sim/skyCoords";
import { useSettingsStore } from "../state/settingsStore";
import { useTimeStore } from "../state/timeStore";

const [b, c, d] = PLANETS;
export const DOME_R = 100; // 천구돔 반경 (씬 단위 — 모든 천체는 각도로만 배치, §7.3)

// 항성 방향 평행광 — c·d 위상 라이팅의 광원 (§6.3 "광원=항성")
function StarLight() {
  const ref = useRef<DirectionalLight>(null);
  useFrame(() => {
    if (!ref.current) return;
    const jd = useTimeStore.getState().simTimeJD;
    const obs = useSettingsStore.getState().observer;
    const h = inertialDirToHorizontal(starDirectionFromPlanet(b, jd), b, jd, obs);
    const [x, y, z] = horizontalToScenePos(h, DOME_R);
    ref.current.position.set(x, y, z); // target = 원점(기본) → 항성→관측자 방향 평행광
  });
  return <directionalLight ref={ref} intensity={2.4} color="#FFBA70" />;
}

export default function SurfaceScene() {
  // 시간 적분 (System/Surface 중 마운트된 쪽이 담당)
  useFrame((_, delta) => {
    useTimeStore.getState().advance(delta * 1000);
  });

  return (
    <>
      {/* 무대기 프리셋 폴백 배경 — 대기 있으면 SkyDome이 덮음 */}
      <color attach="background" args={["#05060a"]} />
      <SkyDome />
      <CelestialSphere />
      <GiantStar />
      <StarLight />
      <PlanetInSky planet={c} />
      <PlanetInSky planet={d} />
      <FlareSystem />
      {/* 지면: 수평선 실루엣 임시판 (M6-1에서 지형으로 교체) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
        <circleGeometry args={[DOME_R * 2, 64]} />
        <meshBasicMaterial color="#0b0d12" />
      </mesh>
      <ambientLight intensity={0.3} />
      {/* 1인칭 둘러보기: 카메라를 원점 근처에 고정하고 회전만 — §6.1 (커스텀 look controls는 추후) */}
      <OrbitControls
        makeDefault
        enableZoom={false}
        enablePan={false}
        target={[0, 0, 0]}
        rotateSpeed={-0.4}
      />
    </>
  );
}
