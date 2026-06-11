// 배경 천구 — 스펙 §6.4: HYG 별필드(Points) + 태양 마커(천칭자리 V2.75) + 일주운동
// 별 위치는 관성계 고정 → 그룹 회전(관측자 지평 기저)으로 4.90634일 주기 일주운동 재현
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useControls } from "leva";
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  Matrix4,
  Vector3,
  type Group,
} from "three";
import { PLANETS, SKY_EVENTS } from "../data/teegarden";
import { observerFrame, raDecToInertialDir } from "../sim/skyCoords";
import { STARFIELD_FRAG, STARFIELD_VERT } from "../shaders/starfield";
import { useSettingsStore } from "../state/settingsStore";
import { useTimeStore } from "../state/timeStore";
import { DOME_R } from "./SurfaceScene";

const b = PLANETS[0];
type StarRow = [number, number, number, number]; // [raHours, decDeg, mag, ciBV]

// B−V 색지수 → sRGB 근사 (Ballesteros 온도식 + 간이 흑체 팔레트)
function bvToRGB(bv: number): [number, number, number] {
  const t = 4600 * (1 / (0.92 * bv + 1.7) + 1 / (0.92 * bv + 0.62)); // K
  const x = Math.min(1, Math.max(0, (t - 2000) / 10000));
  // 저온(적) → 고온(청백) 보간
  const r = x < 0.6 ? 1.0 : 1.0 - (x - 0.6) * 0.45;
  const g = 0.55 + 0.45 * Math.min(1, x * 1.6);
  const bl = Math.min(1, 0.35 + x * 1.3);
  return [r, g, bl];
}

export default function CelestialSphere() {
  const group = useRef<Group>(null);
  const [stars, setStars] = useState<StarRow[] | null>(null);
  const { sunLabel } = useControls({ sunLabel: { value: true, label: "태양 라벨" } });

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}stars.json`)
      .then((r) => r.json())
      .then(setStars)
      .catch((e) => console.error("stars.json 로드 실패:", e));
  }, []);

  const geometry = useMemo(() => {
    if (!stars) return null;
    const n = stars.length;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const size = new Float32Array(n);
    const alpha = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const [ra, dec, mag, ci] = stars[i];
      const d = raDecToInertialDir(ra, dec);
      pos[i * 3] = d[0] * DOME_R;
      pos[i * 3 + 1] = d[1] * DOME_R;
      pos[i * 3 + 2] = d[2] * DOME_R;
      const [r, g, bl] = bvToRGB(ci);
      col[i * 3] = r;
      col[i * 3 + 1] = g;
      col[i * 3 + 2] = bl;
      // 등급 → 크기/밝기 (시각 보정 맵핑 — 광학 캘리브레이션은 M5-3)
      size[i] = Math.max(1.1, 1.2 + (6.5 - mag) * 0.55);
      alpha[i] = Math.min(1, Math.max(0.18, 0.22 + (6.5 - mag) * 0.13));
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(pos, 3));
    geo.setAttribute("aColor", new Float32BufferAttribute(col, 3));
    geo.setAttribute("aSize", new Float32BufferAttribute(size, 1));
    geo.setAttribute("aAlpha", new Float32BufferAttribute(alpha, 1));
    return geo;
  }, [stars]);

  // 태양 마커 위치 (관성계 고정 — 그룹 회전이 일주운동 처리)
  const sunPos = useMemo(() => {
    const s = SKY_EVENTS.sunFromTeegarden;
    const d = raDecToInertialDir(s.raHours, s.decDeg);
    return new Vector3(d[0], d[1], d[2]).multiplyScalar(DOME_R * 0.995);
  }, []);

  // 태양은 12.5광년 거리의 '별' — 점광원으로, 다른 별과 동일한 등급→크기 규칙 (M8-1)
  const sunGeometry = useMemo(() => {
    const s = SKY_EVENTS.sunFromTeegarden;
    const geo = new BufferGeometry();
    geo.setAttribute(
      "position",
      new Float32BufferAttribute([sunPos.x, sunPos.y, sunPos.z], 3),
    );
    geo.setAttribute("aColor", new Float32BufferAttribute([1.0, 0.96, 0.86], 3));
    geo.setAttribute(
      "aSize",
      new Float32BufferAttribute([Math.max(1.1, 1.2 + (6.5 - s.vMag) * 0.55)], 1),
    );
    geo.setAttribute("aAlpha", new Float32BufferAttribute([0.95], 1));
    return geo;
  }, [sunPos]);

  // 일주운동: 씬 = [east; up; −north] 행렬 × 관성계 방향
  const mat = useMemo(() => new Matrix4(), []);
  const vE = useMemo(() => new Vector3(), []);
  const vU = useMemo(() => new Vector3(), []);
  const vN = useMemo(() => new Vector3(), []);
  useFrame(() => {
    if (!group.current) return;
    const jd = useTimeStore.getState().simTimeJD;
    const obs = useSettingsStore.getState().observer;
    const f = observerFrame(b, jd, obs);
    vE.set(...f.east);
    vU.set(...f.up);
    vN.set(-f.north[0], -f.north[1], -f.north[2]);
    mat.makeBasis(vE, vU, vN).transpose(); // 열→행 전환: 원하는 변환은 행 기저
    group.current.setRotationFromMatrix(mat);
  });

  return (
    <group ref={group}>
      {geometry && (
        <points geometry={geometry} renderOrder={1}>
          <shaderMaterial
            vertexShader={STARFIELD_VERT}
            fragmentShader={STARFIELD_FRAG}
            transparent
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </points>
      )}
      {/* 태양 — "시민들이 고향을 가리키는 별" (천칭자리, V 2.75 [유도]) — 점광원 */}
      <points geometry={sunGeometry} renderOrder={1}>
        <shaderMaterial
          vertexShader={STARFIELD_VERT}
          fragmentShader={STARFIELD_FRAG}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
      {sunLabel && (
        <Html position={sunPos} style={{ pointerEvents: "none" }} center distanceFactor={60}>
          <div
            style={{
              color: "#fff4d6",
              fontFamily: "sans-serif",
              fontSize: "11px",
              whiteSpace: "nowrap",
              textShadow: "0 0 4px #000",
              transform: "translateY(-14px)",
            }}
          >
            ☉ 태양 (Sol) · V {SKY_EVENTS.sunFromTeegarden.vMag} · 천칭자리
          </div>
        </Html>
      )}
    </group>
  );
}
