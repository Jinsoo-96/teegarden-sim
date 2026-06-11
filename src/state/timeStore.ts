// 시간 스토어 — 스펙 §3.2: simTimeJD / timeScale(1×~1e6×) / paused
// 적분은 rAF 델타 기반: simTimeJD += (dtMs/86400000) × timeScale
import { create } from "zustand";
import { EPOCH_JD } from "../data/teegarden";
import { MS_PER_DAY } from "../sim/julian";

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
  simTimeJD: EPOCH_JD,
  timeScale: 1e5, // 기본 ≈1.16일/초 — b 공전이 ~4초에 보이는 속도
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
