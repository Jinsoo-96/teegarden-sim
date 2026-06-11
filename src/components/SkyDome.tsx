// 대기 산란 스카이돔 — 스펙 §6.5 (M5-1)
// BackSide 구에 skyScattering 셰이더, 항성 방향 uniform은 GiantStar와 동일 파이프라인
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { BackSide, Vector3, type ShaderMaterial } from "three";
import { PLANETS, STAR } from "../data/teegarden";
import {
  horizontalToScenePos,
  inertialDirToHorizontal,
  starDirectionFromPlanet,
} from "../sim/skyCoords";
import { SKY_SCATTERING_FRAG, SKY_SCATTERING_VERT } from "../shaders/skyScattering";
import { flareIntensity, useFlareStore } from "../state/flareStore";
import { useSettingsStore } from "../state/settingsStore";
import { useTimeStore } from "../state/timeStore";
import { DOME_R } from "./SurfaceScene";

const b = PLANETS[0];

// 대기 프리셋 3종 (§6.5) — 밀도 배율 [가정]
const PRESETS = {
  "Earth-like 1bar": 1.0,
  "얇은 대기 0.1bar": 0.1,
  "대기 없음": 0.0,
} as const;

export default function SkyDome() {
  const mat = useRef<ShaderMaterial>(null);
  const sunVec = useMemo(() => new Vector3(), []);
  const { preset, quality } = useControls("대기 (§6.5)", {
    preset: { value: "Earth-like 1bar", options: Object.keys(PRESETS), label: "프리셋" },
    quality: { value: 8, options: [4, 8, 16], label: "파장 샘플" },
  });

  const uniforms = useMemo(
    () => ({
      uSunDir: { value: new Vector3(0, 0, -1) },
      uTeffK: { value: STAR.teffK },
      uDensity: { value: 1.0 },
      uSamples: { value: 8 },
      uExposure: { value: 2.2 },
      uFlare: { value: 0 },
      uFlareTempK: { value: STAR.flare.colorTempK },
    }),
    [],
  );

  useFrame(() => {
    if (!mat.current) return;
    const jd = useTimeStore.getState().simTimeJD;
    const obs = useSettingsStore.getState().observer;
    const h = inertialDirToHorizontal(starDirectionFromPlanet(b, jd), b, jd, obs);
    const [x, y, z] = horizontalToScenePos(h, 1);
    mat.current.uniforms.uSunDir.value = sunVec.set(x, y, z);
    mat.current.uniforms.uDensity.value = PRESETS[preset as keyof typeof PRESETS];
    mat.current.uniforms.uSamples.value = quality;
    mat.current.uniforms.uFlare.value = flareIntensity(useFlareStore.getState().active, jd);
  });

  return (
    // renderOrder -1: 가장 먼저 그려 별/행성/항성이 그 위에 얹힘
    <mesh renderOrder={-1}>
      <sphereGeometry args={[DOME_R * 1.04, 48, 32]} />
      <shaderMaterial
        ref={mat}
        side={BackSide}
        depthWrite={false}
        vertexShader={SKY_SCATTERING_VERT}
        fragmentShader={SKY_SCATTERING_FRAG}
        uniforms={uniforms}
      />
    </mesh>
  );
}
