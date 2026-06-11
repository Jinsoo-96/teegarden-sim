// 광학 캘리브레이션 유틸 — 스펙 §7.4-7.5
// 등급 → HDR 상대 강도. 기준: b에서 본 항성 V = −22.3 → 1.0 (§9)
import { VIS } from "../data/teegarden";

export function magToIntensity(vMag: number, refMag: number = VIS.starVmagFromB): number {
  return Math.pow(10, -0.4 * (vMag - refMag));
}

// 두 등급 간 강도비 (포그슨 법칙)
export function magRatio(magA: number, magB: number): number {
  return Math.pow(10, -0.4 * (magA - magB));
}
