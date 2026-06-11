// HUD용 "다가오는 이벤트" 계산 — 불변식: 반환되는 모든 시각 > jd
// (HUD 캐시가 "이벤트 통과 시 재계산" 방식이라, 시각 ≤ jd인 항목이 섞이면
//  재계산 → 동일 결과 → 무한 재렌더 루프로 크래시. 2026-06-11 프로덕션 버그 원인)
import { PLANETS, type PlanetData } from "../data/teegarden";
import { findLibrationSunrise } from "./civicTime";
import { nextOccultation, nextOppositionJd, type OccultationWindow } from "./events";

const [b, c, d] = PLANETS;

// 경계 동치 방지용 최소 전진폭 (1e-6일 ≈ 0.086초) — 이벤트 시각에 정확히 점프해도 안전
export const EVENT_EPS_DAY = 1e-6;

// jd 이후(엄밀히 >) 시작하는 엄폐 — 진행 중이면 다음 회합의 엄폐로 넘어감
export function upcomingOccultation(target: PlanetData, jd: number): OccultationWindow {
  let w = nextOccultation(b, target, jd + EVENT_EPS_DAY);
  if (w.startJd <= jd + EVENT_EPS_DAY) {
    w = nextOccultation(b, target, w.endJd + EVENT_EPS_DAY);
  }
  return w;
}

export interface UpcomingBasics {
  sunrise: number;
  cOpp: number;
  dOpp: number;
}

export function upcomingBasics(jd: number): UpcomingBasics {
  const from = jd + EVENT_EPS_DAY;
  return {
    sunrise: findLibrationSunrise(from),
    cOpp: nextOppositionJd(b, c, from),
    dOpp: nextOppositionJd(b, d, from),
  };
}

export interface CalendarEvent {
  jd: number;
  label: string;
  note?: string;
}

export function upcomingCalendar(jd: number): CalendarEvent[] {
  const basics = upcomingBasics(jd);
  const cOcc = upcomingOccultation(c, jd);
  const dOcc = upcomingOccultation(d, jd);
  const events: CalendarEvent[] = [
    { jd: basics.sunrise, label: "칭동 일출", note: "주 시작 (D1)" },
    { jd: basics.cOpp, label: "c 충", note: "보름 c · 15.2′ · V−6.5" },
    { jd: cOcc.startJd, label: "c 엄폐 시작", note: `항성 뒤 ${cOcc.durationHours.toFixed(1)}h` },
    { jd: basics.dOpp, label: "d 충", note: "5.2′ · V−3.0" },
    { jd: dOcc.startJd, label: "d 엄폐 시작", note: `항성 뒤 ${dOcc.durationHours.toFixed(1)}h` },
  ].sort((a, x) => a.jd - x.jd);
  return events;
}
