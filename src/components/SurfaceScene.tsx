// Surface View 스캐폴드 — 스펙 §6.1 관측자 / §7.3 각도 좌표 투영
// M3-1: 천구돔 + 지면 + 항성 플레이스홀더 원반(정확한 고도/방위/각크기)
// 본격 렌더: M3-2(항성 셰이더), M3-3(별 배경), M5-1(대기 산란)
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { Mesh } from "three";
import { PLANETS, STAR } from "../data/teegarden";
import { starAngularRadiusRad } from "../sim/civicTime";
import {
  horizontalToScenePos,
  inertialDirToHorizontal,
  starDirectionFromPlanet,
} from "../sim/skyCoords";
import { useSettingsStore } from "../state/settingsStore";
import { useTimeStore } from "../state/timeStore";

const b = PLANETS[0];
export const DOME_R = 100; // 천구돔 반경 (씬 단위 — 모든 천체는 각도로만 배치, §7.3)

// 거대 항성 원반 플레이스홀더 — 각지름 2.47°를 돔 거리에서 정확히 재현
function GiantStarPlaceholder() {
  const ref = useRef<Mesh>(null);
  useFrame(() => {
    if (!ref.current) return;
    const jd = useTimeStore.getState().simTimeJD;
    const obs = useSettingsStore.getState().observer;
    const h = inertialDirToHorizontal(starDirectionFromPlanet(b, jd), b, jd, obs);
    const [x, y, z] = horizontalToScenePos(h, DOME_R * 0.98);
    ref.current.position.set(x, y, z);
    // 구 반지름 = 돔거리 × sin(각반지름) → 관측 각크기 보존
    const r = DOME_R * 0.98 * Math.sin(starAngularRadiusRad(jd));
    ref.current.scale.setScalar(r);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 48, 24]} />
      <meshBasicMaterial color={STAR.colorSRGB} />
    </mesh>
  );
}

export default function SurfaceScene() {
  // 시간 적분 (System/Surface 중 마운트된 쪽이 담당)
  useFrame((_, delta) => {
    useTimeStore.getState().advance(delta * 1000);
  });

  return (
    <>
      {/* 임시 하늘색 — M5-1 산란 셰이더가 교체 (영구 박명의 암청회) */}
      <color attach="background" args={["#10141f"]} />
      <GiantStarPlaceholder />
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
