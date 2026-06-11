// 지형·연출 — 스펙 §6.6 (M6-1)
// 저폴리 지평선 능선 + 도시 인공조명(§5.1: 청색강화 조명 인프라) + 야간면(+x 동쪽) 구름·번개
import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferGeometry,
  CylinderGeometry,
  Float32BufferAttribute,
  type Mesh,
} from "three";
import { STARFIELD_FRAG, STARFIELD_VERT } from "../shaders/starfield";

const RIDGE_R = 80;

// 시드 고정 의사난수 (능선·도시 배치 재현성)
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 능선: 원기둥 윗단 정점을 무작위 높이로 변위한 저폴리 실루엣
function useRidgeGeometry() {
  return useMemo(() => {
    const rand = mulberry32(42);
    const geo = new CylinderGeometry(RIDGE_R, RIDGE_R, 1, 160, 1, true);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      if (pos.getY(i) > 0) {
        pos.setY(i, 0.4 + rand() * 2.6); // 능선 높이 0.4–3.0 (수평선 위 ~0.3–2°)
      } else {
        pos.setY(i, -0.5);
      }
    }
    geo.computeVertexNormals();
    return geo;
  }, []);
}

// 도시 불빛: 관측자 주변 점광 클러스터 — 청색강화(§5.1) 위주 + 일부 온백색
function useCityLights() {
  return useMemo(() => {
    const rand = mulberry32(7);
    const n = 90;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const size = new Float32Array(n);
    const alpha = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const ang = rand() * Math.PI * 2;
      const r = 6 + rand() * 42;
      pos[i * 3] = Math.cos(ang) * r;
      pos[i * 3 + 1] = 0.06;
      pos[i * 3 + 2] = Math.sin(ang) * r;
      const blue = rand() < 0.75; // §5.1: 청색강화 조명이 다수
      col[i * 3] = blue ? 0.78 : 1.0;
      col[i * 3 + 1] = blue ? 0.86 : 0.83;
      col[i * 3 + 2] = blue ? 1.0 : 0.6;
      size[i] = 1.4 + rand() * 2.2;
      alpha[i] = 0.5 + rand() * 0.5;
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(pos, 3));
    geo.setAttribute("aColor", new Float32BufferAttribute(col, 3));
    geo.setAttribute("aSize", new Float32BufferAttribute(size, 1));
    geo.setAttribute("aAlpha", new Float32BufferAttribute(alpha, 1));
    return geo;
  }, []);
}

// 야간면(동, +x) 구름 + 무작위 번개 플래시 (GCM: 강수는 야간면 집중 — §6.1/§6.6)
function NightClouds() {
  const flash = useRef<Mesh>(null);
  const timer = useRef({ next: 3, until: 0 });
  useFrame(({ clock }) => {
    if (!flash.current) return;
    const t = clock.elapsedTime;
    const tm = timer.current;
    if (t > tm.next) {
      tm.until = t + 0.12;
      tm.next = t + 4 + Math.random() * 9;
    }
    const mat = flash.current.material as { opacity: number };
    mat.opacity = t < tm.until ? 0.75 : 0;
  });
  return (
    <group>
      {[-18, 4, 24].map((z, i) => (
        <mesh key={z} position={[64, 3.5 + i * 0.8, z]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[26, 6]} />
          <meshBasicMaterial color="#0b0e16" transparent opacity={0.85} depthWrite={false} />
        </mesh>
      ))}
      {/* 번개: 구름 뒤 백청색 플래시 */}
      <mesh ref={flash} position={[66, 3, 4]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[20, 5]} />
        <meshBasicMaterial color="#dfe8ff" transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function Terrain() {
  const ridge = useRidgeGeometry();
  const city = useCityLights();
  const [lightsOn] = useState(true);
  return (
    <group>
      {/* 지면 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
        <circleGeometry args={[RIDGE_R + 2, 64]} />
        <meshBasicMaterial color="#0b0d12" />
      </mesh>
      {/* 저폴리 지평선 능선 실루엣 */}
      <mesh geometry={ridge} position={[0, 0, 0]}>
        <meshBasicMaterial color="#05060a" side={2} />
      </mesh>
      {/* 도시 인공조명 — 시민 거주의 근거 연출 */}
      {lightsOn && (
        <points geometry={city} renderOrder={3}>
          <shaderMaterial
            vertexShader={STARFIELD_VERT}
            fragmentShader={STARFIELD_FRAG}
            transparent
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </points>
      )}
      <NightClouds />
    </group>
  );
}
