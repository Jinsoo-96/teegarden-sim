// 거대 항성 디스크 — 스펙 §6.2 (M3-2)
// 위치/각크기는 천구좌표·칭동(§4)에서, 표면은 starSurface 셰이더가 그림
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, type Mesh, type ShaderMaterial } from "three";
import { EPOCH_JD, PLANETS, STAR } from "../data/teegarden";
import { starAngularRadiusRad } from "../sim/civicTime";
import {
  horizontalToScenePos,
  inertialDirToHorizontal,
  starDirectionFromPlanet,
} from "../sim/skyCoords";
import { STAR_SURFACE_FRAG, STAR_SURFACE_VERT } from "../shaders/starSurface";
import { useSettingsStore } from "../state/settingsStore";
import { useTimeStore } from "../state/timeStore";
import { DOME_R } from "./SurfaceScene";

const b = PLANETS[0];
const STAR_DIST = DOME_R * 0.98; // 돔 바로 안쪽

export default function GiantStar() {
  const mesh = useRef<Mesh>(null);
  const mat = useRef<ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uColor: { value: new Color(STAR.colorSRGB) },
      uLimbA: { value: STAR.limbDarkening.a },
      uLimbB: { value: STAR.limbDarkening.b },
      uRotPhase: { value: 0 },
      uTime: { value: 0 },
    }),
    [],
  );

  useFrame(({ camera }) => {
    if (!mesh.current || !mat.current) return;
    const jd = useTimeStore.getState().simTimeJD;
    const obs = useSettingsStore.getState().observer;
    // 고도 = 칭동값(§4), 방위 = 항성직하점 방향(서) — skyCoords가 보장
    const h = inertialDirToHorizontal(starDirectionFromPlanet(b, jd), b, jd, obs);
    const [x, y, z] = horizontalToScenePos(h, STAR_DIST);
    mesh.current.position.set(x, y, z);
    mesh.current.lookAt(camera.position); // 빌보드 — 디스크가 항상 관측자를 향함
    // 디스크 반경 = 거리 × sin(각반지름) → 각지름 2.47° 정확 재현 (§10 테스트 2)
    mesh.current.scale.setScalar(STAR_DIST * Math.sin(starAngularRadiusRad(jd)));
    mat.current.uniforms.uRotPhase.value =
      (((jd - EPOCH_JD) / STAR.rotationPeriodDays) % 1) * 2 * Math.PI;
    mat.current.uniforms.uTime.value = jd - EPOCH_JD;
  });

  return (
    // renderOrder 2: 배경 별(1) 위에 그려져 엄폐를 표현 (§6.3 엄폐 연출은 M4-2)
    <mesh ref={mesh} renderOrder={2}>
      {/* 2.6×2.6 평면: 셰이더 좌표 r=1이 림, 1.3까지 채층 글로우 */}
      <planeGeometry args={[2.6, 2.6]} />
      <shaderMaterial
        ref={mat}
        vertexShader={STAR_SURFACE_VERT}
        fragmentShader={STAR_SURFACE_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
