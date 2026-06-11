// starSurface 셰이더 — 스펙 §6.2/§7.4
// 평면 디스크에 항성 원반을 그린다: 좌표 r=1이 림(limb), 1<r≤1.3은 채층 글로우
// I(μ) = 1 − a(1−μ) − b(1−μ)²  (2차 limb darkening, a/b는 STAR.limbDarkening 상수)
// 쌀알무늬(granulation) = 표면 고정 fbm 노이즈, 흑점 3개 = 몸체 고정 방향 (자전 uRotPhase 반영)

export const STAR_SURFACE_VERT = /* glsl */ `
varying vec2 vP;
void main() {
  vP = position.xy; // 평면 지오메트리 2.6×2.6 → vP ∈ [−1.3, 1.3]
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const STAR_SURFACE_FRAG = /* glsl */ `
precision highp float;
varying vec2 vP;
uniform vec3 uColor;      // 3,034K 흑체색 #FFBA70
uniform float uLimbA;     // 0.9 [가정]
uniform float uLimbB;     // -0.2 [가정]
uniform float uRotPhase;  // 자전 위상 [rad] — 주기 97.56일
uniform float uTime;      // 시뮬레이션 경과 [day] — granulation 진화
uniform float uFlare;     // 플레어 강도 0–1 (§6.2)
uniform vec3 uFlareDir;   // 플레어 핫스팟 방향 (뷰 좌표 — 지속 수 분이라 자전 무시 가능)

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * vnoise(p);
    p *= 2.07;
    a *= 0.5;
  }
  return v;
}

// 몸체 고정 흑점: dot(표면벡터, 흑점방향) > cos(반경)이면 어둡게 (부드러운 경계)
float spotMask(vec3 vb, vec3 s, float cosR) {
  return smoothstep(cosR - 0.012, cosR + 0.015, dot(vb, normalize(s)));
}

void main() {
  float r2 = dot(vP, vP);
  float r = sqrt(r2);

  if (r > 1.3) discard;

  if (r > 1.0) {
    // 채층/홍염 림 — 옅은 적색 글로우 (Hα), 림 밖으로 지수 감쇠
    float glow = exp(-(r - 1.0) * 9.0);
    vec3 rim = mix(uColor, vec3(1.0, 0.42, 0.28), 0.55);
    gl_FragColor = vec4(rim * glow * 0.85, glow);
    return;
  }

  float mu = sqrt(1.0 - r2);
  float omu = 1.0 - mu;
  float I = 1.0 - uLimbA * omu - uLimbB * omu * omu;

  // 정사영 → 표면(뷰 기준) 벡터, 자전 위상으로 몸체 좌표 복원
  vec3 f = vec3(vP, mu);
  float c = cos(uRotPhase);
  float s = sin(uRotPhase);
  vec3 vb = vec3(c * f.x + s * f.z, f.y, -s * f.x + c * f.z);

  // 쌀알무늬: 몸체 고정 좌표 노이즈 (이음매 없음) + 느린 시간 진화
  float g = fbm(vec2(vb.x * 9.0 + vb.z * 3.3, vb.y * 9.0) + vec2(uTime * 0.07, uTime * 0.041));
  I *= 0.90 + 0.20 * g;

  // 흑점 3개 [가정: 스펙 2–4개 범위] — 몸체 고정, 자전(97.56일)으로 매우 느리게 이동
  float sp = 0.0;
  sp = max(sp, 0.55 * spotMask(vb, vec3(0.45, 0.30, 0.84), cos(0.10)));
  sp = max(sp, 0.45 * spotMask(vb, vec3(-0.60, -0.12, 0.79), cos(0.065)));
  sp = max(sp, 0.50 * spotMask(vb, vec3(0.95, 0.05, -0.30), cos(0.08)));
  I *= 1.0 - sp;

  // 플레어 (§6.2): 디스크 전체 증광 + 국소 백청색(10,000K) 핫스팟
  I *= 1.0 + 0.35 * uFlare;
  vec3 col = uColor * I + vec3(0.25, 0.06, 0.03) * smoothstep(0.92, 1.0, r);
  if (uFlare > 0.001) {
    float hs = smoothstep(cos(0.22), cos(0.05), dot(f, normalize(uFlareDir)));
    col += vec3(0.82, 0.88, 1.0) * hs * uFlare * 1.6;
  }
  // HDR 부스트 (§7.5): 블룸 임계(1.0) 초과시키되 ACES 롤오프가 디스크 질감 보존
  gl_FragColor = vec4(col * 1.6, 1.0);
}
`;
