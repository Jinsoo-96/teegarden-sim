// 플레어 시스템 상태 — 스펙 §6.2: 푸아송 λ=0.026/일, 130–600초, 10⁳¹–1.3×10³² erg
import { create } from "zustand";
import { STAR } from "../data/teegarden";

export interface FlareEvent {
  startJd: number;
  durationSec: number;
  energyErg: number;
  dirView: [number, number, number]; // 핫스팟 방향 (디스크 뷰 좌표, z>0 = 가시면)
}

interface FlareState {
  active: FlareEvent | null;
  log: FlareEvent[]; // 자동/수동 발생 기록 (최근 20건)
  trigger: (jd: number) => void;
  step: (jd: number, dtDays: number) => void;
}

function spawnFlare(jd: number): FlareEvent {
  const [d0, d1] = STAR.flare.durationSec;
  const [e0, e1] = STAR.flare.energyRangeErg;
  // 핫스팟: 가시 반구 코사인 가중 랜덤
  const az = Math.random() * 2 * Math.PI;
  const z = 0.3 + 0.7 * Math.random();
  const r = Math.sqrt(1 - z * z);
  return {
    startJd: jd,
    durationSec: d0 + Math.random() * (d1 - d0),
    energyErg: Math.exp(Math.log(e0) + Math.random() * (Math.log(e1) - Math.log(e0))),
    dirView: [r * Math.cos(az), r * Math.sin(az), z],
  };
}

export const useFlareStore = create<FlareState>((set, get) => ({
  active: null,
  log: [],
  trigger: (jd) => {
    const f = spawnFlare(jd);
    // 자동 발생 로그 (M5-2 DoD)
    console.info(
      `[플레어] JD ${jd.toFixed(4)} 발생 — ${f.durationSec.toFixed(0)}초, ${f.energyErg.toExponential(2)} erg`,
    );
    set((s) => ({ active: f, log: [...s.log.slice(-19), f] }));
  },
  step: (jd, dtDays) => {
    const { active, trigger } = get();
    if (active) {
      const elapsedSec = (jd - active.startJd) * 86400;
      if (elapsedSec > active.durationSec || elapsedSec < 0) set({ active: null });
      return;
    }
    // 푸아송 근사: P(dt 내 발생) ≈ λ·dt (시뮬레이션 시간 기준 — 가속하면 자주 보임)
    if (dtDays > 0 && Math.random() < Math.min(1, STAR.flare.ratePerDay * dtDays)) {
      trigger(jd);
    }
  },
}));

// 강도 엔벨로프 0–1: 급상승(앞 10%) → 지수 감쇠 (§6.2 라이프사이클)
export function flareIntensity(f: FlareEvent | null, jd: number): number {
  if (!f) return 0;
  const t = ((jd - f.startJd) * 86400) / f.durationSec;
  if (t < 0 || t > 1) return 0;
  return t < 0.1 ? t / 0.1 : Math.exp((-3 * (t - 0.1)) / 0.9);
}
