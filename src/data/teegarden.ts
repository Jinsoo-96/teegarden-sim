// src/data/teegarden.ts
// 출처: Dreizler+2024 (A&A 684 A117), Marfil+2021, Shan+2024, Fuhrmeister+2025
// 단위계: 거리 AU, 시간 day, 질량 Msun (G = 4π²·AU³/(yr²·Msun) 사용)

export const STAR = {
  name: "Teegarden's Star",
  spectralType: "M7.0V",
  massMsun: 0.097,          // ±0.010 [관측]
  radiusRsun: 0.120,        // ±0.012 [관측] = 83,480 km
  teffK: 3034,              // ±45 [관측]
  luminosityLsun: 7.22e-4,  // [관측]
  rotationPeriodDays: 97.56,// [관측]
  ageGyr: 8,                // 하한 [관측]
  distancePc: 3.831,        // [관측]
  // 렌더링용
  colorSRGB: "#FFBA70",     // 3034K 흑체 정규화 [유도]
  limbDarkening: { a: 0.9, b: -0.2 }, // 2차식 근사 [가정: M왜성 가시광 전형값]
  flare: {                  // Fuhrmeister+2025 기반
    ratePerDay: 0.026,      // ~2.6회/100일 (대형 플레어, 10^31–32 erg급) [관측]
    energyRangeErg: [1e31, 1.3e32],
    durationSec: [130, 600],
    colorTempK: 10000,      // 플레어 플라즈마 8,000–15,000 K [관측]
  },
} as const;

export interface PlanetData {
  name: string;
  periodDays: number;       // [관측]
  semiMajorAxisAU: number;  // [관측]
  eccentricity: number;     // b만 관측, c/d는 가정
  mSinIEarth: number;       // [관측] 최소질량
  assumedRadiusEarth: number; // [가정] 암석질 질량-반지름 관계
  tidallyLocked: boolean;   // [유도] 고정시간 << 나이
  insolationSE: number;     // [유도]
  teqK_A03: number;         // [유도] albedo 0.3
  meanLongitudeAtEpochDeg: number; // [가정] 임의 epoch 위상 — RV 위상 데이터로 갱신 가능
}

export const EPOCH_JD = 2460000.0; // 기준 epoch (2023-02-24) [가정]

export const PLANETS: PlanetData[] = [
  { name: "Teegarden b", periodDays: 4.90634, semiMajorAxisAU: 0.0259,
    eccentricity: 0.03, mSinIEarth: 1.16, assumedRadiusEarth: 1.02,
    tidallyLocked: true, insolationSE: 1.076, teqK_A03: 260,
    meanLongitudeAtEpochDeg: 0 },
  { name: "Teegarden c", periodDays: 11.416, semiMajorAxisAU: 0.0455,
    eccentricity: 0.0,  mSinIEarth: 1.05, assumedRadiusEarth: 1.00,
    tidallyLocked: true, insolationSE: 0.349, teqK_A03: 196,
    meanLongitudeAtEpochDeg: 137 },
  { name: "Teegarden d", periodDays: 26.13, semiMajorAxisAU: 0.0791,
    eccentricity: 0.0,  mSinIEarth: 0.82, assumedRadiusEarth: 0.95,
    tidallyLocked: true, insolationSE: 0.115, teqK_A03: 149,
    meanLongitudeAtEpochDeg: 245 },
];

// 미확정 후보 (토글 가능, 기본 OFF)
export const CANDIDATE_E = { name: "candidate (172d signal)",
  periodDays: 172, semiMajorAxisAU: 0.27, confirmed: false } as const;

// 시민 시간계 (§5)
export const CIVIC_TIME = {
  orbitHours: 4.90634 * 24,        // 117.75 h = 1 티가든 주(week)
  civicDaysPerOrbit: 5,
  civicDayHours: 4.90634 * 24 / 5, // 23.55 h
  civicHourMinutes: 60,            // 시민일을 24"시"로 나누면 1시간 ≈ 58.9 지구분
} as const;

// 하늘 이벤트 (b 기준) [유도]
export const SKY_EVENTS = {
  cOppositionPeriodDays: 8.60,  // c가 가장 크고(15.2′) 밝아지는(−6.5등급) 주기
  dOppositionPeriodDays: 6.04,  // d 충 주기 (5.2′, −3.0등급)
  librationPeriodDays: 4.90634, // 항성의 수평선 승강 주기 (진폭 ±3.4°)
  sunFromTeegarden: { raHours: 14.883, decDeg: -16.88, vMag: 2.75, constellation: "Libra" },
} as const;

// --- 이하 스펙 §2 코드블록 외 추가 상수 (M1-3, CLAUDE.md 불변 규칙 1) ---
// 단위 환산: 렌더 시 반경을 AU로 변환하기 위함
export const UNITS = {
  kmPerAU: 1.495978707e8, // 표준 천문단위 [정의]
  starRadiusKm: 83480,    // R★ = 0.120 R☉ = 83,480 km [관측, 스펙 §1.1]
  earthRadiusKm: 6371,    // R⊕ 표준값 [정의]
} as const;
