// System View — 스펙 §7.2 컴포넌트 트리 / §7.3 스케일 전략
// 거리 = 실척(AU 좌표), 천체 반경만 과장 배율 + True scale 토글
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { useControls } from "leva";
import type { Mesh } from "three";
import { EPOCH_JD, PLANETS, STAR, UNITS, type PlanetData } from "../data/teegarden";
import { propagate } from "../sim/kepler";

const STAR_RADIUS_AU = UNITS.starRadiusKm / UNITS.kmPerAU; // ≈ 5.58e-4 (스펙 §7.3의 0.00056)
const EARTH_RADIUS_AU = UNITS.earthRadiusKm / UNITS.kmPerAU;
// 반경 과장 배율 — 항성 ×8은 스펙 예시 그대로, 행성은 ×80 채택 (스펙 예시 ×400은
// 행성(0.017 AU)이 과장 항성(0.0045 AU)보다 커져 부적절 → DECISIONS 기록)
const STAR_SCALE = 8;
const PLANET_SCALE = 80;

interface SimClock {
  jd: number;
}

function Planet({
  planet,
  clock,
  trueScale,
}: {
  planet: PlanetData;
  clock: SimClock;
  trueScale: boolean;
}) {
  const ref = useRef<Mesh>(null);
  const radius =
    planet.assumedRadiusEarth * EARTH_RADIUS_AU * (trueScale ? 1 : PLANET_SCALE);
  useFrame(() => {
    if (!ref.current) return;
    const { posAU } = propagate(planet, clock.jd);
    ref.current.position.set(posAU[0], posAU[1], posAU[2]);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[radius, 32, 16]} />
      <meshStandardMaterial color="#9aa3b0" roughness={1} />
    </mesh>
  );
}

function OrbitLine({ planet }: { planet: PlanetData }) {
  // 케플러 전파로 1주기 샘플링 → e=0.03의 미세 타원도 정확히 반영
  const points = useMemo(() => {
    const N = 256;
    const pts: [number, number, number][] = [];
    for (let k = 0; k <= N; k++) {
      pts.push(propagate(planet, EPOCH_JD + (k / N) * planet.periodDays).posAU);
    }
    return pts;
  }, [planet]);
  return <Line points={points} color="#3d4452" lineWidth={1} />;
}

export default function SystemScene() {
  const clock = useRef<SimClock>({ jd: EPOCH_JD }).current;
  const { daysPerSec, trueScale } = useControls({
    daysPerSec: { value: 1, min: 0, max: 10, label: "일/초 (M2-1에서 교체)" },
    trueScale: { value: false, label: "True scale" },
  });
  useFrame((_, delta) => {
    clock.jd += delta * daysPerSec;
  });

  const starRadius = STAR_RADIUS_AU * (trueScale ? 1 : STAR_SCALE);

  return (
    <>
      <color attach="background" args={["#0a0c12"]} />
      {/* 항성 자체 발광 + 행성 라이팅용 점광원 (decay 0: AU 스케일에서 감쇠 무시) */}
      <ambientLight intensity={0.08} />
      <pointLight position={[0, 0, 0]} intensity={2} decay={0} color={STAR.colorSRGB} />
      <mesh>
        <sphereGeometry args={[starRadius, 48, 24]} />
        <meshBasicMaterial color={STAR.colorSRGB} />
      </mesh>
      {PLANETS.map((p) => (
        <group key={p.name}>
          <OrbitLine planet={p} />
          <Planet planet={p} clock={clock} trueScale={trueScale} />
        </group>
      ))}
      <OrbitControls makeDefault minDistance={0.002} maxDistance={1} />
    </>
  );
}
