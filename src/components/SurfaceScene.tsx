// Surface View — 스펙 §6.1 관측자 / §7.3 각도 좌표 투영
// M3-2: 거대 항성 셰이더 디스크(GiantStar). 별 배경은 M3-3, 대기 산란은 M5-1
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import GiantStar from "./GiantStar";
import CelestialSphere from "./CelestialSphere";
import { useTimeStore } from "../state/timeStore";

export const DOME_R = 100; // 천구돔 반경 (씬 단위 — 모든 천체는 각도로만 배치, §7.3)

export default function SurfaceScene() {
  // 시간 적분 (System/Surface 중 마운트된 쪽이 담당)
  useFrame((_, delta) => {
    useTimeStore.getState().advance(delta * 1000);
  });

  return (
    <>
      {/* 임시 하늘색 — M5-1 산란 셰이더가 교체 (영구 박명의 암청회) */}
      <color attach="background" args={["#10141f"]} />
      <CelestialSphere />
      <GiantStar />
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
