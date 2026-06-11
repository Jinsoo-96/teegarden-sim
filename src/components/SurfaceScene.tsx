// Surface View — 스펙 §6.1 관측자 / §7.3 각도 좌표 투영
// M3-2: 거대 항성 셰이더 디스크(GiantStar). 별 배경은 M3-3, 대기 산란은 M5-1
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Vector3, type DirectionalLight } from "three";
import { useViewStore } from "../state/viewStore";
import GiantStar from "./GiantStar";
import CelestialSphere from "./CelestialSphere";
import PlanetInSky from "./PlanetInSky";
import SkyDome from "./SkyDome";
import FlareSystem from "./FlareSystem";
import PostFX from "./PostFX";
import Terrain from "./Terrain";
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

// 카메라 ↔ 나침반 동기화 + "천체 보기" 부드러운 회전 (M7-2)
function CameraSync() {
  const tmp = useMemo(() => new Vector3(), []);
  useFrame(({ camera }) => {
    const store = useViewStore.getState();
    // 시선 방위 발행 (원점 응시 구조: 시선 = −position). 방위 = atan2(x, −z)
    const d = tmp.copy(camera.position).multiplyScalar(-1).normalize();
    const az = Math.round(((Math.atan2(d.x, -d.z) * 180) / Math.PI + 360) % 360);
    if (az !== store.cameraAzimuthDeg) store.setCameraAzimuthDeg(az);
    // 천체 보기: 카메라를 −방향·0.5 로 보간 (원점 너머의 천체를 응시)
    const t = store.lookAtTarget;
    if (t) {
      const [x, y, z] = horizontalToScenePos(
        { altitudeRad: t.altitudeRad, azimuthRad: t.azimuthRad },
        1,
      );
      tmp.set(-x * 0.5, -y * 0.5, -z * 0.5);
      camera.position.lerp(tmp, 0.16);
      if (camera.position.distanceTo(tmp) < 0.004) store.clearLookAt();
    }
  });
  return null;
}

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
      <PostFX />
      <Terrain />
      <CameraSync />
      <ambientLight intensity={0.3} />
      {/* 1인칭 둘러보기: 카메라를 원점 근처에 고정하고 회전만 — §6.1
          damping 비활성: CameraSync의 외부 카메라 이동("천체 보기")과 충돌 방지 */}
      <OrbitControls
        makeDefault
        enableZoom={false}
        enablePan={false}
        enableDamping={false}
        target={[0, 0, 0]}
        rotateSpeed={-0.4}
      />
    </>
  );
}
