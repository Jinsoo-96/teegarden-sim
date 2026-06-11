// 시간 스토어 — 스펙 §3.2: simTimeJD / timeScale(1×~1e6×) / paused
// 적분은 rAF 델타 기반: simTimeJD += (dtMs/86400000) × timeScale
import { create } from "zustand";
import { MS_PER_DAY } from "../sim/julian";
import { WEEK_ZERO_JD } from "../sim/civicTime";

export const TIME_SCALE_MIN = 1;
export const TIME_SCALE_MAX = 1e6;

interface TimeState {
  simTimeJD: number;
  timeScale: number;
  paused: boolean;
  advance: (dtMs: number) => void;
  setJD: (jd: number) => void;
  setTimeScale: (scale: number) => void;
  togglePaused: () => void;
}

export const useTimeStore = create<TimeState>((set, get) => ({
  // 시작 = 첫 칭동 일출 직후(+0.1일, 고도 ≈2°) — 첫 화면에 거대 항성이 수평선 위 (M7-1)
  simTimeJD: WEEK_ZERO_JD + 0.1,
  timeScale: 5e4, // ≈0.58일/초 — 칭동 일출→일몰 사이클이 ~8분에 보이는 속도
  paused: false,
  advance: (dtMs) => {
    const { paused, timeScale } = get();
    if (paused) return;
    set((s) => ({ simTimeJD: s.simTimeJD + (dtMs / MS_PER_DAY) * timeScale }));
  },
  setJD: (jd) => set({ simTimeJD: jd }),
  setTimeScale: (scale) =>
    set({ timeScale: Math.min(TIME_SCALE_MAX, Math.max(TIME_SCALE_MIN, scale)) }),
  togglePaused: () => set((s) => ({ paused: !s.paused })),
}));
