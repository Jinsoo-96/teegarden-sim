// skyScattering 셰이더 — 스펙 §6.5/§7.4: M왜성 전용 대기 산란
// ① 3,034K 플랑크 분포를 380–780nm에서 uSamples개 샘플
// ② 파장별 Rayleigh(λ⁻⁴) + Mie(HG) 단일산란 근사
// ③ CIE 색매칭 가우시안 근사 → XYZ → 선형 sRGB → 지수 톤매핑
// 기존 Preetham/Hosek은 태양(5,778K) 전제라 사용 불가 — 입력 스펙트럼부터 다름
export const SKY_SCATTERING_VERT = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position; // 원점 중심 구 → 로컬 위치 = 시선 방향
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const SKY_SCATTERING_FRAG = /* glsl */ `
precision highp float;
varying vec3 vDir;
uniform vec3 uSunDir;    // 항성 방향 (씬 좌표, 정규화)
uniform float uTeffK;    // 3034 [관측]
uniform float uDensity;  // 대기 프리셋: 1bar=1.0 / 0.1bar=0.1 / 무대기=0.0 [가정]
uniform int uSamples;    // 파장 샘플 수 4/8/16 (quality)
uniform float uExposure;

// 플랑크 분포 (정규화 무관 — 상대 분포만 사용). λ: nm
float planck(float lambda, float T) {
  float c2 = 1.4388e7; // hc/k [nm·K]
  float l5 = pow(lambda / 560.0, 5.0); // 스케일 안정화를 위한 상대화
  return 1.0 / (l5 * (exp(c2 / (lambda * T)) - 1.0));
}

// CIE 1931 색매칭 함수 가우시안 근사 (Wyman 단순화판)
vec3 cieXYZ(float l) {
  float x = 1.065 * exp(-0.5 * pow((l - 595.8) / 33.33, 2.0))
          + 0.366 * exp(-0.5 * pow((l - 446.8) / 19.44, 2.0));
  float y = 1.011 * exp(-0.5 * pow((l - 558.0) / 46.0, 2.0));
  float z = 1.839 * exp(-0.5 * pow((l - 449.8) / 22.6, 2.0));
  return vec3(x, y, z);
}

void main() {
  vec3 v = normalize(vDir);
  vec3 s = normalize(uSunDir);
  float cosT = dot(v, s);

  // 위상함수: Rayleigh (3/16π)(1+cos²θ) 비례 + Mie Henyey-Greenstein(g=0.76)
  float pR = 0.7 * (1.0 + cosT * cosT);
  float g = 0.76;
  float pM = (1.0 - g * g) / pow(1.0 + g * g - 2.0 * g * cosT, 1.5);

  // 시선 상대 광학경로 (천정 1, 수평선 ~25)
  float mv = 1.0 / max(v.y, 0.04);
  // 입사광 경로 — 항성 고도가 낮을수록/음수일수록 급증 (박명·소광)
  float sunH = s.y;
  float ms = sunH > 0.0 ? 1.0 / max(sunH, 0.03) : 33.0 * (1.0 + 30.0 * -sunH);

  vec3 XYZ = vec3(0.0);
  for (int i = 0; i < 16; i++) {
    if (i >= uSamples) break;
    float fi = (float(i) + 0.5) / float(uSamples);
    float lambda = mix(380.0, 780.0, fi);
    float B = planck(lambda, uTeffK);
    // 산란계수 (상대값): Rayleigh λ⁻⁴, Mie는 파장 의존 미약
    float bR = uDensity * 0.30 * pow(550.0 / lambda, 4.0);
    float bM = uDensity * 0.02;
    // 입사 투과율 × 시선 in-scatter (단일산란)
    float Ts = exp(-(bR + bM) * ms * 0.20);
    float inten = B * Ts * ((1.0 - exp(-bR * mv * 0.25)) * pR + (1.0 - exp(-bM * mv * 0.25)) * pM);
    XYZ += inten * cieXYZ(lambda);
  }
  XYZ /= float(uSamples);

  // XYZ → 선형 sRGB
  vec3 rgb = vec3(
    3.2406 * XYZ.x - 1.5372 * XYZ.y - 0.4986 * XYZ.z,
    -0.9689 * XYZ.x + 1.8758 * XYZ.y + 0.0415 * XYZ.z,
    0.0557 * XYZ.x - 0.2040 * XYZ.y + 1.0570 * XYZ.z
  );
  rgb = max(rgb, 0.0);
  // 지수 톤매핑 (ACES 전체 파이프라인은 M5-3)
  rgb = 1.0 - exp(-rgb * uExposure);
  gl_FragColor = vec4(rgb, 1.0);
}
`;
