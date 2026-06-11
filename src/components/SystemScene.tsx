// System View — 스펙 §7.2 컴포넌트 트리 / §7.3 스케일 전략
// 거리 = 실척(AU 좌표), 천체 반경만 과장 배율 + True scale 토글
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import { useControls } from "leva";
import type { Group } from "three";
import {
  CANDIDATE_E,
  EPOCH_JD,
  PLANETS,
  STAR,
  UNITS,
  type PlanetData,
} from "../data/teegarden";
import { propagate } from "../sim/kepler";
import { useSettingsStore } from "../state/settingsStore";
import { useTimeStore } from "../state/timeStore";
import PostFX from "./PostFX";
import { planetColor } from "./planetColors";

// 미확정 후보행성(172d) — 토글 시에만 표시, 원궤도 가정 [관측: 신호만 확인됨]
const CANDIDATE_AS_PLANET: PlanetData = {
  name: CANDIDATE_E.name,
  periodDays: CANDIDATE_E.periodDays,
  semiMajorAxisAU: CANDIDATE_E.semiMajorAxisAU,
  eccentricity: 0,
  mSinIEarth: 0,
  assumedRadiusEarth: 1,
  tidallyLocked: false,
  insolationSE: 0,
  teqK_A03: 0,
  meanLongitudeAtEpochDeg: 0,
};

const STAR_RADIUS_AU = UNITS.starRadiusKm / UNITS.kmPerAU; // ≈ 5.58e-4 (스펙 §7.3의 0.00056)
const EARTH_RADIUS_AU = UNITS.earthRadiusKm / UNITS.kmPerAU;
// 반경 과장 배율 — 항성 ×8은 스펙 예시 그대로, 행성은 ×80 채택 (스펙 예시 ×400은
// 행성(0.017 AU)이 과장 항성(0.0045 AU)보다 커져 부적절 → DECISIONS 기록)
const STAR_SCALE = 8;
const PLANET_SCALE = 80;

function Planet({
  planet,
  trueScale,
  dim,
}: {
  planet: PlanetData;
  trueScale: boolean;
  dim?: boolean;
}) {
  const ref = useRef<Group>(null);
  const showLabels = useSettingsStore((s) => s.showLabels);
  const radius =
    planet.assumedRadiusEarth * EARTH_RADIUS_AU * (trueScale ? 1 : PLANET_SCALE);
  useFrame(() => {
    if (!ref.current) return;
    const { posAU } = propagate(planet, useTimeStore.getState().simTimeJD);
    ref.current.position.set(posAU[0], posAU[1], posAU[2]);
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[radius, 32, 16]} />
        {/* 행성 간 크기 비율은 assumedRadiusEarth 그대로, 색은 추정 팔레트 [가정] */}
        <meshStandardMaterial
          color={dim ? "#5a6172" : planetColor(planet.name)}
          roughness={1}
        />
      </mesh>
      {showLabels && (
        <Html style={{ pointerEvents: "none" }} center distanceFactor={0.08}>
          <div
            style={{
              color: dim ? "#8a8f99" : "#d8d4cd",
              fontFamily: "sans-serif",
              fontSize: 11,
              whiteSpace: "nowrap",
              textShadow: "0 0 4px #000",
              transform: "translateY(-16px)",
            }}
          >
            {planet.name}
            {planet.mSinIEarth > 0 && ` · ${planet.mSinIEarth} M⊕ [관측]`}
          </div>
        </Html>
      )}
    </group>
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
  const showCandidateE = useSettingsStore((s) => s.showCandidateE);
  const { trueScale } = useControls({
    trueScale: { value: false, label: "True scale" },
  });
  // rAF 델타 적분 — 스토어가 paused/timeScale 처리 (§3.2)
  useFrame((_, delta) => {
    useTimeStore.getState().advance(delta * 1000);
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
          <Planet planet={p} trueScale={trueScale} />
        </group>
      ))}
      {showCandidateE && (
        <group>
          <OrbitLine planet={CANDIDATE_AS_PLANET} />
          <Planet planet={CANDIDATE_AS_PLANET} trueScale={trueScale} dim />
        </group>
      )}
      <OrbitControls makeDefault minDistance={0.002} maxDistance={1} />
      <PostFX />
    </>
  );
}
