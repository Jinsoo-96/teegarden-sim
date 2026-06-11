// 시민 시간계 — 스펙 §5.2: 1 공전 = 1 주(week) = 5 시민일, 주 시작 앵커 = 칭동 일출
// 칭동 일출 = 저녁 터미네이터에서 항성 고도가 +각반지름을 상향 통과(완전히 떠오름)하는 순간
import { CIVIC_TIME, EPOCH_JD, PLANETS, UNITS } from "../data/teegarden";
import { librationOffsetRad, propagate } from "./kepler";

const b = PLANETS[0];
const P = b.periodDays;

// 항성 각반지름 [rad] — 거리 r(t)에 따라 미세 변동 (평균 ≈1.235°, §10 테스트 2는 M3-2)
export function starAngularRadiusRad(jd: number): number {
  const r = propagate(b, jd).radiusAU;
  return Math.asin(UNITS.starRadiusKm / UNITS.kmPerAU / r);
}

// 칭동 고도 [rad] — 저녁 터미네이터(경도 +90°) 적도 관측자의 항성 중심 고도
// 부호 규약: 고도 = +librationOffsetRad (DECISIONS 기록)
export function librationAltitudeRad(jd: number): number {
  return librationOffsetRad(b, jd);
}

// fromJd 이후 첫 칭동 일출 시각 (상향 교차 감지 + 이분법)
export function findLibrationSunrise(fromJd: number): number {
  const f = (jd: number) => librationAltitudeRad(jd) - starAngularRadiusRad(jd);
  const step = P / 200;
  let tPrev = fromJd;
  let fPrev = f(tPrev);
  for (let t = fromJd + step; t < fromJd + 2 * P; t += step) {
    const fCur = f(t);
    if (fPrev < 0 && fCur >= 0) {
      let lo = tPrev;
      let hi = t;
      for (let i = 0; i < 60; i++) {
        const mid = (lo + hi) / 2;
        if (f(mid) < 0) lo = mid;
        else hi = mid;
      }
      return (lo + hi) / 2;
    }
    tPrev = t;
    fPrev = fCur;
  }
  throw new Error("2주기 내 칭동 일출 없음 — 칭동 진폭/각반지름 확인 필요");
}

// 주 0의 시작 = epoch 직후 첫 칭동 일출 (모듈 로드 시 1회 계산, 이후 매주 정확히 +P)
export const WEEK_ZERO_JD = findLibrationSunrise(EPOCH_JD);

export interface CivicDateTime {
  week: number; // 0부터 (WEEK_ZERO_JD 이전은 음수)
  civicDay: number; // 1–5 (1일차 아침 = 칭동 일출)
  hour: number; // 0–23 시민시 (1 시민시 = 58.9 지구분)
  minute: number; // 0–59
  second: number; // 0–59
  dayFraction: number; // 시민일 내 진행 0–1
  weekFraction: number; // 주 내 진행 0–1
}

export function jdToCivic(jd: number): CivicDateTime {
  const t = (jd - WEEK_ZERO_JD) / P;
  const week = Math.floor(t);
  const weekFraction = t - week;
  const dayPos = weekFraction * CIVIC_TIME.civicDaysPerOrbit; // 0–5
  const dayIndex = Math.min(Math.floor(dayPos), CIVIC_TIME.civicDaysPerOrbit - 1);
  const civicDay = dayIndex + 1;
  const dayFraction = dayPos - dayIndex;
  const hoursF = dayFraction * 24;
  const hour = Math.min(Math.floor(hoursF), 23);
  const minutesF = (hoursF - hour) * 60;
  const minute = Math.min(Math.floor(minutesF), 59);
  const second = Math.min(Math.floor((minutesF - minute) * 60), 59);
  return { week, civicDay, hour, minute, second, dayFraction, weekFraction };
}

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

export function formatCivic(c: CivicDateTime): string {
  return `W${c.week} D${c.civicDay} ${pad2(c.hour)}:${pad2(c.minute)}:${pad2(c.second)}`;
}
